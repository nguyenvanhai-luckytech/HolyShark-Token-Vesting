// import { Signer } from "ethers";
// import { ethers, network } from "hardhat";
// import { BigNumber } from "@ethersproject/bignumber";
// import chai from "chai";
// import { HLS, MultiSigWallet } from "../../typechain";
// import HLS_ABI from "../../artifacts/contracts/HLS.sol/HLS.json";
// import vestingTypesData from "../../vesting_types/hls.t.json";
// import { Interface } from "@ethersproject/abi";

// const expect = chai.expect;
// const SECOND_IN_MONTH = 2592000;
// const NUM_CONFIRMATION_REQUIRE = 3;

// const VestingTypeId = {
//   Seed_Round : 1,
//   Private_1 : 2,
//   Private_2 : 3,
//   Advisor_Partnership : 4,
//   Foundation_Reserve : 5,
//   LiquidPool_CexListing : 6,
//   Team : 7,
//   Marketing : 8
// }

// enum VestingType {
//   Seed_Round,
//   Private_1,
//   Private_2,
//   Advisor_Partnership,
//   Foundation_Reserve,
//   LiquidPool_CexListing,
//   Team,
//   Marketing
// }

// let signers: Signer[];
// let deployer: Signer;
// let user1: Signer;
// let user2: Signer;
// let hls: HLS;
// let itf: Interface;
// let multisig: MultiSigWallet;

// const setupAddress = async () => {
//   signers = await ethers.getSigners();
//   [deployer, user1, user2] = [signers[0], signers[1], signers[2]];
// }

// describe("Testing vesting HLS with MultiSig Admin - Running on Advisor & Partnership Round", function () {
//   this.timeout(1000000);

//   before(async function () {
//     await setupAddress();

//      // Deploy multiSig
//     const MultisigFactory = await ethers.getContractFactory("MultiSigWallet");
//     multisig = await MultisigFactory.connect(deployer).deploy(
//        [await deployer.getAddress(), await user1.getAddress(), await user2.getAddress()],
//        NUM_CONFIRMATION_REQUIRE
//     );

//     const HLSFactory = await ethers.getContractFactory("HLS");
//     hls = await HLSFactory.connect(deployer).deploy(multisig.address);
    
//     // Adding Advisor_Partnership Round
//     itf = new ethers.utils.Interface(HLS_ABI.abi);

//     let callData = itf.encodeFunctionData("addVestingType", 
//       [
//         vestingTypesData[VestingType.Advisor_Partnership].name,
//         VestingTypeId.Advisor_Partnership,
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tokenPrice),
//         ethers.utils.parseEther(vestingTypesData[VestingType.Advisor_Partnership].allocation.toString()),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tgePercent),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeVesting),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeCliff),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].releaseRounds),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerRound),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].cliff),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerCliff),
//         vestingTypesData[VestingType.Advisor_Partnership].arbitrary
//       ]
//     );

//     const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, callData);
//     await submitTx.wait();

//      //Confirmation by 2 of 3 approver
//     const confirmTx1 = await multisig.connect(deployer).confirmTransaction(0);
//     const confirmTx2 = await multisig.connect(user1).confirmTransaction(0);
//     const confirmTx3 = await multisig.connect(user2).confirmTransaction(0);
//     await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);
 
//     //Execute minting transaction after reach sufficient confirmations
//     const execTx = await multisig.connect(deployer).executeTransaction(0);
//     await execTx.wait();
//   });

//   it("It should not be added Vesting type by NON-OWNER", async function() {
//     expect(
//       hls.connect(deployer).addVestingType(
//         vestingTypesData[VestingType.Advisor_Partnership].name,
//         VestingTypeId.Advisor_Partnership,
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tokenPrice),
//         ethers.utils.parseEther(vestingTypesData[VestingType.Advisor_Partnership].allocation.toString()),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tgePercent),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeVesting),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeCliff),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].releaseRounds),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerRound),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].cliff),
//         BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerCliff),
//         vestingTypesData[VestingType.Advisor_Partnership].arbitrary
//       )
//     ).to.be.revertedWith('ADMIN role required');
//   });

