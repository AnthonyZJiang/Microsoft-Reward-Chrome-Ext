var _urlPromotion;
var _userInteractionPromotion;

function doPromotionQuests(){
    _urlPromotion = new Array();
    _userInteractionPromotion = new Array();

    _status.morePromotions.forEach(promo => {
        // if completed
        if (promo.complete) {
            return;
        }
        // if url promotion
        let url;
        if ((url = promo.url) != null){
            _urlPromotion.push(promo);
            promotionXHR(url);
        } else { // otherwise, treat it as user interaction required promotion
            _userInteractionPromotion.push(promo);
        }
    });

    // check if we have got all the url promotions after 10 seconds
    if (_urlPromotion.length) {
        setTimeout(function() {
            // refresh status
            checkCompletionStatus();
            // find the url promotion
            for (let i in _urlPromotion) {
                let promo;
                if (!(promo = findPromotion(_urlPromotion[i], _status.morePromotions)).complete) {
                    // if the promotion is still incomplete, treat it as user interaction required promotion
                    _userInteractionPromotion.push(promo);
                }
            }
            
            // notify user by notification if nearing the end of day
            var opt = {
                type: 'list',
                title: 'Microsoft Rewards',
                message: 'You still have some points left to get!',
                iconUrl: 'img/bingRwLogo@3x.png',
                items: [{title: 'You still have some points left to get!', message:''}],
                buttons: [{ title: 'Go To Microsoft Reward' }, { title: 'Ignore or Later' }]
            };
            for (let i in _userInteractionPromotion) {
                opt.items.push(
                    { title: '- "' + _userInteractionPromotion[i].title + '"',
                      message: ' worth' + _userInteractionPromotion[i].max.toString() + ' points'}
                );
            }
            chrome.notifications.create('unfinishedPromotionNotification', opt);

            if (_status.dailyPoint.complete){
                setBadge(STATUS_COMPLETE);
            } else {
                setBadge(STATUS_WARNING);
            }
            _sendCompleteNotification = false;
        }, 2000);
    }
}

function promotionXHR(url){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            console.log('url promotion completed.')
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

function findPromotion(promotion, promotionList){
    for (let i in promotionList) {
        if (promotion.title == promotionList[i].title) {
            return promotionList[i];
        }
    }
}