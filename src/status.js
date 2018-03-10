const POINT_PER_SEARCH = 3;
const ADDITIONAL_SEARCH = 5;
const AVOID_PROMOTION_TITLE = [''];
const CORS_PROMOTION_TITLE = ['shop to earn']

var _frame = null;
var _prevWeekDay = -1;

var _freshStatus = {
	pcSearch: {
		progress: 0,
		max: 90,
		numSearch: 0,
		complete: false
	},
	mbSearch: {		
		progress: 0,
		max: 60,
		numSearch: 0,
		complete: false
	},
	dailyPoint: {
		progress: 0,
		max: 160,
		complete: false
	},
	morePromotions: [
		{
			progress: 0,
			pointProgressMax: 0,
			complete: true}
	]
	};

var _status;

function checkCompletionStatus(){
	_frame = null;
	_status = _freshStatus;
	checkStatusInnerLoop();
}

function checkStatusInnerLoop(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://account.microsoft.com/rewards/pointsbreakdown', false);
	try{
		xhr.send();
	} catch (ex) {
		// if fail, most likely the user has been logged out of Microsoft account.
		if (_frame==null){
			// open an iframe and goto ms page.
			_frame = document.createElement('iframe');
			_frame.src = 'https://account.microsoft.com/rewards/pointsbreakdown';
			_frame.sandbox="allow-same-origin allow-scripts allow-popups allow-forms";
			document.body.appendChild(_frame);
			checkStatusInnerLoop();
		} else {
			createNotLoggedInNotification();
		}
	}

	console.log('Status check request sent!')
	if (xhr.readyState == 4 && xhr.status == 200) {
		let p = new DOMParser(); 
		let doc = p.parseFromString(xhr.responseText, 'text/html');	
		if (doc.getElementsByTagName('script').length >= 22) {
			var str = doc.getElementsByTagName('script')[21].text;
		} else {
			createFailStatusCheckNotification('Fail to check reward point status');
			throw 'fail to check reward status due to a change in page structure.'
		}
		
		// update status
		let js = getUserStatusJSON(str);

		if (js === null) {
			createFailStatusCheckNotification('Fail to check reward point status');
			throw 'fail to check reward status due to a change in page structure.'
		}

		_status.pcSearch = pcSearch(js);
		_status.mbSearch = mbSearch(js);
		_status.dailyPoint = dailyPoint(js);
		_status.morePromotions = morePromotions(js);
		_status.pcSearch.numSearch = _status.pcSearch.max ? (_status.pcSearch.max - _status.pcSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;
		_status.mbSearch.numSearch = _status.mbSearch.max ? (_status.mbSearch.max - _status.mbSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;

		console.log('Status check completed!')
		console.log(_status)
	}
	//chrome.browserAction.setBadgeText({text: (_earnedPoints/_maxPoints*100).toString().substr(0,4)});
}

function getUserStatusJSON(str) {
	try {
		var m = /(?=\{"userStatus":).*(=?\}\};)/.exec(str);
		return JSON.parse(m[0].substr(0, m[0].length - 1));
	} catch (ex) {
		createFailStatusCheckNotification('Fail to check reward point status');
		throw 'fail to check reward status due to a change in page structure.'
	}
}

function pcSearch(js) {
	try {
		return {
            progress: js.userStatus.counters.pcSearch[0].pointProgress,
            max: js.userStatus.counters.pcSearch[0].pointProgressMax,
			complete: js.userStatus.counters.pcSearch[0].complete,
			numSearch: 0
        };
	} catch (ex) {
		createFailStatusCheckNotification('Fail to check PC search quest')
		return {
            progress: 0,
            max: 0,
			complete: true,
			numSearch: 0
        };
	}
}

function mbSearch(js) {
    try {
		return {
            progress: js.userStatus.counters.mobileSearch[0].pointProgress,
            max: js.userStatus.counters.mobileSearch[0].pointProgressMax,
			complete: js.userStatus.counters.mobileSearch[0].complete,
			numSearch: 0
        };
	} catch (ex) {
		createFailStatusCheckNotification('Fail to check mobile search quest');
		return {
            progress: 0,
            max: 0,
			complete: true,
			numSearch: 0
        };
	}
}

function dailyPoint(js) {
	try {
		return {
            progress: js.userStatus.counters.dailyPoint[0].pointProgress,
            max: js.userStatus.counters.dailyPoint[0].pointProgressMax,
			originalMax: js.userStatus.counters.dailyPoint[0].pointProgressMax,
			complete: js.userStatus.counters.dailyPoint[0].complete,
        };
	} catch (ex) {
		createFailStatusCheckNotification('Fail to check daily point status');
		return {
            progress: 0,
            max: 0,
			originalMax: 0,
			complete: true
        };
	}
}

function morePromotions(js) {
	try {
		var promos = new Array();
		for (let i in js.morePromotions) {
			// if the promotion is in avoid list, deduct its point from daily point
			if (AVOID_PROMOTION_TITLE.includes(js.morePromotions[i].title.toLowerCase()) && _status.dailyPoint.max >= 0) {
				_status.dailyPoint.max -= js.morePromotions[i].pointProgressMax;
				continue;
			}
			// push to promos
			promos.push({
				title: js.morePromotions[i].title,
				progress: js.morePromotions[i].pointProgress,
				max: js.morePromotions[i].pointProgressMax,
				complete: js.morePromotions[i].complete,
				url: js.morePromotions[i].destinationUrl,
				type: js.morePromotions[i].promotionType,
				cors: CORS_PROMOTION_TITLE.includes(js.morePromotions[i].title.toLowerCase())
			})
		}
		// finally re-evaluate daily point progress
		if (_status.dailyPoint.max <= _status.dailyPoint.progress) {
			_status.dailyPoint.complete = true;
		}
		
	} catch (ex) {
		createFailStatusCheckNotification('Fail to check promotion quests');
	} finally {
		return promos;
	}
	
}

function checkDate(){
	let d;
	if ((d = new Date().getDay()) != _prevWeekDay){
		_prevWeekDay = d;
		return false;
	}
	return true;
}

function createFailStatusCheckNotification(msg) {
	chrome.notifications.create('failStatusCheckNotification', {
		type: 'basic',
		title: msg,
		message: 'Have you logged into your MS account?\n\nThis is could also due to a change in MS Rewards page, in which case the author will try fixing it soon.',
		iconUrl: 'img/err@8x.png',
		requireInteraction: true
	});
	setBadge(STATUS_ERROR)
}

function createNotLoggedInNotification() {
	chrome.notifications.create('notLoggedInNotification', {
		type: 'basic',
		title: 'Fail to check complete status',
		message: 'You need to open the Microsoft reward page and log into your account first.',
		iconUrl: 'img/err@8x.png',
		buttons: [	{ title: 'Go to MS reward'},
					{ title: 'Later'}],
		requireInteraction: true
	});
	setBadge(STATUS_ERROR)
}