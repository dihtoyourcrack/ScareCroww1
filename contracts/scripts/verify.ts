import { run } from "hardhat";
import "dotenv/config";

async function main() {
    const contractAddress = process.env.ESCROW_ADDRESS;
    if (!contractAddress) {
        throw new Error("ESCROW_ADDRESS not set in .env");
    }

    console.log("Verifying contract at:", contractAddress);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.error("Verification error:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
