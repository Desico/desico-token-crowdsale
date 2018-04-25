# Desico Token

[![Build Status](https://travis-ci.org/Desico/desico-token-crowdsale.svg?branch=master?branch=master)](https://travis-ci.org/Desico/desico-token-crowdsale)


## About

* See [desico.io](https://www.desico.io) for more details.

## Development

The smart contracts are being implemented in Solidity `0.4.21`.

### Prerequisites

* [NodeJS](htps://nodejs.org), version 9+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [truffle](http://truffleframework.com/), which is a comprehensive framework for Ethereum development. `npm install -g truffle` — this should install Truffle v4.1.5 or better.  Check that with `truffle version`.


### Initialisation

        npm install

### Compiling

#### From within Truffle

Run the `truffle` development environment

    truffle develop

then from the prompt you can run

    compile
    migrate
    test

as well as other truffle commands. See [truffleframework.com](http://truffleframework.com) for more.

#### Standalone

Run

    npm test

To generate code coverage reports run

    npm run test:cov

*Note* Generating code coverage reports takes a bit longer to run than just running the tests.

### Linting

We provide the following linting options

* `npm run lint` — to lint the solidity files and the javascript.

### Deploying to `rinkeby`

You'll need an address on the Rinkeby blockchain with some ETH in it.

Use [MetaMask](https://metamask.io) to create a wallet and use [faucet.metamask.io](https://faucet.metamask.io/) to get some ETH for it.

You will need to supply a file called `.env` in the root of the project (copy & change from `.env.test`).

Then run

    npm run deploy:rinkeby