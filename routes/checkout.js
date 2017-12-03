const nodemailer = require('nodemailer');
var getUser=require('../libs/getUser');
const config1 = require('../config/default');
var Data=require('../models/data');
exports.post=async function(ctx, next) {
    var data=ctx.request.body;
    let smtpTransport;
    try {
        smtpTransport = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true, // true for 465, false for other ports 587
            auth: {
                user: config1.emailFrom,
                pass: config1.emailPassword
            }
        });
    } catch (e) {
        return console.log('Error: ' + e.name + ":" + e.message);
    }

    let mailOptions = {
        from: config1.emailFrom, // sender address
        to: `${config1.emailTo},${data.email}`, // list of receivers
        subject: 'Заказ на сайте bteam', // Subject line
        text: 'Заказ на сайте bteam', // plain text body
        html: await getMessage(data, ctx) // html body
    };

    smtpTransport.sendMail(mailOptions, (error, info, ctx) => {
        if (error) {
            // return console.log(error);
            ctx.body={status:'error'};
            return console.log('Error');
        } else {
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            ctx.body.status=200;
        }
    });
ctx.body={status:'send'};
}


async function getMessage(data,ctx) {

    return `
    <h3>Детали заказа</h3>
    <ul>
    <li>Имя: ${data.name}</li>
    <li>Email: ${data.email}</li>
    <li>Телефон: ${data.phone}</li>
    </ul>
    <h3>Сообщение</h3>
    <p>${data.comment}</p>
    <h3>Заказ</h3>
    <ul>
        ${await getOrder(data.order,ctx)}
    </ul>
    
    `
}

async function getOrder(order, ctx) {//Проверка на правильность кук
    var obj={};
    var zakaz=order.split(';');
    zakaz.forEach((item)=>{
        var a=item.split('-');
        obj[a[0]]=a[1];
    });
    var search=zakaz.map((item)=>{
        return item.split('-')[0]
    });
    var products= await searchData(search);
    var htmlContent='';
    try {
        var User= await getUser(ctx);
    }
    catch (err){
        var User=null;
    }
    var price=0;
    products.forEach((item)=>{
        var curPrice=getPrice(item, User);
        price+=curPrice*obj[item._id];
        htmlContent+=`<li> Название: ${item.name} <br> Колличество: ${obj[item._id]} <br> Цена:${curPrice} </li>`
    });

    var discount=0;

    if(User!=null&&User.useDiscount){
        htmlContent+=`<h3>Ваша скидка: ${User.discount} % </h3>`
        discount=User.discount;
    }

    htmlContent+=`<p>Итого: ${price-price*discount/100} руб</p>`

    return htmlContent;


}

async  function searchData(mass) {
    let nmass=mass.map((item)=>{
        try {
           let pitem=parseInt(item);
           return pitem
        }
        catch(e){

        }
    });
    var products= await Data.find({_id:{ $in : nmass }});
    return products
}

function getPrice(item, User){
    if(User==null||User.curPrice=='0')
        return item.price

    return item[`specialPrice${User.curPrice}`]
}



