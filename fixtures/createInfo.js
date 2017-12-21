const mongoose=require('../libs/mongoose');
const Info=require('../models/info');
async function q1() {
    await Info.remove({});
    console.log('info removed');
}


async function createInfo() {
    var info={
        _id:0,
        orderId:1,
        fileHash:'qqq'
    }
    var newInfo= new Info(info);
    await newInfo.save();
    console.log('info saved');
}

async function main() {
    await q1();
    await createInfo();
}
main();