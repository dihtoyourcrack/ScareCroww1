async function main() {
  const hardhat = await import("hardhat");
  const { run } = hardhat as any;

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const usdcAddress = process.env.USDC_ADDRESS;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in .env");
  }
  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not set in .env");
  }

  console.log("Verifying contract at:", contractAddress);

  await run("verify:verify", {
    address: contractAddress,
    constructorArguments: [usdcAddress],
  });

  console.log("Contract verified successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
