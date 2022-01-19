// import { Signer } from "ethers";
// import { ethers } from "hardhat";
// import { BigNumber } from "@ethersproject/bignumber";
// import chai from "chai";
// import { HLS, MultiSigWallet } from "../../typechain";
// import HLS_ABI from "../../artifacts/contracts/HLS.sol/HLS.json";
// import vestingTypesData from "../../vesting_types/hls.t.json";
// import { Interface } from "@ethersproject/abi";

// const expect = chai.expect;
// const NUM_CONFIRMATION_REQUIRE = 3;

// const VestingTypeId = {
//     Seed_Round : 1,
//     Private_1 : 2,
//     Private_2 : 3,
//     Advisor_Partnership : 4,
//     Foundation_Reserve : 5,
//     LiquidPool_CexListing : 6,
//     Team : 7,
//     Marketing : 8
// }

// enum VestingType {
//     Seed_Round,
//     Private_1,
//     Private_2,
//     Advisor_Partnership,
//     Foundation_Reserve,
//     LiquidPool_CexListing,
//     Team,
//     Marketing
// }

// let signers: Signer[];
// let deployer: Signer;
// let user1: Signer;
// let user2: Signer;
// let hls: HLS;
// let itf: Interface;
// let multisig: MultiSigWallet;

// const setupAddress = async () => {
//     signers = await ethers.getSigners();
//     [deployer, user1, user2] = [signers[0], signers[1], signers[2]];
// }

// describe("Testig vesting HLS with MultiSig Admin - Running on Advisor Partnership Round", function () {
//     this.timeout(1000000);

//     before(async function () {
//         await setupAddress();

//         // Deploy multiSig
//         const MultisigFactory = await ethers.getContractFactory("MultiSigWallet");
//         multisig = await MultisigFactory.connect(deployer).deploy(
//             [await deployer.getAddress(), await user1.getAddress(), await user2.getAddress()],
//             NUM_CONFIRMATION_REQUIRE
//         );

//         const HLSFactory = await ethers.getContractFactory("HLS");
//         hls = await HLSFactory.connect(deployer).deploy(multisig.address);

//         itf = new ethers.utils.Interface(HLS_ABI.abi);

//         let callData = itf.encodeFunctionData("addVestingType", 
//             [
//                 vestingTypesData[VestingType.Advisor_Partnership].name,
//                 VestingTypeId.Advisor_Partnership,
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tokenPrice),
//                 ethers.utils.parseEther(vestingTypesData[VestingType.Advisor_Partnership].allocation.toString()),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].tgePercent),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeVesting),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].startTimeCliff),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].releaseRounds),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerRound),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].cliff),
//                 BigNumber.from(vestingTypesData[VestingType.Advisor_Partnership].daysPerCliff),
//                 vestingTypesData[VestingType.Advisor_Partnership].arbitrary
//             ]
//         );
        
//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, callData);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(0);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(0);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(0);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);
        
//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(0);
//         await execTx.wait();
//     });

//     // Checking for Vesting Name
//     it("Should be edited name by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setName", [
//             VestingTypeId.Advisor_Partnership,
//             "AP"
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(1);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(1);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(1);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(1);
//         await execTx.wait();

//         expect(await hls.getName(VestingTypeId.Advisor_Partnership)).to.equal("AP");
//     });

//     it("Should NOT be edited name by NON-OWNER", async function() {
//         expect(hls.setName(VestingTypeId.Advisor_Partnership, "AP")).to.be.revertedWith('ADMIN role required');
//     });
  
//     // Checking for Vesting Token Price
//     it("Should be edited tokenPrice by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setTokenPrice", [
//             VestingTypeId.Advisor_Partnership,
//             50
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(2);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(2);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(2);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(2);
//         await execTx.wait();

//         expect(await hls.getTokenPrice(VestingTypeId.Advisor_Partnership)).to.equal(50);
//     });

//     it("Should NOT be edited tokenPrice by NON-OWNER", async function() {
//         expect(hls.setTokenPrice(VestingTypeId.Advisor_Partnership, 50)).to.be.revertedWith('ADMIN role required');
//     });

//     // Checking for Vesting Allocation
//     it("Should be edited Allocation by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setAllocation", [
//             VestingTypeId.Advisor_Partnership,
//             30000000
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(3);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(3);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(3);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(3);
//         await execTx.wait();

//         expect(await hls.getAllocation(VestingTypeId.Advisor_Partnership)).to.equal(30000000);
//     });

//     it("Should NOT be edited Allocation by NON-OWNER", async function() {
//         expect(hls.setAllocation(VestingTypeId.Advisor_Partnership, 30000000)).to.be.revertedWith('ADMIN role required');
//     });

//      // Checking for Vesting TGE Percent
//     it("Should be edited TgePercent by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setTgePercent", [
//             VestingTypeId.Advisor_Partnership,
//             15
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(4);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(4);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(4);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(4);
//         await execTx.wait();

//         expect(await hls.getTgePercent(VestingTypeId.Advisor_Partnership)).to.equal(15);
//     });

