[![CodeFactor](https://www.codefactor.io/repository/github/tmxkn1/microsoft-reward-chrome-ext/badge)](https://www.codefactor.io/repository/github/tmxkn1/microsoft-reward-chrome-ext)

# Microsoft Rewards Bot

A Chrome extension for Microsoft Rewards, which automatically clears PC, mobile and Edge search quests and displays daily point countdown.

This extension will not clear any promotional link or quiz quests and this feature will not be implemented.

**This is a bot!**

Use at your own risk. I do not take responsibility for any consequence caused by this extension.

# Install from git

1. `git clone https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext.git`
2. Open Chrome.
3. Go to chrome://extensions/ and enable `Developer mode`.
4. Click `Load unpacked` and select `src` folder.
5. Enable the extension.

# Install from Chrome web store

Unfortunately, the extension could not make its way to become visible on web store due to ... well ... obvious reasons.

# Use

1. Log into [Microsoft Rewards](https://account.microsoft.com/rewards) and [Bing](www.bing.com).
2. Enjoy.

*Note: You may need to repeat step 1 every time you restart Chrome.*

# Functionality

### Background Work

Every 2 hours the extension checks your daily Microsoft Rewards progress and clears any incomplete search quests. When you have any available quiz/link quests yet to complete, a yellow badge will show with a number indicating the amount of points they worth.

### Action Button

1. A button to force check reward progress.
2. A link to Microsoft Rewards.
3. Options:
   1. Compatibility Mode. Toggle to enable/disable a different way of calculating point countdown. Try this if you have any issues with the current point countdown method.
   2. Copy Debug Info. This will place a bunch of information in your clipboard. The information is not useful for end users.

### Action Button Badge

The colour of the badge changes depending on your daily reward progress or the status of the extension:

![greyLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/grey@1x.png?raw=true) - Just hang on a second.

![blueLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/busy@1x.png?raw=true) - Working hard on doing those search quests for ya!

![greenLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/done@1x.png?raw=true) - You have earned all available points for now.

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/warn@1x.png?raw=true) - Yellow badge is shown with a number: There are X points left to be earned through quiz.

![redLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/err@1x.png?raw=true) - Shown with 'err' text: an error occurred - you are probably not logged in or you have reached your daily google trend request allowance. Try log into [Microsoft Rewards](https://account.microsoft.com/rewards) and [Bing](www.bing.com) and use the Check Now button to force it do another round of work.
