function main(){
    return _w.rewardsQuizRenderInfo.maxQuestions
}

var data = main();

document.dispatchEvent(new CustomEvent('data', { detail: data }));