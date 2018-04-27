require('dotenv').config();

const Web3 = require('web3');
const express = require('express');
const fs = require('fs');

const app = express();
const obj = JSON.parse(fs.readFileSync('./build/contracts/DesicoCrowdsale.json', 'utf8'));

if (!process.env.ADDRESS_CONTRACT || !process.env.ADDRESS_CONTRACT.length) {
  throw new Error('Contract address not set.');
}

if (!process.env.PROVIDER || !process.env.PROVIDER.length) {
  throw new Error('Provider not set.');
}

console.log('Provider: ' + process.env.PROVIDER);

const provider = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER));
const ico = provider.eth.contract(obj.abi).at(process.env.ADDRESS_CONTRACT);
provider.eth.defaultAccount = provider.eth.coinbase;

app.post('/whitelist/:address', (req, res) => {
  try {
    ico.addToWhitelist(req.params.address);
    res.send('');
  } catch (e) {
    res.status(500).send(e);
  }
});

app.delete('/whitelist/:address', (req, res) => {
  try {
    ico.removeFromWhitelist(req.params.address);
    res.send('');
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('/whitelist/:address', (req, res) => {
  res.send(ico.whitelist(req.params.address));
});

app.listen(3000, () => console.log('App listening on port 3000'));
