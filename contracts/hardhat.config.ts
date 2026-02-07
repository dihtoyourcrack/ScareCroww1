import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const {
  PRIVATE_KEY,
  BASE_RPC,
  BASESCAN_API_KEY
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {},

    baseSepolia: {
      url: BASE_RPC || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY || "",
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
