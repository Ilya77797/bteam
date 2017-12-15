const mongoose = require('mongoose');
const crypto = require('crypto');
const sha256=require('sha256');
const _ = require('lodash');
const config = require('../config/default');

const userSchema = new mongoose.Schema({
  displayName:   {
    type:     String,
    required: "Имя пользователя отсутствует."
  },
  role: {
    type: String,
  },
  username:         {
    type:     String,
    unique:   true,
    required: "Поле не может быть пустым.",

  },
  visiblePrice:{
    type: Array,
  } ,

    discount:{
      type:String,
    },

    curPrice:{
    type:String,
    },

    showSP_Price:{
    type:Boolean
    },
    useDiscount:{
    type:Boolean
    },

  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    required: true,
    type: String
  }
}, {
  timestamps: true
});

// const user = new User({password: 123})
// user.password; // 123

// const user = await User.findOne({});

userSchema.virtual('password')
  .set(function(password) {

    if (password !== undefined) {
      if (password.length < 4) {
        this.invalidate('password', 'Пароль должен быть минимум 4 символа.');
      }
    }

    this._plainPassword = password;

    if (password) {
      this.salt = crypto.randomBytes(config.crypto.hash.length).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(
        password,
        this.salt,
        config.crypto.hash.iterations,
        config.crypto.hash.length,
        'sha256'
      ).toString('base64');
    } else {
      // remove password (unable to login w/ password any more, but can use providers)
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password) {
  if (!password) return false; // empty password means no login by password
  if (!this.passwordHash) return false; // this user does not have password (the line below would hang!)
  // bcrypt.compare(password, this.passwordHash) // sync?
    //var ph256=sha256(password);
    const passwordHash = crypto.pbkdf2Sync(
    password,
    this.salt,
    config.crypto.hash.iterations,
    config.crypto.hash.length,
    'sha256'
  ).toString('base64');

  return passwordHash === this.passwordHash;

};

userSchema.methods.getPublicFields = function() {
  return {
    username: this.username,
    displayName: this.displayName
  };

};

userSchema.methods.getId=function () {
    return this._id;
}

module.exports = mongoose.model('User', userSchema);
