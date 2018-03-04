chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("message.action \"",request.action, "\" detected.")
        if (request.action == "getWikiTodayLink"){
            sendResponse({content: document.getElementById("mp-tfa").getElementsByTagName("p")[0].getElementsByTagName("a")[0].href});
            console.log("getWikiTodayLink responded");
        }

        if (request.action == "getKeywordsFromGoogleTrends"){
            var oParser = new DOMParser();
            var titles = oParser.parseFromString(this.document.documentElement.getElementsByTagName('pre')[0].textContent, "text/xml").getElementsByTagName('title');
            var responses = Array(titles.length - 1);
            for (var i = 1; i<titles.length; i++){
                responses[i - 1] = titles[i].textContent;
            }
            sendResponse({content: responses});
            console.log("getKeywordsFromGoogleTrends responded:", responses);
        }
    }
);


console.log("content.js loaded")