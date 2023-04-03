function runScript() {
    const s = document.createElement('script');
s.src = chrome.runtime.getURL('solve.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
}

if (document.getElementsByClassName("TriviaOverlayData").length == 1) {
    if (document.getElementById("quizCompleteContainer")) { // completed
        document.getElementById("rqCloseBtn").click();// click the x close button to close pop up
        chrome.runtime.sendMessage({// tell background to close the tab after 1s to give time to close the popup
            action: 'closeTab',
        });
    } else {
    if (document.getElementById("btoption0")) { // daily quiz
        document.getElementById("btoption0").click();
        chrome.runtime.sendMessage({// tell background to close the tab after 1s to give time to close the popup
            action: 'closeTab',
        });
    } else {
        if (document.getElementById("rqStartQuiz")) { // start
        document.getElementById("rqStartQuiz").click();
        }
        runScript(); // solving
    }
    }
}
