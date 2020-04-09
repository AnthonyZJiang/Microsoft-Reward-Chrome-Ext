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

### Action Button Badge

The colour of the badge changes depending on your daily reward progress or the status of the extension:

![greyLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/grey@1x.png?raw=true) - Just hang on a second.

![blueLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/busy@1x.png?raw=true) - Working hard on doing those search quests for ya!

![greenLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/done@1x.png?raw=true) - You have earned all available points for now.

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/warn@1x.png?raw=true) - Yellow badge is shown with a number: There are X points left to be earned through quiz.

![redLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/err@1x.png?raw=true) - with 'err' text: an error occurred - you are probably not logged in or you have reached your daily google trend request allowance.

# Known issue

None.