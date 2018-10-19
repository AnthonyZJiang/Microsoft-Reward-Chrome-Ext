class Badge {
    constructor(type, iconPath, text, color) {
        this._type_ = type;
        this._icon_ = iconPath;
        this._text_ = text;
        this._color_ = color;
    }

    get type() {
        return this._type_;
    }

    get icon() {
        return this._icon_;
    }

    get text() {
        return this._text_;
    }

    get backgroundColor() {
        return this._backgroundColor_;
    }

    set() {
        chrome.browserAction.setIcon({
            path: this.icon
        })
        chrome.browserAction.setBadgeText({
            text: this.text
        })
        if (this.backgroundColor) {
            chrome.browserAction.setBadgeBackgroundColor({
                "color": this.backgroundColor
            });
        }
    }
}

class BusyBadge extends Badge {
    constructor () {
        super("busy", "img/busy@1.5x.png", '')
    }
}

class DoneBadge extends Badge {
    constructor () {
        super("done", "img/done@1.5x.png", '')
    }
}

class WarningBadge extends Badge {
    constructor () {
        super("warn", "img/warn@1.5x.png", '', [225, 185, 0, 100])
    }

    get text() {
        return (StatusInst.summary.max - StatusInst.summary.progress).toString()
    }
}

class QuizAndDailyBadge extends Badge {
    constructor () {
        super("quiz", "img/warn@1.5x.png", '', [225, 185, 0, 100])
    }

    get text() {
        return (StatusInst.quizAndDailyStatus.max - StatusInst.quizAndDailyStatus.progress).toString()
    }
}

class ErrorBadge extends Badge {
    constructor () {
        super("error", "img/err@1.5x.png", 'err', [225, 185, 0, 100])
    }
}

class NoneBadge extends Badge {
    constructor () {
        super("none", "img/bingRwLogo@1.5x.png", '')
    }
}

var _currentBadge = null;
function setBadge(badge) {
    badge.set();
    _currentBadge = badge;
}

function isCurrentBadge(badgeType){
    if (typeof badgeType == "object") {
        badgeType = badgeType.type;
    }
    return _currentBadge.type == badgeType;
}