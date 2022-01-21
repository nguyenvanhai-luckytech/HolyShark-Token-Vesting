import chai, { expect } from "chai";
import { BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { Signer } from "ethers";

import {PublicSaleRounds} from "../../typechain";

const SECOND_IN_MONTH = 2592000;
let itf : Interface;
let deployer: Signer;
let signers: Signer[];
let publicSaleRoundsFactory;
let publicSaleRounds : PublicSaleRounds;

const setupAddress = async () => {
    signers = await ethers.getSigners();
    [deployer] = [signers[0]];
}

describe("Test vesting token public sale rounds", function() {
    this.timeout(1000000);

    before(async function () {
        [deployer] = await ethers.getSigners();
        publicSaleRoundsFactory = await ethers.getContractFactory("PublicSaleRounds");
        publicSaleRounds = await publicSaleRoundsFactory.connect(deployer).deploy(await deployer.getAddress(), "PublicSaleRounds", "PublicSaleRounds");
        let startTimeVestingTx = await publicSaleRounds.setStartTimeVesting(Math.round(Date.now()/1000));
        await startTimeVestingTx.wait();
        
    })

    // it("It should not be add Vesting by No vesting time", async function () {
    //     [deployer] = await ethers.getSigners();
    //     publicSaleRoundsFactory = await ethers.getContractFactory("PublicSaleRounds");
    //     publicSaleRounds = await publicSaleRoundsFactory.deploy(await deployer.getAddress(), "PublicSaleRounds", "PublicSaleRounds");
    //     const amount = BigNumber.from(10000);
    //     expect( publicSaleRounds.addVestingToken(await deployer.getAddress(), amount)).to.be.revertedWith('No vesting time');
    // })

    // it("Add vesting token", async function () {
    //     const amount = ethers.utils.parseEther("700000");

    //     const addVestingToken = await publicSaleRounds.addVestingToken(await deployer.getAddress(),amount);
    //     const realityBalance = await publicSaleRounds.balanceOf(await deployer.getAddress());
        
    //     const expectedBalance = BigNumber.from(700000).mul(ethers.utils.parseEther("40")).div(BigNumber.from(100));
        
    //     expect(realityBalance).to.equal(expectedBalance);
    // })

    // it("Claim Vesting Token with a month", async function () {
    //     const realityBalance1 = await publicSaleRounds.balanceOf(await deployer.getAddress());
        
        

    //     await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH]);
    //     await network.provider.send("evm_mine");

    //     const getVestingClaimableAmount = await publicSaleRounds.getVestingClaimableAmount(await deployer.getAddress());
        
        
        
    //     const claimableAmountTX = await publicSaleRounds.claimVestingToken();
    //     await claimableAmountTX.wait();

    //     const realityBalance2 = await publicSaleRounds.balanceOf(await deployer.getAddress());
        
        

    //     const totalClaim = BigNumber.from(700000).mul(ethers.utils.parseEther("40")).div(BigNumber.from(100));

    //     expect(getVestingClaimableAmount).to.equal(totalClaim);
    //     expect(await publicSaleRounds.balanceOf(await deployer.getAddress())).to.equal(realityBalance1.add(totalClaim));
    // })

    // it("Claim Vesting Token in the last month", async function () {
    //     const realityBalance3 = await publicSaleRounds.balanceOf(await deployer.getAddress());

    //     await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH * 2]);
    //     await network.provider.send("evm_mine");

    //     const getVestingClaimableAmount = await publicSaleRounds.getVestingClaimableAmount(await deployer.getAddress());

    //     const claimableAmountTX = await publicSaleRounds.claimVestingToken();
    //     await claimableAmountTX.wait();

    //     const realityBalance4 = await publicSaleRounds.balanceOf(await deployer.getAddress());
        
    //     const totalClaim = BigNumber.from(700000).mul(ethers.utils.parseEther("20")).div(BigNumber.from(100));

    //     expect(getVestingClaimableAmount).to.equal(totalClaim);
    //     expect(await publicSaleRounds.balanceOf(await deployer.getAddress())).to.equal(realityBalance4);
    // })

    it("Claim Vesting", async function () {
        const amount = ethers.utils.parseEther("700000");

        let startTimeVestingTx = await publicSaleRounds.setStartTimeVesting(Math.round(Date.now()/1000));
        await startTimeVestingTx.wait();

        const addVestingTokenTX = await publicSaleRounds.addVestingToken(await deployer.getAddress(),amount);
        await addVestingTokenTX.wait();

        const realityBalance5 = await publicSaleRounds.balanceOf(await deployer.getAddress());
        console.log(realityBalance5);
        

        await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH]);
        await network.provider.send("evm_mine");
    
        await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH * 2]);
        await network.provider.send("evm_mine");

        const getVestingClaimableAmount = await publicSaleRounds.getVestingClaimableAmount(await deployer.getAddress());

        const claimableAmountTX = await publicSaleRounds.claimVestingToken();
        await claimableAmountTX.wait();

        const realityBalance2 = await publicSaleRounds.balanceOf(await deployer.getAddress());
        console.log(realityBalance2);
        
        
        const totalClaim =(BigNumber.from(700000).mul(ethers.utils.parseEther("40")).div(BigNumber.from(100))).add((BigNumber.from(700000).mul(ethers.utils.parseEther("20")).div(BigNumber.from(100))));

        expect(realityBalance2).to.equal(totalClaim.add(realityBalance5));
    })

    // it("Can't claim vesting before the day is up", async function () {
    //     const tgePercent = ethers.utils.parseEther("40");
    //     const amount = ethers.utils.parseEther("700000");
    //     let startTimeVestingTx = await publicSaleRounds.setStartTimeVesting(Math.round(Date.now()/1000));
    //     await startTimeVestingTx.wait();
    //     const addVestingTokenTX = await publicSaleRounds.addVestingToken(await deployer.getAddress(),amount);
    //     await addVestingTokenTX.wait();
    //     const realityBalance1 = await publicSaleRounds.balanceOf(await deployer.getAddress());

    //     console.log("realityBalance1",realityBalance1);
    //     await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH / 2]);
    //     await network.provider.send("evm_mine");

    //     const claimableAmountTX = await publicSaleRounds.claimVestingToken();
    //     await claimableAmountTX.wait();

    //     const realityBalance2 = await publicSaleRounds.balanceOf(await deployer.getAddress());
    //     console.log("realityBalance2",realityBalance2);
        
        
    // })
})