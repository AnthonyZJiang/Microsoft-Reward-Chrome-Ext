class ErrorWithSourceInnerException extends Error {
    constructor(source, innerException, message) {
        super(message);
        this.source = source;
        this.innerException = innerException;
    }
}

class FetchResponseAnomalyException extends ErrorWithSourceInnerException {
    constructor(source, message) {
        if (!message) {
            message = 'Fetch response is anomalous.';
        }
        super(source, null, message);
        this.name = 'FetchResponseAnomalous';
    }
}

class FetchFailedException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch failed because an exception occurred.';
        }
        super(source, innerException, message);
        this.name = 'FetchFailed';
    }
}

class FetchRedirectedException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch failed because redirection occurred.';
        }
        super(source, innerException, message);
        this.name = 'FetchRedirected';
    }
}

class GoogleTrendPageNumberOverflowException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to get more Google trend words because all pages have been used.';
        }
        super(source, innerException, message);
        this.name = 'GoogleTrendOverflow';
    }
}

class ParseJSONFailedException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to parse the JSON file.';
        }
        super(source, innerException, message);
        this.name = 'ParseJSONFailed';
    }
}

class FetchTimeoutException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch timeout.';
        }
        super(source, innerException, message);
        this.name = 'FetchTimeout';
    }
}
