//Основной файл
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


const Router = require('koa-router');

const router = new Router();
//Настройка маршрутизации
router.get('/', require('./routes/main').get);
router.post('/login:f', require('./routes/login').post);
router.post('/logout:f', require('./routes/logout').post);
router.post('/searchCat', require('./routes/searchCat').get);
router.post('/searchData', require('./routes/searchData').get);
router.get('/corzina', require('./routes/korzina').get);
router.post('/corzina', require('./routes/korzina').post);
router.post('/checkout', require('./routes/checkout').post);
router.get('/userSettings', require('./routes/userSettings').get);
router.post('/userSettings', require('./routes/userSettings').post);

//Работа  с сессией
app.use(async (ctx, next) => {
  var f=this.session;
  var v=ctx.session;
  if (!ctx.get('csrf-token')) ctx.set('csrf-token', ctx.csrf);
  await next();
});
app.use(router.routes());

//Обработка ошибки 404(при неправильном запросе рендеринг главной страницы)
app.use(async (ctx, next) => {
    try {
        await next()
        if (ctx.status === 404) {
            await require('./routes/main').get(ctx, next);
        }
    } catch (err) {
        // handle error
    }
});



app.listen(config1.port);

//Путь к файлу с выгрузкой(last.json)
var root=pathToJson();

//Эта функция следит за изменениями в last.json. Если изменения были, происходит обновление бд.
require('./libs/watchFileChange')(root);

function pathToJson() {
    return __dirname+'/Price/last.json';
}

function setPendingStatus(status){
    config1.isPending=status;
}

