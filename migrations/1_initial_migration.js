var Migrations = artifacts.require('./Migrations.sol');

module.exports = function (deployer) {
  deployer.deploy(Migrations, {
    gas: 4712388,
    gasPrice: 65000000000,
  });
};