function runScript(){
    var s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

}

if (document.getElementsByClassName("TriviaOverlayData").length == 1){
    if(document.getElementById("quizCompleteContainer")){
        window.close();
    }
    else {
    if (document.getElementById("btoption0")){
        console.log("quiz")
        document.getElementById("btoption0").click();
        setTimeout()
    }
    else {
        if(document.getElementById("rqStartQuiz")){
        document.getElementById("rqStartQuiz").click();
        }
        runScript();
    }
    }
}
