# Cross-Chain Escrow Frontend Implementation Guide

Complete implementation of a modern cross-chain escrow platform with Web3 integration, IPFS messaging, and LI.FI bridge support.

## Project Overview

This is a **Next.js + Wagmi** frontend for a freelancer escrow system that enables:
- Secure multi-step escrow creation and funding
- Cross-chain payment transfers via LI.FI
- IPFS-based message storage
- Real-time transaction tracking
- Optional NFT badges for completed jobs
- Push notifications

## Features Implemented

### 1. Create Escrow Page + Form (`/create`)

**File:** [src/components/escrow/CreateEscrowForm.tsx](src/components/escrow/CreateEscrowForm.tsx)

**Features:**
- ✓ Freelancer ENS/address resolution
- ✓ Token selection (USDC, ETH, etc.)
- ✓ Amount and installment configuration
- ✓ Destination chain selection
- ✓ Optional message (uploaded to IPFS)
- ✓ Two-step flow: Create → Deposit
- ✓ Real-time transaction status
- ✓ Spinner and loading indicators

**Usage:**
```tsx
<CreateEscrowForm />
```

**Key Functions:**
- `handleCreateEscrow()` - Creates escrow on-chain
- `handleDepositFunds()` - Deposits tokens and approves spending
- `uploadMessageToIPFS()` - Stores message to IPFS or localStorage

---

### 2. Escrow Detail Page (`/escrow/[id]`)

**File:** [src/app/escrow/[id]/page.tsx](src/app/escrow/[id]/page.tsx)

**Features:**
- ✓ Show complete escrow information
- ✓ Display funded amount and installments
- ✓ Retrieve and display message from IPFS
- ✓ Destination chain information
- ✓ Release buttons for clients
- ✓ Bridge button for freelancers
- ✓ Transaction status tracking
- ✓ Role-based UI (client vs freelancer)

**Status Information:**
- Total amount, funding status, release status
- Participant addresses with role indicators
- Refund deadline countdown

**Client Actions:**
- Release funds to freelancer
- Request refund (after deadline)
- Bridge to destination chain

**Freelancer Status:**
- Payment waiting/received indicators
- Bridge options for cross-chain transfers

---

### 3. IPFS Integration (`/lib/ipfs.ts`)

**Features:**
- ✓ Pinata integration with automatic fallback
- ✓ localStorage fallback for demo mode
- ✓ Encrypts message with metadata
- ✓ Retrieval from IPFS or localStorage

**Functions:**
```typescript
uploadToIPFS(data)           // Upload to Pinata
retrieveFromIPFS(hash)       // Fetch from Pinata
uploadToLocalStorage(data)   // Fallback storage
retrieveFromLocalStorage(id) // Fallback retrieval
```

**Configuration:**
```env
NEXT_PUBLIC_PINATA_JWT=your_jwt_token
```

---

### 4. LI.FI Bridge Integration

**Files:**
- [src/hooks/useLiFiBridge.ts](src/hooks/useLiFiBridge.ts)
- [src/hooks/useBridge.ts](src/hooks/useBridge.ts)
- [src/lib/lifi.ts](src/lib/lifi.ts)

**Features:**
- ✓ Get bridge quotes across chains
- ✓ Execute bridge transactions
- ✓ Support for multiple chains (Base, Ethereum, Polygon, Arbitrum, Optimism)
- ✓ Transaction tracking and status updates
- ✓ Error handling and user feedback

**Supported Chains:**
- Base (8453)
- Ethereum (1)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)

**Usage:**
```typescript
const { bridgeUSDC, bridgeLoading, bridgeError } = useLiFiBridge();

const result = await bridgeUSDC({
  fromChain: 8453,
  toChain: 1,
  amount: "1000000", // 1 USDC
  fromAddress: "0x...",
  toAddress: "0x...",
});
```

---

### 5. Event Tracking (`/hooks/useEscrowEvents.ts`)

**Features:**
- ✓ Listen to all escrow contract events
- ✓ Real-time event updates
- ✓ Filter by escrow ID
- ✓ Track event types (Created, Deposited, Released, Refunded)

**Functions:**
```typescript
useEscrowEvents()           // Get all events
useEscrowEventsByID(id)     // Get events for specific escrow
```

---

### 6. Notification System (Optional)

