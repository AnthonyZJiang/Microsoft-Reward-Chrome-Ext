'use strict'

// Saves options to chrome.storage
function saveOptions() {
    var userCookieExpiry = getSetCookieCheckboxNode().checked ? CookieStateType.persistent : CookieStateType.sessional;
    var enableNotification = getNotificationCheckboxNode().checked;
    var corsApi = getVerifiedCorsAPI(getCorsAPIInputNode().value);
    checkThenSetCookie(userCookieExpiry);
    uploadOption({
        enableNotification: enableNotification,
        userCookieExpiry: userCookieExpiry,
        corsApi: corsApi
    });
}

function uploadOption(options) {
    chrome.storage.sync.set(options, () => {
        // Update status to let user know options were saved.
        var status = document.getElementById('saved-notice');
        status.textContent = 'Saved!';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
        sendOptions(options);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({
        enableNotification: true,
        userCookieExpiry: CookieStateType.sessional,
        corsApi: ''
    }, function (options) {
        getSetCookieCheckboxNode().checked = options.userCookieExpiry == CookieStateType.persistent;
        getNotificationCheckboxNode().checked = options.enableNotification;
        getCorsAPIInputNode().value = options.corsApi;
        checkThenSetCookie(options.userCookieExpiry);
    });
}

function checkThenSetCookie(userCookieExpiry) {
    getAuthCookieExpiry()
        .then((currentCookieExpiry) => {
            setAuthCookieExpiry(currentCookieExpiry, userCookieExpiry)
                .then((newCookieExpiry) => {
                    getCookieCurrentStatusNode().textContent = newCookieExpiry;
                })
                .catch((message) => {
                    getCookieCurrentStatusNode().textContent = message;
                })
        })
        .catch((message) => {
            getCookieCurrentStatusNode().textContent = message;
        })
}

function sendOptions(options) {
    chrome.runtime.sendMessage({
        action: 'updateOptions',
        content: options
    });
}

function getVerifiedCorsAPI(corsAPI) {
    if (corsAPI.endsWith('/')) {
        return corsAPI;
    }
    return getCorrectedCorsAPI(corsAPI);
}

function getCorrectedCorsAPI(corsAPI){
    return corsAPI+'/';
}

function getSetCookieCheckboxNode(){
    return document.getElementById('set-cookie-persistent');
}

function getNotificationCheckboxNode(){
    return document.getElementById('enable-notification');
}

function getCorsAPIInputNode() {
    return document.getElementById('cors-api');
}

function getCookieCurrentStatusNode() {
    return document.getElementById("cookie-current-status");
}

document.addEventListener('DOMContentLoaded', restoreOptions);

document.getElementById('save').addEventListener('click', saveOptions);

document.getElementById('check-now').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'checkStatus'
    })
});

document.getElementById('ms-rewards-link').addEventListener('click', () => {
    chrome.tabs.create({
        url: "https://account.microsoft.com/rewards/"
    })
});

document.querySelectorAll('.tooltip-github-help').forEach((ele) => {
    ele.addEventListener('click', () => {
        chrome.tabs.create({
            url:"https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext#optional-setup"
        })
    })
})

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == 'popup-update') {
        restoreOptions();
    }
})