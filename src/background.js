const _maxPCSearch = 35;
const _maxMbSearch = 25;
const STATUS_NONE = 0;
const STATUS_BUSY = 1;
const STATUS_COMPLETE = 2;
const STATUS_WARNING = 3;
var _sendCompleteNotification = true;


function checkQuests() {
	setBadge(STATUS_BUSY);
	if (!checkDate()) {
		// if a new day, reset variables
		_pcSearchWordIdx = 0;
		_mbSearchWordIdx = 0;
		_currentGoogleTrendPageIdx = 0;
		_usedAllGoogleTrendPageNotificationFired = false;
		_currentSearchType = NaN;
		_searchWordArray = new Array();
	}

	checkCompletionStatus();

	if (_status.dailyPoint.complete)
	{
		// if completed
		setBadge(STATUS_COMPLETE);
		return;
	} else {
		// check search quests
		if (!_status.pcSearch.complete || !_status.mbSearch.complete){
			doSearchQuests();
		}
		// check promotion quests
		doPromotionQuests();
	}
}

chrome.browserAction.onClicked.addListener(function (tab) {
	// send notification if it is initiated from browser action.
	_sendCompleteNotification = true;
	checkQuests();
});

function setBadge(status) {
	if (status == STATUS_BUSY) {
		chrome.browserAction.setIcon({path:"img/done.png"});
		chrome.browserAction.setBadgeText({text: ''});
	} else if (status == STATUS_COMPLETE) {
		chrome.browserAction.setIcon({path:"img/done.png"});
		chrome.browserAction.setBadgeText({text: ''});
		if (_sendCompleteNotification){
			_sendCompleteNotification = false;
			chrome.notifications.create('completeNotification', {
				type: 'basic',
				title: 'Microsoft Rewards',
				message: 'Hooray! You have got all available points so far! \nMore points from promotion quests could be on the way. Check back after awhile or just leave it to me :).',
				iconUrl: 'img/bingRwLogo@3x.png',
				buttons: [{ title: 'Go To Microsoft Reward' }, { title: 'Dismiss' }]
			});
		}
	} else if (status == STATUS_WARNING) {
		chrome.browserAction.setIcon({path:"img/warning.png"});
		chrome.browserAction.setBadgeText({text: (_status.dailyPoint.max - _status.dailyPoint.progress).toString()});
	} else {
		chrome.browserAction.setIcon({path:"img/bingRwLogo@1x.png"});
		chrome.browserAction.setBadgeText({text: ''});
	}
}

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
	if (notificationId == 'usedAllGoogleTrendPageNotification')	{ 
		// this notification has no button
	}
	// for notificationIds:
	// unfinishedPromotionNotification
	// completeNotification
	// failStatusCheckNotification
	if (buttonIndex == 0) {
		chrome.tabs.create({
			url: 'https://account.microsoft.com/rewards',
			active: true});
	} else {
		chrome.notifications.clear(notificationId);
	}
});

// do an initial check
checkQuests();
// and then check every 30 minutes for possible new promotion
var _mainTimer = setInterval(
	function() {
		checkQuests();
	},
	1800000
);