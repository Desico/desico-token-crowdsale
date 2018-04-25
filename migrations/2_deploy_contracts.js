var DesicoCrowdsale = artifacts.require('./DesicoCrowdsale.sol');
var DesicoToken = artifacts.require('./DesicoToken.sol');

module.exports = function (deployer, network, accounts) {
  /*
  if (network === 'development') {
    return;
  }
  */

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
          financialSupportersWallet,
          { from: ownerWallet, gas: 4712388, gasPrice: 65000000000 }
        )
          .then(function () {
            console.log('Token address: ' + DesicoToken.address);

            return deployer.deploy(
              DesicoCrowdsale,
              startTime,
              endTime,
              crowdsaleWallet,
              reserveWallet,
              DesicoToken.address,
              { from: ownerWallet, gas: 4712388, gasPrice: 65000000000 });
          })
          .then(function () {
            console.log('Crowdsale address: ' + DesicoCrowdsale.address);

            return DesicoToken.deployed();
          })
          .then(function (_token) {
            token = _token;

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
            return _ico.addManyToWhitelist([
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
          .then(function () {
            console.log('Wallets whitelisted');
          });
      }
    });
  });
};