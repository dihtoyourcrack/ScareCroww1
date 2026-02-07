import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  const USDC = process.env.USDC_ADDRESS || "";
  const ROUTER = process.env.UNISWAP_ROUTER || "";

  if (!ethers.isAddress(USDC)) {
    throw new Error("USDC_ADDRESS is missing or invalid in .env");
  }

  if (!ethers.isAddress(ROUTER)) {
    throw new Error("UNISWAP_ROUTER is missing or invalid in .env");
  }

  const Escrow = await ethers.getContractFactory("FreelanceEscrow");

  const escrow = await Escrow.deploy(ROUTER, USDC);

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();

  console.log("✅ FreelanceEscrow deployed to:", address);

  // -------- save address for frontend ----------
  const frontendEnvPath = path.join(
    __dirname,
    "../../frontend/.env.local"
  );

  fs.appendFileSync(
    frontendEnvPath,
    `\nNEXT_PUBLIC_ESCROW_ADDRESS=${address}\n`
  );

  console.log("✅ Address written to frontend/.env.local");

  // -------- copy ABI ----------
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/FreelanceEscrow.sol/FreelanceEscrow.json"
  );

  const abiPath = path.join(
    __dirname,
    "../../frontend/abi/FreelanceEscrow.json"
  );

  fs.copyFileSync(artifactPath, abiPath);

  console.log("✅ ABI copied to frontend/abi/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
