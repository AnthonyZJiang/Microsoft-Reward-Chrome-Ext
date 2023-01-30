import {setBadge, ErrorBadge} from './badge.js';

export function handleException(ex) {
    setBadge(new ErrorBadge());
    console.log('Error History:');
    logException(ex);
    throw ex;
}

export function logException(ex) {
    if (ex.innerException) {
        logException(ex.innerException);
    }
    console.log(`Source: ${ex.source}\n`, ex);
}

export class ErrorWithSourceInnerException extends Error {
    constructor(source, innerException, message) {
        message = message + '\nInnerEx: ' + (innerException ? innerException.stack : 'null');
        super(message);
        this.source = source;
        this.innerException = innerException;
    }
}

export class FetchFailedException extends ErrorWithSourceInnerException {
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

export class ResponseUnexpectedStatusException extends ErrorWithSourceInnerException {
    constructor(source, ex, message) {
        if (!message) {
            message = `Expected response status is within 200-299. Received response: ${ex}`;
        }
        super(source, null, message);
        this.name = 'FetchRedirected';
    }
}

export class GoogleTrendPageNumberOverflowException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to get more Google trend words because all pages have been used.';
        }
        super(source, innerException, message);
        this.name = 'GoogleTrendOverflow';
    }
}

export class ParseJSONFailedException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Failed to parse the JSON file.';
        }
        super(source, innerException, message);
        this.name = 'ParseJSONFailed';
    }
}

export class FetchTimeoutException extends ErrorWithSourceInnerException {
    constructor(source, innerException, message) {
        if (!message) {
            message = 'Fetch timeout.';
        }
        super(source, innerException, message);
        this.name = 'FetchTimeout';
    }
}

export class UserAgentInvalidException extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserAgentInvalid';
    }
}

export class NotRewardUserException extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserNotLoggedIn';
    }
}
