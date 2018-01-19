function pathToJson() {
    return __dirname+'/Price/last.json';
}

//Эта функция следит за изменениями в last.json. Если изменения были, происходит обновление бд.
//Путь к файлу с выгрузкой(last.json)
var root=pathToJson();
require('./libs/watchFileChange')(root);