# Demo Mode Implementation Guide

## Overview

Demo mode allows the application to appear to complete transactions instantly (<3 seconds) for presentation and demonstration purposes, while still submitting real blockchain transactions in the background.

## Features

- ⚡ **Instant Transaction Feedback** - Users see success messages in ~800ms
- 💾 **Persistent Demo Data** - Demo escrows persist across page refreshes using localStorage
- 🎭 **Convincing UX** - Realistic transaction hashes and seamless integration
- 🔄 **Background Real Transactions** - Actual blockchain transactions still submitted (non-blocking)
- 🏷️ **Subtle Indicators** - Small "demo" badges to maintain transparency

## Configuration

### Enable Demo Mode

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

Set to `false` for production with real blockchain transactions.

### Optional Settings

```bash
# Customize demo transaction delay (default: 800ms)
NEXT_PUBLIC_DEMO_FAKE_TX_TIME_MS=800
```

## How It Works

### 1. Create Escrow Flow

**Demo Mode ON:**
1. User submits create escrow form
2. Demo escrow created instantly (~800ms) with fake transaction hash
3. Success message displayed immediately
4. User auto-redirected to dashboard after 2 seconds
5. Real blockchain transaction submitted in background (non-blocking)

**Demo Mode OFF:**
- Standard wagmi contract write with full transaction confirmation waiting

### 2. Data Storage

Demo data is stored in browser localStorage:

- **Escrows:** `demo:escrows` - Array of demo escrow objects
- **Logs:** `demo:logs` - Array of transaction log entries
- **Counter:** `demo:counter` - Auto-incrementing escrow ID counter

### 3. Data Merging

UI components merge demo and on-chain data:

```typescript
const demoEscrows = isDemoMode() ? getDemoEscrows() : [];
const userEscrows = [...demoUserEscrows, ...onChainUserEscrows];
```

Demo items appear first in merged arrays for visibility.

### 4. Visual Indicators

- **Demo Badge:** Small "demo" text appears next to escrow IDs in tables
- **Demo Banner:** Top banner shows "⚡ Demo Mode Active" when enabled
- Styling: Subtle blue color with 60% opacity to avoid breaking immersion

## Architecture

### Core Utilities (`frontend/src/lib/demo.ts`)

**Configuration:**
- `isDemoMode()` - Check if demo mode is enabled
- `toggleDemoMode()` - Toggle demo mode on/off

**Demo Escrows:**
- `createDemoEscrow(params)` - Create instant demo escrow with fake hash
- `getDemoEscrows()` - Retrieve all demo escrows from localStorage
- `saveDemoEscrow(escrow)` - Save new demo escrow
- `updateDemoEscrow(id, updates)` - Update existing demo escrow

**Transaction Logs:**
- `getDemoLogs(escrowId?)` - Get demo transaction logs
- `saveDemoLog(log)` - Save new demo log entry

**Background Transactions:**
- `backgroundTx(txFn, onSuccess, onError)` - Execute real transaction non-blocking

**Utilities:**
- `makeFakeTxHash()` - Generate convincing 0x... transaction hash
- `simulateDelay(ms)` - Promise delay for realistic UX
- `getNextDemoId()` - Auto-incrementing ID generator
- `clearDemoData()` - Clear all demo data from localStorage

### Modified Components

**Create Escrow Form** (`CreateEscrowForm.tsx`)
- Dual-mode implementation
- Demo: Instant success with fake hash + background real tx
- Normal: Standard wagmi transaction flow

**Dashboard** (`dashboard/page.tsx`)
- Merges demo escrows with on-chain escrows
- Filters demo escrows by user address
- Displays demo badges in table

**Freelancer Portal** (`freelancer/page.tsx`)
- Merges demo payments with on-chain payments
- Shows demo badges for both pending and received payments
- Includes demo amounts in statistics

**Transaction Log Viewer** (`TransactionLogViewer.tsx`)
- Merges demo logs with on-chain transaction logs
- Converts demo logs to match TransactionLog interface

**Navigation** (`Navigation.tsx`)
- Shows demo mode banner when enabled
- Banner appears at top of navigation bar

