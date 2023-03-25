function runScript(){
    var s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

}

if (document.getElementsByClassName("TriviaOverlayData").length == 1){
    if(document.getElementsByClassName("cico rqSumryLogo ").length == 1){
        console.log("close");
        document.getElementById("rqCloseBtn").click();
    }
    else {
    if (document.getElementById("btoption0")){
        console.log("quiz")
        document.getElementById("btoption0").click();
    }
    else {
        if(document.getElementById("rqStartQuiz")){
        document.getElementById("rqStartQuiz").click();
        }
        runScript();
    }
    }
}