//     it("Should NOT be edited TgePercent by NON-OWNER", async function() {
//         expect(hls.setTgePercent(VestingTypeId.Advisor_Partnership, 15)).to.be.revertedWith('ADMIN role required');
//     });

//      // Checking for Vesting Start Time
//     it("Should be edited startTimeVesting by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setStartTimeVesting", [
//             VestingTypeId.Advisor_Partnership,
//             1635644223
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(5);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(5);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(5);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(5);
//         await execTx.wait();

//         expect(await hls.getStartTimeVesting(VestingTypeId.Advisor_Partnership)).to.equal(1635644223);
//     });

//     it("Should NOT be edited startTimeVesting by NON-OWNER", async function() {
//         expect(hls.setStartTimeVesting(VestingTypeId.Advisor_Partnership, 1635644223)).to.be.revertedWith('ADMIN role required');
//     });

//     // Checking for Vesting Start Time Cliff
//     it("Should be edited startTimeCliff by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setStartTimeCliff", [
//             VestingTypeId.Advisor_Partnership,
//             1635644223
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(6);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(6);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(6);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(6);
//         await execTx.wait();

//         expect(await hls.getStartTimeCliff(VestingTypeId.Advisor_Partnership)).to.equal(1635644223);
//     });

//     it("Should NOT be edited startTimeCliff by NON-OWNER", async function() {
//         expect(hls.setStartTimeCliff(VestingTypeId.Advisor_Partnership, 1635644223)).to.be.revertedWith('ADMIN role required');
//     });

//       // Checking for Vesting Release Round
//     it("Should be edited releaseRound by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setReleaseRounds", [
//             VestingTypeId.Advisor_Partnership,
//             0
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(7);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(7);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(7);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(7);
//         await execTx.wait();

//         expect(await hls.getReleaseRound(VestingTypeId.Advisor_Partnership)).to.equal(0);
//     });

//     it("Should NOT be edited releaseRound by NON-OWNER", async function() {
//         expect(hls.setReleaseRounds(VestingTypeId.Advisor_Partnership, 0)).to.be.revertedWith('ADMIN role required');
//     });

//      // Checking for Vesting Days Per Round
//     it("Should be edited daysPerRound by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setDaysPerRound", [
//             VestingTypeId.Advisor_Partnership,
//             30
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(8);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(8);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(8);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(8);
//         await execTx.wait();

//         expect(await hls.getDaysPerRound(VestingTypeId.Advisor_Partnership)).to.equal(30);
//     });

//     it("Should NOT be edited daysPerRound by NON-OWNER", async function() {
//         expect(hls.setDaysPerRound(VestingTypeId.Advisor_Partnership, 30)).to.be.revertedWith('ADMIN role required');
//     });

//     // Checking for Vesting Cliff
//     it("Should be edited cliff by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setCliff", [
//             VestingTypeId.Advisor_Partnership,
//             0
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(9);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(9);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(9);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(9);
//         await execTx.wait();

//         expect(await hls.getCliff(VestingTypeId.Advisor_Partnership)).to.equal(0);
//     });

//     it("Should NOT be edited cliff by NON-OWNER", async function() {
//         expect(hls.setCliff(VestingTypeId.Advisor_Partnership, 0)).to.be.revertedWith('ADMIN role required');
//     });

//     // Checking for Vesting Days Per CLiff
//     it("Should be edited daysPerCliff by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setDaysPerCliff", [
//             VestingTypeId.Advisor_Partnership,
//             30
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(10);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(10);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(10);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(10);
//         await execTx.wait();

//         expect(await hls.getDaysPerCliff(VestingTypeId.Advisor_Partnership)).to.equal(30);
//     });

//     it("Should NOT be edited daysPerCliff by NON-OWNER", async function() {
//         expect(hls.setDaysPerCliff(VestingTypeId.Advisor_Partnership, 30)).to.be.revertedWith('ADMIN role required');
//     });

//     // Checking for Vesting Arbitrary
//     it("Should be edited arbitrary by OWNER", async function() {
//         let calldata = itf.encodeFunctionData("setArbitrary", [
//             VestingTypeId.Advisor_Partnership,
//             true
//         ]);

//         const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//         await submitTx.wait();

//         //Confirmation by 2 of 3 approver
//         const confirmTx1 = await multisig.connect(deployer).confirmTransaction(11);
//         const confirmTx2 = await multisig.connect(user1).confirmTransaction(11);
//         const confirmTx3 = await multisig.connect(user2).confirmTransaction(11);
//         await Promise.all([confirmTx1.wait(), confirmTx2.wait(), confirmTx3.wait()]);

//         //Execute minting transaction after reach sufficient confirmations
//         const execTx = await multisig.connect(deployer).executeTransaction(11);
//         await execTx.wait();

//         expect(await hls.getArbitrary(VestingTypeId.Advisor_Partnership)).to.equal(true);
//     });

//     it("Should NOT be edited arbitrary by NON-OWNER", async function() {
//         expect(hls.setArbitrary(VestingTypeId.Advisor_Partnership, true)).to.be.revertedWith('ADMIN role required');
//     });

// })