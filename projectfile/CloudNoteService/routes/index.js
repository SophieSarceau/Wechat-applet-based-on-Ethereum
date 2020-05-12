//导入express模块
var express = require('express');
var router = express.Router();
//导入mysql_connect模块
var Database = require("./mysql_connect");
//创建Database类的实例
var db=new Database();
//定义addNote路由，用于添加笔记
router.get('/addNote', function(req, res, next) {
    //将云笔记内容保存到以太坊网络上，并返回交易地址
    var code=global.database.addNote(req.query.id,req.query.form,req.query.name,req.query.content);
    //将交易地址保存到req中名为code的查询字段中
    req.query['code']=code;
    //将云笔记中除了内容以外的数据保存到MySQL数据库中
    db.addNote(req,res);
});
/*
router.post('/addNote',function (req, res, next) {
    var code = global.database.addNote(req.query.id,req.query.form,req.query.name,req.query.content);
    req.query['code']=code;
    db.addNote(req,res);
})
*/
router.get('/updateNote', function(req, res, next) {
    req.query['code']=global.database.updateNote(req.query.id,req.query.form,req.query.name,req.query.content);
    db.updateNote(req,res);

});
router.get('/getNote', function(req, res, next) {
    res.send({content:global.database.getNote(req.query.id,req.query.form,req.query.name)})
});
router.get('/addImage',function (req,res, next) {
    var code=global.database.addImage(req.query.id,req.query.form,req.query.name,req.query.content);
    req.query['code']=code;
    db.addImage(req,res);
});
router.get('/getImage', function(req, res, next) {
    res.send({content:global.database.getImage(req.query.id,req.query.form,req.query.name)})
});
//定义status路由，用于获取特定交易的状态
router.get('/status', function(req, res, next) {

    //从以太坊网络中获取req.query.hash指定的内容
    var result = global.database.queryTransactionStatus(req.query.hash);
    //交易待处理
    if(result == null)
    {
        res.send({info:2});
    }
    //交易成功
    else if(result == 1){

        res.send({info:1});
    }
    //交易失败
    else
    {
        res.send({info:0});
    }

});
//获取笔记列表
router.get('/getNoteList', function(req, res, next) {
    db.getNoteList(req,res);
});
//获取图片列表
router.get('getImageList',function (req, res, next) {
    db.getImageList(req,res);
})

//导出路由
module.exports = router;


