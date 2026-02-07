# Integration Guide for Cross-Chain Escrow

## 1. Smart Contract Integration

### Step 1: Verify Contract ABI

Ensure your contract ABI is in the correct format:

```bash
# Copy ABI from hardhat artifacts
cp contracts/artifacts/contracts/FreelanceEscrow.sol/FreelanceEscrow.json \
   frontend/abi/FreelanceEscrow.json
```

### Step 2: Update Contract Address

In `frontend/src/lib/contracts.ts`:

```typescript
export const ESCROW_ADDRESS = "0xYourContractAddress" as `0x${string}`;
export const ESCROW_ABI = abi.abi || abi;
```

### Step 3: Deploy JobBadge (Optional)

```bash
cd contracts

# Deploy JobBadge contract
npx hardhat run scripts/deploy.ts --network base
```

Update the JobBadge address in your environment variables.

---

## 2. Wallet Connection Setup

### RainbowKit Configuration

In `frontend/src/app/layout.tsx` (or your provider setup):

```tsx
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { baseMainnet, ethereum, polygon, arbitrum, optimism } from 'wagmi/chains';

const { connectors } = getDefaultWallets({
  appName: 'CrossChain Escrow',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

const config = createConfig({
  connectors,
  transports: {
    [baseMainnet.id]: http(),
    [ethereum.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});

export default function RootLayout() {
  return (
    <html>
      <body>
        <WagmiConfig config={config}>
          <RainbowKitProvider>
            {/* Your app */}
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
```

---

## 3. Environment Configuration

### Create `.env.local`

```env
# Contract Deployment
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_JOBBADGE_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_NETWORK_ID=8453
NEXT_PUBLIC_NETWORK_NAME=base

# Wallet Connect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_id

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_JWT=your_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# LI.FI Bridge
NEXT_PUBLIC_LIFI_API_KEY=your_api_key
NEXT_PUBLIC_LIFI_API_URL=https://li.quest/v1

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

---

## 4. IPFS Setup with Pinata

### Get Pinata API Credentials

1. Sign up at https://pinata.cloud
2. Create an API key
3. Copy the JWT token
4. Add to `.env.local`

### Alternative: Self-hosted IPFS

Modify `frontend/src/lib/ipfs.ts`:

```typescript
const IPFS_API = "http://localhost:5001"; // Your IPFS node

export async function uploadToIPFS(data) {
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(data)]);
  formData.append('file', blob);

  const response = await fetch(`${IPFS_API}/api/v0/add`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  return {
    ipfsHash: result.Hash,
    pinataUrl: `ipfs://${result.Hash}`,
  };
}
```

---

## 5. LI.FI Bridge Setup

### Configuration

LI.FI is already configured in `frontend/src/lib/lifi.ts`.

### Test Bridge Functionality

```typescript
// In your component
import { useLiFiBridge } from '@/hooks/useLiFiBridge';

export function TestBridge() {
  const { bridgeUSDC, bridgeLoading } = useLiFiBridge();

  const testBridge = async () => {
    const result = await bridgeUSDC({
      fromChain: 8453,    // Base
      toChain: 1,         // Ethereum
      amount: '1000000',  // 1 USDC
      fromAddress: userAddress,
      toAddress: userAddress,
    });
    console.log('Bridge result:', result);
  };

  return <button onClick={testBridge}>Test Bridge</button>;
}
```

---

## 6. Database (Optional)

### For Storing Additional Metadata

```typescript
// Example with Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Store escrow metadata
async function storeEscrowMetadata(escrowId: number, data: any) {
  const { error } = await supabase
    .from('escrows')
    .insert([{
      id: escrowId,
      ipfs_cid: data.messageCID,
      created_at: new Date(),
      ...data
    }]);

  if (error) throw error;
}
```

---

## 7. Notifications Setup

### Browser Notifications

```typescript
// Request permission on app load
import { requestNotificationPermission } from '@/hooks/useNotification';

useEffect(() => {
  requestNotificationPermission();
}, []);

