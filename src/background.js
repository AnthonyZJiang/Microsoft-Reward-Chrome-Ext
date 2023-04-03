
'use strict';

function onExtensionLoad() {
    setBadge(new GreyBadge());
    loadSavedSettings();
    getDeveloperSettings();
    setDelayedInitialisation(5000);
}

function loadSavedSettings() {
    chrome.storage.sync.get({
        AutoSolve: false,
        compatibilityMode: false,
        pcUaOverrideEnable: false,
        mbUaOverrideEnable: false,
        pcUaOverrideValue: '',
        mbUaOverrideValue: '',
    }, function (options) {
        _compatibilityMode = options.compatibilityMode;
        _autosolve = options.AutoSolve;
        _pcUaOverrideEnable = options.pcUaOverrideEnable;
        _mbUaOverrideEnable = options.mbUaOverrideEnable;
        _pcUaOverrideValue = options.pcUaOverrideValue;
        _mbUaOverrideValue = options.mbUaOverrideValue;
    });
}

async function getDeveloperSettings() {
    const devJson = chrome.runtime.getURL('developer.json');
    const fetchProm = await fetch(devJson, {method: 'GET'}).then((response) => {
        return response.json();
    }).then((json) => {
        developer = json;
        console.log('Developer mode enabled.');
        console.log(developer);
    }).catch((ex) => {
        if (ex.name == 'TypeError') {
            return;
        }
        throw ex;
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
        ms,
    );
}

function initialize() {
    doBackgroundWork();

    // check every 120 minutes for possible new promotion
    setInterval(
        function () {
            doBackgroundWork();
        },
        WORKER_ACTIVATION_INTERVAL,
    );
}

async function doBackgroundWork() {
    if (searchQuest.jobStatus == STATUS_BUSY || userDailyStatus.jobStatus == STATUS_BUSY) {
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
        await setTimeoutAsync(WAIT_FOR_ONLINE_TIMEOUT);
    }
}

async function setTimeoutAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkDailyRewardStatus() {
    // update status
    let result;
    try {
        result = await userDailyStatus.update();
    } catch (ex) {
        handleException(ex);
    }
    if (!result || !userDailyStatus.summary.isValid) {
        setBadge(new ErrorBadge());
        return;
    }

    await doSearchQuests();
    if (_autosolve) {// autyoslve cards enabled
        await solveCards();
    }
    checkQuizAndDaily();
}

async function doSearchQuests() {
    if (userDailyStatus.summary.isCompleted) {
        return;
    }

    if (!userDailyStatus.pcSearchStatus.isCompleted || !userDailyStatus.mbSearchStatus.isCompleted) {
        try {
            await searchQuest.doWork(userDailyStatus);
        } catch (ex) {
            handleException(ex);
        }
    }
}

const WORKER_ACTIVATION_INTERVAL = 7200000; // Interval at which automatic background works are carried out, in ms.
const WAIT_FOR_ONLINE_TIMEOUT = 60000;

const googleTrend = new GoogleTrend();
const userDailyStatus = new DailyRewardStatus();
const searchQuest = new SearchQuest(googleTrend);
let developer = false;
let userAgents;
let _compatibilityMode;
let _autosolve;
let _pcUaOverrideEnable;
let _mbUaOverrideEnable;
let _pcUaOverrideValue;
let _mbUaOverrideValue;

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {

    }
    if (details.reason == 'update') {

    }
});

chrome.runtime.onMessage.addListener(async function (request,sender) {
    if (request.action == 'checkStatus') {
        doBackgroundWork();
    }
    if (request.action == 'updateOptions') {
        _compatibilityMode = request.content.compatibilityMode;
        _autosolve = request.content.AutoSolve;
        _pcUaOverrideEnable = request.content.pcUaOverrideEnable;
        _mbUaOverrideEnable = request.content.mbUaOverrideEnable;
        _pcUaOverrideValue = request.content.pcUaOverrideValue;
        _mbUaOverrideValue = request.content.mbUaOverrideValue;
        return;
    }
    if (request.action == 'copyDebugInfo') {
        getDebugInfo();
    }
    if (request.action == 'closeTab') {
         chrome.tabs.remove(sender.tab.id);
    }
    if (request.action == 'solve') {
        solveCards();
    }
});

async function tryUpdate() {
    try {
        const result = await userDailyStatus.update();
    } catch (ex) {
        handleException(ex);
    }
}

async function solveCards() {
    await openUrlRewards();
    await openQuizzes();
    setTimeout(async () => await tryUpdate(), 60000);
}
async function openQuizzes() {
    const daily = userDailyStatus.dailySetUrls.quiz; // get daily array
    const more = userDailyStatus.morePromosUrls.quiz; // get mora promos array
    await opentabs(daily);// open daily urls
    await opentabs(more); // open more promos urls
    return;
}

async function opentabs(urls) {
    for (let i =0; i< urls.length; i++) {
        await chrome.tabs.create(
        {
            url: urls[i],
            active: false,
        },
    );
    wait(500); // delay to make sure everylink opens
    }
    return;
}

async function openUrlRewards() {
    if (userDailyStatus.dailySetUrls.urlReward.length != 0 || userDailyStatus.morePromosUrls.urlReward.length != 0) {
        chrome.tabs.create(
            {
                url: "https://rewards.bing.com/",
                active: false,
            },
            async (tab) => {
                const tabID = tab.id;

                await openCards(userDailyStatus.dailySetUrls.urlReward, tabID); // open daily
                await openCards(userDailyStatus.morePromosUrls.urlReward, tabID); // open more promos
                setTimeout(() => chrome.tabs.remove(tabID), 3000); // we wait 3000ms to avoid erorrs
            },
        );
        return;
    }
}

async function openCards(cardsIDs, tabId) {
    for (let i =0; i< cardsIDs.length; i++) {
        await chrome.tabs.executeScript(
            tabId,
            {
            code: `document.querySelector("div[data-bi-id='${cardsIDs[i]}']").children[0].click()`, // click the card with the provied id
        },
        );
        wait(1000); // we wait 1s so opening the links is registered as so
    }

    return;
}


function wait(ms) {
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
      end = new Date().getTime();
   }
}


chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    const url = tab.url;
    if (url) {
        if ((userDailyStatus.dailySetUrls.urlRewardUrls.includes(url) || userDailyStatus.morePromosUrls.urlRewardUrls.includes(url)) && changeInfo.status == 'complete') { // url reward tab opened by script and loading completed
            setTimeout(() => chrome.tabs.remove(tabId), 1000);
        } else {
            if (url.includes("https://www.bing.com/search?q=") && changeInfo.status == 'complete') { // make sure the page has finished loading
                setTimeout(
                () =>
                chrome.tabs.executeScript(tabId, { // run scruipt to solve answers
                    file: 'solveContent.js',
                }), 3000);// wait for page load or refresh
        }
        }
    }
});

onExtensionLoad();
