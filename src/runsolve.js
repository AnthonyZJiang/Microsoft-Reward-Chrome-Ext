var s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);