function checkQuizAndDaily() { 
    if (_status.quizAndDaily.complete) {
        return;
    }

    // notify user by notification if there are more points to grab
    var opt = {
        type: 'basic',
        title: (_status.quizAndDaily.max - _status.quizAndDaily.progress).toString() + ' points left!',
        message: 'You are just a few clicks away to grab them!',
        iconUrl: 'img/err@8x.png',
        buttons: [{ title: 'Go To Bing' }, { title: 'Later' }]};

    chrome.notifications.create('unfinishedPromotionNotification', opt);
}