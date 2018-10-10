const POINT_PER_SEARCH = 3;
const ADDITIONAL_SEARCH = 5;
const AVOID_PROMOTION_TITLE = [''];
const CORS_PROMOTION_TITLE = ['shop to earn', 'keep earning']

const _freshStatus = {
	pcSearch: {
		progress: 0,
		max: 0,
		numSearch: 0,
		complete: false
	},
	mbSearch: {		
		progress: 0,
		max: 0,
		numSearch: 0,
		complete: false
	},
	quizAndDaily: {
		progress: 0,
		max: 0,
		complete: false
	},
	summary: {		
		progress: 0,
		max: 0,
		complete: false
	}
};

var _frame = null;
var _status;

async function checkCompletionStatus(){
	_frame = null;
	_status = clone(_freshStatus);
	
	return await checkStatusInnerLoop()
	.then(function (xmlResponse) { return updateStatus(xmlResponse); })
	.catch(function(val){
		console.log('Status check failed.')
		console.log(val)
		// if fail, most likely the user has been logged out of his Microsoft account.
		createNotLoggedInNotification();
		return false;
	});	
}

function updateStatus(xmlResponse){
	let doc = new DOMParser().parseFromString(xmlResponse, 'text/html');		
	if (doc.getElementsByTagName('script').length < 22) {
		createWrongPageStructureNotification('Fail to check reward point status');
		return false;
	}
	
	let js = getUserStatusJSON(doc.getElementsByTagName('script')[21].text);
	
	if (js === null) {
		createWrongPageStructureNotification('Fail to check reward point status');
		return false;
	}

	getStatus(js);
	console.log('Status check completed!')
	console.log(_status)

	return _status.summary.max != 0
}

function getStatus(js) {
	_status.pcSearch = getPcSearchPoints(js);
	_status.mbSearch = getMbSearchPoints(js);
	_status.pcSearch.numSearch = (_status.pcSearch.max && !_status.pcSearch.complete) ? (_status.pcSearch.max - _status.pcSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;
	_status.mbSearch.numSearch = (_status.mbSearch.max && !_status.mbSearch.complete) ? (_status.mbSearch.max - _status.mbSearch.progress) / POINT_PER_SEARCH + ADDITIONAL_SEARCH : 0;
	_status.quizAndDaily = getQuizAndDaily(js);
	_status.summary = { 
		progress: _status.pcSearch.progress + _status.mbSearch.progress + _status.quizAndDaily.progress,
		max: _status.pcSearch.max + _status.mbSearch.max + _status.quizAndDaily.max,
		complete: _status.pcSearch.complete & _status.mbSearch.complete & _status.quizAndDaily.complete	};
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
}

function getUserStatusJSON(str) {
	try {
		var m = /(?=\{"userStatus":).*(=?\}\};)/.exec(str);
		return JSON.parse(m[0].substr(0, m[0].length - 1));
	} catch (ex) {
		return null;
	}
}

function getPcSearchPoints(js) {
	var pcSearchStatus = clone(_freshStatus.pcSearch);
	try {
		let l = js.userStatus.counters.pcSearch.length
		console.assert( l <= 2);
		js.userStatus.counters.pcSearch.forEach(function(s) {
			pcSearchStatus.progress += s.pointProgress;
			pcSearchStatus.max += s.pointProgressMax;
			pcSearchStatus.complete += s.complete;
		})
		pcSearchStatus.complete = pcSearchStatus.complete == l;
		return pcSearchStatus;
	} catch (ex) {
		createWrongPageStructureNotification('Fail to check PC search quest.')
		return pcSearchStatus;
	}
}

function getMbSearchPoints(js) {
    try {
		return {
            progress: js.userStatus.counters.mobileSearch[0].pointProgress,
            max: js.userStatus.counters.mobileSearch[0].pointProgressMax,
			complete: js.userStatus.counters.mobileSearch[0].complete,
			numSearch: 0
        };
	} catch (ex) {
		createWrongPageStructureNotification('Fail to check mobile search quest.');
		return clone(_freshStatus.mbSearch);
	}
}

function getQuizAndDaily(js) {	
	let quiz = getQuiz(js);
	let daily = getDaily(js);
	let quizDaily = {
		progress: quiz.progress + daily.progress,
		max: quiz.max + daily.max
	}
	quizDaily.complete = quizDaily.progress === quizDaily.max;
	return clone(quizDaily);
}

function getQuiz(js) {
	try {
		return {
            progress: js.userStatus.counters.activityAndQuiz[0].pointProgress,
            max: js.userStatus.counters.activityAndQuiz[0].pointProgressMax
        };
	} catch (ex) {
		createWrongPageStructureNotification('Fail to check quiz point status.');
		return clone(_freshStatus.quizAndDaily);
	}
}

function getDaily(js) {
	try {
		let daily = clone(_freshStatus.quizAndDaily);
		js.dailySetPromotions[getTodayDate()].forEach(function(val) {
			daily.progress += val.pointProgress;
			daily.max += val.pointProgressMax;
		});
		return daily;
	} catch (ex) {
		createWrongPageStructureNotification('Fail to check daily promotion point status.');
		return clone(_freshStatus.quizAndDaily);
	}	
}

function getTodayDate() {
	var date = new Date();
	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

function createWrongPageStructureNotification(msg) {
	if (_doNotNotify){
		return;
	}
	chrome.notifications.create('failStatusCheckNotification', {
		type: 'basic',
		title: msg,
		message: 'Have you logged into your MS account? If this is due to a change in MS Rewards page, a fix will be on the way soon.',
		iconUrl: 'img/err@8x.png',
		requireInteraction: true,
		buttons: [	{ title: 'Go to MS Rewards'},
					{ title: 'Be Quiet!'}],
	});
	setBadge(STATUS_ERROR)
}

function createNotLoggedInNotification() {
	if (_doNotNotify){
		return;
	}
	chrome.notifications.create('notLoggedInNotification', {
		type: 'basic',
		title: 'Fail to check complete status',
		message: 'You need to open the Microsoft  page and log into your account first.',
		iconUrl: 'img/err@8x.png',
		buttons: [	{ title: 'Go to MS Rewards'},
					{ title: 'Be Quiet!'}],
		requireInteraction: true
	});
	setBadge(STATUS_ERROR)
}

function clone(obj) {
	if (obj === null || typeof (obj) !== 'object')
        return obj;
	return JSON.parse(JSON.stringify(obj));
}