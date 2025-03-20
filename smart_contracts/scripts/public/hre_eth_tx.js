const path = require('path');
const fs = require('fs-extra');
const { ethers } = require('ethers');
const { Utils } = require("alchemy-sdk")

// member1 details
const { accounts, besu } = require("../keys.js");
const host = besu.rpcnode.url;
// one of the seeded accounts
const accountAPrivateKey = accounts.a.privateKey;

async function main() {
  const provider = new ethers.JsonRpcProvider(host);

  const walletA = new ethers.Wallet(accountAPrivateKey, provider);
  var accountABalance = await provider.getBalance(walletA.address);
  console.log("Account A has balance of: " + accountABalance);

  // create a new account to use to transfer eth to
  const walletB = ethers.Wallet.createRandom()
  var accountBBalance = await provider.getBalance(walletB.address);
  console.log("Account B has balance of: " + accountBBalance);

  const nonce = await provider.getTransactionCount(walletA.address);
  const feeData = await provider.getFeeData();
  const gasLimit = await provider.estimateGas({ from: walletA.address, value: ethers.parseEther("0.01") });

  const contractJsonPath = path.resolve(__dirname, '../../', 'contracts', 'Counter.json');
  const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
  const contractAbi = contractJson.abi;
  const contractBytecode = contractJson.bytecode;


   //console.log(new ethers.Interface(contractAbi));

  const MyContractAbi = new ethers.Interface(contractAbi);
  //const wallet = new ethers.Wallet(accountAPrivateKey, provider);

  //const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);
  const constructorEncodedData = MyContractAbi.encodeDeploy();
  const txData = ethers.hexlify(ethers.toUtf8Bytes(contractBytecode));

  console.log(txData)

 

  new ethers.AbiCoder(contractAbi);
  console.log( ethers.AbiCoder.encode(contractAbi))
  const txn = {
    chainId: 1337,
    value: 0,
    type: 2,
    nonce: nonce,
    from: walletA.address,
    //data: contractAbi.abi(),  //amount of eth to transfer
    gasLimit: 1000000 //max number of gas units the tx is allowed to use
  };



  console.log("create and sign the txn")
  const signedTx = await walletA.sendTransaction(txn);
  await signedTx.wait();
  console.log("tx transactionHash: " + signedTx.hash);
  






  /*
    // send some eth from A to B
    const txn = {
      nonce: nonce,
      from: walletA.address,
      to: walletB.address,
      value: 0x10,  //amount of eth to transfer
      gasPrice: feeData.gasPrice, //ETH per unit of gas
      gasLimit: gasLimit //max number of gas units the tx is allowed to use
    };
  
    console.log("create and sign the txn")
    const signedTx = await walletA.sendTransaction(txn);
    await signedTx.wait();
    console.log("tx transactionHash: " + signedTx.hash);
  
    //After the transaction there should be some ETH transferred
    accountABalance = await provider.getBalance(walletA.address);
    console.log("Account A has balance of: " + accountABalance);
    accountBBalance = await provider.getBalance(walletB.address);
    console.log("Account B has balance of: " + accountBBalance);
  */
}

if (require.main === module) {
  main();
}

module.exports = exports = main