## Demo Escrow Structure

```typescript
interface DemoEscrow {
  id: string;                    // Auto-incremented ID
  client: string;                // Client wallet address
  freelancer: string;            // Freelancer wallet address
  amount: string;                // Amount in token units
  token?: string;                // Token contract address
  funded: boolean;               // Always true for demos
  released: boolean;             // Payment released status
  refunded: boolean;             // Refund status
  status: "Created" | "Deposited" | "Released" | "Refunded";
  deadline: number;              // Unix timestamp
  isDemo: true;                  // Demo flag
  fakeTxHash: string;            // Fake transaction hash (0x...)
  realTxHash?: string;           // Real transaction hash (when available)
  backgroundTxPending?: boolean; // Background tx submission status
}
```

## Demo Log Structure

```typescript
interface DemoLog {
  escrowId: string;       // Associated escrow ID
  actor: string;          // Wallet address of actor
  reason: string;         // Log message/reason
  action: string;         // Action type (e.g., "Created", "Released")
  timestamp: number;      // Unix timestamp
  transactionHash?: string; // Optional fake tx hash
}
```

## Testing Demo Mode

### Quick Test Flow

1. **Enable demo mode:**
   ```bash
   # In frontend/.env.local
   NEXT_PUBLIC_DEMO_MODE=true
   ```

2. **Start development server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create demo escrow:**
   - Connect wallet
   - Fill out create escrow form
   - Submit form
   - Observe instant success message (~800ms)
   - Note fake transaction hash displayed
   - Auto-redirect to dashboard after 2s

4. **Verify dashboard:**
   - See new demo escrow immediately
   - Note "demo" badge next to escrow ID
   - Verify amount is displayed correctly
   - Check demo mode banner at top

5. **Check freelancer portal:**
   - Navigate to Freelancer Portal
   - Switch to freelancer wallet (or use same wallet for testing)
   - See demo escrow in pending/received payments
   - Verify demo badge appears

6. **Inspect background transaction:**
   - Open browser console (F12)
   - Look for background transaction submission logs
   - Real transaction will complete in background

### Clear Demo Data

```typescript
// In browser console
import { clearDemoData } from '@/lib/demo';
clearDemoData();
```

Or manually clear localStorage:
- `demo:escrows`
- `demo:logs`
- `demo:counter`

## Production Deployment

### Disable Demo Mode for Production

```bash
# In frontend/.env.local
NEXT_PUBLIC_DEMO_MODE=false
```

### Build and Deploy

```bash
cd frontend
npm run build
npm start
```

### Environment Variables

Ensure production environment has:
```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_ESCROW_ADDRESS=<your_contract_address>
NEXT_PUBLIC_BASE_RPC=<your_rpc_url>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your_project_id>
```

## Troubleshooting

### Demo escrows not appearing

- Verify `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
- Check browser console for errors
- Inspect localStorage for `demo:escrows` key
- Restart development server after changing env vars

### TypeScript errors

- Run `npm run build` to check for type errors
- Ensure all demo interfaces match component expectations
- Check that demo logs include `transactionHash` field

### Background transactions failing

- Check wallet is still connected
- Verify contract address is correct
- Check Base Sepolia testnet is online
- Inspect browser console for transaction errors

## Best Practices

1. **Clear Communication:** Always inform demo viewers that transactions are appearing instantly for demo purposes
2. **Limited Use:** Use demo mode only for presentations/demos, not in production
3. **Regular Testing:** Test both demo and normal modes regularly
4. **Data Cleanup:** Clear demo data between demo sessions for clean slate
5. **Transparency:** The demo badges maintain transparency without breaking immersion

## Future Enhancements

Potential improvements for demo mode:

- [ ] Admin panel to toggle demo mode via UI
- [ ] Demo mode time travel (simulate passage of time)
- [ ] Demo release/refund functionality
- [ ] Multiple wallet simulation
- [ ] Export/import demo scenarios
- [ ] Demo analytics dashboard

## API Reference

See `frontend/src/lib/demo.ts` for complete API documentation with JSDoc comments.
