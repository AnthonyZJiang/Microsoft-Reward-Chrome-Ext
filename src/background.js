'use strict';

function onExtensionLoad() {
    setBadge(new GreyBadge());
    loadSavedSettings();
    getDeveloperSettings();
    setDelayedInitialisation(5000);
}

function loadSavedSettings() {
    chrome.storage.sync.get({
        compatibilityMode: false,
        AutoSolve: false
    }, function (options) {
        _compatibilityMode = options.compatibilityMode;
        _autosolve = options.AutoSolve
    });
}

async function getDeveloperSettings() {
    const devJson = chrome.runtime.getURL('developer.json');
    const fetchProm = await fetch(devJson, {method: 'GET'}).then((response) => {
        return response.json();
    }).then((json) => {
        developer = json;
        console.log('Developer mode enabled.');
        console.log(developer);
    }).catch((ex) => {
        if (ex.name == 'TypeError') {
            return;
        }
        throw ex;
    });
}

// -----------------------------
// Work
// -----------------------------
function setDelayedInitialisation(ms) {
    setTimeout(
        function () {
            initialize();
        },
        ms,
    );
}

function initialize() {
    doBackgroundWork();

    // check every 120 minutes for possible new promotion
    setInterval(
        function () {
            doBackgroundWork();
        },
        WORKER_ACTIVATION_INTERVAL,
    );
}

async function doBackgroundWork() {
    if (searchQuest.jobStatus == STATUS_BUSY || userDailyStatus.jobStatus == STATUS_BUSY) {
        return;
    }

    await waitTillOnline();

    setBadge(new BusyBadge());

    checkNewDay();
    await checkDailyRewardStatus();

    if (isCurrentBadge('busy')) {
        setBadge(new DoneBadge());
    }
}

async function waitTillOnline() {
    while (!navigator.onLine) {
        await setTimeoutAsync(WAIT_FOR_ONLINE_TIMEOUT);
    }
}

async function setTimeoutAsync(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkDailyRewardStatus() {
    // update status
    let result;
    try {
        result = await userDailyStatus.update();
    } catch (ex) {
        handleException(ex);
    }
    if (!result || !userDailyStatus.summary.isValid) {
        setBadge(new ErrorBadge());
        return;
    }

    await doSearchQuests();
    
    checkQuizAndDaily();
}

async function doSearchQuests() {
    if (userDailyStatus.summary.isCompleted) {
        return;
    }

    if (!userDailyStatus.pcSearchStatus.isCompleted || !userDailyStatus.mbSearchStatus.isCompleted) {
        try {
            await searchQuest.doWork(userDailyStatus);
        } catch (ex) {
            handleException(ex);
        }
    }
}




const WORKER_ACTIVATION_INTERVAL = 7200000; // Interval at which automatic background works are carried out, in ms.
const WAIT_FOR_ONLINE_TIMEOUT = 60000;

const googleTrend = new GoogleTrend();
const userDailyStatus = new DailyRewardStatus();
const searchQuest = new SearchQuest(googleTrend);
let developer = false;
let userAgents;
let _compatibilityMode;
let _autosolve;

chrome.runtime.onMessage.addListener(async function (request,sender) {
    if (request.action == 'checkStatus') {
        await doBackgroundWork();
    }
    if (request.action == 'updateOptions') {
        _compatibilityMode = request.content.compatibilityMode;
        _autosolve = request.content.AutoSolve;
        return;
    }
    if (request.action == 'copyDebugInfo') {
        await getDebugInfo();
    }
    if (request.action == 'closeTab') {
        //console.log(sender.tab.id)
        if(_autosolve){
            await chrome.tabs.remove(sender.tab.id);
        }
        
    }
    if (request.action == 'test') {

        //userDailyStatus.dailySetUrls.urlReward = ["ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b"]
        //userDailyStatus.morePromosUrls.urlReward = ["ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b","ESES_moreactivities_offer_20230331b"]
        //userDailyStatus.morePromosUrls.quiz = ["https://www.google.es/","https://www.google.es/","https://www.google.es/","https://www.google.es/","https://www.google.es/","https://www.google.es/","https://www.google.es/"]
        await openUrlRewards();
        await openQuizzes();
        
    }
});

async function openQuizzes(){
    let daily = userDailyStatus.dailySetUrls.quiz; //get daily array
    let more = userDailyStatus.morePromosUrls.quiz; //get mora promos array
    await opentabs(daily);//open daily urls
    await opentabs(more); //open more promos urls
    return;
}

async function opentabs(urls){
    for (let i =0 ; i< urls.length;i++)
    await chrome.tabs.create(
        {
            url: urls[i],
            active: false
        }
    )
    return;
}

async function openUrlRewards(){

    chrome.tabs.create(
        {
            url: "https://rewards.bing.com/",
            active: false
        },
        async (tab) => {
            let tabID = tab.id
            wait(1000);
            await openCards(userDailyStatus.dailySetUrls.urlReward,tabID);
            
            await openCards(userDailyStatus.morePromosUrls.urlReward,tabID);
            setTimeout(() =>  chrome.tabs.remove(tabID),1000) // we wait 1000ms to avoid erorrs

           
        }
    )
    return;
}

async function openCards(cardsIDs,tabId){
    for (let i =0 ; i< cardsIDs.length;i++){
        await chrome.tabs.executeScript(
            tabId,
            {
            code: `document.querySelector("div[data-bi-id='${cardsIDs[i]}']").children[0].click()` // click the card with the provied id
        }
        )
    }
    
    return;
}


function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
}



chrome.tabs.onUpdated.addListener(async function(tabId,changeInfo,tab){
    let url = tab.url;
    if (url.includes("https://www.bing.com/search?q=") && changeInfo.status == 'complete'){ //make sure the page has finished loading
        if (url.includes("PUBL=RewardsDO")){ // url reward tab opened by script
            console.log("closing");
            if(_autosolve){ // check if autosolving is enabled so it has been opening the tab auto
                setTimeout(() => chrome.tabs.remove(tabId),1000) 
            }
            
        }
        else{
            if(_autosolve){// if autosolve is enabled
            console.log("once");
            setTimeout(() => 
            chrome.tabs.executeScript(tabId,{
                file: 'solveContent.js'
            }),3000);// wait for page load or refresh
        }
    }
        // execute code once
        
    }
});

onExtensionLoad();
