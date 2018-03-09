const POINT_PER_SEARCH = 3;
const ADDITIONAL_SEARCH = 5;
const AVOID_PROMOTION_TITLE = ['shop to earn'];

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
		if (false){
			// open an iframe and goto ms page.
			_frame = document.createElement('iframe');
			_frame.src = 'https://account.microsoft.com/rewards/pointsbreakdown';
			_frame.sandbox="allow-same-origin allow-scripts allow-popups allow-forms";
			document.body.appendChild(_frame);
			checkStatusInnerLoop();
		} else {
			chrome.notifications.create('failStatusCheckNotification', {
				type: 'basic',
				title: 'Fail to check complete status',
				message: 'You need to open the Microsoft reward page and log into your account first.',
				iconUrl: 'img/bingRwLogo@3x.png',
				buttons: [	{ title: 'Go to MS reward'},
							{ title: 'Later'}],
				requireInteraction: true
			  });
		}
	}

	console.log('request sent!')
	if (xhr.readyState == 4 && xhr.status == 200) {
		let p = new DOMParser(); 
		let doc = p.parseFromString(xhr.responseText, 'text/html');	
		let str = doc.getElementsByTagName('script')[21].text;
		
		// update status
		_status.pcSearch = pcSearch(str);
		_status.mbSearch = mbSearch(str);
		_status.dailyPoint = dailyPoint(str);
		_status.morePromotions = morePromotions(str);
		_status.pcSearch.numSearch = (_status.pcSearch.max - _status.pcSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH;
		_status.mbSearch.numSearch = (_status.mbSearch.max - _status.mbSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH;
	}
	//chrome.browserAction.setBadgeText({text: (_earnedPoints/_maxPoints*100).toString().substr(0,4)});
}

function pcSearch(str) {
    var m;
    if ((m = /(?="pcSearch":\[).*(?=,"mobileSearch":\[)/g.exec(str)) !== null){
        let jsonObj = JSON.parse('{'+ m[0] +'}');
        return {
            progress: jsonObj.pcSearch[0].pointProgress,
            max: jsonObj.pcSearch[0].pointProgressMax,
			complete: jsonObj.pcSearch[0].complete,
			numSearch: 0
        }
    }
}

function mbSearch(str) {
    var m;
    if ((m = /(?="mobileSearch":\[).*(?=,"dailyPoint":\[)/g.exec(str)) !== null){
        let jsonObj = JSON.parse('{'+ m[0] +'}');
        return {
            progress: jsonObj.mobileSearch[0].pointProgress,
            max: jsonObj.mobileSearch[0].pointProgressMax,
            complete: jsonObj.mobileSearch[0].complete,
			numSearch: 0
        }
    }
}

function dailyPoint(str) {
    var m;
    if ((m = /(?="dailyPoint":\[).*(?=,"lastOrder":\{)/g.exec(str)) !== null){
		let jsonObj =  JSON.parse('{'+ m[0]);
		return {
            progress: jsonObj.dailyPoint[0].pointProgress,
			max: jsonObj.dailyPoint[0].pointProgressMax,
			originalMax: jsonObj.dailyPoint[0].pointProgressMax,
            complete: jsonObj.dailyPoint[0].complete
        }
    }
}

function morePromotions(str) {
    var m;
    if ((m = /(?="morePromotions":\[).*(?=,"suggestedRewards":\[)/g.exec(str)) !== null){
		let jsonObj = JSON.parse('{'+ m[0] +'}'); 
		let promos = new Array();
		for (let i in jsonObj.morePromotions) {
			// if the promotion is in avoid list, deduct its point from daily point
			if (AVOID_PROMOTION_TITLE.includes(jsonObj.morePromotions[i].title.toLowerCase())) {
				_status.dailyPoint.max -= jsonObj.morePromotions[i].pointProgressMax;
				continue;
			}
			// push to promos
			promos.push({
				title: jsonObj.morePromotions[i].title,
				max: jsonObj.morePromotions[i].pointProgressMax,
				complete: jsonObj.morePromotions[i].complete,
				url: jsonObj.morePromotions[i].destinationUrl
			})
		}
		// finally re-evaluate daily point progress
		if (_status.dailyPoint.max == _status.dailyPoint.progress) {
			_status.dailyPoint.complete = true;
		}
        return promos
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