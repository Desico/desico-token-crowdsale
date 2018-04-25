import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

var BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const DesicoToken = artifacts.require('./DesicoToken.sol');

contract('DesicoToken', function (accounts) {
  const cap = new BigNumber(803631373 * 10 ** 18);
  const teamWallet = accounts[2];
  const reserveWallet = accounts[3];
  const foundationWallet = accounts[4];
  const advisorsWallet = accounts[5];
  const bountiesWallet = accounts[6];
  const financialSupportersWallet = accounts[7];

  var token;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    const releaseTime = latestTime() + duration.years(1);

    token = await DesicoToken.new(
      releaseTime,
      teamWallet,
      reserveWallet,
      foundationWallet,
      advisorsWallet,
      bountiesWallet,
      financialSupportersWallet
    );
  });

  describe('details', function () {
    it('should have a name', async function () {
      (await token.name()).should.be.equal('Desico');
    });

    it('should have a symbol', async function () {
      (await token.symbol()).should.be.equal('DESI');
    });

    it('should have 18 decimals', async function () {
      (await token.decimals()).should.be.bignumber.equal(18);
    });

    it('should have correct cap', async function () {
      (await token.cap()).should.be.bignumber.equal(cap);
    });
  });

  describe('reserved supplies', function () {
    it('should have correct reserve supply', async function () {
      var supply = await token.RESERVE_SUPPLY();
      var balance = await token.balanceOf(reserveWallet);
      balance.should.be.bignumber.equal(supply);
    });

    it('should have correct advisors supply', async function () {
      var supply = await token.ADVISORS_SUPPLY();
      var balance = await token.balanceOf(advisorsWallet);
      balance.should.be.bignumber.equal(supply);
    });

    it('should have correct bounties supply', async function () {
      var supply = await token.BOUNTIES_SUPPLY();
      var balance = await token.balanceOf(bountiesWallet);
      balance.should.be.bignumber.equal(supply);
    });

    it('should have correct financial supporters supply', async function () {
      var supply = await token.FINANCIAL_SUPPORTERS_SUPPLY();
      var balance = await token.balanceOf(financialSupportersWallet);
      balance.should.be.bignumber.equal(supply);
    });
  });

  describe('locked supplies', function () {
    it('should not release locked supply before time limit', async function () {
      await token.withdraw().should.be.rejectedWith(EVMRevert);
    });

    it('should release locked supply after time limit', async function () {
      await increaseTimeTo(latestTime() + duration.years(2));

      (await token.balanceOf(teamWallet)).should.be.bignumber.equal(0);
      (await token.balanceOf(foundationWallet)).should.be.bignumber.equal(0);

      await token.withdraw().should.be.fulfilled;

      var teamSupply = await token.TEAM_SUPPLY();
      var foundationSupply = await token.FOUNDATION_SUPPLY();

      (await token.balanceOf(teamWallet)).should.be.bignumber.equal(teamSupply);
      (await token.balanceOf(foundationWallet)).should.be.bignumber.equal(foundationSupply);
    });

    it('should not release locked supply twice', async function () {
      await increaseTimeTo(latestTime() + duration.years(2));

      await token.withdraw().should.be.fulfilled;
      await token.withdraw().should.be.rejectedWith(EVMRevert);
    });
  });
});
