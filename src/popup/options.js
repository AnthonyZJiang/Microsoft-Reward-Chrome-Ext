'use strict';


// Get element methods
function getElementCountdownAlgorithm() {
    return document.getElementById('use-old-countdown-algorithm');
}

function getElementPcUaOverrideEnable() {
    return document.getElementById('pc-ua-override-enable');
}

function getElementMbUaOverrideEnable() {
    return document.getElementById('mb-ua-override-enable');
}

function getElementPcUaOverrideValue() {
    return document.getElementById('pc-ua-override-value');
}

function getElementMbUaOverrideValue() {
    return document.getElementById('mb-ua-override-value');
}

// Chrome storage methods
function saveOptions() {
    const options = {
        compatibilityMode: getElementCountdownAlgorithm().checked,
        pcUaOverrideEnable: getElementPcUaOverrideEnable().checked,
        mbUaOverrideEnable: getElementMbUaOverrideEnable().checked,
        pcUaOverrideValue: getElementPcUaOverrideValue().value,
        mbUaOverrideValue: getElementMbUaOverrideValue().value,
    };
    chrome.storage.sync.set(options, () => {
        sendOptions(options);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        compatibilityMode: false,
        pcUaOverrideEnable: false,
        mbUaOverrideEnable: false,
        pcUaOverrideValue: '',
        mbUaOverrideValue: '',
    }, function (options) {
        getElementCountdownAlgorithm().checked = options.compatibilityMode;
        getElementPcUaOverrideEnable().checked = options.pcUaOverrideEnable;
        getElementMbUaOverrideEnable().checked = options.mbUaOverrideEnable;
        getElementPcUaOverrideValue().value = options.pcUaOverrideValue;
        getElementMbUaOverrideValue().value = options.mbUaOverrideValue;
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
getElementPcUaOverrideEnable().addEventListener('click', saveOptions);
getElementMbUaOverrideEnable().addEventListener('click', saveOptions);
getElementPcUaOverrideValue().addEventListener('change', saveOptions);
getElementMbUaOverrideValue().addEventListener('change', saveOptions);

document.getElementById('version-number').innerText = 'V' + chrome.runtime.getManifest().version;
