# Microsoft Rewards Bot

A Chrome extension that checks your Microsoft Rewards progress every six hour to make sure you don't miss any points. It also helps the user complete daily search quests (both PC and mobile).

Note that this extension cannot do any daily sets or quiz.

**This is a bot!**

This extension is clearly a bot as it tries to perform automatic search which would award you reward points. Using a bot is against Microsoft Rewards TOS. Therefore, using this extension to your advantage may result in your account being banned, for which I take no responsibility. 

# Installation

1. Download the source code.
2. Open Chrome (build 64+, preferably).
3. Log into your Microsoft account.
4. Go to chrome://extensions/ and enable `Developer mode`.
5. Click `Load unpacked` and select `src` folder.
6. Enable the extension.

*Tip: The extension does not log you into MS Rewards. You need to manually log into your account.*

# What can it do

### Background Work

Every 2 hour or on browser startup, the extension checks your daily reward progress. If there are any points left to be earned, a notification will pop up to notify the user. If it is a search quest, the extension will try completing it automatically using words from Google Trend.

### Action Button Click

User can click on the action button to force it to do the background work once.

### Action Button Icon

The colour of the action button icon changes depending on your daily reward progress:

![greyLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/grey@1x.png?raw=true) - Progress unknown.

![blueLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/busy@1x.png?raw=true) - Doing some background work (e.g. automatic search).

![greenLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/done@1x.png?raw=true) - You have earned all available reward points for now.

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/warn@1x.png?raw=true) - with some digits: you can earn more reward points; the digits indicates the value of the points.

![redLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/err@1x.png?raw=true) - with 'err' text: an error occurred; this normally comes with a notification to brief you what went wrong.

# Known issue

None.

# Optional setup

### Persistent cookie

This extension needs to `fetch` [MS Point Breakdown page](https://account.microsoft.com/rewards/pointsbreakdown) to understand your daily point progress. However, to access this page, you have to be logged in to your MS account. Since this extension does not take your account and password, you will have to login manually. This must be done every time your browser is completely closed, due to its short-lived authentication cookie *(expires on session close)*. To overcome this PITA, you can **set the cookie to literally never expire** in the extension popup page, which extends the cookie's expiry date to 2199. 

Sounds easy? Unfortunately, this only solves a part of the PITA. Yes, a literally-never-expired cookie ensures that your login status does not expire if you close your browser **unless** your PC reboots or recovers from sleep. Therefore, you still need to open the MS Point Breakdown page manually once for every Windows session. On the good side though your login information is still available in the authentication cookie, so you don't have to enter your account and password; the login page will be redirected automatically to the Point Breakdown page. 

### CORS

Redirect automatically... OK, so what prevents you from "logging in" programmatically, no login information required anyway? Well, this is not possible because the login page refuses Cross Origin Requests (COR) which interrupts the `fetch` request with an error:

    Failed to load https://login.live.com/login.srf?_ETC._:No 'Access-Control-Allow-Origin' header is present on the requested resource.Origin 'chrome-extension://nkehjiackpilondifkdglecdblnhpnfe' is therefore not allowed access.

To overcome this, you will need to setup a [Cross Origin Request Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server. This is not a click away however. You may read [How to set up your own CORS server - A quick guide](https://github.com/tmxkn1/cors/blob/master/README.md#how-to-set-up-your-own-cors-server---a-quick-guide) to setup your own CORS server. Once the server is setup, you can copy the server address and fill the CORS API box in the extension popup page.

### TL;DR

To save you from login to your MS account manually, check **Set persistent authentication cookie** in the extension popup page, and read [How to set up your own CORS server - A quick guide](https://github.com/tmxkn1/cors/blob/master/README.md#how-to-set-up-your-own-cors-server---a-quick-guide) to obtain a **CORS server api**, which you should use to fill the **CORS API** input box.
