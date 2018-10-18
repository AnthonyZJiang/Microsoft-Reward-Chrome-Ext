# Microsoft Rewards Bot

A Chrome extension that checks your Microsoft Rewards progress every six hour to make sure you don't miss any points. It also helps the user complete daily search quests (both PC and mobile).

Note that this extension does not try clearing any daily sets or quiz.

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


# How it works

### Background Work

Every 6 hour or on browser startup, the extension checks your daily reward progress. If there are any points left to be earned, a notification will pop up to notify the user. If it is a search quest, the extension will try completing it automatically using words from Google Trend.

### Action Button Click

User can click on the action button to force it to do the background work once.

### Action Button Icon

The colour of the action button icon changes depending on your daily reward progress:

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/bingRwLogo@1x.png?raw=true) - Progress unknown.

![blueLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/busy@1x.png?raw=true) - Doing some background work (e.g. automatic search).

![greenLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/done@1x.png?raw=true) - No more points left to earn.

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/err@1x.png?raw=true) - with some digits: there are more points, value of which is indicated by the digits, for you to grab.

![redLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/err@1x.png?raw=true) - with 'err' text: there is some problem with checking your reward progress; this normally comes with a notification to inform about what went wrong.

# Known issue

None and I assume no one will report any because no one should use this.

---

To me, this small project serves a pretty good practice on learning to code javascript and make a Chrome extension.