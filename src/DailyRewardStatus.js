class DailyRewardStatus {
    constructor() {
        this.reset();
    }

    reset() {
        this._pcSearch_ = new DailySearchQuest(0, 0);
        this._mbSearch_ = new DailySearchQuest(0, 0);
        this._quizAndDaily_ = new DailyQuest(0, 0);
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
        return new DailyQuest(this.progressSummary, this.maxSummary);
    }

    get _progressSummary_() {
        return this._pcSearch_.progress + this._mbSearch_.progress + this._quizAndDaily_.progress;
    }

    get _maxSummary_() {
        return this._pcSearch_.max + this._mbSearch_.max + this._quizAndDaily_.max;
    }

    update() {
        this.reset();
        return new Promise((resolve, reject) => {
            this.getPointBreakdownDocument()
                .then((document) => {
                    this.parsePointBreakdownDocument(document);
                    resolve();
                })
                .catch((message) => {
                    // message.name:
                    // InvalidJson @ parsePointBreakdownDocument(), caused by changes in point breakdown page.
                    // TypeError @ parse methods, caused by changes in user status JSON.
                    // Redirected @ getPointBreakdownDocument(), when point breakdown page is redirected, usually to the login page, meaning user is logged out from his MS account.
                    // Unknown @ getPointBreakdownDocument(), when fetch fails completely for unknown reasons.
                    // FetchFailed @ getPointBreakdownDocument(), when point breakdown page is unreachable - because server is down, network is interrupted, etc.
                    reject(message);
                });
        });
    }

    // returns a promise that resolves to the document of the point breakdown webpage.
    getPointBreakdownDocument() {
        var POINT_BREAKDOWN_URL = 'https://account.microsoft.com/rewards/pointsbreakdown';
        var POINT_BREAKDOWN_FETCH_OPTION = {
            method: 'GET',
            redirect: 'error'
        }
        return new Promise((resolve, reject) => {
            fetch(POINT_BREAKDOWN_URL, POINT_BREAKDOWN_FETCH_OPTION)
                .catch((response) => {
                    if (response.redirect) {
                        reject({name:"Redirected"})
                    } else {
                        reject({name:"Unknown"})
                    }
                }) // reject with response attached.
                .then((response) => {
                    if (response.status == 200) {
                        return response.text();
                    } else {
                        reject({name:"FetchFailed"});
                    }
                })
                .then((htmlText) => {
                    resolve(DailyRewardStatus.getDomFromText(htmlText));
                })
                .catch(reject); // reject with response attached.
        })
    }

    //**************
    // PARSE METHODS
    //**************
    parsePointBreakdownDocument(doc) {
        let statusJson = getUserStatusJSON(doc);

        if (statusJson == null) {
            throw {name:'InvalidJson'}
        }

        this.parseStatusJson(statusJson);
    }

    parseStatusJson(statusJson) {
        this.parsePcSearch(statusJson);
        this.parseMbSearch(statusJson);
        this.parseQuiz(statusJson);
        this.parseDaily(statusJson);
    }

    parsePcSearch(statusJson) {
        console.assert(statusJson.userStatus.counters.pcSearch.length > 0 && statusJson.userStatus.counters.pcSearch.length <= 2);
        statusJson.userStatus.counters.pcSearch.forEach((obj) => {
            this._pcSearch_.progress += obj.pointProgress;
            this._pcSearch_.max += obj.pointProgressMax;
        });
    }

    parseMbSearch(statusJson) {
        console.assert(statusJson.userStatus.counters.mobileSearch.length == 1);
        this._mbSearch_.progress = statusJson.userStatus.counters.mobileSearch[0].pointProgress;
        this._mbSearch_.max = statusJson.userStatus.counters.mobileSearch[0].pointProgressMax;
    }

    parseQuiz(statusJson) {
        console.assert(statusJson.userStatus.counters.activityAndQuiz.length == 1);
        this._quizAndDaily_.progress += statusJson.userStatus.counters.activityAndQuiz[0].pointProgress;
        this._quizAndDaily_.max += statusJson.userStatus.counters.activityAndQuiz[0].pointProgressMax;
    }

    parseDaily(statusJson) {
        statusJson.dailySetPromotions[getTodayDate()].forEach((obj) => {
            this._quizAndDaily_.progress += obj.pointProgress;
            this._quizAndDaily_.max += obj.pointProgressMax;
        });
    }

    //***************
    // STATIC METHODS
    //***************
    // parses a document object from text/string.
    static getDomFromText(text) {
        return new DOMParser().parseFromString(text, "text/html");
    }

    static getUserStatusJSON(doc) {
        var jsList = doc.querySelectorAll("body script[type='text/javascript']:not([id])");
        for (var i in jsList) {
            var m;
            if (m = /(?=\{"userStatus":).*(=?\}\};)/.exec(jsList[i].text)) {
                return JSON.parse(m[0].substr(0, m[0].length - 1));
            }
        }
        return null;
    }
}