**Files:**
- [src/hooks/useNotification.ts](src/hooks/useNotification.ts)
- [src/components/ui/NotificationContainer.tsx](src/components/ui/NotificationContainer.tsx)

**Features:**
- ✓ Toast notifications
- ✓ Browser push notifications (with permission)
- ✓ Escrow-specific notifications
- ✓ Auto-dismiss after 5 seconds
- ✓ Success/error/info/warning types

**Usage:**
```typescript
const { addNotification } = useNotification();

addNotification(
  "Payment Released",
  "Funds transferred to freelancer",
  "success"
);

// Or escrow-specific
sendEscrowNotification("released", 1, { amount: "1000" });
```

---

### 7. JobBadge NFT (Optional)

**File:** [contracts/contracts/JobBadge.sol](contracts/contracts/JobBadge.sol)

**Features:**
- ✓ ERC721 compliant NFT contract
- ✓ Mint badge on escrow completion
- ✓ Store escrow metadata on-chain
- ✓ Query badge by escrow ID
- ✓ Owner/admin control

**Functions:**
```solidity
mintBadge(
    uint256 escrowId,
    address freelancer,
    address client,
    uint256 amount,
    string memory description
) external returns (uint256 tokenId)

getBadgeMetadata(uint256 tokenId) external view returns (BadgeMetadata)
getBadgeByEscrow(uint256 escrowId) external view returns (uint256)
hasBadge(uint256 escrowId) external view returns (bool)
```

---

### 8. Dashboard Page (`/dashboard`)

**File:** [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)

**Features:**
- ✓ View all user escrows (as client or freelancer)
- ✓ Statistics (active, completed, volume)
- ✓ Recent activity feed
- ✓ Quick navigation to create new escrow
- ✓ Filter and sort escrows
- ✓ Role indicators

---

## Component Structure

```
src/
├── app/
│   ├── create/page.tsx                    # Create escrow page
│   ├── dashboard/page.tsx                 # Dashboard
│   ├── escrow/[id]/page.tsx              # Escrow detail page
│   └── layout.tsx
├── components/
│   ├── escrow/
│   │   ├── CreateEscrowForm.tsx          # Main form component
│   │   ├── EscrowDetailView.tsx          # Detail view
│   │   ├── ReleaseAndBridgeButton.tsx    # Release + bridge
│   │   ├── ReleaseButton.tsx             # Release only
│   │   └── EscrowCard.tsx                # Card display
│   └── ui/
│       ├── LoadingSpinner.tsx
│       └── NotificationContainer.tsx
├── hooks/
│   ├── useEscrowContract.ts              # Contract interactions
│   ├── useEscrowEvents.ts                # Event tracking
│   ├── useENS.ts                         # ENS resolution
│   ├── useLiFiBridge.ts                  # LI.FI integration
│   ├── useBridge.ts                      # Bridge wrapper
│   └── useNotification.ts                # Notifications
├── lib/
│   ├── contracts.ts                      # ABI and addresses
│   ├── ipfs.ts                           # IPFS upload/retrieve
│   ├── lifi.ts                           # LI.FI API
│   └── utils.ts                          # Utility functions
└── types/
    └── index.ts
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
# From frontend directory
npm install
# or
pnpm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Contract
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_NETWORK=8453

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token

# LI.FI (optional)
NEXT_PUBLIC_LIFI_API_KEY=your_lifi_api_key

# Wallet Connect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
```

### 3. Run Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Workflow Example

### Creating an Escrow

1. **Navigate to `/create`**
2. **Enter freelancer address or ENS** → Click Resolve
3. **Select token** (USDC, ETH, etc.)
4. **Enter amount and installments**
5. **Select destination chain** for freelancer
6. **(Optional) Add message** → Uploaded to IPFS
7. **Click "Create Escrow"** → Confirm transaction
8. **Step 2: Deposit Funds** → Review summary
9. **Click "Approve & Deposit"** → Confirm token approval + deposit

### Releasing Payment

1. **Navigate to escrow detail** `/escrow/1`
2. **Client views full information:**
   - Freelancer address
   - Amount and status
   - Message (if provided)
3. **Click "Release Funds to Freelancer"** → Confirm
4. **(Optional) Select chain** → Click "Bridge" to move across chains
5. **View transaction status** with spinner

### Freelancer Experience

