'use strict';

const STATUS_NONE = 0;
const STATUS_BUSY = 1;
const STATUS_DONE = 20;
const STATUS_WARNING = 30;
const STATUS_ERROR = 3;

var _questingStatus = {
	status: STATUS_NONE,
	sendCompletionNotification: false
}
var _clickCheck = 0;
var _prevWeekDay = -1;
var _notificationEnabled;

//chrome.browserAction.onClicked.addListener(browserActionButtonCallback);

chrome.notifications.onButtonClicked.addListener(notificationButtonCallback);

chrome.runtime.onInstalled.addListener(async function (details) {
	if (details.reason == "install") {
		saveOptionsOnInstall();
		_questingStatus.sendCompletionNotification = true;
	}
});

chrome.runtime.onMessage.addListener(
	function (request, sender) {
		if (request.action == 'updateOptions') {
			_notificationEnabled = request.content.enableNotification;
			return;
		}
		if (request.action == 'checkQuests') {
			_questingStatus.sendCompletionNotification = true;
			checkQuests();
		}
})

// load settings
chrome.storage.sync.get({
	enableNotification: true
}, (val) => {
	_notificationEnabled = val;
});

// check on load
checkQuests();

// check every 60 minutes for possible new promotion
setInterval(
	function () {
			checkQuests();
		},
		3600000
);

// -----------------------------
// FUNCTIONS
// -----------------------------

// --------
// Options
// --------

function saveOptionsOnInstall() {
	getAuthCookieStatus()
		.then((val) => {
			chrome.storage.sync.set({
				userPersistentAuthCookie: val,
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

async function checkQuests() {
	setBadge(STATUS_BUSY);
	if (!isNewDay()) {
		// if a new day, reset variables
		resetSearchParams();
	}

	let result = await checkCompletionStatus();
	if (!result) {
		setBadge(STATUS_ERROR);
		return;
	}

	console.assert(_status.summary.max != 0);

	if (_status.summary.complete) {
		// if completed
		_questingStatus.status = STATUS_DONE;
		setCompletion();
		return;
	}

	// check search quests
	if (!_status.pcSearch.complete || !_status.mbSearch.complete) {
		_questingStatus.status = STATUS_BUSY;

		// note that this is not awaited and do not await it!
		doSearchQuests();
	}

	// check promotion quests	
	checkQuizAndDaily();
	setCompletion();
}

function isNewDay() {
	let d;
	if ((d = new Date().getDay()) != _prevWeekDay) {
		_prevWeekDay = d;
		return false;
	}
	return true;
}

function resetSearchParams() {
	_pcSearchWordIdx = 0;
	_mbSearchWordIdx = 0;
	_currentGoogleTrendPageIdx = 0;
	_usedAllGoogleTrendPageNotificationFired = false;
	_currentSearchType = NaN;
	_searchWordArray = new Array();
}

function setCompletion() {
	if (_questingStatus.status != STATUS_DONE) {
		return
	}

	if (_status.summary.complete) {
		setBadge(STATUS_DONE);
	} else {
		setBadge(STATUS_WARNING);
		return
	}

	assertSearchCompletion();

	if (!_notificationEnabled) {
		return;
	}

	if (_questingStatus.sendCompletionNotification) {
		_questingStatus.sendCompletionNotification = false;
		chrome.notifications.create('searchQuestCompletionNotification', {
			type: 'basic',
			title: (_status.pcSearch.progress + _status.mbSearch.progress).toString() + '/' + (_status.pcSearch.max + _status.mbSearch.max).toString(),
			message: 'Search quests have been completed!',
			iconUrl: 'img/done@8x.png',
			buttons: [{
				title: 'Go To MS Rewards'
			}, {
				title: 'Be Quiet!'
			}]
		})
	}
}

function setBadge(status) {
	switch (status) {
		case STATUS_BUSY:
			chrome.browserAction.setIcon({
				path: "img/busy@1.5x.png"
			});
			chrome.browserAction.setBadgeText({
				text: ''
			});
			console.log('busy badge')
			break;
		case STATUS_DONE:
			chrome.browserAction.setIcon({
				path: "img/done@1.5x.png"
			});
			chrome.browserAction.setBadgeText({
				text: ''
			});
			console.log('done badge')
			break;
		case STATUS_WARNING:
			chrome.browserAction.setIcon({
				path: "img/err@1.5x.png"
			});
			chrome.browserAction.setBadgeText({
				text: (_status.summary.max - _status.summary.progress).toString()
			});
			chrome.browserAction.setBadgeBackgroundColor({
				"color": [225, 185, 0, 100]
			});
			console.log('warning badge')
			break;
		case STATUS_ERROR:
			chrome.browserAction.setIcon({
				path: "img/err@1.5x.png"
			});
			chrome.browserAction.setBadgeText({
				text: 'err'
			});
			chrome.browserAction.setBadgeBackgroundColor({
				"color": [225, 185, 0, 100]
			});
			console.log('error badge')
			break;
		default:
			chrome.browserAction.setIcon({
				path: "img/bingRwLogo@1.5x.png"
			});
			chrome.browserAction.setBadgeText({
				text: ''
			});
			console.log('none badge')
	}
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

function assertSearchCompletion() {
	console.assert(_status.pcSearch.complete)
	console.assert(_status.pcSearch.max == _status.pcSearch.progress)
	console.assert(_status.mbSearch.complete)
	console.assert(_status.mbSearch.max == _status.mbSearch.progress)
}