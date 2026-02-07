export const CHAINS = {
  BASE: {
    id: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
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
      [CHAINS.BASE.id]: "0xd9aAEc860b8A838435ACCCF6c7cced4f7f1CBD1f",
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