//   it("It should be successfully added vesting TOKEN with FUND", async function () {
//     let calldata = itf.encodeFunctionData("addVestingToken", [ 
//       await user1.getAddress(), 
//       BigNumber.from(VestingTypeId.Advisor_Partnership)
//     ]);
//     const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//     await submitTx.wait();

//     //Confirmation by 2 of 3 approver
//     const confirmTx1 = await multisig.connect(deployer).confirmTransaction(1);
//     const confirmTx2 = await multisig.connect(user1).confirmTransaction(1);
//     const confirmTx3 = await multisig.connect(user2).confirmTransaction(1);
//     await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//     //Execute minting transaction after reach sufficient confirmations
//     const execTx = await multisig.connect(deployer).executeTransaction(1);
//     await execTx.wait();

//     const realityBalance = ethers.utils.formatEther(await hls.balanceOf(await user1.getAddress()));
//     expect(parseInt(realityBalance)).to.equal(0);
//   });

//   it("It should NOT added vesting TOKEN with FUND Exceed Max Allocation", async function () {
//     let calldata = itf.encodeFunctionData("addVestingToken", [ 
//       await user2.getAddress(), 
//       BigNumber.from(VestingTypeId.Advisor_Partnership)
//     ]);
//     const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//     await submitTx.wait();

//     //Confirmation by 2 of 3 approver
//     const confirmTx1 = await multisig.connect(deployer).confirmTransaction(2);
//     const confirmTx2 = await multisig.connect(user1).confirmTransaction(2);
//     const confirmTx3 = await multisig.connect(user2).confirmTransaction(2);
//     await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//     //Execute minting transaction after reach sufficient confirmations
//     expect(multisig.connect(deployer).executeTransaction(2)).to.be.revertedWith('tx failed');
//   });

//   it("It should be claim when cliff ended - Ex 70%", async function() {
//     await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH]);
//     await network.provider.send("evm_mine");

//     const claimable = await hls.getVestingClaimableAmount(
//       await user1.getAddress(), 
//       BigNumber.from(VestingTypeId.Advisor_Partnership)
//     );
    
//     const previouseBalance = await hls.balanceOf(await user1.getAddress());
//     const claimTx = await hls.connect(user1).claimVestingToken(
//       BigNumber.from(VestingTypeId.Advisor_Partnership), 
//       BigNumber.from(7000));
//     await claimTx.wait();
    
//     expect(parseInt(ethers.utils.formatEther(claimable))).to.equal(vestingTypesData[VestingType.Advisor_Partnership].allocation);
//     expect(await hls.balanceOf(await user1.getAddress())).to.equal(previouseBalance.add(claimable.mul(70).div(100)));
//   });

//   it("It should be claim all the rest of vesting token", async function() {
//     const claimTx = await hls.connect(user1).claimVestingToken(
//       BigNumber.from(VestingTypeId.Advisor_Partnership), 
//       BigNumber.from(10000));
//     await claimTx.wait();

//     const claimable = await hls.getVestingClaimableAmount(
//         await user1.getAddress(), 
//         BigNumber.from(VestingTypeId.Advisor_Partnership)
//     );  

//     expect(parseInt(ethers.utils.formatEther(await hls.balanceOf(await user1.getAddress()))))
//     .to.equal(vestingTypesData[VestingType.Advisor_Partnership].allocation);
//     expect(claimable).to.equal(0)
//   });

//   it("It should NOT be claim after calim all token", async function(){
//     expect(hls.connect(user1).claimVestingToken(
//       BigNumber.from(VestingTypeId.Advisor_Partnership), 
//       BigNumber.from(10000)))
//     .to.be.revertedWith('Nothing to claim');
//   });

// });