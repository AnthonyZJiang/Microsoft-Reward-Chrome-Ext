var _currentGoogleTrendPageIdx = 0;
var _usedAllGoogleTrendPageNotificationFired = false;
var _numSearchWordsRequired = 0;

const _googleTrendPageId = ['1', '9', '10', '23', '24', '28', '29'];

function googleTrendRequest()   {
    if (_currentGoogleTrendPageIdx >= _googleTrendPageId.length && !_usedAllGoogleTrendPageNotificationFired) {
        chrome.notifications.create('usedAllGoogleTrendPageNotification', {
            type: 'list',
            title: 'Out of search words',
            message: 'All google trend pages have been used. Cannot carry on with both or one of the searches.',
            iconUrl: 'img/bingRwLogo@3xWarning.png',
            items: [
                {
                    title: 'Total number of search words:',
                    message: _searchWordArray.length.toString()
                },
                {
                    title: 'PC search status:',
                    message: 'used ' + _pcSearchWordIdx.toString() + ' search words; progress: ' + _status.pcSearch.progress.toString() + '/' + _status.pcSearch.max.toString()
                },
                {
                    title: 'Mobile search status:',
                    message: 'used ' + _mbSearchWordIdx.toString() + ' search words; progress: ' + _status.mbSearch.progress.toString() + '/' + _status.mbSearch.max.toString()
                }
            ],
            requireInteraction: true
        });
        _usedAllGoogleTrendPageNotificationFired = true;
        // set completion
        _questingStatus.searchQuesting = STATUS_WARNING;
        setCompletion();
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('Google trend response received!')
            appendWords(this.responseXML);
        }
    };
    xhr.open('GET', 'https://trends.google.com/trends/hottrends/atom/feed?pn=p' + _googleTrendPageId[_currentGoogleTrendPageIdx], true);
    xhr.send();	
    console.log('Google trend request sent!')
}

function appendWords(doc){
    _currentGoogleTrendPageIdx++;
	// get titles
	var titles = doc.getElementsByTagName('title');
	console.log('Number of titles: ', titles.length);

	if (titles.length < 0){
        console.log('No keywords found, requesting another Google trend page.')
		getGoogleTrends(_currentGoogleTrendPageIdx);
		return;
	}
	
	// iterate through all titles
	// but skip the first one as it is 'Hot Trends'
	for (var i = 1; i < titles.length; i++){
		// if the same search word has been added, skip to the next one.
		if (_searchWordArray.includes(titles[i].textContent))
			continue;
		// add the search word
		_searchWordArray.push(titles[i].textContent);
	}

    // check the number of search words
	console.log('Number of search words: ', _searchWordArray.length, '; needs: ', _numSearchWordsRequired);
	if (_searchWordArray.length < _numSearchWordsRequired){
		// if we still need more search words
		googleTrendRequest(_currentGoogleTrendPageIdx);
	}else{
        // if we have got enough search words, waiting no more and do the search.
        bingSearch();
	}
}