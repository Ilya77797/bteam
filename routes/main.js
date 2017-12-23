require('../models/categor');
var session=require('../libs/mongoose');
const passport = require('koa-passport');
const mongoose=require('../libs/mongoose');
var Categor=require('../models/categor');
var Data=require('../models/data');
var isLogged=require('../libs/isLogged');
var getUser=require('../libs/getUser');
const LIMIT=9;
exports.get=async function(ctx, next) {

        if(await isLogged(ctx)){
            var user= await getUser(ctx);
            if(user==null)
                ctx.body = ctx.render('main',{isLoged:false});
            else
                ctx.body = ctx.render('main',{isLoged:true, name:user.name});

        }
        else {

            ctx.body = ctx.render('main',{isLoged:false});
        }

};




