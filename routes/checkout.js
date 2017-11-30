const nodemailer = require('nodemailer');
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
        html: getMessage(data) // html body
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            // return console.log(error);
            return console.log('Error');
        } else {
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    });

}


function getMessage(data) {

    return `
        <p>Заказ на сайте bteam.ru</p>
    <h3>Детали заказа</h3>
    <ul>
    <li>Имя: ${data.name}</li>
    <li>Email: ${data.email}</li>
    <li>Телефон: ${data.phone}</li>
    </ul>
    <h3>Сообщение</h3>
    <p>${data.comment}</p>
    <h3>Headers</h3>
    <ul>
    <li>cookie: ${req.headers.cookie}</li>
    <li>user-agent: ${req.headers["user-agent"]}</li>
    <li>referer: ${req.headers["referer"]}</li>
    <li>IP: ${req.ip}</li>
    </ul>
    
    `
}

async function getOrder(order) {//Проверка на правильность кук
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
    products.forEach((item)=>{
        htmlContent+=`<li> Название: ${item.name} <br> Колличество: ${obj[item._id]} <br> Цена: </li>>`
    });
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



