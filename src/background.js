'use strict';

var _prevWeekDay = -1;
var _notificationEnabled = true;
var _debugNotificationEnabled = false; // To enable debug notification, type `enableDebugNotification()` in console; to disable, type `disableDebugNotification()`; to check is enabled or not, type `isDebugNotificationEnabled()`.
var _backgroundWorkInterval = 7200000; // Interval at which automatic background works are carried out, in ms.
var _corsAPI = ''; // CORS domain is optional.

var StatusInst = new DailyRewardStatus();
var SearchInst = new SearchQuest();

chrome.notifications.onButtonClicked.addListener(notificationButtonCallback);

chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason == "install") {
		setOptionsOnInstall();
	}
	if (details.reason == "update") {

	}
});

chrome.runtime.onMessage.addListener(function (request) {
	if (request.action == 'updateOptions') {
		_notificationEnabled = request.content.enableNotification;
		_debugNotificationEnabled = request.content.enableDebugNotification;
		_corsAPI = request.content.corsAPI;
		return;
	}
	if (request.action == 'checkStatus') {
		doBackgroundWork();
	}
});

// load settings
chrome.storage.sync.get({
	enableNotification: true,
	enableDebugNotification: false,
	userCookieExpiry: CookieStateType.sessional,
	corsAPI: ''
}, (options) => {
	_notificationEnabled = options.enableNotification;
	_debugNotificationEnabled = options.enableDebugNotification;
	_corsAPI = options.corsAPI;
	getAuthCookieExpiry()
		.then((currentCookieExpiry) => {
			setAuthCookieExpiry(currentCookieExpiry, options.userCookieExpiry)
		})
		.finally(() => {
			initialize();
		})
});

// -----------------------------
// Options
// -----------------------------
function setOptionsOnInstall() {
	getAuthCookieExpiry()
		.then((val) => {
			chrome.storage.sync.set({
				userCookieExpiry: val,
				enableNotification: true,
				enableDebugNotification: false
			});
		});
}

function setNotificationEnabled(val) {
	console.assert(typeof (val) == "boolean");
	_notificationEnabled = val;
	chrome.storage.sync.set({
		enableNotification: val
	}, () => {
		chrome.runtime.sendMessage({
			action: 'popup-update'
		})
	})
}

// -----------------------------
// Work
// -----------------------------
function initialize() {
	// check on load
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

	setBadge(new BusyBadge());

	checkNewDay();
	await checkDailyRewardStatus();

	if (isCurrentBadge("busy")) {
		setBadge(new DoneBadge());
	}
}

async function checkDailyRewardStatus() {
	// update status
	var result
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