// Send notification
import { sendEscrowNotification } from '@/hooks/useNotification';

sendEscrowNotification('released', escrowId, {
  amount: '1000 USDC',
  chain: 'Base',
});
```

### Firebase Cloud Messaging (Optional)

For cross-device notifications:

```bash
npm install firebase
```

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
```

---

## 8. Testing Integration

### Local Hardhat Testing

```bash
# Terminal 1: Start local network
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Run frontend
cd frontend
npm run dev
```

### Using Testnet

```bash
# Update .env.local
NEXT_PUBLIC_NETWORK_ID=84531  # Base Sepolia
NEXT_PUBLIC_ESCROW_ADDRESS=0x...  # Deployed address

# Run dev server
npm run dev
```

### Test Scenario

1. **Create Escrow**
   - Enter freelancer address
   - Set amount to 10 USDC
   - Add test message
   - Click create

2. **Deposit Funds**
   - Approve token
   - Confirm deposit

3. **Release**
   - Click release
   - Verify transaction

4. **Bridge** (if needed)
   - Select destination chain
   - Execute bridge
   - Wait for completion

---

## 9. Deployment to Production

### Vercel Deployment

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
vercel

# Set production environment variables in Vercel dashboard
```

### Environment Variables for Production

```env
# Use mainnet addresses
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=8453

# Secure API keys (set in Vercel dashboard, not .env.local)
NEXT_PUBLIC_PINATA_JWT=***
NEXT_PUBLIC_LIFI_API_KEY=***
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=***
```

### Security Checklist

- [ ] All API keys in Vercel secrets (not in code)
- [ ] CORS configured for API endpoints
- [ ] Rate limiting enabled
- [ ] Sentry configured for error tracking
- [ ] Analytics integrated
- [ ] Environment-specific logging

---

## 10. Monitoring & Analytics

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Event Analytics

```typescript
// Track important events
const trackEvent = (name: string, data?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, data);
  }
};

// Usage
trackEvent('escrow_created', { amount: 1000 });
trackEvent('funds_released', { escrowId: 1 });
```

---

## Troubleshooting Integration Issues

### Contract Not Found
```
Error: Contract address not set
→ Solution: Update NEXT_PUBLIC_ESCROW_ADDRESS in .env.local
```

### IPFS Upload Fails
```
Error: Failed to upload to IPFS
→ Solution: 
  1. Check PINATA_JWT is valid
  2. App will automatically fall back to localStorage
  3. Verify Pinata quota
```

### Bridge Not Working
```
Error: Bridge execution failed
→ Solution:
  1. Verify token liquidity on destination chain
  2. Check gas balance on destination
  3. Ensure destination chain is supported
  4. Check LI.FI API status
```

### Wallet Connection Issues
```
Error: Failed to connect wallet
→ Solution:
  1. Clear browser cache
  2. Try different wallet provider
  3. Check WALLETCONNECT_PROJECT_ID is valid
  4. Update RainbowKit version
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image';

// Good
<Image src="/logo.svg" alt="Logo" width={100} height={100} />

// Bad
<img src="/logo.svg" alt="Logo" />
```

### Code Splitting

```typescript
// Load components dynamically
const CreateForm = dynamic(() => import('@/components/escrow/CreateEscrowForm'), {
  loading: () => <LoadingSpinner />,
});
```

### Caching

```typescript
// Cache contract reads
import { useQuery } from '@tanstack/react-query';

const { data: escrow } = useQuery({
  queryKey: ['escrow', escrowId],
  queryFn: () => getEscrow(escrowId),
  staleTime: 30000, // 30 seconds
});
```

---

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run lint              # Run linter
npm run type-check        # Check TypeScript

# Production
npm run build             # Build for production
npm start                 # Start production server

# Testing
npm run test              # Run tests
npm run test:coverage     # Coverage report

# Contract interaction
npx hardhat verify 0x... --network base  # Verify contract
npx hardhat run scripts/deploy.ts --network base  # Deploy
```

---

**Last Updated:** February 2026
