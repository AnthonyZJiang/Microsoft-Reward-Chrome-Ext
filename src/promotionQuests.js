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
        title: (_status.promotion.max - _status.promotion.progress).toString() + ' points left!',
        message: 'You are just a few clicks away to grab them!',
        iconUrl: 'img/err@8x.png',
        buttons: [{ title: 'Go To Bing' }, { title: 'Later' }]
    };
    chrome.notifications.create('unfinishedPromotionNotification', opt);

    // set completion
    _questingStatus.promoQuesting = STATUS_WARNING;
    setCompletion();  
}

/* async function doPromotionQuests(){
    var urlPromotion = new Array();
    var userInterventionPromotion = new Array();

    _status.promotions.forEach(promo => {
        // if completed
        if (promo.complete) {
            return;
        }
        // if url promotion
        let url;
        if ((url = promo.url) != null){
            urlPromotion.push(promo);
            if (promo.cors){
                corsPromotionXHR(url);
            } else {
                promotionXHR(url);
            }
        } else { // otherwise, treat it as user interaction required promotion
            userInterventionPromotion.push(promo);
        }
    });
   
    // check if we have got all the url promotions after 10 seconds
    if (urlPromotion.length) {
        setTimeout(async function() {await checkPromotion(urlPromotion, userInterventionPromotion);}, 10000);
    }
}

function corsPromotionXHR(url){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (this.readyState == 4 && this.status == 200){
            console.log('Url promotion (CORS) request successful.')
        }
    };    
    xhr.onerror = function() {
        console.log('Url promotion (CORS) request unsuccessful. There was an error!');
    };

    // set properties for CORS
    //xhr.withCredentials = true;
    xhr.open('GET', 'https://corsanthony.herokuapp.com/'+url, true);
    xhr.send();
}

function promotionXHR(url){
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (this.readyState == 4 && this.status == 200){
            console.log('Url promotion request successful.')
        }
    };    
    xhr.onerror = function() {
        console.log('Url promotion request unsuccessful. There was an error!');
    };

    // set properties for CORS
    //xhr.withCredentials = true;
    xhr.open('GET', url, true);
    xhr.send();
}

async function checkPromotion(urlPromotion, userInterventionPromotion) { 
    // refresh status
    await checkCompletionStatus();
    // find the url promotion
    for (let i in urlPromotion) {
        let promo;
        if (!(promo = findPromotion(urlPromotion[i], _status.promotions)).complete) {
            // if the promotion is still incomplete, treat it as user interaction required promotion
            userInterventionPromotion.push(promo);
        }
    }
    if (userInterventionPromotion.length) {
        // notify user by notification if there are more points to grab
        var opt = {
            type: 'list',
            title: '',
            message: 'You still have some points left to get!',
            iconUrl: 'img/err@8x.png',
            items: [],
            buttons: [{ title: 'Go To Bing' }, { title: 'Later' }]
        };
        // add promotions to notification list
        var p = 0;
        for (let i in userInterventionPromotion) {
            opt.items.push(
                { title: '- "' + userInterventionPromotion[i].title + '"',
                    message: ' worth ' + userInterventionPromotion[i].max.toString() + ' points'}
            );
            p += userInterventionPromotion[i].max;
        }
        opt.title = p.toString() + ' more points to earn!'
        chrome.notifications.create('unfinishedPromotionNotification', opt);

        // set completion
        _questingStatus.promoQuesting = STATUS_WARNING;
        setCompletion();
    } else {
        // set completion
        _questingStatus.promoQuesting = STATUS_DONE;
        setCompletion();  
    }      
}

function findPromotion(promotion, promotionList){
    for (let i in promotionList) {
        if (promotion.title == promotionList[i].title) {
            return promotionList[i];
        }
    }
} */