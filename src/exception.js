function handleException(ex) {
    setBadge(new ErrorBadge());
    console.log('Error History:');
    logException(ex);
    throw ex;
}

function logException(ex) {
    if (ex.innerException) {
        logException(ex.innerException);
    }
    console.log(`Source: ${ex.source}\n`, ex);
}

class ErrorWithSourceInnerException extends Error {
    constructor(source, innerException, message) {
        message = message + '\nInnerEx: ' + (innerException ? innerException.stack : 'null');
        super(message);
        this.source = source;
        this.innerException = innerException;
    }
}

class FetchFailedException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (innerException == undefined) {
            innerException = {
                message: undefined,
                name: undefined,
            };
        }

        if (!message) {
            message = `Fetch failed because an exception occurred::${innerException.message}`;
        }
        super(source, innerException, message);
        this.name = 'FetchFailed::'+innerException.name;
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

class ResponseUnexpectedStatusException extends ErrorWithSourceInnerException {
    constructor(source, response, message) {
        if (!message) {
            message = `Expected response status is within 200-299. Received response status: ${response.status} (${response.statusText})`;
        }
        super(source, null, message);
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
