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
        // FetchRedirectedException         @ _getPointBreakdownDocument(), when point breakdown page is redirected, usually to the login page, meaning user is logged out from his MS account.
        // FetchResponseAnomalyException    @ _getPointBreakdownDocument(), when the response status is not 200 a.k.a. OK completely for unknown reasons.
        // FetchFailedException             @ _getPointBreakdownDocument(), when point breakdown page is unreachable - because server is down, network is interrupted, etc.

        this.reset();

        this._jobStatus_ = STATUS_BUSY;
        try{
            this._parsePointBreakdownDocument(getDomFromText(await this._getPointBreakdownDocument()));
        } catch (ex) {
            this._jobStatus_ = STATUS_ERROR;
            throw ex;
        }
        this._jobStatus_ = STATUS_DONE;

        return this._jobStatus_;
    }

    // returns a promise that resolves to the document of the point breakdown webpage.
    async _getPointBreakdownDocument() {
        var controller = new AbortController();
        var signal = controller.signal;
        var fetchPromise = fetch(POINT_BREAKDOWN_URL, this._getFetchOptions(signal));
        setTimeout(() => controller.abort(), 3000);  
        try {
            var response = await fetchPromise;
        }
        catch (ex) {
            if (response && response.redirect) {
                throw new FetchRedirectedException('Status');
            }
            if (ex.name == 'AbortError') {
                throw ex;
            }
            throw new FetchFailedException('Status', ex);
        }
        
        if (response.status == 200) {
            return response.text();
        }
        throw new FetchResponseAnomalyException('Status');
    }

    _getFetchOptions(signal) {
        return {
            method: 'GET',
            redirect: 'error',
            signal: signal
        }
    }

    //**************
    // PARSE METHODS
    //**************
    _parsePointBreakdownDocument(doc) {
        let statusJson = DailyRewardStatus.getUserStatusJSON(doc);

        if (statusJson == null) {
            throw new ParseJSONFailedException('Status');
        }
        try {
            this._parseStatusJson(statusJson);
        } catch (ex) {
            if (ex.name == 'TypeError' || ex.name == 'ReferenceError') {
                throw new ParseJSONFailedException('Status', ex);
            }
        }
    }

    _parseStatusJson(statusJson) {
        this._parsePcSearch(statusJson);
        this._parseMbSearch(statusJson);
        this._parseQuiz(statusJson);
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
        console.assert(statusJson.userStatus.counters.mobileSearch.length == 1);
        this._mbSearch_.progress = statusJson.userStatus.counters.mobileSearch[0].pointProgress;
        this._mbSearch_.max = statusJson.userStatus.counters.mobileSearch[0].pointProgressMax;
    }

    _parseQuiz(statusJson) {
        console.assert(statusJson.userStatus.counters.activityAndQuiz.length == 1);
        this._quizAndDaily_.progress += statusJson.userStatus.counters.activityAndQuiz[0].pointProgress;
        this._quizAndDaily_.max += statusJson.userStatus.counters.activityAndQuiz[0].pointProgressMax;
    }

    _parseDaily(statusJson) {
        statusJson.dailySetPromotions[getTodayDate()].forEach((obj) => {
            this._quizAndDaily_.progress += obj.pointProgress;
            this._quizAndDaily_.max += obj.pointProgressMax;
        });
    }

    //***************
    // STATIC METHODS
    //***************
    // parses a document object from text/string.
    static getUserStatusJSON(doc) {
        var jsList = doc.querySelectorAll("body script[type='text/javascript']:not([id])");
        for (var i in jsList) {
            var m = /(?=\{"userStatus":).*(=?\}\};)/.exec(jsList[i].text);
            if (m) {
                return JSON.parse(m[0].substr(0, m[0].length - 1));
            }
        }
        return null;
    }
}

const POINT_BREAKDOWN_URL = 'https://account.microsoft.com/rewards/pointsbreakdown';