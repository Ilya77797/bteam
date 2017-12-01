const mongoose = require('mongoose');
const config = require('../config/default');
const categorShema=new mongoose.Schema({
    name:String,
    subcat:mongoose.Schema.Types.Mixed,
    index:Number
},
);

module.exports = mongoose.model('Categor', categorShema);
