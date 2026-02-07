# Quick Start Guide - Cross-Chain Escrow

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Web3 wallet (MetaMask, Rainbow, etc.)
- (Optional) Pinata account for IPFS

## Setup Steps

### 1. Install Dependencies (1 minute)

```bash
cd frontend
npm install
# or
pnpm install
```

### 2. Configure Environment (1 minute)

Create `frontend/.env.local`:

```env
# Minimum required for demo
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id

# Optional: For production
NEXT_PUBLIC_ESCROW_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_LIFI_API_KEY=your_lifi_api_key
```

### 3. Start Dev Server (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Connect Wallet (1 minute)

- Click "Connect Wallet" button
- Select your preferred wallet
- Approve connection

### 5. Create Test Escrow (1 minute)

1. Go to `/create`
2. Enter a freelancer address or ENS name
3. Set amount (e.g., 10)
4. Click "Create Escrow"
5. Approve transaction in wallet
6. Follow Step 2 to deposit funds

## Key URLs

- Home: http://localhost:3000
- Create: http://localhost:3000/create
- Dashboard: http://localhost:3000/dashboard
- Escrow Details: http://localhost:3000/escrow/1

## Common Tasks

### View Created Escrows

```bash
# Navigate to dashboard
http://localhost:3000/dashboard
```

### Test Bridge Functionality

1. Create and fund an escrow
2. Go to escrow detail page
3. Select destination chain
4. Click "Release & Bridge"

### Check IPFS Messages

- Messages uploaded to IPFS automatically
- Falls back to localStorage if Pinata JWT not set
- View message on escrow detail page

## Troubleshooting

### Wallet Won't Connect
```
→ Clear browser cache
→ Try different wallet provider
→ Check WalletConnect Project ID
```

### "Escrow not found"
```
→ Create escrow first
→ Check contract address in .env
→ Verify on correct network
```

### IPFS Upload Fails
```
→ Check Pinata JWT is valid
→ App falls back to localStorage automatically
→ Check Pinata quota
```

### Bridge Not Working
```
→ Ensure sufficient gas on destination
→ Check token liquidity
→ Verify destination chain is supported
→ Check LI.FI API status
```

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✅ Yes | Wallet connection |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | ❌ No | Contract address |
| `NEXT_PUBLIC_PINATA_JWT` | ❌ No | IPFS uploads |
| `NEXT_PUBLIC_LIFI_API_KEY` | ❌ No | Bridge quotes |

## Get API Credentials

### WalletConnect (Required)
1. Go to https://cloud.walletconnect.com
2. Create new project
3. Copy Project ID
4. Add to `.env.local`

### Pinata (Optional)
1. Go to https://pinata.cloud
2. Create account
3. Generate API key
4. Copy JWT token
5. Add as `NEXT_PUBLIC_PINATA_JWT`

### LI.FI (Optional)
1. Go to https://li.fi
2. Request API access
3. Get API key
4. Add as `NEXT_PUBLIC_LIFI_API_KEY`

## Testing Scenarios

### Scenario 1: Basic Escrow
```
1. Create escrow with 10 USDC
2. Deposit funds
3. Release to freelancer
✅ Complete
```

### Scenario 2: With Message
```
1. Create escrow with message
2. Message uploaded to IPFS
3. View message on detail page
✅ Complete
```

### Scenario 3: Cross-Chain Bridge
```
1. Create and fund escrow
2. Release funds
3. Bridge to different chain
4. Funds appear on destination
✅ Complete
```

## File Locations

| Page | File | Route |
|------|------|-------|
| Create | `src/app/create/page.tsx` | `/create` |
| Dashboard | `src/app/dashboard/page.tsx` | `/dashboard` |
| Detail | `src/app/escrow/[id]/page.tsx` | `/escrow/1` |

## Component Locations

| Component | File |
|-----------|------|
| Create Form | `src/components/escrow/CreateEscrowForm.tsx` |
| Detail View | `src/components/escrow/EscrowDetailView.tsx` |
| Bridge Button | `src/components/escrow/ReleaseAndBridgeButton.tsx` |
| Notifications | `src/components/ui/NotificationContainer.tsx` |

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run lint         # Check code quality
npm run type-check   # TypeScript validation

# Production
npm run build        # Build for production
npm start            # Start production server

# Testing
npm run test         # Run tests
npm test:watch       # Watch mode
```

## Support

- **Documentation:** See [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
- **Detailed Guide:** See [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)
- **Component Docs:** See [FRONTEND_IMPLEMENTATION.md](../FRONTEND_IMPLEMENTATION.md)

## Next Steps

After getting familiar with the app:

1. **Deploy Smart Contract**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.ts --network base
   ```

2. **Update Contract Address**
   - Add deployed address to `.env.local`

3. **Enable IPFS**
   - Get Pinata JWT and add to `.env.local`

4. **Test Full Flow**
   - Create → Deposit → Release → Bridge

5. **Deploy Frontend**
   - Push to GitHub
   - Connect to Vercel
   - Set environment variables
   - Deploy!

---

**Ready to go!** 🚀

For more details, see the full documentation files.
