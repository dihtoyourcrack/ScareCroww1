# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Create     │  │   Dashboard  │  │   Escrow Detail     │  │
│  │   /create    │  │  /dashboard  │  │   /escrow/[id]      │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│         │                  │                     │              │
│         └──────────────────┼─────────────────────┘              │
│                            │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │               REACT COMPONENTS & HOOKS                    │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │ │
│  │  │   useEscrow     │  │   useLiFiBridge              │   │ │
│  │  │   Contract.ts   │  │   useBridge.ts               │   │ │
│  │  │                 │  │                              │   │ │
│  │  │ • createEscrow  │  │ • getQuote()                 │   │ │
│  │  │ • depositFunds  │  │ • executeRoute()             │   │ │
│  │  │ • releaseFunds  │  │ • trackStatus()              │   │ │
│  │  │ • requestRefund │  │                              │   │ │
│  │  └─────────────────┘  └──────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │ │
│  │  │   useENS.ts     │  │   useNotification.ts         │   │ │
│  │  │                 │  │                              │   │ │
│  │  │ • resolveENS()  │  │ • addNotification()          │   │ │
│  │  │ • getAddress()  │  │ • sendBrowser()              │   │ │
│  │  │                 │  │ • escrowNotifications()      │   │ │
│  │  └─────────────────┘  └──────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │ │
│  │  │   useEscrow     │  │   useBridge.ts (wrapper)     │   │ │
│  │  │   Events.ts     │  │                              │   │ │
│  │  │                 │  │ • bridge()                   │   │ │
│  │  │ • watchEvents() │  │ • trackTransaction()         │   │ │
│  │  │ • filterByID()  │  │ • getStatus()                │   │ │
│  │  └─────────────────┘  └──────────────────────────────┘   │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────── │ │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐               │
│         │                  │                  │               │
└─────────┼──────────────────┼──────────────────┼───────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   BLOCKCHAIN │  │   IPFS       │  │   LI.FI API  │
    │   (Wagmi)    │  │   (Pinata)   │  │   (Bridge)   │
    │              │  │              │  │              │
    │ • createEscrow
    │ • depositFunds│  │ • uploadMsg  │  │ • getQuote   │
    │ • releaseFunds│  │ • retrieveMsg│  │ • executeRoute
    │ • queryEscrow │  │              │  │              │
    │              │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### Escrow Creation Flow

```
User Input (Form)
    ↓
validateInputs()
    ↓
resolveENS (if needed)
    ↓
uploadMessageToIPFS() [optional]
    ↓
createEscrow() [Smart Contract]
    ↓
confirmTransaction()
    ↓
showSuccess / saveCID
    ↓
Proceed to Deposit Step
```

### Deposit Flow

```
User Submits Deposit
    ↓
parseAmount()
    ↓
approveToken() [ERC20 approval]
    ↓
waitForApproval()
    ↓
depositFunds() [Smart Contract]
    ↓
confirmTransaction()
    ↓
showSuccess
    ↓
Escrow Funded ✓
```

### Release & Bridge Flow

```
Client Clicks Release
    ↓
releaseFunds() [Smart Contract]
    ↓
confirmTransaction()
    ↓
Funds Sent to Freelancer ✓
    ↓
(Optional) Select Destination Chain
    ↓
bridgeUSDC() [LI.FI]
    ↓
getQuote()
    ↓
executeRoute()
    ↓
trackBridgeStatus()
    ↓
Funds on Destination Chain ✓
```

## Component Hierarchy

```
App (Layout)
│
├── RootLayout
│   ├── RainbowKitProvider
│   └── WagmiConfig
│
├── CreatePage (/create)
│   └── CreateEscrowForm
│       ├── Step 1: Escrow Details
│       │   ├── ENSInput
│       │   ├── TokenSelector
│       │   ├── AmountInput
│       │   ├── InstallmentInput
│       │   ├── ChainSelector
│       │   └── MessageInput
│       └── Step 2: Deposit
│           ├── SummaryDisplay
│           └── DepositButton
│
├── DashboardPage (/dashboard)
│   ├── StatsOverview
│   ├── ActivityFeed
│   └── EscrowTable
│       └── EscrowRow
│           └── ViewButton → Detail Page
│
├── EscrowDetailPage (/escrow/[id])
│   └── EscrowDetailView
│       ├── StatusOverview
│       ├── ParticipantInfo
│       ├── MessageDisplay
│       ├── ClientActions (conditional)
│       │   ├── ReleaseButton
│       │   ├── ChainSelector
│       │   └── ReleaseAndBridgeButton
│       └── FreelancerStatus (conditional)
│           └── PaymentStatus
│
└── Global Components
    ├── NotificationContainer
    ├── ConnectWallet
    └── ChainSelector
```

## State Management

