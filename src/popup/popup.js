import {runInPageContext} from '../page-context.js'
function someFunction(name = 'test') {
  return new Promise( function() {
    resolve('Success!');
  }
    
  );
}

function solve1(){
  chrome.tabs.executeScript({
    file: 'runsolve.js'
});
}

document.getElementById('Solve').addEventListener('click', async () => {
  solve1();
});