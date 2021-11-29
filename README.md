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
       ./wallet.js page init <page_name>
       ./wallet.js page router_publish <page_name>
       ./wallet.js page version_publish <page_name>
    
    NOTE. No password protection of wallet. This is only for demo purposes for arweave.virdpool_testnet

# Hackathon: Open Web Foundry notes

## What is dynamic page on arweave

Example https://arweave.net/7Z-dJ4c6WlyaVTb-1nRBo2mh8zUq9cUqaLDIoQaDu4U \
So. You want publish your first permaweb page, you published some html, and after one day you realized that you need put some changes... in PERMAweb \
So as Vitalik Buterin made immutable smart contracts so there is proxy smart contract, so now the same is for arweave page publish \
This tool simplifies publishing of html pages (e.g. for some DeFi projects)

## Why all this stuff in title?

  * Your logo and title. Because every site have in that place
  * Gateway selector. Well I hope in future arweave will have some protocol for automatic gateway discovery. Also I will put all gateways I know in that list. Also getting site from localhost is available (well, because it's not https there can be some problems with DeFi). Optional, but for future development.
  * Router selector. Users should pick any router they want. User should have ability to stay on old router, get list of all availble routers, switch router/gateway/version whatever they want. Well, if you really want autoupdateable router you can do that, but I will not bless you.
  * Version selector. Users should pick any page version they want. This is most important and mandatory UI element.
  * Open in new tab button. Metamask can't access into iframe body of loaded page, so users should open that page in new tab (button is already in router for exactly that purpose)

## How to publish your first dynamic page on arweave

    # step 1 get this repository working
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
    source ~/.bashrc
    nvm i 14
    npm i -g yarn
    git clone https://github.com/virdpool/arweave_console_wallet
    cd arweave_console_wallet
    yarn
    
    # step 2 generate wallet
    ./wallet.js gen
    
    # step 3 see your address, fill that address with some balance
    # You can not wait until confirmation and get step 4
    
    # step 4 init your first router and page version in folder sample_page
    ./wallet.js page init sample_page
    
    # step 5. inspect sample_page folder, edit contents of page.html
    
    # step 6. publish your static page
    ./wallet.js page version_publish sample_page
    # you can look at your page in browser
    # you can even open ./sample_page/router.html and make sure that it gets all data from arweave.net properly
    # now you can publish any amount of different versions of page.html
    
    # step 7. publish your router page
    ./wallet.js page router_publish sample_page
    # now you can publish any amount of different versions of router.html, but remember
    #   each time you update router.html, your users will need to switch to new router URL
    #   users have possibility to see that new router UI is published
  