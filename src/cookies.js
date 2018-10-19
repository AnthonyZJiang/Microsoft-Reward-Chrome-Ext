'use strict';

const AUTH_COOKIE_OPTION = {
    url: "https://.account.microsoft.com",
    name: "AMCSecAuth"
};
const AUTH_COOKIE_EXPIRATION_DATE = 7226582400; // 1/1/2199 00:00:00.
var CookieStateType = Object.freeze({
    "none": "um...what just happened?",
    "notFound": "not found.",
    "error": "error!",
    "sessional": "delete on browser close.",
    "persistentEarlyExpire": "expires soon.",
    "persistent": "expires in >100 years."
});

function setAuthCookiePersistent() {
    return new Promise((resolve, reject) => {
        chrome.cookies.get(AUTH_COOKIE_OPTION, (cookie) => {
                if (!cookie) {
                    reject(CookieStateType.notFound)
                } else {
                    cookie.session = false;
                    cookie.expirationDate = AUTH_COOKIE_EXPIRATION_DATE;
                    chrome.cookies.set(getCookieFromFullCookie(cookie));
                    resolve(CookieStateType.persistent);
                }
            }
        );
    });
}

function setAuthCookieSessional() {
    return new Promise((resolve, reject) => {
        chrome.cookies.get(AUTH_COOKIE_OPTION, (cookie) => {
                if (!cookie) {
                    reject(CookieStateType.notFound)
                } else {
                    delete cookie.expirationDate;
                    cookie.session = true;
                    chrome.cookies.set(getCookieFromFullCookie(cookie));
                    resolve(CookieStateType.sessional);
                }
            }
        );
    });
}

function setAuthCookieExpiry(currentCookieExpiry, userCookieExpiry) {
    if (currentCookieExpiry == userCookieExpiry) {
        return new Promise((resolve) => resolve(currentCookieExpiry));
    }
    
    if (userCookieExpiry == CookieStateType.sessional) {
        return setAuthCookieSessional();
    }

    return setAuthCookiePersistent();
}

function getAuthCookieExpiry() {
    return new Promise((resolve, reject) => {
        chrome.cookies.get(AUTH_COOKIE_OPTION, (cookie) => {
                if (!cookie) {
                    reject(CookieStateType.notFound);
                }
                if (cookie.session) {
                    resolve(CookieStateType.sessional);
                    return;
                }
                if (!cookie.expirationDate) {
                    reject(CookieStateType.error);
                    return;
                }
                if (cookie.expirationDate < AUTH_COOKIE_EXPIRATION_DATE) {
                    resolve(CookieStateType.persistentEarlyExpire);
                    return;
                }
                resolve(CookieStateType.persistent);
            })
    });
}

function getCookieFromFullCookie(cookie) {
    var newCookie = {};
    newCookie.url = AUTH_COOKIE_OPTION.url;
    newCookie.name = AUTH_COOKIE_OPTION.name;
    newCookie.value = cookie.value;
    if (!cookie.hostOnly) {
        newCookie.domain = cookie.domain;
    }
    newCookie.path = cookie.path;
    newCookie.secure = cookie.secure;
    newCookie.httpOnly = cookie.httpOnly;
    if (!cookie.session) {
        newCookie.expirationDate = cookie.expirationDate;
    }
    newCookie.storeId = cookie.storeId;
    return newCookie;
}