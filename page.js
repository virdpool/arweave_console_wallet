var fs = require("fs");
async function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

module.exports = async function(argv, arweave) {
  var page_name = argv._[2];
  if (!page_name) {
    console.log("usage");
    console.log("   ./wallet.js page <command> <page_name>");
    console.log("page_name will be your folder");
    return;
  }
  
  var wallet_path = argv["wallet-path"] || "./wallet.json";
  if (!fs.existsSync(wallet_path)) {
    console.log("no wallet for page bind");
    return;
  }
  var key = JSON.parse(fs.readFileSync(wallet_path));
  
  
  async function publish_html(read_file, pub_type) {
    if (!fs.existsSync(read_file)) {
      console.log(`router file ${read_file} not exists`);
      return;
    }
    
    // TODO check and show diff between last published version and current
    // add option -y to ignore that diff check
    
    let transaction = await arweave.createTransaction({
      data: fs.readFileSync(read_file, "utf-8"),
    }, key);
    
    var version = "";
    try {
      version = fs.readFileSync(__dirname+"/package.json")
    } catch(err) {
      console.log("can't detect version reason:"+err.message);
    }
    
    transaction.addTag("Client", "Virdpool console wallet");
    if (version) {
      transaction.addTag("Version", version);
    }
    transaction.addTag("Content-Type", "text/html");
    transaction.addTag("Pub-Type", pub_type);
    
    await arweave.transactions.sign(transaction, key);
    
    var txid = transaction.id;
    var url = "https://arweave.net/"+txid;
    console.log("txid: "+txid);
    console.log("upload started");
    
    // N.B. The above code has been simplified and ignores potential errors.
    // TODO store transaction for complete/re-cast in future
    let uploader = await arweave.transactions.getUploader(transaction);
    
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }
    console.log("Upload completed");
    console.log("You can inspect your page directly at "+url);
    if (pub_type === "page") {
      console.log("NOTE. Page version will be not available unless tx is confirmed");
    }
    console.log("Poll for tx status...");
    while(true) {
      await delay(10000);
      try {
        var res = await arweave.transactions.getStatus(txid);
        if (res.confirmed) {
          console.log("confirmed", res.confirmed);
          break;
        }
        console.log("unconfirmed");
      } catch(err) {
        console.log("error during pool for status (you can ignore it)", err.message);
      }
    }
    console.log("Poll complete. Tx seems published");
    console.log("You can inspect your page directly at "+url);
  }
  
  switch (argv._[1]) {
    case "init":
      if (fs.existsSync(page_name)) {
        console.log("page folder already exists");
        return;
      }
      fs.mkdirSync(page_name);
      var wallet = key.address || await arweave.wallets.jwkToAddress(key);
      
      function page_process(path) {
        var cont = fs.readFileSync("do_not_change/asset/"+path, "utf-8");
        cont = cont.split("%%title%%").join(page_name);
        cont = cont.split("%%wallet%%").join(JSON.stringify(wallet));
        
        var write_file = page_name+"/"+path;
        fs.writeFileSync(write_file, cont);
        console.log(write_file+" created");
      }
      
      page_process("router.html");
      page_process("page.html");
      return;
    
    case "router_publish":
      var read_file = page_name+"/router.html";
      await publish_html(read_file, "router");
      return;
    
    case "version_publish":
      var read_file = page_name+"/page.html";
      await publish_html(read_file, "page");
      return;
    
    default:
      console.log("usage");
      console.log("  ./wallet.js page init <page_name>              initialize asset folder");
      console.log("  ./wallet.js page router_publish <page_name>    publish new router");
      console.log("  ./wallet.js page version_publish <page_name>   publish new page version");
      return;
  }
}
