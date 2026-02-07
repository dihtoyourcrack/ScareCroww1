# Testing Real Claim Flow with MetaMask

## Overview
The claim funds implementation supports both **demo mode** (simulated) and **real mode** (blockchain transactions).

## Prerequisites
- MetaMask browser extension installed
- Test account with sufficient balance for gas fees
- Access to a test network (Sepolia, Mumbai, etc.) or mainnet fork

## Testing Real Claims

### 1. **Prerequisites Setup**
```bash
cd a:\crosschain-escrow
npm run dev
# Dev server will start on available port (3000, 3001, 3002, etc.)
```

### 2. **Connect MetaMask Wallet**
- Open the app in browser (http://localhost:3010 or shown port)
- Click "Connect Wallet" / wallet button at top
- MetaMask popup opens → Connect your account
- Select network (Ethereum, Polygon, etc.)

### 3. **Navigate to Freelancer Claim Page**
- Go to `/freelancer` dashboard
- Find an escrow marked as "Awaiting Release"
- Click "Claim Funds →" button

### 4. **View Claim Modal**
The modal shows:
- **Available Balance**: Total funds the freelancer can claim
- **Recipient Address**: Your connected wallet (disabled field)
- **Amount to Claim**: Pre-filled with available balance (editable)
- **Message**: Required – describe what funds are for
- **MetaMask Status**: Blue button to open/verify MetaMask connection

### 5. **Fill in Claim Details**
```
Amount: 10.5 USDC
Message: Payment for website redesign completed January 2026
```

### 6. **Open MetaMask (Optional)**
- Click 🦊 **Open MetaMask** button
- Verifies MetaMask connection
- MetaMask popup opens (if not already connected)

### 7. **Confirm Claim**
- Click **Confirm Claim** button
- Browser automatically triggers these MetaMask popups:

#### First Popup: Chain Switch (if needed)
- MetaMask shows: "Switch to Ethereum Mainnet?"
- Click **Switch Network** ✅

#### Second Popup: Add Token (for ERC-20)
- MetaMask shows: "Add USDC to MetaMask?"
- Displays token details (address, symbol, decimals)
- Click **Add Token** ✅
- (Skip if using native token)

#### Third Popup: Approve Transaction
- MetaMask shows transaction details:
  - To: Freelancer wallet address
  - Amount: USDC amount
  - Gas: Estimated gas fee
- Click **Confirm** ✅

### 8. **Transaction Processing**
```
✅ Transaction sent: 0x123abc...
⏳ Waiting for confirmation...
✅ Transaction confirmed: 0x123abc...
```

### 9. **Success Screen**
```
✅ Claim Complete!

Amount: 10.5 USDC
Recipient: 0xbbbb...bbbb
Transaction: 0x123a...c789
Message: Payment for website redesign...

🔗 View on block explorer: [BlockScan Link]
```

### 10. **Verify in MetaMask**
- Open MetaMask wallet
- Check **Activity** tab
- See sent transaction with status ✅ Confirmed

## Expected Behavior

### Successful Transaction
1. MetaMask popups appear in sequence
2. User signs transaction
3. Transaction sent to blockchain
4. Receipt shows transaction hash
5. Funds transferred to recipient wallet
6. Escrow marked as claimed

### Error Scenarios

| Scenario | Response |
|----------|----------|
| User cancels MetaMask popup | "Transaction was cancelled by user" |
| Insufficient gas balance | "Insufficient balance to complete transfer" |
| Wrong network | Chain switch popup shows correct network |
| No MetaMask installed | "MetaMask not found. Please install MetaMask." |
| Invalid recipient | Form validation prevents submission |

## Console Debugging

Open browser DevTools (F12 → Console) to see detailed logs:

```
📱 Calling notifyWallet with: { chainId, tokenAddr, tokenSym, tokenDec, escrowData }
📋 Requesting accounts from MetaMask...
✅ Accounts connected: [0xaaaa...]
🔗 Switching to chain: 0x1 (THIS WILL SHOW A POPUP)
✅ Chain switched
🪙 Requesting to watch token: 0xA0b...
✅ Token added to MetaMask
✅ MetaMask integration complete
🔐 Creating ethers provider...
✅ Signer obtained: 0xbbbb...
💳 Performing ERC-20 transfer...
Transferring 10.5 tokens to 0xbbbb...
📤 Transaction sent: 0x123abc789...
✅ Transaction confirmed: 0x123abc789...
✅ Claim successful: { escrowId, amount, message, txHash, ... }
```

## Demo Mode vs Real Mode

### Demo Mode (NEXT_PUBLIC_DEMO_MODE=true)
- No MetaMask required
- Simulates transfers via localStorage
- Instant balance updates
- Good for UI/UX testing

### Real Mode (Production)
- MetaMask required
- Real blockchain transactions
- Actual gas fees charged
- Recipient receives real funds

To toggle demo mode:
```javascript
// In browser console:
localStorage.setItem('demo:enabled', '1')  // Enable demo
localStorage.removeItem('demo:enabled')    // Disable demo
location.reload()
```

## Troubleshooting

### MetaMask Popup Not Showing?
1. Check MetaMask is unlocked
2. Check browser popup settings allow MetaMask
3. Try clicking "Open MetaMask" button explicitly
4. Check console for error messages (F12)

### Transaction Fails?
1. Verify sufficient gas balance
2. Check correct network selected
3. Verify recipient address is valid Ethereum address
4. Check token has sufficient balance

### Balance Not Updating?
1. Refresh MetaMask wallet
2. Check transaction is confirmed on block explorer
3. Verify contract address is correct
4. Check for token decimals mismatch

## Next Steps

1. Test on testnet first (Sepolia, Mumbai)
2. Verify funds arrive in recipient wallet
3. Check transaction on block explorer
4. Test with multiple installments
5. Test error scenarios

---

Generated: 2026-02-06
Implementation: Real claim flow with ethers v6 and MetaMask integration
