const Dataq=require('../models/data');
const mongoose=require('../libs/mongoose');
const Categor=require('../models/categor');
const User=require('../models/user');
const mainFile=require('../Price/last.json');
var resultCat=[];
var resultMass = [];
var resultUsers=[];
async function main() {
//parcing categories

    try{
        mainFile.users.forEach((item)=>{
            let prices=item[3].split(' ');
            let user={
                username:item[0],
                displayName:item[2],
                password:item[1],
                visiblePrice:prices,
                discount:item[4],
                curPrice:prices[prices.length-1],
                showSP_Price:false,
                useDiscount:true
            };
            resultUsers.push(user);
        });
    }
    catch (e){

    }

    resultUsers.forEach(async function (item) {
        let us=new User(item);
        await us.save();
        console.log(`user ${item.name} is added to the database`);
    });
    try{
        mainFile.groups.forEach((item)=>{
            let cat={
                name:item.name,
                subcat:item.subcat
            };
            resultCat.push(cat);
            console.log(`category ${item.name} is added to the database`);
        });
    }
    catch (e) {

    }
     resultCat.forEach(async function (item) {
     let cat=new Categor(item);
     await cat.save();
     console.log(`category ${item.name} is added to the database`);
     });


//parcing data from JSON---Доделать

    try {
        mainFile.data.forEach((item, i) => {
            var dataObj = {
                _id: parseInt(item[0]),
                name: item[0] + ' ' + item[1],
                status: item[2],
                textDescription: item[3],
                measure: item[4],
                amount: item[5],
                price: item[6],
                specialPrice1: item[7],
                specialPrice2: item[8],
                specialPrice3: item[9],
                specialPrice4: item[10],
                minOrder: item[11],
                category: takeCat(item[12]),
                icon: takeIcon(item[13]),
                info: takeInfo(item[13], item[14]),
                index: i,


            };
            resultMass.push(dataObj);
        });

    }
    catch (e) {
        console.log('err: ', e)
    }

    await sortPriceUp(resultMass);
    await sortAlpha(resultMass);
    var a=0;


    resultMass.forEach(async function (data,i) {
     var b=new Dataq(data);
     await b.save();
     console.log('done: ', i);
     });
}

function takeName(str) {
    if(str.indexOf('<')==-1)
        return str
    return str.substring(0,str.indexOf('<'));


}

function takeStatus(str) {
    if(str.indexOf('<')==-1)
        return 'В наличие'
    return str.substring(str.indexOf('<strong>')+8,str.indexOf('</strong>'));
}

function takeInfo(str1, str2) {
    if(str1==''||str1==undefined){
     if(str2==''||str2==undefined)
         return 'null'
     else
         return str2
    }


    return mainFile.prefixes[0]+str1

    /*var str=str1.substring(str1.indexOf("http"),str1.indexOf("target")-2);
     return str.replace(/'\'/g, "")*/
    /*var str= str1.substring(str1.indexOf('http'),str1.indexOf("target"));
    var index=str.indexOf("'")
    if(index==-1)
        return str
    else
        return str.substring(0,index);*/
}

function takeIcon(str) {
    if(str==''||str==undefined)
        return 'images/noPicture.png'
    return mainFile.prefixes[1]+str
}

function takeAmount(str) {
    return str.substring(str.indexOf('+'))
}

function takeCat(str) {
    if(str==undefined)
        return 'null'
    return str
}

async function sortPriceUp(mass) {
        var sortedMass = mass;
        await sortedMass.sort((a, b) => {
            return a.price - b.price;
        });

        await sortedMass.forEach(function (item,i) {
           item.indexSortUp=i;
        });



    }

async function sortAlpha(mass) {
    var sortedMass = mass;
    await sortedMass.sort((a, b) => {
        var aN=a.name.substring(firstLetter(a.name)).toUpperCase();
        var bN=b.name.substring(firstLetter(b.name)).toUpperCase();
       return compareLetters(aN,bN,0);

    });

    await sortedMass.forEach(function (item,i) {
        item.indexSortAlp=i;
    });
    var b=0;
}

/*var indexUp=FindId(item._id, resultMass);
resultMass[indexUp].indexSortUp = i;*/
function FindId(id, mass) {
        var i=mass.length-1;
        var f=false;
        while(f==false&&i>0){
            if(mass[i]._id==id)
                f=true;
            i--;
        }
        return i+1;
    }
function firstLetter(string) {
    for(var i=0; i<string.length;i++){
        var lll=string[i];
        var p=string[i].toUpperCase().charCodeAt(0);
       if(p>1039&&p<1072||p>64&&p<91){
           return i
       }
    }
}

function compareLetters(a,b, i) {
    if(a[i]!=b[i])
        return a.charCodeAt(0)-b.charCodeAt(0)
    else {
        if(a.length==b.length&&a.length==i)
            return 1
        if(a.length>b.length && i==b.length)
            return -1
        if(b.length>a.length && i==a.length)
            return 1

        compareLetters(a,b,i+1);
    }
}

main();

