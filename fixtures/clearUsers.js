const mongoose=require('../libs/mongoose');
const User=require('../models/user');
async function q1() {
    await User.remove({});
    console.log('done');
}

q1();
module.exports=q1;