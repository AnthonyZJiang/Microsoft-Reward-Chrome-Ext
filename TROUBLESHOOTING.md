
# Troubleshooting
There are several reasons why you see an unhappy red error icon. Here are some possible solutions.

## General steps

1. Click on the extension icon, wait for a few seconds and see if it resolves the issue.
2. If not, and if you can't see your Microsoft Reward statistics but asking you to log in or join Microsoft Reward, please see [Not logged in](#Not-logged-in).
4. If you can, then try visit the [Microsoft Rewards page](https://rewards.bing.com/).
5. If the page is not responding or very slow, then the issue is likely to be  [Temporary issue with Microsoft Rewards #1](#temporary-issue-with-microsoft-rewards-1).
6. If the page loads without an issue, check symptoms in [Region issue](#region-issue). 
7. If it is not a region issue, try to do some manual search on Bing and see if the counter changes. If not, the issue is possibly [Temporary issue with Microsoft Rewards #2](#temporary-issue-with-microsoft-rewards-2).
8. Depending on the browser you use, check what errors the extension reports. If it is `UserAgentInvalid`, then check [User agents invalid](#user-agents-invalid).
9. If none of the above helps, please report it.

# Common issues
## Not logged in
#### Symptoms
- An error saying `UserNotLoggedIn` and or `FetchRedirected: expected response status is within 200-299`.
- Not doing any search.
- [possible] Popup page shows a *log in* or *join now* button instead of quests and statistics about your reward account.

#### Explanations
- You have not logged into your Microsoft account.
- You have logged into your Microsoft account but the extension is not able to detect it.

#### What to do
- Click the extension icon again. This normally resolves the issue.
- If you are still seeing the *log in* or *join now* page, hold down control button and click the link, log into your MS account, then try again.

#### When to report
- Report it only if the above does not resolve the issue.

## Temporary issue with Microsoft Rewards #1

#### Symptoms
- An error saying `FetchRedirected: expected response status is within 200-299`.
- Popup page shows your reward account statistics.
- Blue extension icon does not show up or only show up for a very short period of time.
- If you visit Microsoft Rewards page (https://rewards.bing.com/), it may take a long time to load up or does not load at all.

#### Explanation
- Microsoft Rewards server is too slow and it is up to Microsoft to fix the issue.

#### What to do
- Retry later as the issue may be resolved by Microsoft. Sometimes it can take a few days.
- Do not report it as a bug, but feel free to open an issue to discuss it with others.

#### When to report
- Report it only if it is persistent for 3 days.

## Temporary issue with Microsoft Rewards #2

#### Symptoms
- An error saying `UserAgentInvalid`.
- Not doing any search.
- Popup page shows your reward account statistics.
- Blue extension icon is on for a minute or two before it turns to red.
- When you search on Bing, it does not add to your Rewards counter.

#### Explanation
- Something is messed up with Microsoft Rewards and it is up to Microsoft to fix the issue.

#### What to do
- Retry later as the issue may be resolved by Microsoft. Sometimes it can take a few days.

#### When to report
- Report it only if it is persistent for 3 days.

## User agents invalid

#### Symptoms
- An error saying `UserAgentInvalid`
- When you click on the extension icon, you can see your reward account statistics but no search is being done.

#### Explanations
- User agents are used by Microsoft to identify the browser and device you are using. Microsoft blocks user agents from time to time. Therefore, it is important to use up-to-date user agents.
- The extension uses several different sources for user agents, but they can become outdated. I will try keep them updated but not always.

#### What to do
- Wait for me to update user agents.
- As a temporary fix, enable the relevant user agents override in extension option, select one from the following list and copy and paste into the box. I suggest Edge browser for PC and Safari iOS for mobile.
   - https://www.whatismybrowser.com/guides/the-latest-user-agent/
   - https://whatmyuseragent.com/engines
   - https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
- A correct user agent looks like, strictly no whitespaces at the start or end:
```
Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.106 Mobile/13E238 Safari/604.1
```

#### When to report
- When this issue happens, it is likely to affect multiple users if not all, and others may have already reported it. If you see an existing issue, do not open a new one, but add your comments in the existing issue.

## Region issue

#### Symptoms
- An error saying `FetchRedirected: expected response status is within 200-299`
- Visit the [Microsoft Rewards page](https://rewards.bing.com/) and its [mini page](https://www.bing.com/rewardsapp/flyout?channel=0), and you see the final address in the address bar does not belong one of the domains:
  - *.microsoft.com/
  - *.bing.com/

#### Explanations
- Microsoft Rewards uses different domains in your country and the extension does not support all of them. 

#### What to do
- Wait for me to add support for your country.

#### When to report
- Report the issue immediately.

## Manifest version 2

#### Symptoms
- An error saying `ManifestV2: manifest version 2 is no longer supported`.
  
#### Explanations
- The extension is using an old manifest version which is going to be removed in future.
- A solution is being explored but slow. Let me know if you want to help.

#### What to do
- Wait for me to update the extension.

#### When to report
- Please do not report it. I am fully aware of the issue and it does not temporarily affect the functionality of the extension.
