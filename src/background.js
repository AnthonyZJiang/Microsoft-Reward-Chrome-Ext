const _maxPCSearch = 35;
const _maxMbSearch = 25;
const STATUS_NONE = 0;
const STATUS_BUSY = 1;
const STATUS_COMPLETE = 20;
const STATUS_WARNING = 30;
const STATUS_ERROR = 3;

var _questingStatus = {
	searchQuesting : STATUS_NONE,
	promoQuesting : STATUS_NONE,
	sendPromoCompletionNotification : true,
	sendSearchCompletionNotification : true
}


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
		_questingStatus.promoQuesting = STATUS_COMPLETE;
		_questingStatus.searchQuesting = STATUS_COMPLETE;
		setCompletion();
		return;
	} else {
		_questingStatus.promoQuesting = STATUS_BUSY;
		_questingStatus.searchQuesting = STATUS_BUSY;
		// check search quests
		if (!_status.pcSearch.complete || !_status.mbSearch.complete){
			doSearchQuests();
		} else {			
			_questingStatus.searchQuesting = STATUS_COMPLETE;
		}
		// check promotion quests		
		doPromotionQuests();
	}
}

function setCompletion() {
	if ((_questingStatus.promoQuesting + _questingStatus.searchQuesting) >= (STATUS_COMPLETE * 2)) {
		// both are complete or one of them is completed and the other is warning or both are warning
		if (_status.dailyPoint.complete) {
			setBadge(STATUS_COMPLETE);
		} else {
			setBadge(STATUS_WARNING);
		}
	}
	if (_questingStatus.promoQuesting == STATUS_COMPLETE && _questingStatus.sendPromoCompletionNotification) {
		_questingStatus.sendPromoCompletionNotification = false;
		let p = 0, pm = 0;
		for (var i in _status.morePromotions) {
			p += _status.morePromotions[i].progress;
			pm += _status.morePromotions[i].max;
		}
		chrome.notifications.create('completeNotification', {
			type: 'basic',
			title: p.toString() + '/' + pm.toString(),
			message: 'All available promotion quests have been completed! \n\nMore could be on the way, and I will let you know.',
			iconUrl: 'img/bingRwLogo@3x.png',
			buttons: [{ title: 'Go To Microsoft Reward' }, { title: 'Dismiss' }]
		});
	}
	if (_questingStatus.searchQuesting == STATUS_COMPLETE && _questingStatus.sendSearchCompletionNotification) {
		_questingStatus.sendSearchCompletionNotification = false;
		chrome.notifications.create('searchQuestCompletionNotification',{
            type: 'basic',
            title: (_status.pcSearch.progress + _status.mbSearch.progress).toString() + '/' + (_status.pcSearch.max + _status.mbSearch.max).toString(),
            message: 'Search quests have been completed!',
            iconUrl: 'img/bingRwLogo@3x.png',
            buttons: [{ title: 'Go To Microsoft Reward' }, { title: 'Dismiss' }]
        })
	}
}

function setBadge(status) {
	if (status == STATUS_BUSY) {
		chrome.browserAction.setIcon({path:"img/done.png"});
		chrome.browserAction.setBadgeText({text: ''});
	} else if (status == STATUS_COMPLETE) {
		chrome.browserAction.setIcon({path:"img/done.png"});
		chrome.browserAction.setBadgeText({text: ''});
	} else if (status == STATUS_WARNING) {
		chrome.browserAction.setIcon({path:"img/warning.png"});
		chrome.browserAction.setBadgeText({text: (_status.dailyPoint.max - _status.dailyPoint.progress).toString()});
		chrome.browserAction.setBadgeBackgroundColor({"color": [225, 185, 0, 100]}); 
	} else if (status == STATUS_ERROR) {
		chrome.browserAction.setIcon({path:"img/warning.png"});
		chrome.browserAction.setBadgeText({text: 'err'});
		chrome.browserAction.setBadgeBackgroundColor({"color": [225, 185, 0, 100]}); 
	} else {
		chrome.browserAction.setIcon({path:"img/bingRwLogo@1x.png"});
		chrome.browserAction.setBadgeText({text: ''});
	}
}

chrome.browserAction.onClicked.addListener(function (tab) {
	// send notification if it is initiated from browser action.
	_questingStatus.sendPromoCompletionNotification = true;
	_questingStatus.sendSearchCompletionNotification = true;
	checkQuests();
});

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
	if (notificationId == 'usedAllGoogleTrendPageNotification')	{ 
		// this notification has no button
		// failStatusCheckNotification
	} else if (buttonIndex == 0) {
		// for notificationIds:
		// unfinishedPromotionNotification
		// completeNotification
		// notLoggedInNotification
		// searchQuestCompletionNotification
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
	3600000
);