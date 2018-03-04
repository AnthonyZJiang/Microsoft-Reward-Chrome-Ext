var pageId = ["1", "9", "10", "23", "24", "28", "29"];
var searchWords = new Array();
var i = 0;
var maxPCSearch = 35;
var maxMbSearch = 25;
var mobileUA = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";

async function buildSearchWords(tab){
	// goto google trend feed
	await updateTab("https://trends.google.com/trends/hottrends/atom/feed?pn=p" + pageId[i], tab);

	chrome.tabs.sendMessage(tab.id, {action: 'getKeywordsFromGoogleTrends'}, function(response) {
		console.log('response: ', response.content);
		for (var j = 0; j < response.content.length; j++){
			if (searchWords.includes(response.content[j]))
				continue;
			searchWords.push(response.content[j]);
		}

		console.log('searchWords: ', i, searchWords);

		i++;

		if (i < pageId.length && searchWords.length < maxPCSearch)
			buildSearchWords(tab);
		else{
			alert('Search word list has been built. Number of searches: ' + searchWords.length.toString());
			bingSearch(tab)
		}
	});
}

async function bingSearch(tab){
	// pc search
	for (var j = 0; j < maxPCSearch; j++){
		await updateTab('https://www.bing.com/search?q=' + searchWords[j], tab);
		chrome.browserAction.setBadgeText({text: "P "+(j+1).toString()});
	}

	// mobile search
	// change user-agent to mobile browser and blocking request.
	chrome.webRequest.onBeforeSendHeaders.addListener(toMobileUA, {urls: ['https://www.bing.com/search?q=*']}, ['blocking', 'requestHeaders']);
	try	{
		for (var j = 0; j < maxMbSearch; j++){
			await updateTab('https://www.bing.com/search?q=' + searchWords[j], tab);
			chrome.browserAction.setBadgeText({text: "M "+(j+1).toString()});
		}
	}
	finally{
		// restore user-agent setting
		chrome.webRequest.onBeforeSendHeaders.removeListener(toMobileUA);
		await updateTab('https://account.microsoft.com/rewards/dashboard', tab);
	}
}

function toMobileUA(details){
	for (var i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name === 'User-Agent') {
			details.requestHeaders[i].value = mobileUA;
			break;
		}
	}
	return {requestHeaders: details.requestHeaders};
}

function updateTab (url, tab) {
    return new Promise(resolve => {
        chrome.tabs.update(tab.id, {url}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}

chrome.browserAction.onClicked.addListener(function (tab) {
	i = 0;
	searchWords = new Array();
	buildSearchWords(tab);
});