export const CHAINS = {
  BASE: {
    id: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: "Base Sepolia",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
  },
  ETHEREUM: {
    id: 1,
    name: "Ethereum",
    rpc: "https://eth.publicnode.com",
    explorer: "https://etherscan.io",
  },
  POLYGON: {
    id: 137,
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
  ARBITRUM: {
    id: 42161,
    name: "Arbitrum",
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
  },
  OPTIMISM: {
    id: 10,
    name: "Optimism",
    rpc: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
  },
};

export const TOKENS = {
  USDC: {
    symbol: "USDC",
    decimals: 6,
    address: {
      [CHAINS.BASE.id]: "0x833589fcd6edb6e08f4c7c32d4f71b1566469c18", // Base Mainnet
      [CHAINS.BASE_SEPOLIA.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    },
  },
  USDT: {
    symbol: "USDT",
    decimals: 6,
    address: {
      [CHAINS.BASE.id]: "0xfde4C96c8593536E31F26A3d5669F4748129081",
    },
  },
  ETH: {
    symbol: "ETH",
    decimals: 18,
    address: {},
  },
};
