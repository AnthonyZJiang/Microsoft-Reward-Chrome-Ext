'use strict'

function handleException(ex) {
    if (ex.name == 'GoogleTrendOverflow') {
        notifyOutOfSearchWords();
    }

    if (ex.name == 'ParseJSONFailed') {
        notifyJSONFailed();
    }

    if (ex.name == 'FetchRedirected') {
        notifyRedirected();
    }

    setBadge(new ErrorBadge());	
    
    logException(ex);
    throw ex;
}

function logException(ex) {
    console.log('InnerException:', ex.innerException);
}

var _usedAllGoogleTrendPageNotificationFired = false;

function notifyOutOfSearchWords() {
    if (!_notificationEnabled || _usedAllGoogleTrendPageNotificationFired) {
        return;
    }

    chrome.notifications.create('usedAllGoogleTrendPageNotification', {
        type: 'list',
        title: 'Out of search words',
        message: 'All google trend pages have been used. Cannot carry on with both or one of the searches.',
        iconUrl: 'img/err@8x.png',
        requireInteraction: true
    });
    _usedAllGoogleTrendPageNotificationFired = true;
}

function notifyQuizDailyPoints() {
    if (!_notificationEnabled) {
        return;
    }
    var opt = {
        type: 'basic',
        title: (StatusInst.quizAndDailyStatus.max - StatusInst.quizAndDailyStatus.progress).toString() + ' points left!',
        message: 'You are just a few clicks away to grab them!',
        iconUrl: 'img/warn@8x.png',
        buttons: [{
                title: 'Go To Bing'
            },
            {
                title: 'Be Quiet!'
            }
        ]
    };
    chrome.notifications.create('unfinishedPromotionNotification', opt);
}

function notifyJSONFailed() {
    if (!_notificationEnabled) {
        return;
    }
    var opt = {
        type: 'basic',
        title: 'Error',
        message: 'Failed to check your daily reward progress because MS Rewards page has changed. A fix is underway.',
        iconUrl: 'img/err@8x.png',
        buttons: [{
                title: 'Go To Bing'
            },
            {
                title: 'Be Quiet!'
            }
        ]
    };
    chrome.notifications.create('jsonFailedNotification', opt);
}

function notifyRedirected() {
    if (!_notificationEnabled) {
        return;
    }
    var opt = {
        type: 'basic',
        title: 'Not signed in?',
        message: 'Failed to check your daily progress. Maybe you haven\'t signed into your MS account?',
        iconUrl: 'img/err@8x.png',
        buttons: [{
                title: 'Go To Bing'
            },
            {
                title: 'Be Quiet!'
            }
        ]
    };
    chrome.notifications.create('jsonFailedNotification', opt);
}