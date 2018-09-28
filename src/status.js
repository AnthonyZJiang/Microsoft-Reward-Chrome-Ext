const POINT_PER_SEARCH = 3;
const ADDITIONAL_SEARCH = 5;
const AVOID_PROMOTION_TITLE = [''];
const CORS_PROMOTION_TITLE = ['shop to earn', 'keep earning']

var _frame = null;
var _prevWeekDay = -1;
var _status;
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
	promotions: [
		{
			progress: 0,
			max: 0,
			complete: true}
	]
	};

async function checkCompletionStatus(){
	_frame = null;
	_status = _freshStatus;
	await checkStatusInnerLoop()
	.then(function(val){
		let p = new DOMParser(); 
		let doc = p.parseFromString(val, 'text/html');	
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
		_status.dailyPoint.complete = _status.dailyPoint.max == _status.dailyPoint.progress;
		_status.promotions.max = _status.dailyPoint.max - _status.mbSearch.max - _status.pcSearch.max;
		_status.promotions.progress = _status.dailyPoint.progress - _status.mbSearch.progress - _status.pcSearch.progress;
		_status.promotions.complete = _status.promotions.max == _status.promotions.progress;
		_status.pcSearch.numSearch = (_status.pcSearch.max && !_status.pcSearch.complete) ? (_status.pcSearch.max - _status.pcSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;
		_status.mbSearch.numSearch = (_status.mbSearch.max && !_status.mbSearch.complete) ? (_status.mbSearch.max - _status.mbSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;

		console.log('Status check completed!')
		console.log(_status)
	})
	.catch(function(val){
		console.log('Status check failed.')
		console.log(val)
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
	});
}

async function checkStatusInnerLoop(){
	return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://account.microsoft.com/rewards/pointsbreakdown', true);
        xhr.onload = function () {
			console.log('Status check request responded! - xhr.readyState:', xhr.readyState, ' - status', xhr.status)
            if (xhr.readyState == 4 && xhr.status == 200) {
				resolve(xhr.responseText)
			} else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
			console.log('Status check request responded with error! - xhr.readyState:', xhr.readyState, ' - status', xhr.status)
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
		console.log('Status check request sent!')
    });
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

/* function promotions(js) {
	try {
		var promos = new Array();
		for (let i in js.promotions) {
			// if the promotion is in avoid list, deduct its point from daily point
			if (AVOID_PROMOTION_TITLE.includes(js.promotions[i].title.toLowerCase()) && _status.dailyPoint.max >= 0) {
				_status.dailyPoint.max -= js.promotions[i].max;
				continue;
			}
			// push to promos
			promos.push({
				title: js.promotions[i].title,
				progress: js.promotions[i].pointProgress,
				max: js.promotions[i].max,
				complete: js.promotions[i].complete,
				url: js.promotions[i].destinationUrl,
				type: js.promotions[i].promotionType,
				cors: CORS_PROMOTION_TITLE.includes(js.promotions[i].title.toLowerCase())
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
} */

function createFailStatusCheckNotification(msg) {
	chrome.notifications.create('failStatusCheckNotification', {
		type: 'basic',
		title: msg,
		message: 'Have you logged into your MS account?\n\nThis is could also due to a change in MS Rewards page, in which case the author will try fixing it soon.',
		iconUrl: 'img/err@8x.png',
		requireInteraction: true,
		buttons: [	{ title: 'Go to MS reward'},
					{ title: 'Later'}],
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