var s = document.createElement('script');
s.src = chrome.runtime.getURL('getquest.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

document.addEventListener('data', function (e) {
    var data = e.detail;
    console.log('received', data);
});