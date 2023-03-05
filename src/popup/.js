'use strict';


// Get element methods
function getElementCountdownAlgorithm() {
    return document.getElementById('use-old-countdown-algorithm');
}

// Chrome storage methods
function saveOptions() {
    const options = {
        compatibilityMode: getElementCountdownAlgorithm().checked,
    };
    chrome.storage.sync.set(options, () => {
        sendOptions(options);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        compatibilityMode: false,
    }, function (options) {
        getElementCountdownAlgorithm().checked = options.compatibilityMode;
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

document.getElementById('copy-debug-info').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'copyDebugInfo',
    });
});

getElementCountdownAlgorithm().addEventListener('click', saveOptions);

document.getElementById('version-number').innerText = 'V' + chrome.runtime.getManifest().version;
