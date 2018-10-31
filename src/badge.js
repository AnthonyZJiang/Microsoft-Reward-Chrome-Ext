class Badge {
    constructor(type, iconPath, text, color) {
        this._type_ = type;
        this._icon_ = iconPath;
        if (!text) {
            text = '';
        }
        this._text_ = text;
        this._backgroundColor_ = color;
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
        this.setIcon();
        this.setText();
        this.setBackgroundColour();
    }

    setIcon() {
        chrome.browserAction.setIcon({
            path: this.icon,
        });
    }

    setText() {
        let txt = this.text;
        if (!txt) {
            txt = '';
        }

        chrome.browserAction.setBadgeText({
            text: txt,
        });
    }

    setBackgroundColour() {
        if (!this.backgroundColor) {
            return;
        }
        chrome.browserAction.setBadgeBackgroundColor({
            'color': this.backgroundColor,
        });
    }
}

class GreyBadge extends Badge {
    constructor() {
        super('grey', 'img/grey@1.5x.png');
    }
}

class BusyBadge extends Badge {
    constructor() {
        super('busy', 'img/busy@1.5x.png');
    }
}

class DoneBadge extends Badge {
    constructor() {
        super('done', 'img/done@1.5x.png');
    }
}

class WarningBadge extends Badge {
    constructor() {
        super('warn', 'img/warn@1.5x.png');
    }
}

class QuizAndDailyBadge extends Badge {
    constructor(text) {
        super('quiz', 'img/warn@1.5x.png', text, [255, 201, 71, 100]);
    }
}

class ErrorBadge extends Badge {
    constructor() {
        super('error', 'img/err@1.5x.png', 'err', [255, 51, 51, 100]);
    }
}

class NoneBadge extends Badge {
    constructor() {
        super('none', 'img/bingRwLogo@1.5x.png');
    }
}

let _currentBadge = null;
function setBadge(badge) {
    badge.set();
    _currentBadge = badge;
}

function isCurrentBadge(badgeType) {
    if (typeof badgeType == 'object') {
        badgeType = badgeType.type;
    }
    return _currentBadge.type == badgeType;
}
