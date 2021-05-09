# Arweave console wallet (with testnet support)

## Install requirements
nodejs and yarn

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
    source ~/.bashrc
    nvm i 14
    npm i -g yarn

## Install

    git clone https://github.com/virdpool/arweave_console_wallet
    cd arweave_console_wallet
    yarn

## Usage

    ./wallet.js
    usage
      ./wallet.js <command>
      (optional for testnet) --network arweave.virdpool_testnet
      (optional) --network-host      65.21.63.64
      (optional) --network-port      2984
      (optional) --network-protocol  http
      (optional) --wallet-path       ./wallet.json
    
    sample commands
       ./wallet.js --network arweave.virdpool_testnet gen
       ./wallet.js --network arweave.virdpool_testnet balance
       ./wallet.js --network arweave.virdpool_testnet send <address> <amount>
    
    NOTE. No password protection of wallet. This is only for demo purposes for arweave.virdpool_testnet
