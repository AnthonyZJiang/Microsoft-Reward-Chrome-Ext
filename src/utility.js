let _prevWeekDay = -1;

function checkNewDay() {
    if (!isNewDay()) {
        // if a new day, reset variables
        resetDayBoundParams();
    }
}

function isNewDay() {
    let day;
    if ((day = new Date().getDay()) != _prevWeekDay) {
        _prevWeekDay = day;
        return false;
    }
    return true;
}

function getDomFromText(text) {
    return new DOMParser().parseFromString(text, 'text/html');
}

function getTodayDate() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return `${mm}/${dd}/${today.getFullYear()}`;
}

function resetDayBoundParams() {
    SearchInst = new SearchQuest();
    _usedAllGoogleTrendPageNotificationFired = false;
}

function enableDebugNotification() {
    _debugNotificationEnabled = true;
    chrome.storage.sync.set({
        enableDebugNotification: true,
    }, () => {
        console.log('Debug notification enabled!');
    });
}

function disableDebugNotification() {
    _debugNotificationEnabled = false;
    chrome.storage.sync.set({
        enableDebugNotification: false,
    }, () => {
        console.log('Debug notification disabled!');
    });
}

function isDebugNotificationEnabled() {
    console.log('Debug notification', _debugNotificationEnabled ? 'is' : 'is not', 'enabled.');
}

function isHttpUrlValid(url) {
    // rule:
    // starts with https:// or http://
    // followed by non-whitespace character
    // must end with a word character, a digit, or close bracket (')') with or without forward slash ('/')
    return /^https?:\/\/\S+.*\..*[\w\d]+\)?\/?$/i.test(url);
}
