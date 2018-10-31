class GoogleTrend {
    constructor() {
        this.reset();
    }

    reset() {
        this._currentGoogleTrendPageIdx_ = 0;
        this._numSearchWordsRequested_ = 0;
        this._googleTrendWords_ = [];
        this._newlyAddedWordsCount_ = 0;
    }

    get googleTrendWords() {
        return this._googleTrendWords_;
    }

    async getGoogleTrendWords(numSearchWordsRequired) {
        this._numSearchWordsRequested_ = numSearchWordsRequired - this._googleTrendWords_.length;
        console.assert(this._numSearchWordsRequested_ > 0);
        this._newlyAddedWordsCount_ = 0;
        await this._fetchGoogleTrend();
    }

    async _fetchGoogleTrend() {
        if (this._isOutOfSearchWords()) {
            throw new GoogleTrendPageNumberOverflowException('GoogleTrend');
        }

        let response;
        try {
            response = await fetch(this._getGoogleTrendUrl());
        } catch (ex) {
            throw new FetchFailedException('GoogleTrend', ex);
        }

        if (response.status != 200) {
            throw new FetchResponseAnomalyException('GoogleTrend');
        }

        this._currentGoogleTrendPageIdx_++;
        this._newlyAddedWordsCount_ += this._parseWordsFromDocument(getDomFromText(await response.text()));
        if (this._newlyAddedWordsCount_ >= this._numSearchWordsRequested_) {
            return;
        }

        await this._fetchGoogleTrend();
    }

    _isOutOfSearchWords() {
        return this._currentGoogleTrendPageIdx_ >= GOOGLE_TREND_PAGE_ID.length;
    }

    _getGoogleTrendUrl() {
        return 'https://trends.google.com/trends/hottrends/atom/feed?pn=p' + GOOGLE_TREND_PAGE_ID[this._currentGoogleTrendPageIdx_];
    }

    _parseWordsFromDocument(doc) {
        this._currentGoogleTrendPageIdx_++;

        // get titles
        const titles = doc.getElementsByTagName('title');
        console.log('Number of titles: ', titles.length);

        if (titles.length < 0) {
            console.log('No keywords found, requesting another Google trend page.');
            return 0;
        }

        return this._appendWords(titles);
    }

    _appendWords(titles) {
        let addedWordCount = 0;
        // iterate through all titles
        // but skip the first one as it is 'Hot Trends'
        for (let i = 1; i < titles.length; i++) {
            // if the same search word has been added, skip to the next one.
            if (this._isCurrentWordIncluded(titles[i].textContent)) {
                continue;
            }
            // add the search word
            this._googleTrendWords_.push(titles[i].textContent);
            addedWordCount++;
        }

        return addedWordCount;
    }

    _isCurrentWordIncluded(word) {
        return this._googleTrendWords_.includes(word);
    }
}


const GOOGLE_TREND_PAGE_ID = ['1', '9', '10', '23', '24', '28', '29'];
