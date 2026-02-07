# EIP-712 Signature-Based Release Implementation

## Overview

This implementation adds a secure, per-escrow nonce-based EIP-712 signature flow that allows clients to authorize fund releases without requiring them to submit the transaction themselves. Freelancers can claim authorized funds by presenting a valid client signature.

## Smart Contract Changes

### New Features
- **Per-Escrow Nonces**: `mapping(uint256 => uint256) public nonces` provides replay protection scoped to each escrow
- **EIP-712 Domain**: Standard typed data domain with contract name, version, chainId, and verifying contract address
- **`releaseWithSignature` Function**: Verifies client signature and releases funds to freelancer

### Contract Functions

#### `releaseWithSignature(uint256 id, uint256 amount, uint256 nonce, bytes calldata signature)`
Releases funds using a client's EIP-712 signature.

**Parameters:**
- `id`: Escrow ID
- `amount`: Amount of USDC to release
- `nonce`: Current nonce for this escrow (must match `nonces[id]`)
- `signature`: Client's EIP-712 signature

**Security:**
- ✅ Verifies signature recovers to escrow client address
- ✅ Requires exact nonce match (per-escrow replay protection)
- ✅ Validates amount ≤ remaining balance
- ✅ Increments nonce after successful use
- ✅ Emits `ClaimReleased` and `TransactionLog` events

#### `nonceOf(uint256 id) external view returns (uint256)`
Returns the current nonce for an escrow (used to prepare signatures).

#### `hashRelease(uint256 id, uint256 nonce, uint256 amount) public view returns (bytes32)`
Helper to compute the EIP-712 digest for a release (useful for off-chain signature generation).

## Frontend Implementation

### New Hook: `useReleaseWithSignature`

Located in `frontend/src/hooks/useEscrowContract.ts`

**Features:**
- Reads current nonce from contract
- Builds EIP-712 typed data (domain + types + message)
- Requests in-app wallet signing via `walletClient.signTypedData`
- Submits `releaseWithSignature` transaction
- Supports manual signature paste for demos/testing

**Usage:**
```typescript
const { signAndRelease, isSigning, isSubmitting } = useReleaseWithSignature();

await signAndRelease(
  BigInt(escrowId),
  amountBigInt,
  nonce,
  optionalManualSignature // undefined for in-app signing
);
```

### New Component: `ReleaseWithSignatureModal`

Located in `frontend/src/components/escrow/ReleaseWithSignatureModal.tsx`

**Features:**
- Shows remaining balance and recipient
- Editable release amount
- Optional message field (logged via HTTP)
- Displays current nonce
- **In-app signing (default)**: Requests wallet signature automatically
- **Demo/Manual mode (toggle)**: Allows pasting pre-generated signatures for testing

**UI States:**
- Idle: Ready to sign
- Signing: Waiting for wallet signature
- Submitting: Transaction in progress
- Success: Release completed
- Error: Shows error message

### New Page: `/freelancer/retrieve`

Located in `frontend/src/app/freelancer/retrieve/page.tsx`

**Features:**
- Lists all active escrows where connected wallet is the freelancer
- Merges on-chain and demo escrows
- Shows escrow cards with remaining balance
- "Request Signed Release" button opens signature modal
- Handles demo mode gracefully

## EIP-712 Typed Data Structure

### Domain
```typescript
{
  name: "FreelanceEscrow",
  version: "1",
  chainId: chain.id,
  verifyingContract: ESCROW_ADDRESS
}
```

### Types
```typescript
{
  Release: [
    { name: "id", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "amount", type: "uint256" }
  ]
}
```

### Message
```typescript
{
  id: escrowId,
  nonce: currentNonce,
  amount: amountToRelease
}
```

## Security Considerations

