'use strict';

let _notificationEnabled = true;
let _debugNotificationEnabled = false; // To enable debug notification, type `enableDebugNotification()` in console; to disable, type `disableDebugNotification()`; to check is enabled or not, type `isDebugNotificationEnabled()`.
const _backgroundWorkInterval = 7200000; // Interval at which automatic background works are carried out, in ms.
const _backgroundWorkWaitForOnLineInterval = 60000;
let _corsApi = ''; // CORS domain is optional.

const StatusInst = new DailyRewardStatus();
let SearchInst = new SearchQuest();

chrome.notifications.onButtonClicked.addListener(notificationButtonCallback);

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
        setOptionsOnInstall();
    }
    if (details.reason == 'update') {

    }
});

chrome.runtime.onMessage.addListener(function (request) {
    if (request.action == 'updateOptions') {
        _notificationEnabled = request.content.enableNotification;
        _debugNotificationEnabled = request.content.enableDebugNotification;
        _corsApi = request.content.corsApi;
        return;
    }
    if (request.action == 'checkStatus') {
        doBackgroundWork();
    }
});

onExtensionLoad();

// on extension load.
function onExtensionLoad() {
    setBadge(new GreyBadge());

    chrome.storage.sync.get({
        enableNotification: true,
        enableDebugNotification: false,
        userCookieExpiry: CookieStateType.sessional,
        corsApi: '',
    }, (options) => {
        _notificationEnabled = options.enableNotification;
        _debugNotificationEnabled = options.enableDebugNotification;
        _corsApi = options.corsApi;
        getAuthCookieExpiry()
            .then((currentCookieExpiry) => {
                setAuthCookieExpiry(currentCookieExpiry, options.userCookieExpiry);
            })
            .finally(() => {
                // initialise when chrome is fully loaded.
                setDelayedInitialisation(10000);
            });
    });
}

// -----------------------------
// Options
// -----------------------------
function setOptionsOnInstall() {
    getAuthCookieExpiry()
        .then((val) => {
            chrome.storage.sync.set({
                userCookieExpiry: val,
                enableNotification: true,
                enableDebugNotification: false,
            });
        });
}

function setNotificationEnabled(val) {
    console.assert(typeof (val) == 'boolean');
    _notificationEnabled = val;
    chrome.storage.sync.set({
        enableNotification: val,
    }, () => {
        chrome.runtime.sendMessage({
            action: 'popup-update',
        });
    });
}

// -----------------------------
// Work
// -----------------------------
function setDelayedInitialisation(ms) {
    setTimeout(
        function () {
            initialize();
        },
        ms
    );
}

function initialize() {
    doBackgroundWork();

    // check every 120 minutes for possible new promotion
    setInterval(
        function () {
            doBackgroundWork();
        },
        _backgroundWorkInterval
    );
}

async function doBackgroundWork() {
    if (SearchInst.jobStatus == STATUS_BUSY || StatusInst.jobStatus == STATUS_BUSY) {
        return;
    }

    await waitTillOnline();

    setBadge(new BusyBadge());

    checkNewDay();
    await checkDailyRewardStatus();

    if (isCurrentBadge('busy')) {
        setBadge(new DoneBadge());
    }
}

async function waitTillOnline() {
    while (!navigator.onLine) {
        await setTimeoutAsync(_backgroundWorkWaitForOnLineInterval);
    }
}

async function setTimeoutAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkDailyRewardStatus() {
    // update status
    let result;
    try {
        result = await StatusInst.update();
    } catch (ex) {
        handleException(ex);
    }
    if (!result || !StatusInst.summary.isValid) {
        setBadge(new ErrorBadge());
        return;
    }

    console.assert(StatusInst.pcSearchStatus.isValid);
    console.assert(StatusInst.mbSearchStatus.isValid);

    checkQuizAndDaily();
    await doSearchQuests();
}

async function doSearchQuests() {
    if (StatusInst.summary.isCompleted) {
        return;
    }

    if (!StatusInst.pcSearchStatus.isCompleted || !StatusInst.mbSearchStatus.isCompleted) {
        try {
            await SearchInst.doWork(StatusInst);
        } catch (ex) {
            handleException(ex);
        }
    }
}
