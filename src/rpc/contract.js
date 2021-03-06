const pb = require('./transaction_pb');
const Transaction = require('../transaction/index');

async function deployContract(contract) {
    const cli = this;

    let td = new pb.TransactionData();
    td.setType(pb.TransactionData.Type.INVOKE);
    td.setVmType(pb.TransactionData.VMType.XVM);
    td.setPayload(contract);

    let tx = new Transaction();
    tx.from = cli.address;
    tx.data = td;
    await tx.sign(cli.privateKey);
    tx.data = td.toObject();

    let receipt = await cli.SendTransactionWithReceipt(tx);
    return b64DecodeUnicode(receipt.ret);
}

async function invokeContract(vmType, address, method, ...args) {
    const cli = this;

    let ip = new pb.InvokePayload();
    ip.setMethod(method);
    ip.setArgsList(args);

    let payload = ip.serializeBinary();
    let td = new pb.TransactionData();
    td.setType(pb.TransactionData.Type.INVOKE);
    td.setVmType(vmType);
    td.setPayload(payload);

    let tx = new Transaction();
    tx.from = cli.address;
    tx.to = address;
    tx.data = td;
    await tx.sign(cli.privateKey);
    tx.data = td.toObject();

    let receipt = await cli.SendTransactionWithReceipt(tx);
    if (receipt.ret) {
        let buffer = Buffer.from(receipt.ret, 'base64');
        return buffer.toString();
    }
    return '';
}

// Decode from base64 and Convert from utf8 to utf-16
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// Turns Base64-encoded Ascii Data Back to Binary
function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}

module.exports = {
    deployContract,
    invokeContract
};