# Cross-Chain Freelance Escrow Platform

A decentralized escrow platform for freelance payments with cross-chain bridge support, IPFS messaging, installment payouts, and EIP-712 signature authorization.

## 🌟 Features

- **Smart Contract Escrow** - Secure on-chain escrow with USDC payments
- **Cross-Chain Bridge** - Transfer funds across multiple chains via LI.FI
- **Installment Payments** - Support for milestone-based payment schedules
- **IPFS Messaging** - Decentralized message storage with Pinata
- **EIP-712 Signatures** - Gasless release authorization for clients
- **ENS Resolution** - Support for .eth domain names
- **Real-time Events** - Live transaction tracking and notifications
- **Demo Mode** - Instant transactions for testing and presentations
- **Trust-First Design** - Clean, professional UI focused on security

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.19
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Uniswap V3** - Token swaps

### Frontend
- **Next.js** 14 - React framework
- **TypeScript** - Type safety
- **Wagmi** + **Viem** - Ethereum interactions
- **RainbowKit** - Wallet connection
- **TailwindCSS** - Styling
- **React Query** - Data fetching

### Services
- **Pinata** - IPFS storage
- **LI.FI** - Cross-chain bridge
- **Base Sepolia** - Testnet deployment

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm**
- **MetaMask** or compatible Web3 wallet
- **Base Sepolia ETH** for gas fees ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

### 2. Configure Environment Variables

**Contracts** (`contracts/.env`):
```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

**Frontend** (`frontend/.env.local`):
```bash
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id

# Optional but recommended
NEXT_PUBLIC_ESCROW_ADDRESS=0x...  # Set after contract deployment
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_LIFI_API_KEY=your_lifi_api_key

# Optional features
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_HTTP_LOGGING_URL=https://your-logging-service.com
```

### 3. Deploy Smart Contract

```bash
# Compile contracts
pnpm compile

# Deploy to Base Sepolia
cd contracts
pnpm deploy

# Copy contract address to frontend/.env.local
```

### 4. Start Development Server

```bash
# From root directory
pnpm dev

# Or from frontend directory
cd frontend
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Frontend Implementation](FRONTEND_IMPLEMENTATION.md)** - Component documentation
- **[Integration Guide](INTEGRATION_GUIDE.md)** - API integration
- **[System Architecture](SYSTEM_ARCHITECTURE.md)** - Technical overview
- **[Demo Mode Guide](DEMO_MODE_GUIDE.md)** - Testing with demo mode
- **[Index](INDEX.md)** - Complete documentation index

## 🏗️ Project Structure

```
.
├── contracts/              # Smart contracts
│   ├── contracts/          # Solidity files
│   │   ├── FreelanceEscrow.sol
│   │   └── interfaces/
│   ├── scripts/            # Deployment scripts
│   └── test/              # Contract tests
│
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── types/        # TypeScript types
│   ├── abi/              # Contract ABIs
│   └── public/           # Static assets
│
├── scripts/              # Utility scripts
└── shared/               # Shared code
    ├── constants/        # Chain configs
    └── types/           # Shared types
```

## 💡 Usage

### Create an Escrow

1. Navigate to `/create`
2. Enter freelancer address or ENS name
3. Set amount and select token
4. Choose destination chain
5. Add optional message (stored on IPFS)
6. Create escrow → Deposit funds

### Release Payment

1. Go to escrow detail page `/escrow/[id]`
2. Click "Release Funds"
3. Optionally bridge to different chain
4. Confirm transaction

### Installment Payments

1. Create escrow with installments
2. Release installments one at a time
3. Track progress with visual schedule

### Signature-Based Release (EIP-712)

1. Client signs release authorization
2. Freelancer claims funds with signature
3. No gas fees for client's authorization

## 🌉 Supported Chains

- **Base** (8453)
- **Ethereum** (1)
- **Polygon** (137)
- **Arbitrum** (42161)
- **Optimism** (10)

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run contract tests
pnpm test

# Deploy contracts
pnpm deploy

# Start frontend dev server
pnpm dev

# Build frontend for production
pnpm --filter frontend build

# Clean all build artifacts
pnpm clean
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
```

### Frontend
```bash
cd frontend
pnpm test
```

### Demo Mode
Enable instant transactions for testing:
```bash
# In frontend/.env.local
NEXT_PUBLIC_DEMO_MODE=true
```

## 🔐 Security

- ✅ Audited OpenZeppelin contracts
- ✅ Reentrancy guards
- ✅ Safe token transfers
- ✅ EIP-712 signature verification
- ✅ No private keys in frontend
- ✅ Server-side IPFS storage

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Smart contract security
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [LI.FI](https://li.fi/) - Cross-chain bridge
- [Pinata](https://pinata.cloud/) - IPFS storage
- [Base](https://base.org/) - L2 blockchain

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/crosschain-escrow/issues)
- **Discord**: [Join our community](#)

## 🗺️ Roadmap

- [x] Basic escrow functionality
- [x] Cross-chain bridge integration
- [x] Installment payments
- [x] EIP-712 signatures
- [x] Demo mode
- [ ] Multi-currency support
- [ ] Dispute resolution
- [ ] Reputation system
- [ ] Mobile app
- [ ] DAO governance

---

**Built with ❤️ for the decentralized future**

**Version:** 1.0.0  
**Last Updated:** February 2026
