/**
 * Created by wangshouyun on 2016/12/3.
 */
var express = require('express');
var app = express();
var path = require('path');

//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,User-Name,Login-Sign");
    res.header("Access-Control-Allow-Methods", "POST,GET");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "text/html;charset=utf-8");
    next();
});

//静态资源
app.use(express.static(path.join(__dirname, "server/www")));

var server = app.listen(9999, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('topology listening at http://%s:%s', host, port);
});