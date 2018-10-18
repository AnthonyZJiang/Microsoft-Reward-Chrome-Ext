class DailyQuest {
    constructor(progress, max) {
        this.progress = progress;
        this.max = max;
    }

    get complete() {
        return this.progress == this.max;
    }

    get isValid() {
        return this.max > 0;
    }

    get isValidAndComplete() {
        return this.valid && this.complete;
    }
}

class DailySearchQuest extends DailyQuest {
    get pointPerSearch() {
        return 3;
    }

    get searchPerformedCount() {
        return this.progress / this.pointPerSearch;
    }

    get searchNeededCount() {
        return this.max / this.pointPerSearch - this.searchPerformedCount;
    }
}