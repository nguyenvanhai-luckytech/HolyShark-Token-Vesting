// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { Signer } from "ethers";
import multisigArgs from "../constructor_args/multisigArgs";

let signers: Signer[];
let deployer: Signer;

interface Call {
  address: string // Address of the contract
  name: string // Function name on the contract (example: balanceOf)
  params?: any[] // Function params
}

const setupAddress = async () => {
signers = await ethers.getSigners();
[deployer] = [signers[0]];
}


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

   // Setup address
   await setupAddress();

   // Deploy Multisig Wallet
   const MultisigFactory = await ethers.getContractFactory("MultiSigWallet");
   const multisig = await MultisigFactory.connect(deployer).deploy(multisigArgs[0] as string[], multisigArgs[1] as number);
   console.log("Multisig deployed to:", multisig.address);
 
   // We get the contract to deploy
   const GDCFactory = await ethers.getContractFactory("GDC");
   const gdc = await GDCFactory.connect(deployer).deploy(multisig.address);
   console.log("GDC deployed to:", gdc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
