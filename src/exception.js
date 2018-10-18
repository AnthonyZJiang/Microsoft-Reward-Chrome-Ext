class FetchResponseAnomalyException extends Error {
    constructor(source, message) {
        if (!message) {
            message = 'Fetch response is anomalous.'
        }
        super(message)
        this.name = 'FetchResponseAnomalous';
        this.source = source;
    }
}

class FetchFailedException extends Error {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch failed because an exception occurred.'
        }
        super(message)
        this.name = 'FetchFailed';
        this.source = source;
        this.innerException = innerException;
    }
}

class FetchRedirectedException extends Error {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch failed because redirection occurred.'
        }
        super(message)
        this.name = 'FetchRedirected';
        this.source = source;
        this.innerException = innerException;
    }
}

class GoogleTrendPageNumberOverflowException extends Error {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to get more Google trend words because all pages have been used.'
        }
        super(message)
        this.name = 'GoogleTrendOverflow';
        this.source = source;
        this.innerException = innerException;
    }
}

class ParseJSONFailedException extends Error {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to parse the JSON file.'
        }
        super(message)
        this.name = 'ParseJSONFailed';
        this.source = source;
        this.innerException = innerException;
    }
}

