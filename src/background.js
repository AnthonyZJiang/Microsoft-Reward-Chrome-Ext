'use strict';



var _questingStatus = {
	status: STATUS_NONE,
	sendCompletionNotification: false
}

var _prevWeekDay = -1;
var _notificationEnabled;

var StatusInst = new DailyRewardStatus();
var SearchInst = new SearchQuest();

chrome.notifications.onButtonClicked.addListener(notificationButtonCallback);

chrome.runtime.onInstalled.addListener(async function (details) {
	if (details.reason == "install") {
		saveOptionsOnInstall();
		_questingStatus.sendCompletionNotification = true;
	}
});

chrome.runtime.onMessage.addListener(
	function (request) {
		if (request.action == 'updateOptions') {
			_notificationEnabled = request.content.enableNotification;
			return;
		}
		if (request.action == 'checkStatus') {
			_questingStatus.sendCompletionNotification = true;
			doBackgroundWork();
		}
})

// load settings
chrome.storage.sync.get({
	enableNotification: true,
	userCookieExpiry: CookieStateType.sessional
}, (enableNotification, userCookieExpiry) => {
	_notificationEnabled = enableNotification;
	getAuthCookieExpiry()
	.then((currentCookieExpiry) => {
		setAuthCookieExpiry(currentCookieExpiry, userCookieExpiry)
	})
	.finally(() => {
		initialize();
	})
});

// -----------------------------
// FUNCTIONS
// -----------------------------
function initialize() {
	// check on load
	doBackgroundWork();

	// check every 60 minutes for possible new promotion
	setInterval(
		function () {
			doBackgroundWork();
			},
			3600000
	);
}

// --------
// Options
// --------

function saveOptionsOnInstall() {
	getAuthCookieExpiry()
		.then((val) => {
			chrome.storage.sync.set({
				userCookieExpiry: val,
				enableNotification: true
			});
		});
}

function setNotificationEnabled(val) {
	console.assert(typeof(val) == "boolean");
	_notificationEnabled = val;
	chrome.storage.sync.set({
		enableNotification: val
	}, () => {
		chrome.runtime.sendMessage({
			action: 'popup-update'
		})
	})
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
		}
		catch (ex) {
			handleException(ex);
		}
	}
}

function checkNewDay() {
	if (!isNewDay()) {
		// if a new day, reset variables
		resetSearchParams();
	}
}

function isNewDay() {
	let d;
	if ((d = new Date().getDay()) != _prevWeekDay) {
		_prevWeekDay = d;
		return false;
	}
	return true;
}

function getDomFromText(text) {
    return new DOMParser().parseFromString(text, "text/html");
}

function getTodayDate() {
	var date = new Date();
	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

function resetSearchParams() {
	SearchInst = new SearchQuest();
	_usedAllGoogleTrendPageNotificationFired = false;
}

function notificationButtonCallback(notificationId, buttonIndex) {
	if (notificationId == 'usedAllGoogleTrendPageNotification') {
		// this notification has no button
	} else if (notificationId == 'unfinishedPromotionNotification' && buttonIndex == 0) {
		// for notificationIds:
		// unfinishedPromotionNotification
		chrome.tabs.create({
			url: 'https://www.bing.com/',
			active: true
		});
	} else if (buttonIndex == 0) {
		// failStatusCheckNotification
		// notLoggedInNotification	
		// searchQuestCompletionNotification	
		// completeNotification
		chrome.tabs.create({
			url: 'https://account.microsoft.com/rewards',
			active: true
		});
	} else {
		chrome.notifications.clear(notificationId);
		setNotificationEnabled(false)
	}
}