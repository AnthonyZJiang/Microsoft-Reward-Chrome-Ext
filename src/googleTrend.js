class GoogleTrend {
    constructor() {
        this.reset();
    }

    get nextPCWord() {
        if (this._pcWordPointer_ >= this._googleTrendWords_.words.length-1) {
            this._pcWordPointer_ = -1;
        }
        this._pcWordPointer_ ++;
        return this._googleTrendWords_.words[this._pcWordPointer_];
    }

    get nextMBWord() {
        if (this._mbWordPointer_ >= this._googleTrendWords_.words.length-1) {
            this._mbWordPointer_ = -1;
        }
        this._mbWordPointer_ ++;
        return this._googleTrendWords_.words[this._mbWordPointer_];
    }

    reset() {
        this._googleTrendWords_ = {date: '', words: []};
        this._pcWordPointer_ = -1;
        this._mbWordPointer_ = -1;
    }

    async getGoogleTrendWords() {
        if (this._isGoogleTrendUpToDate()) {
            return;
        }
        if (this._loadLocalWords()) {
            return;
        }

        const dates = this._getPastThreeDays();
        for (let i = 0; i<3; i++) {
            await this._fetchGoogleTrend(this._getGoogleTrendUrl(dates[i]));
        }
        this._saveWordsToLocal();
    }

    _isGoogleTrendUpToDate(date=this._googleTrendWords_.date) {
        return date == this._getyyyymmdd(new Date());
    }

    _saveWordsToLocal() {
        localStorage.setItem('googleTrend', this._googleTrendWords_.words.join('|'));
        localStorage.setItem('googleTrendDate', this._googleTrendWords_.date);
    }

    _loadLocalWords() {
        const date = localStorage.getItem('googleTrendDate');
        if (date == undefined) {
            return false;
        }
        if (!this._isGoogleTrendUpToDate(date)) {
            return false;
        }
        this._googleTrendWords_.date = date;
        this._googleTrendWords_.words = localStorage.getItem('googleTrend').split('|');
        return true;
    }

    async _fetchGoogleTrend(url) {
        let response;
        try {
            response = await fetch(url);
        } catch (ex) {
            throw new FetchFailedException('googleTrend::_fetchGoogleTrend', ex);
        }
        if (!response.ok) {
            throw new FetchFailedException('googleTrend::_fetchGoogleTrend', response);
        }
        this._getWordsFromJSON(JSON.parse((await response.text()).slice(5)));
    }

    _getPastThreeDays() {
        const dates = [];
        const date = new Date();
        for (let i = 0; i<3; i++) {
            if (i != 0) {
                date.setDate(date.getDate()- 1);
            }
            dates.push(this._getyyyymmdd(date));
        }
        return dates;
    }

    _getyyyymmdd(date) {
        return date.toJSON().slice(0, 10).replace(/-/g, '');
    }

    _getGoogleTrendUrl(yyyymmdd) {
        return `https://trends.google.com/trends/api/dailytrends?hl=en-US&ed=${yyyymmdd}&geo=US&ns=15`;
    }

    _getWordsFromJSON(json) {
        const trends = json['default']['trendingSearchesDays'][0]['trendingSearches'];
        for (let i = 0; i<trends.length; i++) {
            this._appendWord(trends[i]['title']['query']);

            const relatedQueries = trends[i]['relatedQueries'];
            for (let j = 0; j<relatedQueries.length; j++) {
                this._appendWord(relatedQueries[j]['query']);
            }
        }
    }

    _appendWord(word) {
        if (!this._googleTrendWords_.words.includes(word)) {
            this._googleTrendWords_.words.push(word);
        }
    }
}
