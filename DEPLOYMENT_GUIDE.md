# Quick Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Wallet with Base Sepolia testnet ETH
- Git repository cloned

## Step 1: Deploy Smart Contract

```bash
cd contracts

# Compile contract with new functions
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia

# Note the deployed contract address!
# Example output: "FreelanceEscrow deployed to: 0x1234..."
```

**Copy the contract address** - you'll need it for frontend configuration.

## Step 2: Update Frontend Configuration

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_ESCROW_ADDRESS=0x... # Paste your deployed contract address here
```

## Step 3: Copy Updated ABI

```bash
cd contracts
npm run copy-abi
```

This copies the new contract ABI (with `cancelEscrow` and `logTransaction` functions) to the frontend.

## Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

## Step 5: Build & Test Locally

```bash
# Still in frontend directory
npm run build

# If build succeeds, start dev server
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Create an escrow
- ✅ Check dashboard (should be empty until funded)
- ✅ Deposit funds
- ✅ Verify escrow appears in dashboard
- ✅ Visit `/freelancer` page
- ✅ Add a transaction note
- ✅ Test delete on unfunded escrow

## Step 6: Production Deployment

### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_ESCROW_ADDRESS` = your contract address

### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

### Option C: Self-hosted
```bash
cd frontend
npm run build

# Serve the 'out' directory
npx serve out
```

## Testing Checklist

After deployment, test these workflows:

### Client Flow
1. Connect wallet
2. Create escrow (note: won't appear in dashboard yet)
3. Deposit funds (escrow now appears)
4. View dashboard - see escrow
5. Add transaction note: "Payment for Phase 1"
6. Release funds
7. Verify freelancer received payment

### Freelancer Flow
1. Connect wallet (use different address)
2. Visit `/freelancer` page
3. See pending payment
4. Wait for client to release
5. See payment move to "Received" section
6. Add transaction note: "Work completed, thank you"

### Delete Flow
1. Create escrow (don't fund it)
2. Go to dashboard
3. Escrow should NOT appear (unfunded)
4. Create another escrow and fund it
5. Now it appears
6. Try to delete - should fail (already funded)
7. Create third escrow without funding
8. Delete should work

## Common Issues

### "Module not found: Can't resolve '@shared/constants/chains'"
**Fix:** Ensure `tsconfig.json` has:
```json
"paths": {
  "@/*": ["src/*"],
  "@shared/*": ["../shared/*"]
}
```

### "Transaction reverted: Not client"
**Fix:** You're trying to cancel/release with wrong account. Switch wallet to client address.

### "Cannot cancel funded escrow"
**Fix:** This is expected behavior. Only unfunded escrows can be deleted.

### Build fails with viem/rainbowkit conflicts
**Fix:** Use `npm install --legacy-peer-deps` flag.

## Environment Variables Reference

### Required
```env
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
```

### Optional
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=... # For WalletConnect support
PINATA_JWT=... # For IPFS message storage (falls back to localStorage)
```

## Verifying Deployment

1. **Contract Verification (BaseScan)**
```bash
cd contracts
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS "ROUTER_ADDRESS" "USDC_ADDRESS"
```

2. **Frontend Testing**
- Visit your deployed URL
- Connect wallet
- Create → Fund → Release workflow
- Check `/dashboard` and `/freelancer` pages
- Test transaction logging

## Production Checklist

- [ ] Contract deployed to mainnet (not testnet)
- [ ] Contract verified on BaseScan
- [ ] Frontend environment variables set
- [ ] Build succeeds without warnings
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Transactions execute successfully
- [ ] Dashboard filtering works (no $0 rows)
- [ ] Freelancer portal shows correct data
- [ ] Transaction logs display correctly
- [ ] Delete function works for unfunded escrows
- [ ] Navigation links work
- [ ] Mobile responsive design verified

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify contract address in `.env.local`
3. Ensure wallet is on correct network (Base Sepolia/Base)
4. Check transaction logs in BaseScan
5. Review `DASHBOARD_AND_FREELANCER_IMPLEMENTATION.md` for detailed docs

## Rollback Plan

If you need to rollback to previous version:
1. Keep old contract address
2. Use old ABI
3. Remove new features from frontend code
4. Redeploy frontend with old config

Or simply point frontend to old contract address in `.env.local`.

---

**Deployment Status:** Ready for production! 🚀
