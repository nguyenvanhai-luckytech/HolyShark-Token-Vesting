import chai, { expect } from "chai";
import { BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";
import { ethers } from "hardhat";

let itf : Interface;

describe("Test vesting token public sale rounds", function() {
    this.timeout(1000000);

    let Token;
    let Deployer;
    let TokenPublic;
    let StartTimeVesting;

    before(async function () {

        [Deployer] = await ethers.getSigners();
        Token = await ethers.getContractFactory("PublicSaleRounds");
        TokenPublic = await Token.deploy(Deployer.address, "PublicSaleRounds", "PublicSaleRounds");
        
        StartTimeVesting = await TokenPublic.setStartTimeVesting(1635644113);
    })

    it("It should not be added Vesting type by no vesting time", async function () {
        [Deployer] = await ethers.getSigners();
        Token = await ethers.getContractFactory("PublicSaleRounds");
        TokenPublic = await Token.deploy(Deployer.address, "PublicSaleRounds", "PublicSaleRounds");
        const amount = BigNumber.from(10000);
        expect( TokenPublic.addVestingToken(Deployer.address, amount)).to.be.revertedWith('No vesting time');
    })

    it("add vesting token", async function () {
        [Deployer] = await ethers.getSigners();
        Token = await ethers.getContractFactory("PublicSaleRounds");
        TokenPublic = await Token.deploy(Deployer.address, "PublicSaleRounds", "PublicSaleRounds");
        
        StartTimeVesting = await TokenPublic.setStartTimeVesting(1635644113);
        
        const tgePercent = BigNumber.from (4000);
        const amount = BigNumber.from(10000);
        const addVestingToken = await TokenPublic.addVestingToken(Deployer.address,amount);
        const expectedBalance = BigNumber.from(10000).mul(tgePercent).div(BigNumber.from(10000));
        const realityBalance = ethers.utils.formatEther(await TokenPublic.balanceOf(await Deployer.address));

        expect(parseInt(realityBalance)).to.equal(expectedBalance.toNumber());
    })

   
})