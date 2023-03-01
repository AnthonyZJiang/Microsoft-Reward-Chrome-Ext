import {runInPageContext} from '../page-context.js'
function someFunction(name = 'test') {
  return new Promise( function() {
    resolve('Success!');
  }
    
  );
}


document.getElementById('Solve').addEventListener('click', async () => {
  chrome.tabs.executeScript({
    file: 'content.js'
});
});