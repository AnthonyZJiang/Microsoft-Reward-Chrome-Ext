function getanswer4(){
    return _w.rewardsQuizRenderInfo.correctAnswer;
}

function getanswer(){
    return parseInt(_w.rewardsQuizRenderInfo.correctAnswer);
}
function getkey(){
     return  _G.IG;
}

function decodecode(key,name){
    let t = 0;
    for (let i = 0; i < name.length; i++) {
       t += name.charCodeAt(i);
}
     t+= parseInt(key.slice(-2),16)
    return t
}


function solve2(){ //solve this or that

let answer = getanswer();
let answers = document.getElementsByClassName("btOptionCard")
let key = getkey();
    
if (decodecode(key,answers[0].getAttribute("data-option")) == answer){
    answers[0].click();
}
if (decodecode(key,answers[1].getAttribute("data-option")) == answer){
    answers[1].click();
}
    
}

function solve8() { //solve 5 correct options
      let answers = document.getElementsByClassName("b_cards bt_lstcl_card btcc btcNoImg")
for (let i = 0; i < answers.length; i++) {
    try{
        answers[i].click();
    }
    catch{
        console.log("a");
    }
  
}

}

function noption() {
    return _w.rewardsQuizRenderInfo.numberOfOptions
}

function solve4(){ // solve correct
let answer = getanswer4();
let answers = document.getElementsByClassName("rqOption");
for (let i = 0; i < answers.length; i++) {
  if(answers[i].getAttribute("value")==answer){
      answers[i].click();
  }
}
}

console.log("Solve");

switch (noption()){ //solve depending on type
case 2:
    solve2();
    break;
case 4:
    solve4();
    break;
case 8:
    solve8();
    break;
}

