// import { Signer } from "ethers";
// import { ethers, network } from "hardhat";
// import { BigNumber } from "@ethersproject/bignumber";
// import chai from "chai";
// import { HLS, MultiSigWallet } from "../../typechain";
// import SCE_ABI from "../../artifacts/contracts/HLS.sol/HLS.json";
// import vestingTypesData from "../../vesting_types/hls.t.json";
// import { Interface } from "@ethersproject/abi";

// const expect = chai.expect;
// const SECOND_IN_MONTH = 2592000;
// const NUM_CONFIRMATION_REQUIRE = 3;
// const USER1_FUND = 1000000;

// const VestingTypeId = {
//   Seed_Round: 1,
//   Private_1: 2,
//   Private_2: 3,
//   Advisor_Partnership: 4,
//   Foundation_Reserve: 5,
//   LiquidPool_CexListing: 6,
//   Team: 7,
//   Marketing: 8
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
//     signers = await ethers.getSigners();
//     [deployer, user1, user2] = [signers[0], signers[1], signers[2]];
// }

// describe("Testing vesting HLS with MultiSig Admin - Running on Sedd Round", function () {

//   this.timeout(1000000);

//   before(async function() {
//     await setupAddress();

//     // Deploy multiSig
//     const MultisigFactory = await ethers.getContractFactory("MultiSigWallet");
//     multisig = await MultisigFactory.connect(deployer).deploy(
//       [await deployer.getAddress(), await user1.getAddress(), await user2.getAddress()],
//       NUM_CONFIRMATION_REQUIRE
//     );

//     const HLSFactory = await ethers.getContractFactory("HLS");
//     hls = await HLSFactory.connect(deployer).deploy(multisig.address);

//     // Adding Seed Round
//     itf = new ethers.utils.Interface(SCE_ABI.abi);
//     let calldata = itf.encodeFunctionData("addVestingType", [ 
//         vestingTypesData[VestingType.Seed_Round].name, 
//         VestingTypeId.Seed_Round,
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].tokenPrice),
//         ethers.utils.parseEther(vestingTypesData[VestingType.Seed_Round].allocation.toString()), 
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].tgePercent),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].startTimeVesting),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].startTimeCliff),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].releaseRounds),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].daysPerRound),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].cliff),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].daysPerCliff),
//         vestingTypesData[VestingType.Seed_Round].arbitrary
//     ]);
//     const submitTx = await multisig.connect(deployer).submitTransaction(hls.address, 0, calldata);
//     await submitTx.wait();

//     //Confirmation by 2 of 3 approver
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
//         vestingTypesData[VestingType.Seed_Round].name, 
//         VestingTypeId.Seed_Round,
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].tokenPrice),
//         ethers.utils.parseEther(vestingTypesData[VestingType.Seed_Round].allocation.toString()), 
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].tgePercent),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].startTimeVesting),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].startTimeCliff),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].releaseRounds),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].daysPerRound),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].cliff),
//         BigNumber.from(vestingTypesData[VestingType.Seed_Round].daysPerCliff),
//         vestingTypesData[VestingType.Seed_Round].arbitrary
//       )
//     ).to.be.revertedWith('ADMIN role required');
//   });

//   it("It should NOT be claim during cliff - a month passed", async function () {
//     await network.provider.send("evm_increaseTime", [SECOND_IN_MONTH]);
//     await network.provider.send("evm_mine");

//     const claimable = await hls.getVestingClaimableAmount(
//       await user1.getAddress(), 
//       BigNumber.from(VestingTypeId.Seed_Round)
//     );

//     expect(claimable).to.equal(0);
//     expect(hls.connect(user1).claimVestingToken(
//       BigNumber.from(VestingTypeId.Seed_Round), 
//       BigNumber.from(10000))
//     )
//     .to.be.revertedWith('Nothing to claim');
//   });

//   it("It should NOT be claim after calim all token", async function(){
//     expect(hls.connect(user1).claimVestingToken(
//       BigNumber.from(VestingTypeId.Seed_Round), 
//       BigNumber.from(10000)))
//     .to.be.revertedWith('Nothing to claim');
//   });

// });