const path = require('path');
const fs = require('fs-extra');
const Web3 = require('web3');
const { ethers } = require('ethers');
const Tx = require('ethereumjs-tx').Transaction;

// member1 details
const { tessera, besu, accounts } = require("../keys.js");
const host = besu.rpcnode.url;

async function main() {
  const web3 = new Web3(host);

  const contractJsonPath = path.resolve(__dirname, "Counter.json");
  const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));

  // ABI and Bytecode of the contract

  const privateKey = "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);


  const contractAbi = contractJson.abi;
  const contractBin = contractJson.bytecode;

  const txnCount = await web3.eth.getTransactionCount(account.address);


  const rawTxOptions = {
    nonce: web3.utils.numberToHex(txnCount),
    from: account.address,
    to: null,
    value: "0x00",
    data: '0x' + contractBin.toString('hex'),
    gasPrice: 0,
    gas: 0,
    chainId: "1337"
  };

  const tx = new Tx(rawTxOptions); //hardfork london and berlin not supported only petersburg maybe cancun? not even cancun

  tx.sign(Buffer.from(privateKey.slice(2), 'hex'));

  const serializedTx = tx.serialize();

  console.log(serializedTx)
  

  const pTx = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));





}

if (require.main === module) {
  main();
}

module.exports = exports = main

