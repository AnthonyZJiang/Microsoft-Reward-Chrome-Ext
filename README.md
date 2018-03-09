# Microsoft Reward Bot
A Chrome extension for getting MS Rewards points automatically. 

In general, it does two things in background every 30 minutes:

1. Completing PC and mobile search quests, if they are not completed.
2. Trying to complete quiz and promotion quests, if they are not completed. If the quests fail, it will notify user by sending Chrome notifications and changing the colour of the Action Button to red. The unacquired points will be shown in the badge.


# What do you need?

1. Chrome (build 64+, preferably).
2. Go to chrome://extensions/ and enable `Developer mode`.
3. Click `Load unpacked` and select `src` folder.
4. Log into your Microsoft account. 

The extension does not log your login information or account id at all. However, this would require you to log into your account if your login credential expires.


# How it works

### Background Work

Every 1 hour, the extension checks quest completion status. If there are any quests available, it will try to complete it. It will notify the user if it fails a quest.

*Tip: Sometimes, promotional quests are added at different time during the day. Therefore, checking every hour is necessary.*

### Action Button Click

User can click on the action button to force it to check quest completion status and completing quests if there are any available.

### Action Button Icon

The colour of the action button icon changes depending on your completion status:

![yellowLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/bingRwLogo@1x.png?raw=true) - completion status unknown

![blueLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/busy.png?raw=true) - doing work (completing search quests or promotion quests for example)

![greenLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/done.png?raw=true) - all points are earned.

![redLogo](https://github.com/tmxkn1/Microsoft-Reward-Chrome-Ext/blob/master/src/img/warning.png?raw=true) - error status, or there are more points to earn. In the first case, you will see a badge showing 'err' next to the icon; in the second case, the badge shows a number indicating points available to earn.

# What's working and what's not working

### Working

- PC search quest
- Mobile search quest
- Notifying user about other quests

### Not working
#### These are not likely going to work because it is MS's intention to prevent clicking or xhr bots.

- Shop to earn quest (URL clicking)
- Quiz quest
- Url quest (hot word search quest, 10 points per quest)

---

This is my first try on making an extension for Chrome. 

**Disclaimer**: This project only serves the purpose of learning extension development for Chrome. One shall not use this project for any activities outside this purpose.
