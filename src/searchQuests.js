const MB_USER_AGENT = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19';
const SEARCH_TYPE_PC_SEARCH = 0;
const SEARCH_TYPE_MB_SEARCH = 1;

var _searchWordArray = new Array();
var _pcSearchWordIdx = 0;
var _mbSearchWordIdx = 0;

var _currentSearchNum = 0;
var _currentSearchType = NaN

function doSearchQuests() {
    _numSearchWordsRequired = Math.max(_pcSearchWordIdx + _status.pcSearch.numSearch, _mbSearchWordIdx + _status.mbSearch.numSearch);

    // check if we have enough words to carry on searching
    if (_numSearchWordsRequired < _searchWordArray.length) {
        // if yes, lets do pc search
        bingSearch();
    } else {
        // if not, add more words to the array
        googleTrendRequest();
    }
}

function bingSearch() {
    _currentSearchNum = 0;
    // change badge
    chrome.browserAction.setBadgeText({text: '...'});

    // always do pc search first
    if (_currentSearchType != SEARCH_TYPE_PC_SEARCH){
        // but let's first check whether we need to do it
        if (!_status.pcSearch.complete) {
            preparePCSearch();
        } else {
            // if completed, skip ahead to mobile search
            prepareMbSearch();
        }
    } else {
        prepareMbSearch();
    }

    // do search!
    bingSearchXHR();
}

function preparePCSearch() {
    _currentSearchType = SEARCH_TYPE_PC_SEARCH;
    // restore user-agent
    try {
        chrome.webRequest.onBeforeSendHeaders.removeListener(toMobileUA);
    }
    catch (ex) {}
}

function prepareMbSearch() {
    _currentSearchType = SEARCH_TYPE_MB_SEARCH;
    // change user-agent to mobile browser and blocking request.
    chrome.webRequest.onBeforeSendHeaders.addListener(toMobileUA, {urls: ['https://www.bing.com/search?q=*']}, ['blocking', 'requestHeaders']);
}

function bingSearchXHR() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
            _currentSearchNum++;
            let numSearchRequired;
            if (_currentSearchType == SEARCH_TYPE_PC_SEARCH) {
                _pcSearchWordIdx++;
                numSearchRequired = _status.pcSearch.numSearch
            }else {
                _mbSearchWordIdx++;
                numSearchRequired = _status.mbSearch.numSearch
            }

			// if haven't reached max, do another search
			if (_currentSearchNum < numSearchRequired){
				bingSearchXHR();
			} else {
				// if reached max
                console.log('Search completed. Number of searches: ', _currentSearchNum);
                if (_currentSearchType == SEARCH_TYPE_PC_SEARCH){
                    // do mobile search now.
                    bingSearch();
                } else {
                    // when mobile search completes, restore user-agent setting
                    chrome.webRequest.onBeforeSendHeaders.removeListener(toMobileUA);
                    // check if we have completed the quests after 10 seconds
                    setTimeout(function() {checkSearchQuests();}, 10000);
                }
			}
		}
    };
    var i;
    if (_currentSearchType == SEARCH_TYPE_PC_SEARCH){
        i = _pcSearchWordIdx;
    } else {
        i = _mbSearchWordIdx;
    }
    xhr.open('GET', 'https://www.bing.com/search?q=' + _searchWordArray[i], true);
	xhr.send();
}

function checkSearchQuests(){
    // refresh status
    checkCompletionStatus();
    // are quests completed?
    if (!_status.pcSearch.complete || !_status.mbSearch.complete){
        doSearchQuests();
    } else {
        // when both quests are completed.
        _questingStatus.searchQuesting = STATUS_COMPLETE;
        setCompletion();
    }
}

function toMobileUA(details){
	for (let i in details.requestHeaders) {
		if (details.requestHeaders[i].name === 'User-Agent') {
			details.requestHeaders[i].value = MB_USER_AGENT;
			break;
		}
	}
	return {requestHeaders: details.requestHeaders};
}