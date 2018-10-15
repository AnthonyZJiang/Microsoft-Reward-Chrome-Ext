'use strict'

// Saves options to chrome.storage
function saveOptions() {
    var isCookiePersistent = document.getElementById('cookie-persistent').checked;

    checkThenSetCookie(isCookiePersistent);
    uploadOption(isCookiePersistent)
}

function uploadOption(isCookiePersistent) {
    chrome.storage.sync.set({
        userPersistentAuthCookie: isCookiePersistent
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('saved-notice');
        status.textContent = 'Saved!';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({
        userPersistentAuthCookie: false
    }, function (items) {
        document.getElementById('cookie-persistent').checked = items.userPersistentAuthCookie;

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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('ms-rewards-link').addEventListener('click', () => {
    chrome.tabs.create({url:"https://account.microsoft.com/rewards/"})
});