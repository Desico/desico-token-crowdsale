const DesicoCrowdsale = artifacts.require('./DesicoCrowdsale.sol');
const DesicoToken = artifacts.require('./DesicoToken.sol');
const CSVParser = require('csv-parse/lib/sync');
const fs = require('fs');

module.exports = function (deployer, network, accounts) {
  const ownerWallet = accounts[0] || process.env.WALLET_OWNER;
  const crowdsaleWallet = accounts[1] || process.env.WALLET_CROWDSALE;
  const teamWallet = accounts[2] || process.env.WALLET_TEAM;
  const reserveWallet = accounts[3] || process.env.WALLET_RESERVE;
  const foundationWallet = accounts[4] || process.env.WALLET_FOUNDATION;
  const advisorsWallet = accounts[5] || process.env.WALLET_ADVISORS;
  const bountiesWallet = accounts[6] || process.env.WALLET_BOUNTIES;
  const financialSupportersWallet = accounts[7] || process.env.WALLET_FINANCIAL_SUPPORTERS;

  console.log('Owner wallet address: ' + ownerWallet);
  console.log('Crodsale wallet address: ' + crowdsaleWallet);
  console.log('Team wallet address: ' + teamWallet);
  console.log('Reserve wallet address: ' + reserveWallet);
  console.log('Foundation wallet address: ' + foundationWallet);
  console.log('Advisors wallet address: ' + advisorsWallet);
  console.log('Bounties wallet address: ' + bountiesWallet);
  console.log('Financial supporters wallet address: ' + financialSupportersWallet);

  var ico;
  var token;
  var tokenOwner;

  web3.eth.getBlockNumber((e, blocknr) => {
    web3.eth.getBlock(blocknr, (e, block) => {
      if (!e) {
        const startTime = block.timestamp + 60;
        const endTime = startTime + 86400 * 30;
        const releaseTime = startTime + 86400 * 30;

        return deployer.deploy(
          DesicoToken,
          releaseTime,
          teamWallet,
          reserveWallet,
          foundationWallet,
          advisorsWallet,
          bountiesWallet,
          financialSupportersWallet
        )
          .then(function () {
            return DesicoToken.deployed();
          })
          .then(function (_token) {
            console.log('Token address: ' + DesicoToken.address);

            token = _token;

            return deployer.deploy(
              DesicoCrowdsale,
              startTime,
              endTime,
              crowdsaleWallet,
              DesicoToken.address);
          })
          .then(function () {
            return DesicoCrowdsale.deployed();
          })
          .then(function () {
            console.log('Crowdsale address: ' + DesicoCrowdsale.address);

            return token.owner.call();
          })
          .then(function (_owner) {
            tokenOwner = _owner;

            console.log('DesicoToken owner : ' + tokenOwner);

            return token.transferOwnership(DesicoCrowdsale.address, { from: tokenOwner });
          })
          .then(function () {
            console.log('DesicoToken owner was changed: ' + DesicoCrowdsale.address);

            return DesicoCrowdsale.deployed();
          })
          .then(function (_ico) {
            ico = _ico;

            return ico.addManyToWhitelist([
              ownerWallet,
              crowdsaleWallet,
              teamWallet,
              reserveWallet,
              foundationWallet,
              advisorsWallet,
              bountiesWallet,
              financialSupportersWallet,
            ]);
          })
          .then(async function () {
            const batchSize = 100;
            const rawData = fs.readFileSync('data/whitelist.csv').toString('utf-8');
            const data = CSVParser(rawData, { columns: true });

            if (data.length > 0) {
              let accounts = [];
              for (let row of data) {
                accounts.push({ address: web3.toHex(row.account) });
              }

              var whitelistedCount = 0;
              while (whitelistedCount < accounts.length) {
                let accountsToImport = [];
                let i = 0;
                while (accountsToImport.length < batchSize && whitelistedCount + i < accounts.length) {
                  accountsToImport.push(accounts[whitelistedCount + i].address);
                  i++;
                }

                await ico.addManyToWhitelist(accountsToImport);

                whitelistedCount += accountsToImport.length;
              }
            }

            console.log('Wallets whitelisted');
          });
      }
    });
  });
};
