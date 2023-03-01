const scriptString = 'function runAtStart () { console.log("our code..."); }';
const script = document.createElement('script'); script.appendChild(document.createTextNode(scriptString));
(document.body || document.head || document.documentElement).appendChild(script);