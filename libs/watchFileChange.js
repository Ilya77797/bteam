const fs = require('fs');
const md5File = require('md5-file');
const Info=require('../models/info');
var createAll=require('../fixtures/create_all');
var path='';
var TIMER=null;

function watch(pathToFile) {

     fs.watchFile(pathToFile, async function (event, filename) {
        console.log('event is: ' + event);
        path=pathToFile;
        if(!fs.existsSync(pathToFile)){

           TIMER=setInterval(()=>{
               if(fs.existsSync(path)){
                   clearInterval(TIMER);
                   promiseChanged();
               }
           },2000);

               //setTimeout(promiseChanged,2000);//Set interval???
        }
        else{
            promiseChanged();
        }



    });
}

function isChanged(pathToFile) {
    return new Promise((resolve, reject)=>{


        md5File(pathToFile, async function(err, hash){
            if (err) throw err
            console.log(`The MD5 sum of LICENSE.md is: ${hash}`);
            if(await isEqual(hash))
                resolve(false);
            else {
                await saveHash(hash);

                resolve(true);
            }



        });
    });

}

async function isEqual(hash) {
    var info=await Info.find({_id:0});
    var oldHash=info[0].fileHash;
    if(hash==oldHash)
        return true
    return false
}

async function saveHash(hash) {
    await Info.update({ _id: 0 }, { $set: { fileHash: hash }});
}

function promiseChanged() {
    isChanged(path)
        .then((isCh)=>{
            if(isCh){
                console.log('start updating...');
                createAll();

            }
            else{
                console.log('no update');
            }

        })
        .catch(()=>{
        console.log('error');
        });

}

module.exports=watch;

/*
try {
    setPendingStatus(true);
    console.log('status:', config1.isPending);
    require('./fixtures/create_all')();
    var promise = new Promise((res, rej) => {
        res();
    });
    promise.then(async function () {
        new Promise((res, rej) => {
            var int = setInterval(async function (res) {
                var products = await Data.find().limit(9);
                if (products.length > 0) {
                    res(int);
                }
            }, 1000);
        });

    })
        .then((int) => {
            clearInterval(int);
            setPendingStatus(false);
            console.log('status:', config1.isPending);
        });


}
catch (err) {

}
*/

/*if (filename) {



} else {
    console.log('filename not provided');
}*/
