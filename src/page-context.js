
/**
 * Runs a function in the page context by serializing it to a string and injecting it to the page
 * @param {(function|Object)} func - a function to serialize and run in the page context, or an arguments object
 * @param {function} func.func - a function to serialize and run in the page context
 * @param {Array} [func.args] - arguments array to be passed to `func`
 * @param {Document} [func.doc] - alternative `document` to inject the serialized function
 * @param {number} [func.timeout] - optional timeout (milliseconds)
 * @param {...any} [args] - arguments array to be passed to `func`
 * @returns {Promise} a promise that will be resolved with the return value of the serialized function
 */
export async function runInPageContext(func, ...args) {

    const params = Object(func);

    const {
        doc = document,
        timeout
    } = params;

    if (typeof func !== 'function') {
        func = params.func;
        args = params.args;
    }

    // test that we are running with the allow-scripts permission
    try { window.sessionStorage; } catch (ignore) { return null; }

    // returned value container
    const resultMessageId = parseInt('' + Math.floor((Math.random() * 100) + 1) + ((new Date()).getTime()));

    // prepare script container
    let scriptElm = doc.createElement('script');
    scriptElm.setAttribute("type", "application/javascript");

    const code = `
        (
            async function () {

                    const response = {
                        id: ${resultMessageId}
                    };

                    try {
                        response.result = JSON.stringify(await (${func})(...${JSON.stringify(args || [])})); // run script
                    } catch(err) {
                        response.error = JSON.stringify(err);
                    }
            
                    window.postMessage(response, '*');
            }
        )();
    `;

    // inject the script
    scriptElm.textContent = code;

    // run the script
    doc.documentElement.appendChild(scriptElm);

    // clean up script element
    scriptElm.remove();

    // create a "flat" promise
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

    // reject on timeout
    if (timeout !== undefined) {

        const timerId = setTimeout(() => {
            onResult({
                data: {
                    id: resultMessageId,
                    error: 'Script timeout'
                }
            });
        }, timeout);

        // clear the timeout handler
        promise.finally(() => (timerId !== null) ? clearTimeout(timerId) : null);
    }

    // resolve on result
    function onResult(event) {
        const data = Object(event.data);
        if (data.id === resultMessageId) {
            window.removeEventListener('message', onResult);
            if (data.error !== undefined) {
                return reject(JSON.parse(data.error));
            }
            return resolve((data.result !== undefined) ? JSON.parse(data.result) : undefined);
        }
    }

    window.addEventListener('message', onResult);

    return promise;

}