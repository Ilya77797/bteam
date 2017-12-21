const crypto = require('crypto');
const sha256=require('sha256');
const md5File = require('md5-file')
function main(){
    //var hash = crypto.createHash('sha256').update('1234').digest('base64');
    //var a=sha256('1234');
    //var d=0;
    md5File('/Users/MacBookPro/Desktop/WebStorm/сайт/node2.0/bteam/Price/last.json', (err, hash) => {
        if (err) throw err

        console.log(`The MD5 sum of LICENSE.md is: ${hash}`)
    })
}
main();