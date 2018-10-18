'use strict'

// Saves options to chrome.storage
function saveOptions() {
    var userCookieExpiry = document.getElementById('set-cookie-persistent').checked ? CookieStateType.persistent : CookieStateType.sessional;
    var enableNotification = document.getElementById('enable-notification').checked;
    checkThenSetCookie(userCookieExpiry);
    uploadOption({
        enableNotification:enableNotification,
        userCookieExpiry:userCookieExpiry
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
        enableNotification:true,
        userCookieExpiry: CookieStateType.sessional
    }, function (items) {
        document.getElementById('set-cookie-persistent').checked = items.userCookieExpiry == CookieStateType.persistent;
        document.getElementById('enable-notification').checked = items.enableNotification;

        checkThenSetCookie(items.userCookieExpiry);
    });
}

function checkThenSetCookie(userCookieExpiry) {
    getAuthCookieExpiry()
        .then((currentCookieExpiry) => {
            setAuthCookieExpiry(currentCookieExpiry, userCookieExpiry)
                .then((newCookieExpiry) => {
                    document.getElementById("cookie-current-status").textContent = newCookieExpiry;
                })
                .catch((message) => {
                    document.getElementById("cookie-current-status").textContent = message;
                })
        })
        .catch((message) => {
            document.getElementById("cookie-current-status").textContent = message;
        })
}

function sendOptions(options) {
    chrome.runtime.sendMessage({
        action: 'updateOptions',
        content: options
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('check-now').addEventListener('click', () => {
    chrome.runtime.sendMessage({action: 'checkQuests'})
});
document.getElementById('ms-rewards-link').addEventListener('click', () => {
    chrome.tabs.create({url:"https://account.microsoft.com/rewards/"})
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == 'popup-update') {
        restoreOptions();
    }
})