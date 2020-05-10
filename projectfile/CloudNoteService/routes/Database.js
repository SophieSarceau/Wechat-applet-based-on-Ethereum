//导入web3模块
var Web3 = require('web3');
//导入fs模块
var fs = require('fs');
//导入ethereumjs-tx模块*
var Tx = require('ethereumjs-tx');
//导入web3-eth-abi模块
var ethabi = require('web3-eth-abi');

class Database
{
    //在构造方法中完成初始化工作
    constructor() {
        //指定CloudNoteService合约的部署地址
        this.contractAddress = '0x56f3273e0845B2015b416F08dc842c2dDeA234E4';
        //指定gas price 价格为1GWei
        this.gasPrice = '0x2540BE400';
        //创建Web3对象
        //测试节点的URL
        this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/77898fb27f5c4a639c39294c71ebab11"));
        //读取abi文件的内容，并转化为JSON对象
        this.abi = JSON.parse(fs.readFileSync("./CloudNoteService_sol_CloudNoteService.abi").toString());
        //创建与CloudNoteService合约绑定的contract实例
        this.contract = this.web3.eth.contract(this.abi).at(this.contractAddress);
    }
    //获得当前账户以及发布的交易数
    getNonce()
    {
        //getTransactionCount函数的参数值就是用于调用CloudNoteService合约函数的以太坊账户
        var nonce = this.web3.eth.getTransactionCount("0x9C0260920F02e21A416573A8681CB52D21883CC9");
        return nonce;
    }
    //添加或更新笔记，id：用户ID；form:种类；name：笔记名称；content：内容
    //notefun：描述CloudNoteService合约中函数的十六进制数据
    addUpdateNote(id, form, name, content, notefun) {
        var estimateGas = this.web3.eth.estimateGas({
            to: this.contractAddress,
            data: notefun
        });
        //将gas预估值转换为十六进制格式
        estimateGas = this.web3.toHex(estimateGas);
        //获取当前交易的nonce值
        var nonce = global.getNextNonce();
        //定义交易对象
        var rawTx = {
            nonce: nonce,
            gasPrice: this.gasPrice,
            gasLimit: estimateGas,
            to: this.contractAddress,
            value: '0x00',
            data: notefun
        }
        //创建Tx对象风险rawTx对象
        var tx = new Tx(rawTx);
        //设置账户的私钥
        const privateKey = new Buffer.from('45BB6EA301C656107AD5C60AA7159E7EEB6E8A458D086179B934663386ECDE9A', 'hex');
        //用账户的私钥对rawTx中的数据签名
        tx.sign(privateKey);
        //将签名序列化
        var serializedTx = tx.serialize();
        //发送经过签名后的交易数据
        return this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
    }

    //添加笔记
    addNote(id, form, name, content)
    {
        //获取描述CloudNoteService合约中addNote函数的十六进制数据
        var addNote = this.contract.addNote.getData(id, form, name, content);
        //调用addUpdateNote方法添加笔记
        return this.addUpdateNote(id, form, name, content, addNote);
    }
    //更新笔记
    updateNote(id, form, name, content)
    {
        var updateNote = this.contract.updateNote.getData(id, form, name, content);
        return this.addUpdateNote(id,form,name,content,updateNote);
    }
    //根据用户ID，form和笔记名称获得笔记内容
    getNote(id, form, name)
    {
        //获取描述CloudNoteService合约中getNote函数的十六进制数据
        var getNote = this.contract.getNote.getData(id,form,name);
        //通过web3.eth.call函数调用CloudNoteService合约中的getNote函数
        var result = this.web3.eth.call({
            to: this.contractAddress,
            data: getNote
        });
        return  ethabi.decodeParameter('string',result);
    }
    //添加图片
    addImage(id, form, name, content)
    {
        //获取描述CloudNoteService合约中addNote函数的十六进制数据
        var addImage = this.contract.addImage.getData(id, form, name, content);
        //调用addUpdateNote方法添加笔记
        return this.addUpdateNote(id, form, name, content, addImage);
    }
    //获取图片
    getImage(id, form, name)
    {
        var getImage = this.contract.getImage.getData(id,form,name);
        var result = this.web3.eth.call({
            to: this.contractAddress,
            data: getImage
        });
        return  ethabi.decodeParameter('string',result);
    }

    //返回交易状态，1：成功；0：失败
    queryTransactionStatus(hash)
    {
        var result = this.web3.eth.getTransactionReceipt(hash);
        if(result != null)
        {
            return parseInt(result.status,16);
        }
        return null;

    }
}

//导出Datebase类，否则其他JavaScript文件无法使用Datebase类
module.exports = Database;
