// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { Signer } from "ethers";

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
 
   // We get the contract to deploy
   const BuyItems = await ethers.getContractFactory("BuyItems");
   const buyIem = await BuyItems.connect(deployer).deploy("0x91419d12678Ad484C87dCF15727C1eB25400A264");
   console.log("BuyItem deployed to:", buyIem.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
