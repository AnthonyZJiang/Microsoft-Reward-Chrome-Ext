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

function addCollapsibleLisenters() {
    const coll = document.getElementsByClassName('collapsible');
    let i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener('click', function (event) {
            event.target.classList.toggle('active');
            const content = event.target.nextElementSibling;
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    }
}

addCollapsibleLisenters();
