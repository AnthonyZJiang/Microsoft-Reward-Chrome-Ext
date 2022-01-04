'use strict';

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({
        action: 'checkStatus',
    });
});
