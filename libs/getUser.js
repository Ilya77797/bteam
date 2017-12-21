var session=require('../libs/mongoose');
const mongoose=require('../libs/mongoose');
const User=require('../models/user');

async function getUser(ctx) {
    var ses=ctx.sessionId;
    var sesObj= await session.models.Session.find({sid:`koa:sess:${ses}`});
    var userId=sesObj[0].user;
    var c=userId.toObjectId();
    var user= await User.find({_id:userId.toObjectId()});
    var UserN={
        name:user[0].displayName,
        price:user[0].visiblePrice,
        discount:user[0].discount,
        curPrice:user[0].curPrice,
        show:user[0].showSP_Price,
        useDiscount:user[0].useDiscount,
        _id:user[0]._id,
        email:user[0].email
    };
    return UserN;
}

module.exports=getUser;