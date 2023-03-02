function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

function runScript(){
    var s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function() {
    this.remove();
};
document.body.appendChild(s);
}



runScript();