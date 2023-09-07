#!/usr/bin/env node
String.prototype.rjust = function(length, char) {
  var append;
  if (char == null) {
    char = " ";
  }
  append = new Array(Math.max(0, length - this.length) + 1).join(char);
  append = append.substr(0, length - this.length);
  return append + this;
};
Number.prototype.rjust = function(length, char) {
  if (char == null) {
    char = " ";
  }
  return this.toString().rjust(length, char);
};


(async function() {
  var fs = require("fs");
  var Arweave = require("arweave");
  var argv = require("minimist")(process.argv.slice(2));
  var arweave = null;
  
  var network = argv["network"];
  var network_host = argv["network-host"];
  var network_port = argv["network-port"];
  var network_protocol = argv["network-protocol"] || "http";
  var wallet_path = argv["wallet-path"] || "./wallet.json";
  function join() {
    if (network) {
      if (network == "arweave.virdpool_testnet") {
        network_host = "65.21.63.64";
        network_port = "2984";
      } else {
        if (!network_host) {
          console.log("missing --network-host for unknown network");
        }
        if (!network_port) {
          console.log("missing --network-port for unknown network");
        }
        if (!network_protocol) {
          console.log("missing --network-protocol for unknown network");
        }
      }
    } else {
      // mainnet
      if (!network_host) {
        network_host = "arweave.net"
        network_port = 443;
        network_protocol = "https";
      }
    }
    arweave = new Arweave({
      host    : network_host,
      port    : network_port,
      protocol: network_protocol,
      network : network
    })
  }
  
  switch(argv._[0]) {
    case "gen":
      if (fs.existsSync(wallet_path)) {
        console.error("wallet already exists");
        process.exit(1);
      }
      join();
      var key = await arweave.wallets.generate();
      var address = await arweave.wallets.jwkToAddress(key);
      key.address = address;
      fs.writeFileSync(wallet_path, JSON.stringify(key, null, 2));
      console.log("done");
      console.log("your address     : "+address);
      console.log("your wallet path : "+wallet_path);
      if (network == "arweave.virdpool_testnet") {
        console.log("For your transaction history and balance you can use https://explorer.ar-test.virdpool.com/#/address/"+address);
      }
      process.exit();
      break;
    
    case "balance":
      if (!fs.existsSync(wallet_path)) {
        console.error("Can't find wallet at : "+wallet_path);
        process.exit(1);
      }
      var key = JSON.parse(fs.readFileSync(wallet_path));
      var address = key.address;
      join();
      var balance = await arweave.wallets.getBalance(address);
      console.log("your balance     : "+arweave.ar.winstonToAr(balance));
      if (network == "arweave.virdpool_testnet") {
        console.log("For your transaction history and balance you can use https://explorer.ar-test.virdpool.com/#/address/"+address);
      }
      process.exit();
      break;
    
    case "send":
      if (argv._.length != 3) {
        console.error("missing arguments");
        console.error("send usage");
        console.error("  send <address> <amount>");
        process.exit(1);
      }
      var target_address = argv._[1];
      var amount = argv._[2];
      
      if (!fs.existsSync(wallet_path)) {
        console.error("Can't find wallet at : "+wallet_path);
        process.exit(1);
      }
      var key = JSON.parse(fs.readFileSync(wallet_path));
      var address = key.address;
      join();
      
      console.log("sending...");
      var transaction = await arweave.createTransaction({
        target  : target_address,
        quantity: arweave.ar.arToWinston(amount)
      }, key);
      await arweave.transactions.sign(transaction, key);
      console.log("txid", transaction.id);
      var balance = await arweave.wallets.getBalance(address);
      var balance_bn = BigInt(balance);
      var spend_bn = BigInt(transaction.quantity) + BigInt(transaction.reward);
      if (balance_bn < spend_bn) {
        console.error("can't transfer more than you have");
        console.error("balance : "+arweave.ar.winstonToAr(balance).rjust(30));
        console.error("");
        console.error("send    : "+arweave.ar.winstonToAr(+transaction.quantity).rjust(30));
        console.error("fee     : "+arweave.ar.winstonToAr(+transaction.reward).rjust(30));
        console.error("total   : "+arweave.ar.winstonToAr(+spend_bn.toString()).rjust(30));
        console.error("");
        console.error("deficit : "+arweave.ar.winstonToAr(+(balance_bn - spend_bn).toString()).rjust(30));
        process.exit(1);
      }
      
      var response = await arweave.transactions.post(transaction);
      if (response.status == 200) {
        console.log("done");
      } else {
        console.log("Status is not 200. Probably something wrong");
      }
      process.exit();
      break;
    
    case "page":
      join();
      require("./page")(argv, arweave);
      break;

    default:
      console.log("usage");
      console.log("  ./wallet.js <command>");
      console.log("  (optional for testnet) --network arweave.virdpool_testnet");
      console.log("  (optional) --network-host      65.21.63.64");
      console.log("  (optional) --network-port      2984");
      console.log("  (optional) --network-protocol  http");
      console.log("  (optional) --wallet-path       ./wallet.json");
      console.log("");
      console.log("sample commands");
      console.log("   ./wallet.js --network arweave.virdpool_testnet gen");
      console.log("   ./wallet.js --network arweave.virdpool_testnet balance");
      console.log("   ./wallet.js --network arweave.virdpool_testnet send <address> <amount>");
      console.log("   ./wallet.js page init");
      console.log("   ./wallet.js page router_publish");
      console.log("   ./wallet.js page version_publish");
      console.log("");
      console.log("NOTE. No password protection of wallet. This is only for demo purposes for arweave.virdpool_testnet");
      break;
  }
})()
