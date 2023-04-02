const userAgentRawData = {
    UA_SOURCE_STABLE: {
        'url': 'https://raw.githubusercontent.com/tmxkn1/Microsoft-Reward-Chrome-Ext/master/useragents.json',
        'mobile': {
            'parser': function (json) {
                return json.stable.chrome_ios;
            },
            'value': '',
            'valid': false,
        },
        'edge': {
            'parser': function (json) {
                return json.stable.edge_win;
            },
            'value': '',
            'valid': false,
        },
        'lastSync': 0,
    },
    UA_SOURCE_UPDATED: {
        'url': 'https://raw.githubusercontent.com/tmxkn1/UpdatedUserAgents/master/useragents.json',
        'mobile': {
            'parser': function (json) {
                return json.chrome.ios;
            },
            'value': '',
            'valid': false,
        },
        'edge': {
            'parser': function (json) {
                return json.edge.windows;
            },
            'value': '',
            'valid': false,
        },
        'lastSync': 0,
    },
    UA_SOURCE_LOCAL: {
        'url': '',
        'mobile': {
            'parser': '',
            'value': '',
            'valid': true,
        },
        'edge': {
            'parser': '',
            'value': '',
            'valid': true,
        },
        'lastSync': 0,
    },
};

class UserAgents {
    UA_TYPE_MOBILE = 'mobile';
    UA_TYPE_EDGE = 'edge';

    #data = userAgentRawData;
    #currentUASource = {
        'mobile': UA_SOURCE_NONE,
        'edge': UA_SOURCE_NONE,
    };

    constructor() {
        this.#resetSource(UA_SOURCE_STABLE);
        this.#resetSource(UA_SOURCE_UPDATED);
    }

    #resetSource(source) {
        if (source == UA_SOURCE_LOCAL) {
            return;
        }
        this.data[source].mobile = '';
        this.data[source].edge = '';
        this.data[source].status = UA_STATUS_NOT_SYNCED;
    }

    get mobile() {
        if (this.#currentUASource.mobile > UA_SOURCE_LOCAL) {
            throw new UserAgentInvalidException('Cannot find a valid user agent.');
        }
        return this.#data[this.#currentUASource.mobile].mobile;
    }

    get edge() {
        if (this.#currentUASource.edge > UA_SOURCE_LOCAL) {
            throw new UserAgentInvalidException('Cannot find a valid user agent.');
        }
        return this.#data [this.#currentUASource.edge].edge;
    }

    async getNextWorkingUA(uaType) {
        this.#currentUASource[uaType] ++;
        if (this.#data[this.#currentUASource[uaType]].status == UA_STATUS_SYNCED) {
            return;
        }
        try {
            await this.#fetchUserAgent(this.#currentUASource[uaType]);
        } catch (ex) {
            if (ex.name == 'UserAgentInvalidException') {
                throw ex;
            }
            this.#data[this.#currentUASource[uaType]].status = UA_STATUS_NOT_SYNCED;
            this.#getNextWorkingUA();
        }
    }

    async #fetchUserAgent(source) {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchProm = fetch(this.#data[source].url, {method: 'GET', signal: signal});
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
                const json = JSON.parse(text);
                userAgents[source].mobile.value = userAgents[source].mobile.parser(json);
                userAgents[source].edge.value = userAgents[source].edge.parser(json);
                if (userAgents[source].mobile.value) {
                    userAgents[source].mobile.valid = true;
                }
                if (userAgents[source].edge.value) {
                    userAgents[source].edge.valid = true;
                }
                userAgents[source].lastSync = new Date().getTime();
            },
        ).catch((ex) => {
            if (ex.name == 'AbortError') {
                throw new FetchFailedException('getStableUA::_awaitFetchPromise', ex, 'Fetch timed out. Failed to update user agents. Perhaps, Github server is offline.');
            }
            throw new ResponseUnexpectedStatusException('getStableUA::_awaitFetchPromise', ex);
        });
    }

    #assertUA(source) {
        if (!this.#data[source].edge || !this.#data[source].mobile) {
            this.#data[source].status = UA_STATUS_NOT_SYNCED;
            throw new UserAgentInvalidException('Failed to assert user agents. \n UA:\n' + JSON.stringify(this.#data[source]));
        }
    }
}

class UASourceAbstract {

}

const UA_SOURCE_NONE = 0;
const UA_SOURCE_STABLE = 1;
const UA_SOURCE_UPDATED = 2;
const UA_SOURCE_LOCAL = 3;
const UA_STATUS_SYNC_ERROR = -2;
const UA_STATUS_NOT_SYNCED = -1;
const UA_STATUS_NONE_WORKING = 0;
const UA_STATUS_ONLY_MOBILE_WORKING = 1;
const UA_STATUS_ONLY_PC_WORKING = 2;
const UA_STATUS_BOTH_WORKING = 3;