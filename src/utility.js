function checkNewDay() {
	if (!isNewDay()) {
		// if a new day, reset variables
		resetDayBoundParams();
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

function resetDayBoundParams() {
	SearchInst = new SearchQuest();
	_usedAllGoogleTrendPageNotificationFired = false;
}

function enableDebugNotification() {
	_debugNotificationEnabled = true;
	chrome.storage.sync.set({enableDebugNotification:true}, () => {
		console.log("Debug notification enabled!");
	})
}

function disableDebugNotification() {
	_debugNotificationEnabled = false;
	chrome.storage.sync.set({enableDebugNotification:false}, () => {
		console.log("Debug notification disabled!");
	})
}

function isDebugNotificationEnabled() {
	console.log('Debug notification', _debugNotificationEnabled ? 'is':'is not','enabled.')
}

function isHttpUrlValid(url) {
	// rule:
	// starts with https:// or http://
	// followed by non-whitespace character
	// must end with a word character, a digit, or close bracket (')') with or without forward slash ('/')
	return /^https?:\/\/\S+.*\..*[\w\d]+\)?\/?$/i.test(url);
}