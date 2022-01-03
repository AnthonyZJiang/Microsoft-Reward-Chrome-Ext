'use strict';

function saveOptions() {
    const options = {
        compatibilityMode: document.getElementById('compatibility-mode').checked
    };
    chrome.storage.sync.set(options, () => {
        sendOptions(options);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        compatibilityMode: false,
    }, function (options) {
        document.getElementById('compatibility-mode').checked = options.compatibilityMode;
    });
}

function sendOptions(options) {
    chrome.runtime.sendMessage({
        action: 'updateOptions',
        content: options,
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);

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

document.getElementById('compatibility-mode').addEventListener('click', saveOptions);

function addCollapsibleLisenters() {
    const coll = document.getElementsByClassName('collapsible');
    let i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener('click', function (event) {
            event.target.classList.toggle('active');
            let curTarget = event.target;
            while (true) {
                const content = curTarget.nextElementSibling;
                if (!content) {
                    break;
                }
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
                curTarget = content;
            }
        });
    }
}

addCollapsibleLisenters();
