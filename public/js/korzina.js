window.addEventListener('DOMContentLoaded', function() {
    var wasTriggered=false;// Был ли запрос за настройками на сервер
    getOrderedProducts();
    addEvents();
    $("#phone").mask("8(999) 999-9999");

    function getOrderedProducts() {
        var flag=false;
        var massCookies=getCookie('orderId');
        if(massCookies==undefined||massCookies.length==0)
        {

            renderNoProducts();
            return

        }
        var res=getOrderProfuctsWithAmount(massCookies);

        let req={
            data:res[0]
        };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/corzina', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(req));
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;

            if (xhr.status == 200) {
                var ul=document.getElementById('PR');
                ul.classList.add('awaitSearch');

                renderData(JSON.parse(xhr.response), res[1]);


            }


        }
    }

    function getOrderProfuctsWithAmount(mass){

        var obj={};
        mass=mass.split(';').map((item)=>{
           let m=item.split('-');
           obj[m[0]]=m[1];
           return m[0]
        });

        return [mass,obj]


    }

    function renderNoProducts() {
        var ul=document.getElementById('PR');
        ul.classList.remove('awaitSearch');
        var li=document.createElement('li');
        li.textContent='У вас пока нет товаров в корзине';
        li.style.textAlign = "center";
        ul.appendChild(li);
    }

    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function renderData(mass, res) {

        var ul=document.getElementById('PR');
        ul.classList.remove('awaitSearch');
        var products=mass.Products;
        var login=mass.login;
        if(login)
            var User=mass.User;
        var promise=new Promise((resolve, reject)=>{
            resolve();
        })
            .then(()=>{
                clear('PR');
            })
            .then(()=>{
            var a=0;
                if(products==undefined)
                {
                    var li=document.createElement('li');
                    li.textContent='У вас пока нет товаров в корзине';
                    li.style.textAlign = "center";
                    ul.appendChild(li);

                }

                var div=document.createElement('div');
                div.classList.add('ZakazItogForAll');
                var span=document.createElement('span');
                span.textContent='Сумма закакза: 0 руб';
                span.setAttribute('id','ZakazItogForAllPrice');
                var a=document.createElement('a');
                a.setAttribute('id','showOrderForm');
                a.textContent='Оформить заказ';
                a.setAttribute('href','#');
                a.addEventListener('click',Order);
                div.appendChild(span);

                div.appendChild(a);

                products.forEach((item)=>{
                    var li=createElements(item, login, User);
                    ul.appendChild(li);
                });
                document.getElementsByClassName('topMenu')[0].appendChild(div);
                //ul.parentNode.insertBefore(div,ul);


            }).then(()=>{
            if(res==undefined)
                return

                    var inputs=Array.from(document.getElementsByTagName('input')).filter((item)=>{
                        return item.id.includes('inputZ')
                    });

                var discount=0;

                    if(User==undefined){
                        var useSPPrice=false;
                    }
                    else {
                        var useSPPrice=User.show;
                        if(User.useDiscount)
                            discount=User.discount;

                    }




                    inputs.forEach((item)=>{
                        let id=item.id.substring(item.id.indexOf('Z')+1);
                        var price=0;
                        if(!useSPPrice){
                            try {
                                price=parseFloat(document.getElementById(`BO${id}`).textContent);
                            }
                            catch (err){

                            }

                        }
                        else{
                            try {
                                price=parseFloat(document.getElementById(`BSP${id}`).textContent);
                            }
                            catch (err){
                                price=parseFloat(document.getElementById(`BO${id}`).textContent);
                            }

                        }

                        item.value=res[id];
                        document.getElementById(`PriceTotal${id}`).textContent=` ${Math.round((res[id]*price-res[id]*price*discount/100)*1000)/1000} `;
                    });

                    calculateAll();

            });




    }

    function createElements(item, login, User) {
        var addSpan=false;
        var li=document.createElement('li') //0
        li.classList.add('product-wrapper');


        var a=document.createElement('a');//1
        a.classList.add('product');



        var divPrM=document.createElement('div');//2
        divPrM.classList.add('product-main');

        var divPrP=document.createElement('div');
        divPrP.classList.add('product-photo');//3

        var img=document.createElement('img');//4
        img.setAttribute('src',item.icon);

        var divPrPr=document.createElement('div');//4
        divPrPr.classList.add('product-preview');


        var divPrT=document.createElement('div');//3
        divPrT.classList.add('product-text');

        var divPrN=document.createElement('div');//4
        divPrN.classList.add('product-name');

        var amount=document.createElement('span');
        amount.innerText=`На складе: ${item.amount}`;


        if(item.info!='null')
        {
            var productNAmeA=document.createElement('a');
            productNAmeA.setAttribute('href',item.info);
            productNAmeA.textContent=item.name;
            divPrN.appendChild(productNAmeA);
        }
        else{//Вывод текстового описания
            divPrN.textContent=item.name;
            if(item.textDescription!=''){
                var spanDescription=document.createElement('span');
                spanDescription.classList.add('textDescription');
                spanDescription.textContent=item.textDescription;

                divPrP.appendChild(spanDescription);
                img.style.opacity="0.3";



            }

        }


        var divPrDetailsWrap=document.createElement('div');//2
        divPrDetailsWrap.classList.add('product-details-wrap');

        var divPrDetails=document.createElement('div');//3
        divPrDetails.classList.add('product-details');

        var inputZakaz=document.createElement('input');
        inputZakaz.setAttribute('placeholder',`${item.minOrder} ${item.measure}`);
        inputZakaz.setAttribute('id',`inputZ${item._id}`);
        var buttonP=document.createElement('button');
        buttonP.textContent='+';
        var buttonM=document.createElement('button');
        buttonM.textContent='-';
        var spanTotal=document.createElement('span');
        spanTotal.classList.add('spanTotalPrice');
        var zakazContainer=document.createElement('div');
        zakazContainer.classList.add('zakazContainer');

        var small=document.createElement('small');
        small.textContent='руб';
        var b1=document.createElement('b');
        b1.textContent='Итого: ';
        var b=document.createElement('b');
        b.textContent='0';
        b.setAttribute('id',`PriceTotal${item._id}`);
        b.classList.add('PriceTotal'); //Для обновления общей цены
        spanTotal.appendChild(b1);
        spanTotal.appendChild(b);
        spanTotal.appendChild(small);

        var aDelete=document.createElement('a');
        aDelete.classList.add('aDelFromKorzina');
        aDelete.setAttribute('data-info',item._id);
        a.setAttribute('href','#');
        aDelete.textContent='Удалить';

        var divPrAvail=document.createElement('div');//4
        divPrAvail.classList.add('product-availability');

        var spanIcon=document.createElement('span');//5
        spanIcon.classList.add('icon');
        spanIcon.classList.add('icon-check');


        var imgIcon=document.createElement('img');
        if(item.status[2]=='1'){
            imgIcon.setAttribute('src','images/comingSoon.png');//Ожидается
            spanIcon.textContent='Ожидается';
        }
        else if(item.status[0]=='1'){
            imgIcon.setAttribute('src','images/New.png');//Новинка
            spanIcon.textContent='Новинка';
        }
        else if(item.status[1]=='1'){
            imgIcon.setAttribute('src','images/onSale.png');//Акция
            spanIcon.textContent='Акция';
        }
        else {
            imgIcon.setAttribute('src','images/inOrder.png');//Акция
            spanIcon.textContent='В наличие';
        }
        /* switch(item.status){
         case 'Акция!': imgIcon.setAttribute('src','images/onSale.png');
         break;
         case 'В наличии': imgIcon.setAttribute('src','images/inOrder.png');
         break;
         case 'Ожидается': imgIcon.setAttribute('src','images/comingSoon.png');
         break
         case 'Новинка':imgIcon.setAttribute('src','images/New.png');
         break;
         }*/
        imgIcon.classList.add('iconAvail');

        var spanPrPrice=document.createElement('span');//4
        spanPrPrice.classList.add('product-price');
        spanPrPrice.textContent='';

        var spanPrPrice2=document.createElement('span');//4
        spanPrPrice2.classList.add('product-price');
        spanPrPrice2.classList.add('fix');//Чтобы b, small=float:left только в корзине

        var spanPriceInclude=document.createElement('span');
        spanPriceInclude.appendChild(spanPrPrice);
        spanPriceInclude.classList.add('fix');


        if(login) {
           // var small1 = document.createElement('small');//5
            if(User.useDiscount==true){
                item.discount=User.discount

            }

            if (item.status[2] != '1') {


                if (User.price.length == 0||User.show==false||User.curPrice=='0') {
                    var b1 = document.createElement('b');//5
                    b1.textContent = item.price;
                    b1.setAttribute('id',`BO${item._id}`);

                    var small1 = document.createElement('small');//5
                    small1.textContent = 'руб';
                    spanPrPrice.appendChild(b1);
                    spanPrPrice.appendChild(small1);

                 /*   if(User.show==false&&User.curPrice!='0'&&User.price.length != 0){
                        var b2 = document.createElement('b');//5
                        b2.setAttribute('id',`BSP${item._id}`)
                        b2.textContent = item[`specialPrice${User.curPrice}`];
                        b2.style.display='none';
                        spanPrPrice.appendChild(b2);
                    }*/



                }
                else if(User.show==true) {
                    var b1 = document.createElement('b');//5
                    spanPrPrice.classList.add('crossedPrice');
                    b1.textContent = item.price;
                    b1.setAttribute('id',`BO${item._id}`);

                    var small1 = document.createElement('small');//5
                    small1.textContent = 'руб';
                    spanPrPrice.appendChild(b1);
                    spanPrPrice.appendChild(small1);


                    var b2 = document.createElement('b');//5
                    b2.setAttribute('id',`BSP${item._id}`)
                    b2.textContent = item[`specialPrice${User.curPrice}`];

                    var small2 = document.createElement('small');//5
                    small2.textContent = 'руб';
                    spanPrPrice2.appendChild(b2);
                    spanPrPrice2.appendChild(small2);

                    spanPriceInclude.appendChild(spanPrPrice2);
                    spanPriceInclude.classList.add('twoPrices');

                }

            }
            else{
                var b1 = document.createElement('b');
                b1.innerHTML='&nbsp';
                spanPrPrice.appendChild(b1);
            }

        }
        else {
            var b1=document.createElement('b');//5
            var small1=document.createElement('small');//5
            if(item.status[2] != '1'){
                b1.textContent=item.price;
                b1.setAttribute('id',`BO${item._id}`);
                small1.textContent='руб';
            }
            else {
                b1.innerHTML='&nbsp';
                small1.textContent=' ';
            }

            spanPrPrice.appendChild(b1);
            spanPrPrice.appendChild(small1);
        }




        /*appending*/
        li.appendChild(a);
        a.appendChild(divPrM);
        a.appendChild(aDelete);
        divPrM.appendChild(divPrP);

        divPrP.appendChild(img);
        if(item.status!='Ожидается') {
            divPrP.appendChild(divPrPr);
        }

        divPrT.appendChild(divPrN);
        divPrT.appendChild(amount);
        //divPrDetails.appendChild(divPrT);


        a.appendChild(divPrT);
        a.appendChild(divPrAvail);
        a.appendChild(spanPriceInclude);
        zakazContainer.appendChild(buttonM);
        zakazContainer.appendChild(inputZakaz);
        zakazContainer.appendChild(buttonP);
        a.appendChild(zakazContainer);
        a.appendChild(spanTotal);


        //a.appendChild(divPrDetailsWrap);
        //divPrDetailsWrap.appendChild(divPrDetails);
        //divPrDetails.appendChild(divPrAvail);
        divPrAvail.appendChild(imgIcon);
        divPrAvail.appendChild(spanIcon);
        //divPrDetails.appendChild(spanPrPrice);
        //divPrDetails.appendChild(buttonM);
        //divPrDetails.appendChild(inputZakaz);
        //divPrDetails.appendChild(buttonP);
        //divPrDetails.appendChild(spanTotal);





        /*a.appendChild(divPrButWrap);
         divPrButWrap.appendChild(divButtons);
         divButtons.appendChild(spanToCart);
         spanToCart.appendChild(spanIconTocart);*/

        //Events for buttons
        buttonM.addEventListener('click', decrementAmount.bind(item) );

        buttonP.addEventListener('click', incrementAmount.bind(item));

        inputZakaz.addEventListener('ch', changeZakaz.bind(item));

        inputZakaz.addEventListener('keyup', checkKey.bind(item));


        return li;
    }

    function clear(id) {
        var element = document.getElementById(id);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }



    function addEvents() {
        //settings
        document.getElementsByClassName('loginForm')[0].addEventListener('click',changeSettings );

        document.getElementById('PR').addEventListener('click', deleteFromKorzina);
        document.getElementById('PR').addEventListener('change', recalculate);
        document.getElementById('OrderForm').addEventListener('submit', checkout);

        //backToProducts
        document.getElementsByClassName('backToProduct')[0].addEventListener('click', function (e) {
            recalculatePriceCookie();
        });

        document.getElementsByClassName('loginForm')[0].addEventListener('submit',clearAllCookies );

    }
    function checkout(e) {
        var form=document.forms.checkout;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/checkout', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        var data={
            name:form.name.value,
            email:form.emailaddress.value,
            phone:form.phone.value,
            comment:form.subject.value,
            order:getCookie('orderId')
        };
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;

            if (xhr.status == 200) {
                renderCat(JSON.parse(xhr.response));
            }


        }
    }
    function deleteFromKorzina(e) {
        e.preventDefault();
        if(e.target.classList.contains('aDelFromKorzina')){
            e.target.parentNode.parentNode.remove();
            setOrderCookie();

            recalculatePriceCookie();

            /*let id=e.target.dataset.info;
            var mass=getCookie('itemsID').split(';');
            var index = mass.indexOf(id);
            if (index >= 0) {
                mass.splice( index, 1 );
                setCookie('itemsID',mass.join(';'));
                e.target.parentNode.parentNode.remove();
                setOrderCookie();

            }
            if(mass.length==0){
                renderNoProducts();
                document.getElementsByClassName('ZakazItogForAll')[0].remove();
                setOrderCookie();
            }*/




        }
    }

    function recalculate (e) {
        if(e.target.id.includes('select')){
            var input=document.getElementById(`inputZ${e.target.id.substring(e.target.id.indexOf('t')+1)}`);
            var event = new Event('ch');
            input.dispatchEvent(event);

        }
    }

    function setCookie(name, value, options) {//Установка кук
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function calculateAll() {
        var span=document.getElementById('ZakazItogForAllPrice');
        var price=0;
        var massPrice=document.querySelectorAll('.PriceTotal');
        massPrice.forEach((item)=>{
            try {
                price+=parseFloat(item.textContent);
            }
            catch (e){

            }

        });
        price = Math.round(price * 1000) / 1000;

        span.textContent=`Сумма заказа: ${price} руб`;
        return price;

    }

    function Order(e) {
        var form=document.getElementsByClassName('formOrder')[0];
        var ul=document.getElementById('PR');
        var content=document.getElementById('content');
        var a=document.getElementById('showOrderForm');
        if(!isEverythingFilled())
            return

        if(ul.style.display=='none')
            a.textContent='Оформить заказ';
        else{
            a.textContent='Назад в корзину';
            setOrderCookie();
            recalculatePriceCookie();
        }

        $(ul).slideToggle(300);
        $(form).slideToggle(300);
        document.body.style.overflowY='scroll';
        //$('html, body').animate({ scrollTop: form[0].offsetTop}, 500);

    }

    function setOrderCookie() {
        var inputs=Array.from(document.getElementsByTagName('input')).filter((item)=>{
            return item.id.includes('inputZ')
        });
        var a=0;
        var cookie='';
        inputs.forEach((item)=>{
            if(item.value=='')
                var value='0'
            else
                var value=item.value
            cookie=cookie+`;${item.id.substring(item.id.indexOf('Z')+1)}-${value}`;
        });
        cookie=cookie.substring(1);
        setCookie('orderId', cookie);

    }


    function isEverythingFilled() {
        var flag=true;
        var pos=null;
        var inputs=Array.from(document.getElementsByTagName('input')).filter((item)=>{
            return item.id.includes('inputZ')
        });
        inputs.forEach((item, i)=>{
            if(item.value==''||checkInput(item,{minOrder:1})==null||item.value=='0'){
                flag=false;
                item.classList.add('inputErr');
                item.value='Заполните это поле!';
                pos=i;
            }
            else if(item.value!='Заполните это поле!'){
                try{
                    item.classList.remove('inputErr');
                }
                catch (e){

                }
            }

        });

        if(flag)
            return true

        $('html, body').animate({
            scrollTop: pos*inputs[pos].parentNode.parentNode.offsetHeight
        }, 500);

        return false
    }

    function setCookie(name, value, options) {//Установка кук
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function changeZakaz(e) {
        var price=0;
        try{
            let BSP=document.getElementById(`BSP${this._id}`);
             price=parseFloat(BSP.textContent);
        }
        catch (err){
            let BO=document.getElementById(`BO${this._id}`);
             price=parseFloat(BO.textContent);
        }


        var select=document.getElementById(`select${this._id}`);
        var discount=0;
        try {
            if(this.discount!==undefined)
                discount=parseFloat(this.discount);
        }
        catch (e){

        }


        var value=checkInput(e.target, this);
        if(value==null)
            return;

        if(value<this.minOrder){
            var totalPrice=document.getElementById(`PriceTotal${this._id}`);
            totalPrice.textContent='0';
            calculateAll();
            return;
        }
        else
            e.target.value=value;


        var totalPrice=document.getElementById(`PriceTotal${this._id}`);
        totalPrice.textContent=` ${Math.round((value*price-value*price*discount/100)*1000)/1000} `;
        calculateAll();


    }

    function incrementAmount (e) {
        e.preventDefault();
        let input=document.getElementById(`inputZ${this._id}`);
        if(input.value==''){
            input.value=this.minOrder;
            var event = new Event('ch');
            input.dispatchEvent(event);
            return
        }


        var value=checkInput(input,this);
        if(value==null)
            return;



        input.value=value+parseInt(this.minOrder);
        var event = new Event('ch');

        input.dispatchEvent(event);




    }

    function decrementAmount(e) {
        e.preventDefault();
        let input=document.getElementById(`inputZ${this._id}`);
        if(input.value==''){
            input.value=this.minOrder;

        }



        var value=checkInput(input,this);
        if(value==null)
            return;



        if(value>this.minOrder&&value-this.minOrder>0){
            input.value=value-this.minOrder;
            var event = new Event('ch');
            input.dispatchEvent(event);
        }

        else{
            var totalPrice=document.getElementById(`PriceTotal${this._id}`);
            totalPrice.textContent='0';
            input.value='0';
            alert(`Минимальный заказ для этого товара: ${this.minOrder}`);
            calculateAll();
        }



    }

    function checkKey(e) {
        var ip=document.getElementById(`inputZ${this._id}`);
        if(e.keyCode==8&&ip.value==""){
            var totalPrice=document.getElementById(`PriceTotal${this._id}`);
            totalPrice.textContent='0';
            calculateAll();
            return
        }
        else {
            var event = new Event('ch');

            ip.dispatchEvent(event);
        }

    }

    function checkInput(input, item) {
        var value=parseInt(input.value);

        if(isNaN(value)){
            input.value=item.minOrder;
            alert('Введите целое число');
            calculateAll();
            return null
        }
        var ost=value % item.minOrder;
        if(ost ==0)
            return value;
        else
            return value-ost-(-item.minOrder)

    }



    function calculateEachTptalPrice() {

    }

    function changeSettings(e) {
        var a=e.target;
        if(a.nodeName=='A'&&a.textContent=='Настройки'){
            if(!wasTriggered){
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/userSettings', true);
                xhr.send('');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;

                    if (xhr.status == 200) {
                        var USER=JSON.parse(xhr.response);

                        try{
                            var a=document.getElementById('check').textContent;
                        }
                        catch (e){
                            var divChange= document.getElementById('Change');
                            var loginForm=document.getElementById('loginForm');
                            var checkBox=document.createElement('input');
                            checkBox.setAttribute('type','checkbox');
                            checkBox.setAttribute('id','check');
                            if(!USER.show)
                                checkBox.setAttribute('checked', 'true');
                            var label=document.createElement('label');
                            label.setAttribute('for','check');
                            label.textContent='Скрыть Вашу цену';

                            var div=document.createElement('div');
                            div.style.display='inline';
                            div.appendChild(checkBox);
                            div.appendChild(label);

                            if(USER.discount!="0.0"){
                                var checkDiscount=document.createElement('input');
                                checkDiscount.setAttribute('type','checkbox');
                                checkDiscount.setAttribute('id','checkDiscount');

                                var labelDisc=document.createElement('label');
                                labelDisc.setAttribute('for','checkDiscount');
                                labelDisc.textContent=`Применить скидку в ${USER.discount}%`;

                                if(USER.useDiscount){
                                    checkDiscount.setAttribute('checked', 'true');
                                }

                                div.appendChild(checkDiscount);
                                div.appendChild(labelDisc);

                            }

                            var select=document.createElement('select');
                            select.setAttribute('id','selectPrice');
                            divChange.insertBefore(select, divChange.firstChild);
                            divChange.insertBefore(div,divChange.firstChild.nextSibling);
                            var opt=document.createElement('option');
                            opt.textContent='0';
                            select.appendChild(opt);
                            USER.price.forEach((item)=>{
                                var opt=document.createElement('option');
                                opt.textContent=`${item}`;
                                if(item==USER.curPrice){
                                    opt.setAttribute('selected', 'true');
                                }
                                select.appendChild(opt);
                            });
                        }
                        var divChange= document.getElementById('Change');
                        var loginForm=document.getElementById('loginForm');
                        $(loginForm).slideToggle(300);
                        $(divChange).slideToggle(300);
                        wasTriggered=true;

                    }
                }
            }
            else {
                var divChange= document.getElementById('Change');
                var loginForm=document.getElementById('loginForm');
                $(loginForm).slideToggle(300);
                $(divChange).slideToggle(300);

            }

        }
        else if(a.nodeName=='A'&&a.textContent=='Сохранить'){
            var form=document.getElementById('Change');
            var selectedPrice=document.getElementById('selectPrice').options[document.getElementById('selectPrice').selectedIndex].value;
            var check1=document.getElementById('check').checked;
            try{
                var check2=document.getElementById('checkDiscount').checked;
            }
            catch (err){
                var check2=false;
            }
            var req={
                curPrice:selectedPrice,
                showSP_Price:!check1,
                useDiscount:check2
            };

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/userSettings', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(req));
            a.textContent='Сохранение...'
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4) return;

                if (xhr.status == 200) {
                    var divChange= document.getElementById('Change');
                    var loginForm=document.getElementById('loginForm');
                    $(loginForm).slideToggle(300);
                    $(divChange).slideToggle(300);
                    a.textContent='Сохранить';
                    let obj=JSON.parse(xhr.response);
                    if(obj.done)
                        location.reload();

                }


            }



        }

    }
    function recalculatePriceCookie() {
        try{
            var Price=calculateAll();
        }
        catch (err){
            var Price=0;
        }
        setCookie('Price',Price);

    }

    function clearAllCookies() {
        setCookie('Price','');
        setCookie('orderId','');
    }





});





