[![CodeFactor](https://www.codefactor.io/repository/github/tmxkn1/microsoft-reward-chrome-ext/badge)](https://www.codefactor.io/repository/github/tmxkn1/microsoft-reward-chrome-ext)

# Microsoft Rewards Bot

A Chrome extension that checks your Microsoft Rewards progress every six hour to make sure you don't miss any points. It also helps the user complete daily search quests (both PC and mobile).

Note that this extension cannot do any daily sets or quiz.

**This is a bot!**

This extension is clearly a bot as it tries to perform automatic search which would award you reward points. Using a bot is against Microsoft Rewards TOS. Therefore, using this extension to your advantage may result in your account being banned, for which I take no responsibility. 

# Installation

1. Download the source code.
2. Open Chrome (build 64+, preferably).
3. Log into your [Microsoft account](https://www.microsoft.com). (Make sure you also logged into [bing.com](bing.com))
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
