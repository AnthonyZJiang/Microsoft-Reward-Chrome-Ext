let _prevWeekDay = -1;

function checkNewDay() {
    if (isNewDay()) {
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
    searchQuest.reset();
    googleTrend.reset();
}

function isHttpUrlValid(url) {
    // rule:
    // starts with https:// or http://
    // followed by non-whitespace character
    // must end with a word character, a digit, or close bracket (')') with or without forward slash ('/')
    return /^https?:\/\/\S+.*\..*[\w\d]+\)?\/?$/i.test(url);
}

function getElementByXpath(path, element) {
    return document.evaluate(path, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }