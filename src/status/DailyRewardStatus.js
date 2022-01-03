class DailyRewardStatus {
    constructor() {
        this.reset();
    }

    reset() {
        this._pcSearch_ = new DailySearchQuest(0, 0);
        this._mbSearch_ = new DailySearchQuest(0, 0);
        this._quizAndDaily_ = new DailyQuest(0, 0);
        this._jobStatus_ = STATUS_NONE;
    }

    get jobStatus() {
        return this._jobStatus_;
    }

    get pcSearchStatus() {
        return this._pcSearch_;
    }

    get mbSearchStatus() {
        return this._mbSearch_;
    }

    get quizAndDailyStatus() {
        return this._quizAndDaily_;
    }

    get summary() {
        return new DailyQuest(this._progressSummary_, this._maxSummary_);
    }

    get isSearchCompleted() {
        return this._mbSearch_.isCompleted && this._pcSearch_.isCompleted;
    }

    get _progressSummary_() {
        return this._pcSearch_.progress + this._mbSearch_.progress + this._quizAndDaily_.progress;
    }

    get _maxSummary_() {
        return this._pcSearch_.max + this._mbSearch_.max + this._quizAndDaily_.max;
    }

    async update() {
        // Exceptions:
        // ParseJSONFailedException         @ _parsePointBreakdownDocument(), caused by changes in point breakdown page.
        //                                  @ parse methods, caused by changes in user status JSON.
        // FetchFailedException             @ _getPointBreakdownDocument(), when point breakdown page is unreachable - because server is down, network is interrupted, etc.

        this.reset();
        this._jobStatus_ = STATUS_BUSY;
        try {
            const statusJson = await this.getUserStatusJson();
            this._parsePointBreakdownDocument(statusJson);
        } catch (ex) {
            this._jobStatus_ = STATUS_ERROR;
            throw ex;
        }
        this._jobStatus_ = STATUS_DONE;

        return this._jobStatus_;
    }

    async getUserStatusJson() {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(POINT_BREAKDOWN_URL_NEW, this._getFetchOptions(signal));
        setTimeout(() => controller.abort(), 3000);
        const text = await this._awaitFetchPromise(fetchPromise).catch(async (ex) => {
            if (ex.name == 'FetchFailed::TypeError') {
                console.log('An error occurred in the first status update attempt:');
                logException(ex);
                return await this._getPointBreakdownTextOld();
            }
            throw new ResponseUnexpectedStatusException('DailyRewardStatus::getUserStatusJson', ex, errorMessage);
        });
        const doc = getDomFromText(text);
        return DailyRewardStatus.getUserStatusJSON(doc);
    }

    async _getPointBreakdownTextOld() {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(POINT_BREAKDOWN_URL_OLD, this._getFetchOptions(signal));
        setTimeout(() => controller.abort(), 3000);
        return await this._awaitFetchPromise(fetchPromise).catch((ex) => {
            if (ex.name == 'FetchFailed::TypeError') {
                throw new FetchFailedException('DailyRewardStatus::_getPointBreakdownTextOld', ex, 'Are we redirected by the old URL too? Report to the author now!');
            };
            throw ex;
        });
    }

    async _awaitFetchPromise(fetchPromise) {
        let response;
        try {
            response = await fetchPromise;
        } catch (ex) {
            if (ex.name == 'TypeError') {
                throw new FetchFailedException('DailyRewardStatus::_awaitFetchPromise', ex, 'Are we redirected?');
            }
            if (error.name == 'AbortError') {
                throw new FetchFailedException('DailyRewardStatus::_awaitFetchPromise', ex, 'Fetch timed out. Do you have internet connection? Otherwise, perhaps MSR server is down.');
            }
            throw ex;
        }

        if (response.ok) {
            return response.text();
        }

        throw await response.text();
    }

    _getFetchOptions(signal) {
        return {
            method: 'GET',
            signal: signal,
        };
    }

    //* *************
    // PARSE METHODS
    //* *************
    _parsePointBreakdownDocument(statusJson) {
        if (statusJson == null) {
            throw new ParseJSONFailedException('DailyRewardStatus::_getPointBreakdownDocumentOld', null, 'Empty json received.');
        }
        try {
            if (_compatibilityMode) {
                this._parseStatusJsonCompatibilityMode(statusJson);
            } else {
                this._parseStatusJson(statusJson);
            }
        } catch (ex) {
            if (ex.name == 'TypeError' || ex.name == 'ReferenceError') {
                throw new ParseJSONFailedException('DailyRewardStatus::_getPointBreakdownDocumentOld', ex, 'Fail to parse the received json document. Has MSR updated its json structure?');
            }
        }
    }

    _parseStatusJsonCompatibilityMode(statusJson) {
        this._parsePcSearch(statusJson);
        this._parseMbSearch(statusJson);
        this._parseQuiz(statusJson);
        this._parsePunchCards(statusJson, true);
        this._parseDaily(statusJson);
    }

    _parseStatusJson(statusJson) {
        this._parsePcSearch(statusJson);
        this._parseMbSearch(statusJson);
        this._parseMorePromo(statusJson);
        this._parsePunchCards(statusJson, false);
        this._parseDaily(statusJson);
    }

    _parsePcSearch(statusJson) {
        console.assert(statusJson.userStatus.counters.pcSearch.length > 0 && statusJson.userStatus.counters.pcSearch.length <= 2);
        statusJson.userStatus.counters.pcSearch.forEach((obj) => {
            this._pcSearch_.progress += obj.pointProgress;
            this._pcSearch_.max += obj.pointProgressMax;
        });
    }

    _parseMbSearch(statusJson) {
        if (!statusJson.userStatus.counters.hasOwnProperty('mobileSearch')) {
            this._mbSearch_.progress = 1;
            this._mbSearch_.max = 1;
            return;
        }
        console.assert(statusJson.userStatus.counters.mobileSearch.length == 1);
        this._mbSearch_.progress = statusJson.userStatus.counters.mobileSearch[0].pointProgress;
        this._mbSearch_.max = statusJson.userStatus.counters.mobileSearch[0].pointProgressMax;
    }

    _parseQuiz(statusJson) {
        console.assert(statusJson.userStatus.counters.activityAndQuiz.length == 1);
        this._quizAndDaily_.progress += statusJson.userStatus.counters.activityAndQuiz[0].pointProgress;
        this._quizAndDaily_.max += statusJson.userStatus.counters.activityAndQuiz[0].pointProgressMax;
    }

    _parsePunchCards(statusJson, flagDeduct) {
        for (let i = 0; i < statusJson.punchCards.length; i++) {
            const parentPromo = statusJson.punchCards[i].parentPromotion;
            if (!parentPromo) continue;

            const promoTypes = parentPromo.promotionType.split(',');
            const isPurchaseCard = !promoTypes.every((val) => (val == 'urlreward' || val == 'quiz'));
            if (flagDeduct && isPurchaseCard) {
                this._quizAndDaily_.max -= statusJson.punchCards[i].parentPromotion.pointProgressMax;
            } else if (!flagDeduct && !isPurchaseCard) {
                this._quizAndDaily_.max += statusJson.punchCards[i].parentPromotion.pointProgressMax;
                this._quizAndDaily_.progress += statusJson.punchCards[i].parentPromotion.pointProgress;
            }
        }
    }

    _parseDaily(statusJson) {
        const dailyset = statusJson.dailySetPromotions[getTodayDate()];
        if (!dailyset) return;
        dailyset.forEach((obj) => {
            if (obj.complete) {
                this._quizAndDaily_.progress += obj.pointProgressMax;
            } else {
                this._quizAndDaily_.progress += obj.pointProgress;
            }
            this._quizAndDaily_.max += obj.pointProgressMax;
        });
    }

    _parseMorePromo(statusJson) {
        const morePromo = statusJson.morePromotions;
        if (!morePromo) return;
        morePromo.forEach((obj) => {
            if (obj.complete) {
                this._quizAndDaily_.progress += obj.pointProgressMax;
            } else {
                this._quizAndDaily_.progress += obj.pointProgress;
            }
            this._quizAndDaily_.max += obj.pointProgressMax;
        });
    }

    //* **************
    // STATIC METHODS
    //* **************
    // parses a document object from text/string.
    static getUserStatusJSON(doc) {
        const jsList = doc.querySelectorAll('body script[type=\'text/javascript\']:not([id])');
        for (let i = 0; i < jsList.length; i++) {
            const m = /(?=\{"userStatus":).*(=?\}\};)/.exec(jsList[i].text);
            if (m) {
                return JSON.parse(m[0].substr(0, m[0].length - 1));
            }
        }
        return null;
    }
}

const POINT_BREAKDOWN_URL_OLD = 'https://account.microsoft.com/rewards/pointsbreakdown';
const POINT_BREAKDOWN_URL_NEW = 'https://rewards.microsoft.com/pointsbreakdown';
