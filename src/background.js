const _pageId = ["1", "9", "10", "23", "24", "28", "29"];
const _maxPCSearch = 35;
const _maxMbSearch = 25;
const _pointPerSearch = 3;
const _additionalSearch = 5;
const _mbUserAgent = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";

var _status = {
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

var _searchWordArray = new Array();
var _i = 0;
var _isPCSearchCompleted = false;
var _isMbSearchCompleted = false;
var _maxPoints;
var _earnedPoints;
var _frame = null;

function getGoogleTrends(_i) {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log("Google trend response received!")
			appendWords(this.responseXML);
		}
    };
    xhr.open("GET", "https://trends.google.com/trends/hottrends/atom/feed?pn=p" + _pageId[_i], true);
    xhr.send();
	console.log("Google trend request sent!")
}

function appendWords(doc){
	_status.pcSearch.numSearch = _status.pcSearch.max/_pointPerSearch + _additionalSearch;
	_status.mbSearch.numSearch = _status.mbSearch.max/_pointPerSearch + _additionalSearch;

	_i++;
	// get titles
	var titles = doc.getElementsByTagName('title');
	console.log("Number of titles: ", titles.length);

	if (titles.length < 0){
		getGoogleTrends(_i);
		return;
	}
	
	// iterate through all titles
	// but skip the first title as it is 'Hot Trends'
	for (var j = 1; j < titles.length; j++){
		// if the same search word has been added, skip.
		if (_searchWordArray.includes(titles[j].textContent))
			continue;
		// add the search word
		_searchWordArray.push(titles[j].textContent);
	}

	console.log("Number of _searchWordArray: ", _searchWordArray.length, "; needs: ", numPc);

	if (_i < _pageId.length && _searchWordArray.length < numPc){
		// if we still need more search words
		getGoogleTrends(_i);
	}else{
		// if we have got enough search words
		if (_status.pcSearch.complete)
			_i = numPc;
		else
			_i = 0;

		//alert('Search word list has been built. Number of searches: ' + _searchWordArray.length.toString() + ".\n\nPC and mobile searches will begin in background after OK button is clicked.\n\nProgress can be tracked from the badge text.");
		
		// start PC search
		bingPCSearch();
	}
}

function bingPCSearch() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// update extension badge
			chrome.browserAction.setBadgeText({text: "P "+ (_i+1).toString()});
			_i++;
			// if haven't reached max, do another search
			if (_i < _status.pcSearch.numSearch){
				bingPCSearch();
			} else {
				// if reached max, do mobile search
				console.log("PC search completed. Number of searches: ", _i);
				if (_status.mbSearch.complete)
					_i = _status.mbSearch.max;
				else
					_i = 0;

				// change user-agent to mobile browser and blocking request.
				chrome.webRequest.onBeforeSendHeaders.addListener(toMobileUA, {urls: ['https://www.bing.com/search?q=*']}, ['blocking', 'requestHeaders']);
				bingMbSearch();
			}
		}
    };
    xhr.open("GET", "https://www.bing.com/search?q=" + _searchWordArray[_i], true);
	xhr.send();
}

function bingMbSearch() {
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// update extension badge
			chrome.browserAction.setBadgeText({text: "M "+ (_i+1).toString()});
			_i++;
			// if haven't reached max, do another search
			if (_i < _maxMbSearch){
				bingMbSearch();
			} else {
				// if reached max
				console.log("Mobile search completed. Number of searches: ", _i);
				// restore user-agent setting
				chrome.webRequest.onBeforeSendHeaders.removeListener(toMobileUA);
				_frame = null;
				checkStatus();
				if (_isPCSearchCompleted && _isMbSearchCompleted)
				{
					alert('You have completed both search quests.')
				}	
			}
		}
    };
    xhr.open("GET", "https://www.bing.com/search?q=" + _searchWordArray[_i], true);
	xhr.send();
}

function toMobileUA(details){
	for (var _i = 0; _i < details.requestHeaders.length; ++_i) {
		if (details.requestHeaders[_i].name === 'User-Agent') {
			details.requestHeaders[_i].value = _mbUserAgent;
			break;
		}
	}
	return {requestHeaders: details.requestHeaders};
}

chrome.browserAction.onClicked.addListener(function (tab) {
	_i = 0;
	_searchWordArray = new Array();
	
	_frame = null;
	checkStatus();

	if (_isPCSearchCompleted && _isMbSearchCompleted)
	{
		alert('You have completed both search quests today.\n\n But you still have ' + (_maxPoints - _earnedPoints).toString() + ' points to earn today.')
		return;
	}	
	getGoogleTrends(_i);
});

// setInterval(
// 	function() {
// 		checkStatus();

// 	},
// 	1000
// );