const mongoose=require('../libs/mongoose');
var Categor=require('../models/categor');
exports.get=async function(ctx, next) {

    ctx.body=await Categor.find({}).sort('index');

   /* var data=ctx.request.body.search.trim();
    if(data==undefined||data[0]==''){
        var cat= await Categor.find({});
    }
    else {
        var rex=new RegExp('^'+data,'i')
        var cat= await Categor.find({'category':rex});
    }
    if(cat.length==0){
        ctx.body=['Нет таких категорий'];
    }
    else {
        ctx.body=cat;
    }*/




};

function deepSearch(catregor, reg, resMass) {
    if(catregor.name.match(req)){
        resMass.push(catregor);
    }
    if(catregor.subcat==null)
        return
    else{
        catregor.subcat.forEach((item)=>{
            if(item.name.match(req)){
                resMass.push(item);
            }
            else {
                deepSearch(item,reg,resMass);
            }
        });
    }
}


