import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not set in .env");
  }

  const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
  const escrow = await FreelanceEscrow.deploy(usdcAddress);

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("FreelanceEscrow deployed to:", address);
  console.log("USDC address:", usdcAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
