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
            this._parseUserStatus(statusJson);
            const detailedStatusJson = await this.getDetailedUserStatusJson();
            if (detailedStatusJson) {
                this._parseDetailedUserStatus(detailedStatusJson);
            }
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
        const fetchPromise = fetch(USER_STATUS_BING_URL, this._getFetchOptions(signal));
        setTimeout(() => controller.abort(), 3000);
        const text = await this._awaitFetchPromise(fetchPromise).catch(async (ex) => {
            throw new ResponseUnexpectedStatusException('DailyRewardStatus::getUserStatusJsonFromBing', ex);
        });
        return DailyRewardStatus.getUserStatusJSON(text);
    }

    async getDetailedUserStatusJson() {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchPromise = fetch(USER_STATUS_DETAILED_URL, this._getFetchOptions(signal));
        setTimeout(() => controller.abort(), 3000);
        const text = await this._awaitFetchPromise(fetchPromise).catch(async (ex) => {
            if (ex.name == 'FetchFailed::TypeError') {
                console.log('An error occurred in the first status update attempt:');
                logException(ex);
                return null;
            }
            throw new ResponseUnexpectedStatusException('DailyRewardStatus::getUserStatusJson', ex);
        });
        const doc = getDomFromText(text);
        return DailyRewardStatus.getDetailedUserStatusJSON(doc);
    }

    async _awaitFetchPromise(fetchPromise) {
        let response;
        try {
            response = await fetchPromise;
        } catch (ex) {
            if (ex.name == 'TypeError') {
                throw new FetchFailedException('DailyRewardStatus::_awaitFetchPromise', ex, 'Are we redirected? You probably haven\'t logged in yet.');
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
    _parseUserStatus(statusJson) {
        if (statusJson == null) {
            throw new ParseJSONFailedException('DailyRewardStatus::_parseDetailedUserStatus', null, 'Empty json received.');
        }
        try {
            this._parseRewardUser(statusJson);
            if (this._userIsError || !this._isRewardsUser) {
                throw new NotRewardUserException(`Have you logged into Microsoft Rewards? Query returns {IsError:${this._userIsError},IsRewardsUser:${this._isRewardsUser}}`);
            }
            this._parsePcSearch(statusJson.FlyoutResult);
            this._parseMbSearch(statusJson.FlyoutResult);
            this._parseActivityAndQuiz(statusJson.FlyoutResult);
            this._parseDaily(statusJson.FlyoutResult);
        } catch (ex) {
            if (ex.name == 'TypeError' || ex.name == 'ReferenceError') {
                throw new ParseJSONFailedException('DailyRewardStatus::_parseDetailedUserStatus', ex, 'Fail to parse the received json document. Has MSR updated its json structure?');
            }
            throw ex;
        }
    }

    _parseRewardUser(statusJson) {
        this._userIsError = statusJson.hasOwnProperty('IsError') && statusJson.IsError;
        this._isRewardsUser = statusJson.hasOwnProperty('IsRewardsUser') && statusJson.IsRewardsUser;
    }

    _parsePcSearch(statusJson) {
        statusJson.UserStatus.Counters.PCSearch.forEach((obj) => {
            this._pcSearch_.progress += obj.PointProgress;
            this._pcSearch_.max += obj.PointProgressMax;
        });
    }

    _parseMbSearch(statusJson) {
        if (!statusJson.UserStatus.Counters.hasOwnProperty('MobileSearch')) {
            this._mbSearch_.progress = 1;
            this._mbSearch_.max = 1;
            return;
        }
        this._mbSearch_.progress = statusJson.UserStatus.Counters.MobileSearch[0].PointProgress;
        this._mbSearch_.max = statusJson.UserStatus.Counters.MobileSearch[0].PointProgressMax;
    }

    _parseActivityAndQuiz(statusJson) {
        this._quizAndDaily_.progress += statusJson.UserStatus.Counters.ActivityAndQuiz[0].PointProgress;
        this._quizAndDaily_.max += statusJson.UserStatus.Counters.ActivityAndQuiz[0].PointProgressMax;
    }

    _parseDaily(statusJson) {
        const dailySet = statusJson.DailySetPromotions[getTodayDate()];
        if (!dailySet) return;
        dailySet.forEach((obj) => {
            if (obj.Complete) {
                this._quizAndDaily_.progress += obj.PointProgressMax;
            } else {
                this._quizAndDaily_.progress += obj.PointProgress;
            }
            this._quizAndDaily_.max += obj.PointProgressMax;
        });
    }

    _parseDetailedUserStatus(statusJson) {
        if (statusJson == null) {
            throw new ParseJSONFailedException('DailyRewardStatus::_parseDetailedUserStatus', null, 'Empty json received.');
        }
        try {
            this._parsePunchCards(statusJson, _compatibilityMode);
        } catch (ex) {
            if (ex.name == 'TypeError' || ex.name == 'ReferenceError') {
                throw new ParseJSONFailedException('DailyRewardStatus::_parseDetailedUserStatus', ex, 'Fail to parse the received json document. Has MSR updated its json structure?');
            }
        }
    }

    _parsePunchCards(statusJson, flagDeduct) {
        // flagDeduct: set true to deduct the point progress from the total point progress, only accurate in rare cases, reserved for compatibility mode
        for (let i = 0; i < statusJson.punchCards.length; i++) {
            const card = statusJson.punchCards[i];
            if (!card) continue;
            const parentPromo = card.parentPromo;
            if (!parentPromo) continue;

            const promoTypes = parentPromo.promotionType.split(',');
            const isPurchaseCard = !promoTypes.every((val) => (val == 'urlreward' || val == 'quiz'));
            if (flagDeduct && isPurchaseCard) {
                this._quizAndDaily_.max -= parentPromo.pointProgressMax;
            } else if (!flagDeduct && !isPurchaseCard) {
                let pointProgress = parentPromo.pointProgress;
                let pointProgressMax = parentPromo.pointProgressMax;
                for (const j in card.childPromotions) {
                    if (!j) continue;
                    if (card.childPromotions[j].pointProgressMax == 1) continue;
                    pointProgressMax += card.childPromotions[j].pointProgressMax;
                    pointProgress += card.childPromotions[j].pointProgress;
                }
                this._quizAndDaily_.max += pointProgressMax;
                if (pointProgress == pointProgressMax) {
                    this._quizAndDaily_.progress += pointProgress;
                }
            }
        }
    }

    //* **************
    // STATIC METHODS
    //* **************
    static getUserStatusJSON(text) {
        const m = /(=?\{"FlyoutConfig":).*(=?\}\);;)/.exec(text);
        if (m) {
            return JSON.parse(m[0].slice(0, m[0].length - 3));
        }
    }

    static getDetailedUserStatusJSON(doc) {
        const jsList = doc.querySelectorAll('body script[type=\'text/javascript\']:not([id])');
        for (let i = 0; i < jsList.length; i++) {
            const m = /(?=\{"userStatus":).*(=?\}\};)/.exec(jsList[i].text);
            if (m) {
                return JSON.parse(m[0].slice(0, m[0].length - 1));
            }
        }
        return null;
    }
}

const USER_STATUS_BING_URL = 'https://www.bing.com/rewardsapp/flyout?channel=0&partnerId=EdgeNTP&pageType=ntp&isDarkMode=0';
const USER_STATUS_DETAILED_URL = 'https://rewards.bing.com/';
