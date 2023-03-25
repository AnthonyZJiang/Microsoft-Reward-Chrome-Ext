import data from './example.json' assert { type: 'json' };

function getTodayDate() {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return `${mm}/${dd}/${today.getFullYear()}`;
}



function getUrlsFromArr(list,criteria){
    let urls = [];
for(let i = 0; i< list.length;i++){
    
    let type = list[i].Attributes.type;
    if (list[i].Attributes.complete == 'False' && type == criteria){
        urls.push(list[i].DestinationUrl);
    }

}
return urls
}
º
let dailySet = data[0].FlyoutResult.DailySetPromotions[getTodayDate()]
let MorePromotions = data[0].FlyoutResult.MorePromotions;
console.log(getUrlsFromArr(dailySet,"quiz"))