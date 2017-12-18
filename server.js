// A "closer to real-life" app example
// using 3rd party middleware modules
// P.S. MWs calls be refactored in many files


var Data=require('./models/data');
// long stack trace (+clarify from co) if needed
if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');
const mongoose = require('./libs/mongoose');
// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();
const config1 = require('./config/default');
middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});

// ---------------------------------------

// can be split into files too
const Router = require('koa-router');

const router = new Router();

router.get('/', require('./routes/main').get);
router.post('/login:f', require('./routes/login').post);
router.post('/logout:f', require('./routes/logout').post);
router.get('/registrate', require('./routes/registrate').get);
router.post('/registrate', require('./routes/registrate').post);
router.post('/searchCat', require('./routes/searchCat').get);
router.post('/searchData', require('./routes/searchData').get);
router.get('/corzina', require('./routes/korzina').get);
router.post('/corzina', require('./routes/korzina').post);
router.post('/order',require('./routes/order').post);
router.post('/checkout', require('./routes/checkout').post);
router.get('/userSettings', require('./routes/userSettings').get);
router.post('/userSettings', require('./routes/userSettings').post);

app.use(async (ctx, next) => {
  var f=this.session;
  var v=ctx.session;
  if (!ctx.get('csrf-token')) ctx.set('csrf-token', ctx.csrf);
  await next();
});


app.use(router.routes());
app.listen(config1.port);

var root=pathToJson();
fs.watch(root, async function (event, filename) {
    console.log('event is: ' + event);
    if (filename) {

        try{
            setPendingStatus(true);
            console.log('status:',config1.isPending);
            require('./fixtures/create_all')();
            var promise=new Promise((res,rej)=>{
                res();
            });
            promise.then(async function(){
                new Promise((res,rej)=>{
                   var int= setInterval(async function(res){
                       var products= await Data.find().limit(9);
                       if(products.length>0){
                           res(int);
                       }
                   },1000);
                });

            })
                .then((int)=>{
                clearInterval(int);
                    setPendingStatus(false);
                    console.log('status:',config1.isPending);
                });


        }
        catch (err){

        }


    } else {
        console.log('filename not provided');
    }
});

function pathToJson() {
    return __dirname+'/Price/last.json';
}

function setPendingStatus(status){
    config1.isPending=status;
}

