var _isPCSearchCompleted = false;
var _isMbSearchCompleted = false;
var _maxPoints;
var _earnedPoints;
var pcSearchStatus = {
    progress: 0,
    max: 0,
    complete: false
}
function checkStatus(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://account.microsoft.com/rewards/pointsbreakdown", false);
	try{
		xhr.send();
	} catch (ex) {
		// if fail, most likely the user has been logged out of Microsoft account.
		if (_frame == null){
			// open an iframe and goto ms page.
			_frame = document.createElement('iframe');
			_frame.src = 'https://account.microsoft.com/rewards/pointsbreakdown';
			document.body.appendChild(_frame);
			checkStatus();
		} else {
			chrome.notifications.create('failStatusCheck', {
				type: "basic",
				title: "Fail to check complete status",
				message: "You need to open the Microsoft reward page and log into your account first.",
				iconUrl: "url_to_small_icon",
				buttons: [	{ title: "Go to MS reward"},
							{ title: "Later"}],
				requireInteraction: ture
			  });
			chrome.notifications.onButtonClicked.addListener(function (notificationid, buttonindex) {
				if (notificationid == 'failStatusCheck'){
					if (buttonindex == 0){
						chrome.tabs.create({
							url: 'https://account.microsoft.com/rewards/pointsbreakdown',
							active: true});
					} else {
						chrome.notifications.clear(notificationid);
					}
				}
			});
		}
	}

	console.log("request sent!")
	if (xhr.readyState == 4 && xhr.status == 200) {
		let p = new DOMParser(); 
		let doc = p.parseFromString(xhr.responseText, "text/html");
		const regexPCSearch = /(?="classification\.Tag":"PCSearch",)[A-z,"._:0-9]*/g;
		const regexMbSearch = /(?="classification\.Tag":"MobileSearch",)[A-z,"._:0-9]*/g;
		const regexPointStatus = /(?="dailyPoint":\[)[A-z,"._:0-9{]*/g;
		const regexMorePromotion = /(?="morePromotions":\[).*(?=,"suggestedRewards":\[)/g;			
        let str = doc.getElementsByTagName('script')[21].text;
        return {
            pcSearch: pcSearch(str),
            mbSearch: mbSearch(str),
            dailyPoint: dailyPoint(str),
            morePromotions: morePromotions(str)
        };
	}
    return null;
	//chrome.browserAction.setBadgeText({text: (_earnedPoints/_maxPoints*100).toString().substr(0,4)});
}

function pcSearch(str) {
    let m;
    if ((m = /(?="pcSearch":\[).*(?=,"mobileSearch":\[)/g.exec(str)) !== null){
        jsonObj = JSON.parse("{"+ m[0] +"}");
        return {
            progress: jsonObj.pcSearch[0].pointProgress,
            max: jsonObj.pcSearch[0].pointProgressMax,
            complete: jsonObj.pcSearch[0].complete
        }
    }
}

function mbSearch(str) {
    let m;
    if ((m = /(?="mobileSearch":\[).*(?=,"dailyPoint":\[)/g.exec(str)) !== null){
        jsonObj = JSON.parse("{"+ m[0] +"}");
        return {
            progress: jsonObj.mobileSearch[0].pointProgress,
            max: jsonObj.mobileSearch[0].pointProgressMax,
            complete: jsonObj.mobileSearch[0].complete
        }
    }
}

function morePromotions(str) {
    let m;
    if ((m = /(?="morePromotions":\[).*(?=,"suggestedRewards":\[)/g.exec(str)) !== null){
        jsonObj = JSON.parse("{"+ m[0] +"}");        
        return {
            progress: jsonObj.dailyPoint[0].pointProgress,
            max: jsonObj.dailyPoint[0].pointProgressMax,
            complete: jsonObj.dailyPoint[0].complete
        }
    }
}

function dailyPoint(str) {
    let m;
    if ((m = /(?="dailyPoint":\[).*(?=,"lastOrder":\{)/g.exec(str)) !== null){
        return JSON.parse("{"+ m[0] +"}");
    }
}