```
Component State (React useState)
│
├── createForm: CreateEscrowForm.tsx
│   ├── freelancerInput, freelancerAddress
│   ├── token, amount, installments
│   ├── destinationChain, message
│   ├── txStatus (idle/pending/success/error)
│   └── step (create/deposit)
│
├── escrowDetail: [id]/page.tsx
│   ├── escrowData (from contract)
│   ├── message (from IPFS)
│   ├── txStatus (release/refund/bridge)
│   └── targetChain
│
├── bridge: useBridge.ts
│   ├── transactions []
│   ├── isLoading
│   └── error
│
├── notification: useNotification.ts
│   ├── notifications []
│   ├── addNotification()
│   └── removeNotification()
│
└── contract: useEscrowContract.ts
    ├── escrow data (from contract read)
    ├── isLoading
    ├── error
    └── hash (from contract write)
```

## Blockchain Interaction

```
Frontend (Wagmi)
    │
    ├─ useContractWrite() [Create, Deposit, Release, Refund]
    │   │
    │   └─ User's Wallet
    │       │
    │       └─ Smart Contract: FreelanceEscrow.sol
    │           ├── createEscrow(freelancer)
    │           ├── depositFunds(id, token, amount)
    │           ├── releaseFunds(id)
    │           └── requestRefund(id)
    │
    └─ useContractRead() [Get Escrow Data]
        │
        └─ Smart Contract: FreelanceEscrow.sol
            └── escrows[id] → (client, freelancer, amount, funded, released, deadline)
```

## External Services Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │   IPFS (Pinata)      │  │   LI.FI Bridge API       │   │
│  │                      │  │                          │   │
│  │ POST /ipfs/upload    │  │ GET  /quote              │   │
│  │   └─ CID returned    │  │ POST /routes/execute     │   │
│  │                      │  │   └─ Transaction details │   │
│  │ GET /ipfs/[hash]     │  │                          │   │
│  │   └─ Message data    │  │ Support Chains:          │   │
│  │                      │  │ • Base                   │   │
│  │ Fallback:            │  │ • Ethereum               │   │
│  │ localStorage         │  │ • Polygon                │   │
│  │                      │  │ • Arbitrum               │   │
│  │                      │  │ • Optimism               │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Escrow State Machine

```
                    ┌─────────┐
                    │  INIT   │
                    └────┬────┘
                         │
            ┌────────────▼────────────┐
            │   CREATED (on-chain)    │
            │ • Client set            │
            │ • Freelancer set        │
            │ • Amount: 0             │
            │ • Funded: false         │
            └────────────┬────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     DEPOSIT_PENDING         │
          │ • Waiting for deposit       │
          │ • Token approval underway   │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │      FUNDED                 │
          │ • Amount received           │
          │ • Funded: true              │
          │ • Released: false           │
          └──────────────┬──────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
    ┌───▼─────┐                   ┌──────▼────┐
    │REFUNDED │                   │ RELEASED  │
    │ (Timeout)                   │ • Paid    │
    │ • Funds returned to client  │ • Bridged │
    │ • Released: false           │ • Complete
    └─────────┘                   └───────────┘
```

## Sequence Diagram: Full Escrow Lifecycle

```
Client                App              Contract            Freelancer
  │                    │                  │                    │
  ├─ Create Escrow ────>                  │                    │
  │                    ├──────────────────>                     │
  │                    │      emit        │                    │
  │                    │   EscrowCreated  │                    │
  │                    <────────────────-─┤                    │
  │<──────────────────┤                   │                    │
  │                    │                  │                    │
  ├─ Approve Token ────>                  │                    │
  │                    │                  │                    │
  ├─ Deposit Funds ────>                  │                    │
  │                    ├──────────────────>                     │
  │                    │      emit        │                    │
  │                    │    Deposited     │                    │
  │                    <─────────────────┤                    │
  │<──────────────────┤                   │                    │
  │                    │                  │        Notify      │
  │                    │                  ├──────────────────>│
  │                    │                  │                    │
  ├─ View Escrow ─────>http://escrow/1    │                    │
  │                    ├─────────────────>│                    │
  │<──────────────────┤                   │                    │
  │                    │                  │                    │
  ├─ Release Funds ────>                  │                    │
  │                    ├──────────────────>                     │
  │                    │   safeTransfer   │                    │
  │                    │      emit        │                    │
  │                    │    Released      │                    │
  │                    <─────────────────┤                    │
  │<──────────────────┤                   │        USDC        │
  │                    │                  │     received   ──>│
  │                    │                  │                    │
  ├─ Bridge (LI.FI) ──>                   │                    │
  │                    ├─ Get Quote ─────────────────>        │
  │                    <─ Bridge Quote ────────────────        │
  │                    ├─ Execute Route ─────────────>        │
  │                    │   (Cross-chain)                       │
  │<───────────────────────────────────────────────>        │
  │    Funds on        │                  │         USDC on   │
  │    Destination     │                  │       Destination │
  │                    │                  │                    │
  └─────────────────────────────────────────────────────────────
```

---

**System Design:** Event-driven, asynchronous, blockchain-verified  
**Scalability:** Horizontal (frontend) + Smart Contract optimization  
**Reliability:** Multi-layer error handling + fallbacks
