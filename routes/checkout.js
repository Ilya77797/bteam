const nodemailer = require('nodemailer');
var fs = require('fs');
var p=createPath(__dirname)+'logs/logs.json';
var getUser=require('../libs/getUser');
const config1 = require('../config/default');
var Data=require('../models/data');
var orderId=require('../logs/logs.json').orderId;
var strZakaz='';
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


//fs.writeFile(p, JSON.stringify({orderId:parseInt(orderId)+1}), 'utf8');
ctx.body={status:'send'};

}


async function getMessage(data,ctx) {

    return `
    <h4>Информация о заказчике</h4>
    <ul>
    <li>Имя: ${data.name}</li>
    <li>Email: ${data.email}</li>
    <li>Телефон: ${data.phone}</li>
    <li>Сообщение: ${data.comment}</li>
    </ul>
    <h4>Информация о заказе:</h4>
    <ul>
    <li>Дата: ${new Date(Date.now()).toISOString().replace(/T/, ' ').replace(/\..+/, '')}</li>
    
    </ul>
    <table border="1" cellpadding="0" cellspacing="0" >
        <tr >
            <td><b>ID</b></td>
            <td><b>Наименование</b></td>
            <td><b>Кол-во</b></td>
            <td><b>Цена</b></td>
        </tr>
    ${await getOrder(data.order,ctx)}
    <p><i>Письмо создано автоматически. Пожалуйста, не отвечайте на него! Если у Вас возникли любые вопросы - Вы можете перезвонить по тел. 24-07-05, 24-07-08 в рабочее время или отправить письмо на адрес...</i></p>
    <p>${strZakaz}</p>
    
   
    
    `
}

/*<ul>
${await getOrder(data.order,ctx)}
</ul>*/

/*htmlContent+=`<li> Название: ${item.name} <br> Количество: ${obj[item._id]} <br> Цена:${curPrice} </li>`*/

async function getOrder(order, ctx) {//Проверка на правильность кук
    //id;наименование;количество;цена;|
    var strReader=``;

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
        price+=curPrice*parseFloat(obj[item._id]);
        htmlContent+=`<tr> <td> ${item._id} </td> <td> ${getShortName(item.name)} </td> <td> ${obj[item._id]} </td> <td> ${curPrice} руб </td> </tr>`;
        strReader+=`|${item._id};${getShortName(item.name)};${obj[item._id]};${curPrice}`
    });

    var discount=0;
    htmlContent+='</table>';

    if(User!=null&&User.useDiscount){
        htmlContent+=`<h4>Ваша скидка: ${User.discount} % </h4>`
        discount=User.discount;
    }

    htmlContent+=`<p>Итого: ${price-price*discount/100} руб</p>`;


    strZakaz=strReader.substring(1);
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


function getShortName(str) {
    return str.substring(6);
}

function done(err) {
    if (err){
        console.log(err);
    } else {
        console.log(`orderId changed to ${orderId} from ${orderId-1} `);
    }

}

function createPath(path){
    return path.substring(0,path.indexOf('routes'));

}







