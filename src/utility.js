let _prevWeekDay = -1;

function checkNewDay() {
    if (isNewDay()) {
        // if a new day, reset variables
        resetDayBoundParams();
    }
}

function isNewDay() {
    let day;
    if ((day = new Date().getDay()) != _prevWeekDay) {
        _prevWeekDay = day;
        return false;
    }
    return true;
}

function getDomFromText(text) {
    return new DOMParser().parseFromString(text, 'text/html');
}

function getTodayDate() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return `${mm}/${dd}/${today.getFullYear()}`;
}

function resetDayBoundParams() {
    searchQuest.reset();
    googleTrend.reset();
}

function isHttpUrlValid(url) {
    // rule:
    // starts with https:// or http://
    // followed by non-whitespace character
    // must end with a word character, a digit, or close bracket (')') with or without forward slash ('/')
    return /^https?:\/\/\S+.*\..*[\w\d]+\)?\/?$/i.test(url);
}

function getElementByXpath(path, element) {
    return document.evaluate(path, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

async function copyTextToClipboard(text) {
    // Credit: https://stackoverflow.com/a/18455088/1786137
    // Create a textbox field where we can insert text to.
    const copyFrom = document.createElement('textarea');

    // Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    // Append the textbox field into the body as a child.
    // "execCommand()" only works when there exists selected text, and the text is inside
    // document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    // Select all the text!
    copyFrom.select();

    // Execute command
    document.execCommand('copy');

    // (Optional) De-select the text using blur().
    copyFrom.blur();

    // Remove the textbox field from the document.body, so no other JavaScript nor
    // other elements can get access to this.
    document.body.removeChild(copyFrom);
}

async function getDebugInfo() {
    let text = '';

    await userDailyStatus.getUserStatusJson().then(
        (statusJson) => {
            statusJson.userStatus.levelInfo = 'deleted';
            statusJson.userStatus.availablePoints = 'deleted';
            statusJson.userStatus.lifetimePoints = 'deleted';
            statusJson.userStatus.lifetimePointsRedeemed = 'deleted';
            statusJson.userStatus.ePuid = 'deleted';
            statusJson.userStatus.redeemGoal = 'deleted';
            statusJson.userStatus.lastOrder = 'deleted';
            statusJson.userStatus.dashboardImpression = 'deleted';
            statusJson.userStatus.referrerProgressInfo = 'deleted';
            text += JSON.stringify(statusJson);
        },
    ).catch((ex) => {
        text += ex.message + '\n';
    });

    copyTextToClipboard(text);
}

async function updateUA() {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchProm = fetch('https://raw.githubusercontent.com/tmxkn1/UpdatedUserAgents/master/useragents.json', {method: 'GET', signal: signal});

    setTimeout(() => controller.abort(), 3000);

    await fetchProm.then(
        async (response) => {
            if (!response.ok) {
                throw await response.text();
            }
            return response.text();
        },
    ).then(
        (text) => {
            const ua = JSON.parse(text);
            userAgents = {
                'pc': ua.edge.windows,
                'mb': ua.chrome.ios,
            };
        },
    ).catch((ex) => {
        if (ex.name == 'AbortError') {
            throw new FetchFailedException('updateUA::_awaitFetchPromise', ex, 'Fetch timed out. Failed to update user agents. Do you have internet connection? Otherwise, perhaps Github server is down.');
        }
        throw new ResponseUnexpectedStatusException('updateUA::_awaitFetchPromise', ex, errorMessage);
    });
}
