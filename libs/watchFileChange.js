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

