const defer = require('config/defer').deferConfig;
const path = require('path');

module.exports = {
  // secret data can be moved to env variables
  // or a separate config
  secret:   'mysecret',
  mongoose: {
    uri:     'mongodb://Ilya:1234567890QwEr_1@cluster0-shard-00-00-a7qcq.mongodb.net:27017,cluster0-shard-00-01-a7qcq.mongodb.net:27017,cluster0-shard-00-02-a7qcq.mongodb.net:27017/app?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        },
        poolSize:      5

      }
    }
  },
  crypto: {
    hash: {
      length:     128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: 12000
    }
  },
  template: {
    // template.root uses config.root
    root: defer(function(cfg) {
      return path.join(cfg.root, 'templates');
    })
  },
  root:     process.cwd(),
  port: process.env.PORT || 8080,
  emailFrom:'farrukx.val@yandex.ru',
  emailPassword:'123456789qwer',
  emailTo:'farrukx.val@yandex.ru',
    isPending:false
};


