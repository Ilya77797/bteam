const fs = require('fs');
const config1 = require('../config/default');
var log_file = fs.createWriteStream(config1.dir + '/Logs/debug.log', {flags : 'a'});
function main(dir) {
    console.log = function(d) { //
        log_file.write(new Date(Date.now()+10800000).toISOString().replace(/T/, ' ').replace(/\..+/, '')+'  '+d + '\n');
    };
}
module.exports=main;