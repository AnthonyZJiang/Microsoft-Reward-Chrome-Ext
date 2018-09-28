function checkPromotion() { 
    if (_status.promotions.complete) {
        // set completion
        _questingStatus.promoQuesting = STATUS_DONE;
        setCompletion();  
        return;
    }

    // notify user by notification if there are more points to grab
    var opt = {
        type: 'basic',
        title: (_status.promotions.max - _status.promotions.progress).toString() + ' points left!',
        message: 'You are just a few clicks away to grab them!',
        iconUrl: 'img/err@8x.png',
        buttons: [{ title: 'Go To Bing' }, { title: 'Later' }]
    };
    chrome.notifications.create('unfinishedPromotionNotification', opt);

    // set completion
    _questingStatus.promoQuesting = STATUS_WARNING;
    setCompletion();  
}