const _pageId = ["1", "9", "10", "23", "24", "28", "29"];
const _maxPCSearch = 35;
const _maxMbSearch = 25;
const _mbUserAgent = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";

var _searchWordArray = new Array();
var _i = 0;
var _isPCSearchCompleted = false;
var _isMbSearchCompleted = false;

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

	console.log("Number of _searchWordArray: ", _searchWordArray.length, "; needs: ", _maxPCSearch);

	if (_i < _pageId.length && _searchWordArray.length < _maxPCSearch){
		// if we still need more search words
		getGoogleTrends(_i);
	}else{
		// if we have got enough search words
		_i = 0;
		alert('Search word list has been built. Number of searches: ' + _searchWordArray.length.toString() + ".\n\nPC and mobile searches will begin in background after OK button is clicked.\n\nProgress can be tracked from the badge text.");
		
		// start PC search
		bingPCSearch();
	}
}

function bingPCSearch() {
	console.log(_i);
	var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// update extension badge
			chrome.browserAction.setBadgeText({text: "P "+ (_i+1).toString()});
			_i++;
			// if haven't reached max, do another search
			if (_i < _maxPCSearch){
				bingPCSearch();
			} else {
				// if reached max, do mobile search
				console.log("PC search completed. Number of searches: ", _i);
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
	console.log(_i);
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

function checkStatus(){
	var xHttp = new XMLHttpRequest();
	xHttp.open("GET", "https://account.microsoft.com/rewards/pointsbreakdown", false);
	xHttp.send();
	console.log("request sent!")
	if (xHttp.readyState == 4 && xHttp.status == 200) {
		var p = new DOMParser(); 
		var doc = p.parseFromString(xHttp.responseText, "text/html");
		const regexPCSearch = /(?="classification\.Tag":"PCSearch",)[A-z,"._:0-9]*/g;
		const regexMbSearch = /(?="classification\.Tag":"MobileSearch",)[A-z,"._:0-9]*/g;
		var str = doc.getElementsByTagName('script')[21].text;
		let m;
		while ((m = regexPCSearch.exec(str)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regexPCSearch.lastIndex) {
				regexPCSearch.lastIndex++;
			}
			
			_isPCSearchCompleted = JSON.parse("{"+ m[0] +"}").complete == 'True';
		}
		while ((m = regexMbSearch.exec(str)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regexMbSearch.lastIndex) {
			regexMbSearch.lastIndex++;
			}
			
			_isMbSearchCompleted = JSON.parse("{"+ m[0] +"}").complete == 'True';
		}
		console.log('isPCSearchCompleted: ', _isPCSearchCompleted)
		console.log('isMbSearchCompleted: ', _isMbSearchCompleted)
	}

	if (_isPCSearchCompleted && _isMbSearchCompleted)
	{
		chrome.browserAction.setBadgeText({text: "Done"});
	}
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
	checkStatus();
	if (_isPCSearchCompleted && _isMbSearchCompleted)
	{
		alert('You have completed both search quests today.')
		return;
	}	
	getGoogleTrends(_i);
});


checkStatus();