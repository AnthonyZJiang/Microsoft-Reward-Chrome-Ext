'use strict'

// Saves options to chrome.storage
function saveOptions() {
    var userPersistentAuthCookie = document.getElementById('set-cookie-persistent').checked;
    var enableNotification = document.getElementById('enable-notification').checked;
    checkThenSetCookie(userPersistentAuthCookie);
    uploadOption({
        enableNotification:enableNotification,
        userPersistentAuthCookie:userPersistentAuthCookie
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
        userPersistentAuthCookie: false
    }, function (items) {
        document.getElementById('set-cookie-persistent').checked = items.userPersistentAuthCookie;
        document.getElementById('enable-notification').checked = items.enableNotification;

        checkThenSetCookie(items.userPersistentAuthCookie);
    });
}

function checkThenSetCookie(userPersistentAuthCookie) {
    getAuthCookieStatus()
        .then((val) => {
            setCookie(val, userPersistentAuthCookie)
                .then((val) => {
                    document.getElementById("cookie-current-status").textContent = val;
                })
                .catch((val) => {
                    document.getElementById("cookie-current-status").textContent = val;
                })
        })
        .catch((val) => {
            document.getElementById("cookie-current-status").textContent = val;
        })
}

function setCookie(currentStatus, userPersistentAuthCookie) {
    if (currentStatus != CookieStateType.persistent && userPersistentAuthCookie) {
        return setPersistentAuthCookie();
    }

    if (currentStatus != CookieStateType.sessional && !userPersistentAuthCookie) {
        return setSessionalAuthCookie();
    }

    return new Promise((resolve) => resolve(currentStatus));
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