1. **Waits for client** to deposit funds
2. **Receives notification** when funded
3. **Waits for release** from client
4. **Receives payment** on their address
5. **Can bridge** to different chain if needed
6. **(Optional) Receives JobBadge** NFT on completion

---

## API Reference

### useEscrowContract Hook

```typescript
// Create escrow
const { createEscrow, isLoading, hash, error } = useCreateEscrow();
createEscrow?.({ args: [freelancerAddress] });

// Deposit funds
const { depositFunds, isLoading, error } = useDepositFunds();
depositFunds?.({ args: [escrowId, tokenAddress, amount] });

// Release funds
const { releaseFunds, isLoading, error } = useReleaseFunds();
releaseFunds?.({ args: [escrowId] });

// Request refund
const { requestRefund, isLoading, error } = useRequestRefund();
requestRefund?.({ args: [escrowId] });

// Get escrow data
const { escrow, isLoading, error } = useGetEscrow(escrowId);
```

### IPFS Functions

```typescript
// Upload to IPFS
const { ipfsHash, pinataUrl } = await uploadToIPFS({
  message: "Great work!",
  timestamp: Math.floor(Date.now() / 1000),
});

// Retrieve from IPFS
const data = await retrieveFromIPFS(ipfsHash);

// Fallback: localStorage
const cid = uploadToLocalStorage({...});
const data = retrieveFromLocalStorage(cid);
```

### Bridge Functions

```typescript
const { bridgeUSDC, bridgeLoading, bridgeError } = useLiFiBridge();

const result = await bridgeUSDC({
  fromChain: 8453,
  toChain: 1,
  amount: "1000000",
  fromAddress: "0x...",
  toAddress: "0x...",
  tokenAddress: "0xUSDC", // Optional
});
```

---

## Error Handling

All components include comprehensive error handling:

```typescript
{error && (
  <div className="bg-red-900 border border-red-700 rounded-lg p-3">
    <p className="text-red-200 text-sm">
      {error instanceof Error ? error.message : String(error)}
    </p>
  </div>
)}
```

---

## Transaction Flow Diagram

```
User → Create Escrow (Contract Call)
        ↓
     Approve Token → Deposit Funds (Contract Call)
        ↓
     Freelancer Waits → Client Releases (Contract Call)
        ↓
     USDC Transferred → Bridge (LI.FI Call)
        ↓
     Funds on Destination Chain → Done!
        ↓
    (Optional) Mint JobBadge NFT
```

---

## Testing Checklist

- [ ] Create escrow with ENS resolution
- [ ] Deposit funds with token approval
- [ ] View escrow details with correct status
- [ ] Release funds to freelancer
- [ ] Request refund (after deadline)
- [ ] Bridge USDC to different chain
- [ ] Retrieve IPFS message
- [ ] View transaction hashes
- [ ] Check real-time event updates
- [ ] Test notifications
- [ ] Verify JobBadge minting

---

## Troubleshooting

### "Escrow not found"
- Check escrow ID in URL matches created escrow
- Ensure contract is deployed on correct chain

### IPFS upload fails
- Check PINATA_JWT is set correctly
- Falls back to localStorage automatically
- Check Pinata quota

### Bridge not working
- Verify LI.FI API key is set
- Check token liquidity on destination chain
- Ensure sufficient gas on destination

### Wallet connection issues
- Clear browser cache
- Reconnect wallet
- Try different wallet provider

---

## Future Enhancements

1. **Multi-currency support** - More token types
2. **Dispute resolution** - Arbitration mechanism
3. **Escrow templates** - Pre-configured escrows
4. **Dashboard charts** - Analytics and insights
5. **Mobile app** - React Native version
6. **DAO governance** - Community voting
7. **Insurance** - Payment protection
8. **Social features** - Reviews and ratings

---

## Security Considerations

- ✓ Uses wagmi for safe contract interactions
- ✓ No private keys stored in frontend
- ✓ Server-side IPFS with Pinata (no self-hosting)
- ✓ LI.FI for secure bridging
- ✓ Contract reentrancy guards
- ✓ Safe token transfer patterns
- ✓ Events for transparency

---

## Support & Resources

- **Documentation:** See inline JSDoc comments
- **Wagmi Docs:** https://wagmi.sh
- **Viem Docs:** https://viem.sh
- **LI.FI Docs:** https://docs.li.fi
- **Pinata Docs:** https://docs.pinata.cloud

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**License:** MIT
