import { ethers } from "hardhat";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

async function main() {
  const pk = process.env.PRIVATE_KEY;

  if (!pk) {
    console.error("❌ PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  try {
    const wallet = new ethers.Wallet(pk);
    console.log("\n✅ Wallet Address:", wallet.address);
    console.log("\n📋 Use this address to request testnet ETH from:");
    console.log("   • https://coinbase.com/faucets (Coinbase Faucet)");
    console.log("   • https://www.alchemy.com/faucets/base-sepolia");
    console.log("   • https://faucet.quicknode.com/base/sepolia");
    console.log("\n⏱️  Wait 30 seconds for funds to arrive, then run: npm run deploy:base-sepolia\n");
  } catch (err) {
    console.error("❌ Error deriving wallet:", err);
    process.exit(1);
  }
}

main();
