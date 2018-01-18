const Dataq=require('../models/data');
const mongoose=require('../libs/mongoose');
const Categor=require('../models/categor');
const User=require('../models/user');
const fs = require('fs');
var session=require('../libs/mongoose');
var mainFile;
var clearAll=require('./clear_all');
var resultCat=[];
var resultMass = [];
var resultUsers=[];
async function main(resolve) {
    mainFile=await JSON.parse(fs.readFileSync('./Price/last.json', 'utf8'));
    //mainFile=require('../Price/last.json');
    var changeUsers=false;
    var changeData=false;
    var changeCats=false;
   /* var flags=mainFile.flags;
    if(flags[0]){
        changeUsers=true;
    }

    if(flags[1]){
        changeCats=true;
    }

    if(flags[2]){
        changeData=true;
    }*/

   if(mainFile.users!=undefined)
       changeUsers=true;

   if(mainFile.groups!=undefined)
       changeCats=true;

    if(mainFile.data!=undefined)
        changeData=true;

    console.log('start del');
    await clearAll(changeUsers,changeCats,changeData);
    console.log('end del');
 //addUsers
 await addUsers(changeUsers);

//add categories
await addCats(changeCats);

//parcing data from JSON
await addData(changeData);

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
    var sortedMass = mass.slice(); //mass.slice();
    var itogMass=[];
    sortedMass.forEach(function (item,i) {
        itogMass[i]=[prepareForSprtAlpha(item.name),i];
    });
    itogMass.sort();
    itogMass.forEach((item,i)=>{
        resultMass[item[1]].indexSortAlp=i;
    });


}

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


    if(a[i]!=b[i]&&i<a.length&&i<b.length)
        return a[i].charCodeAt(0)-b[i].charCodeAt(0)
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

async function addUsers(isNeeded) {
    if(!isNeeded)
        return

    try{

        await session.models.Session.remove();
        console.log('sessions deleted');
    }
    catch (err){
        console.log('sessions deleting error!');
    }

    try{
        console.log('start adding users');
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
                useDiscount:true,
                email:item[5]||''
            };
            resultUsers.push(user);
        });
    }
    catch (e){
        console.log('adding users error!');
    }

    resultUsers.forEach(async function (item) {
        let us=new User(item);
        await us.save();
        console.log(`user ${item.name} is added to the database`);
    });

}

async function addCats(isNeeded) {
    if(!isNeeded)
        return


    try{
        console.log('start adding cats');
        mainFile.groups.forEach((item, i)=>{
            let cat={
                name:item.name,
                subcat:item.subcat,
                index:i
            };
            resultCat.push(cat);

        });
    }
    catch (e) {
        console.log('adding cats error!');
    }
    console.log(`resultCatLegth: ${resultMass.length}`);
    console.log(`resultCat ${resultCat}`);
    resultCat.forEach(async function (item) {
        let cat=new Categor(item);
        await cat.save();
        console.log(`category ${item.name} is added to the database`);
    });

}

async function addData(isNeeded) {
    if(!isNeeded)
        return


    try {
        console.log('start adding products');
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

    console.log(`resultDataLength ${resultMass.length}`);
    console.log(`resultData ${resultMass}`);
    resultMass.forEach(async function (data,i) {
        var b=new Dataq(data);
        await b.save();
        console.log(`item added: ${i}`);
    });

}

 function sort(mass) {
    var resMass=mass;
    var flag=true;
    while(flag){
        flag=false;
        resMass.forEach((item,i)=>{

            if(i<resMass.length-1){
                var aN=item.name.substring(firstLetter(item.name)).toUpperCase();
                var bN=resMass[i+1].name.substring(firstLetter(resMass[i+1].name)).toUpperCase();

                var index=compareLetters(aN,bN,0);
                if(index>0){
                    let b=resMass[i+1];
                    resMass[i+1]=item;
                    resMass[i]=b;
                    flag=true;
                }

            }

        })

    }
    return resMass

}

function prepareForSprtAlpha(str) {
    var index=firstLetter(str);
    var str_1=str.substring(index).toUpperCase();
    var itog='';
    for(let i=0;i<str_1.length;i++){
        var p=str_1[i].charCodeAt(0);
        if(p>64&&p<91||p>1038&&p<1073)
            itog+=str_1[i];
    }
    return itog;
}



module.exports=main;
