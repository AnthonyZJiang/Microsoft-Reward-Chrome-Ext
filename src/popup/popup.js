'use strict';

document.getElementById('check-now').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'checkStatus',
    });
});

document.getElementById('ms-rewards-link').addEventListener('click', () => {
    chrome.tabs.create({
        url: 'https://account.microsoft.com/rewards/',
    });
});

document.getElementById('copy-debug-info').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'copyDebugInfo',
    });
});