/*
 item.discount=User.discount;
 var small = document.createElement('small');//5
 if (item.status[2] != '1') {

 var select = document.createElement('select');
 select.setAttribute('id',`select${item._id}`);
 spanPrPrice.classList.add('selectPrice');
 if(User.price.length==0){
 var b=document.createElement('b');//5
 b.setAttribute('id',`BPRICE${item._id}`);
 b.textContent=item.price;

 var small=document.createElement('small');//5
 small.textContent='руб';
 spanPrPrice.appendChild(b);
 spanPrPrice.appendChild(small);

 }
 else {
 var option = document.createElement('option');
 option.textContent="Выберете цену";
 option.disabled=true;
 select.appendChild(option);
 User.price.forEach((price, i) => {
 var option = document.createElement('option');
 var priceName = `specialPrice${i+1}`;
 option.textContent = item[priceName];
 select.appendChild(option);
 });
 spanPrPrice.appendChild(select);
 }

 }
 else{
 small.innerHTML="<br> <br>";
 spanPrPrice.appendChild(small);
 }

 }
 else{
 var b=document.createElement('b');//5
 b.setAttribute('id',`BPRICE${item._id}`);
 b.textContent=item.price;

 var small=document.createElement('small');//5
 small.textContent='руб';
 spanPrPrice.appendChild(b);
 spanPrPrice.appendChild(small);
*/

/*
if(login){
    var discount=document.createElement('span');
    discount.textContent=`Ваша персональная скидка: ${User.discount} %`;
    discount.setAttribute('data-disc',User.discount);
    discount.setAttribute('id','DISCOUNT');
    discount.style.display="block";
    div.appendChild(discount);
}
*/

