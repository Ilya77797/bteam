const mongoose = require('mongoose');

const infoShema=new mongoose.Schema({
        _id:{
            type:Number
        },
        orderId:{
            type:Number
        }
    },
    {}
);

module.exports = mongoose.model('Info', infoShema);