const fs = require("fs");
const path = require("path");

// Copy ABI from artifacts to frontend
const artifactPath = path.join(__dirname, "../artifacts/contracts/FreelanceEscrow.sol/FreelanceEscrow.json");
const destPath = path.join(__dirname, "../../frontend/abi/FreelanceEscrow.json");

try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Write ABI to frontend
    fs.writeFileSync(destPath, JSON.stringify(abi, null, 2));
    console.log("✅ ABI copied to frontend");
} catch (error) {
    console.error("❌ Error copying ABI:", error.message);
    process.exit(1);
}
