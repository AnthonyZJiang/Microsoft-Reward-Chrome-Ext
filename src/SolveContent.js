function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  
function runScript(){
    var s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
}

function checkreload(){
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        console.info( "This page is reloaded" );
      } else {
        console.info( "This page is not reloaded");
      }
}

runScript();
sleep(2000);
console.log("aaa")
sleep(2000);
console.log("aaa")