### ✅ Implemented Protections
1. **Replay Protection**: Per-escrow nonces prevent signature reuse
2. **Cross-Contract Protection**: `verifyingContract` in domain prevents signature reuse on other contracts
3. **Cross-Chain Protection**: `chainId` in domain prevents signature reuse on other chains
4. **Amount Validation**: Contract validates `amount ≤ remaining balance`
5. **Signer Verification**: ECDSA recovery ensures only client can authorize releases

### Usage Flow

#### Client Signs Release
1. Client opens escrow detail page
2. Clicks "🔏 Sign Release Authorization"
3. Modal shows remaining balance, amount, and optional message
4. Client confirms → wallet prompts for EIP-712 signature
5. Signature can be shared with freelancer (or submitted immediately)

#### Freelancer Claims Funds
1. Freelancer goes to `/freelancer/retrieve`
2. Sees all active escrows where they are the freelancer
3. Clicks "Request Signed Release" on an escrow
4. If client has already signed: paste signature in manual mode
5. If client signing now: client signs in modal → tx submitted
6. Funds transferred to freelancer wallet

## Testing

### Manual Testing Steps

1. **Compile Contract:**
```bash
cd contracts
npx hardhat compile
```

2. **Deploy to Testnet:**
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

3. **Update Frontend:**
- Copy ABI: `contracts/artifacts/contracts/FreelanceEscrow.sol/FreelanceEscrow.json` → `frontend/abi/FreelanceEscrow.json`
- Update `NEXT_PUBLIC_ESCROW_ADDRESS` in `frontend/.env.local`

4. **Test In-App Signing:**
- Create escrow as client
- Deposit funds
- Open escrow detail page
- Click "Sign Release Authorization"
- Verify wallet prompts for EIP-712 signature
- Submit transaction
- Verify funds released and events emitted

5. **Test Manual Signature Mode:**
- Enable "Demo / Manual signature" toggle
- Generate signature offline or copy from previous signing
- Paste signature
- Submit transaction
- Verify same result as in-app signing

### Unit Test Coverage (TODO)

Add to `contracts/test/FreelanceEscrow.test.ts`:
- ✅ Valid signature releases funds
- ✅ Invalid signature reverts
- ✅ Wrong nonce reverts
- ✅ Nonce increments after use
- ✅ Signature cannot be replayed
- ✅ Amount exceeding balance reverts
- ✅ Events emitted correctly

## Files Modified/Created

### Smart Contracts
- ✅ `contracts/contracts/FreelanceEscrow.sol` - Added EIP-712 domain, nonces, `releaseWithSignature`

### Frontend Hooks
- ✅ `frontend/src/hooks/useEscrowContract.ts` - Added `useReleaseWithSignature`, `useGetNonce`

### Frontend Components
- ✅ `frontend/src/components/escrow/ReleaseWithSignatureModal.tsx` - New signature modal
- ✅ `frontend/src/components/escrow/TransactionLogViewer.tsx` - Updated to show signature releases

### Frontend Pages
- ✅ `frontend/src/app/escrow/[id]/page.tsx` - Added "Sign Release Authorization" button and modal
- ✅ `frontend/src/app/freelancer/retrieve/page.tsx` - New freelancer claim page

### Build Artifacts
- ✅ `frontend/abi/FreelanceEscrow.json` - Updated with `releaseWithSignature` function

## Deployment Checklist

- [ ] Contract compiled successfully (`npx hardhat compile`)
- [ ] Unit tests pass (`npx hardhat test`)
- [ ] Contract deployed to Base Sepolia
- [ ] ABI copied to frontend
- [ ] `NEXT_PUBLIC_ESCROW_ADDRESS` updated in `frontend/.env.local`
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Signature flow tested end-to-end on testnet
- [ ] Events logged correctly (on-chain + HTTP logs)
- [ ] Demo mode works with manual signatures

## Next Steps

1. Add comprehensive unit tests for signature verification
2. Deploy updated contract to Base Sepolia
3. Update frontend env with new contract address
4. Test end-to-end with real wallet signatures
5. Document signature generation for integrations
6. Consider adding a signature expiry timestamp for additional security
