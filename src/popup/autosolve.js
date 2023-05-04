
'use strict';


// Get element methods
function getElementAutoSolve() {
    return document.getElementById('auto-complete-quests');
}

// Chrome storage methods
function saveOptions() {
    const options = {
        AutoSolve: getElementAutoSolve().checked,
    };
    chrome.storage.sync.set(options, () => {
        sendOptions(options);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        AutoSolve: false,
    }, function (options) {
        getElementAutoSolve().checked = options.AutoSolve;
    });
}

function sendOptions(options) {
    chrome.runtime.sendMessage({
        action: 'updateOptions',
        content: options,
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);


getElementAutoSolve().addEventListener('click', saveOptions);


