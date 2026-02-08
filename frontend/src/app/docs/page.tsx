"use client";

import Link from "next/link";
import { useState } from "react";
import LightRays from "@/components/ui/LightRays";
import dynamic from 'next/dynamic';

const FlowingMenu = dynamic(() => import('@/components/ui/FlowingMenu'), { ssr: false });

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "user">("overview");

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* LightRays Background */}
      <div className="fixed inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#6366f1"
          raysSpeed={0.5}
          lightSpread={0.8}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.2}
          fadeDistance={1.2}
          saturation={1.1}
        />
      </div>
      
      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-[1] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">RealSlimShady Documentation</h1>
          <p className="text-xl text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Everything you need to know about our secure escrow platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/20">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-6 py-3 font-semibold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              activeTab === "user"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            User Guide
          </button>
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-6 py-3 font-semibold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              activeTab === "technical"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Technical Guide
          </button>
        </div>

        {/* Content */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/10 shadow-2xl">
          {/* Flowing menu decorative column on wide screens */}
          {/* Decorative flowing menu removed per request (Mojave/Sonoma) */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4">What is RealSlimShady?</h2>
                <p className="text-gray-300 text-lg mb-4">
                  RealSlimShady is a decentralized escrow platform built on blockchain technology that ensures
                  secure payments between clients and freelancers. It eliminates trust issues by holding funds
                  in a smart contract until work is completed and approved.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">Secure Escrow</h3>
                    <p className="text-gray-300">
                      Funds are locked in smart contracts and only released when conditions are met,
                      protecting both parties from fraud.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">Cross-Chain Support</h3>
                    <p className="text-gray-300">
                      Works across multiple blockchain networks including Ethereum, Base, Polygon, and more.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">Installment Payments</h3>
                    <p className="text-gray-300">
                      Split payments into multiple installments for long-term projects with milestone-based releases.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">EIP-712 Signatures</h3>
                    <p className="text-gray-300">
                      Clients can authorize payments off-chain, allowing freelancers to claim funds without
                      client intervention.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">ENS Support</h3>
                    <p className="text-gray-300">
                      Use human-readable ENS names instead of complex wallet addresses for easier transactions.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">Transaction Logs</h3>
                    <p className="text-gray-300">
                      Complete audit trail of all escrow activities, timestamps, and messages for transparency.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Create Escrow</h3>
                      <p className="text-gray-300">
                        Client creates an escrow by specifying the freelancer's wallet address and the payment amount.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Deposit Funds</h3>
                      <p className="text-gray-300">
                        Client deposits the agreed amount in USDC or other supported tokens into the escrow contract.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Complete Work</h3>
                      <p className="text-gray-300">
                        Freelancer completes the agreed-upon work knowing that payment is secured in the contract.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Release Payment</h3>
                      <p className="text-gray-300">
                        Client approves the work and releases funds, or provides a signed authorization for the
                        freelancer to claim.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Receive Funds</h3>
                      <p className="text-gray-300">
                        Freelancer receives payment directly to their wallet, or can bridge to another blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "user" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4">User Guide</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Step-by-step instructions for using RealSlimShady as a client or freelancer.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-blue-400">For Clients (Payers)</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 1: Connect Your Wallet</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Click "Connect Wallet" in the navigation bar</li>
                      <li>Select your wallet provider (MetaMask, WalletConnect, etc.)</li>
                      <li>Approve the connection request</li>
                      <li>Ensure you're on the Base Sepolia network</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 2: Create an Escrow</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Navigate to the home page or "Create Escrow" page</li>
                      <li>Enter the freelancer's wallet address or ENS name</li>
                      <li>Specify the total payment amount in USDC</li>
                      <li>Choose number of installments (1 for single payment)</li>
                      <li>Add an optional message describing the work</li>
                      <li>Click "Create Escrow" and confirm the transaction</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 3: Deposit Funds</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>After escrow creation, you'll be prompted to deposit</li>
                      <li>First, approve the USDC token spending (one-time)</li>
                      <li>Then deposit the full amount into the escrow</li>
                      <li>Wait for both transactions to confirm on the blockchain</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 4: Release Payment</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Once work is complete, go to the escrow details page</li>
                      <li>Review the work and verify completion</li>
                      <li>Option A: Click "Release Full Payment" for immediate transfer</li>
                      <li>Option B: Click "Sign Release Authorization" to create an off-chain signature</li>
                      <li>Share the signature with the freelancer if using Option B</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 5: Request Refund (if needed)</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Only available after the refund deadline has passed</li>
                      <li>Go to the escrow details page</li>
                      <li>Click "Request Refund" if work was not delivered</li>
                      <li>Confirm the transaction to receive your funds back</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mt-12">
                <h3 className="text-2xl font-bold mb-4 text-green-400">For Freelancers (Payees)</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 1: Monitor Escrows</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Connect your wallet</li>
                      <li>Visit "Freelancer Portal" to see escrows where you're the recipient</li>
                      <li>Check "Dashboard" for all your active escrows</li>
                      <li>Wait for client to fund the escrow before starting work</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 2: Complete the Work</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Deliver the agreed-upon work to the client</li>
                      <li>Communicate with client about completion</li>
                      <li>Wait for client approval</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 3: Claim Your Payment</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>Visit "Claim Funds" page</li>
                      <li>Find your escrow in the list</li>
                      <li>If client released directly, funds are already in your wallet</li>
                      <li>If client provided a signature, click "Request Signed Release"</li>
                      <li>Enter the signature data and submit to claim</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-xl font-semibold mb-3">Step 4: Bridge to Other Chains (Optional)</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li>If you want funds on a different blockchain</li>
                      <li>Use the bridge functionality in the escrow details</li>
                      <li>Select your destination chain</li>
                      <li>Confirm the bridge transaction</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mt-12">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Common Questions</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">What tokens are supported?</h4>
                    <p className="text-gray-300">
                      Currently, USDC and ETH are supported. USDC is recommended for stable value transfers.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">What happens if there's a dispute?</h4>
                    <p className="text-gray-300">
                      If work is not delivered by the deadline, the client can request a refund. Communication
                      between both parties is essential to resolve disputes.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Are transaction fees required?</h4>
                    <p className="text-gray-300">
                      Yes, you'll pay network gas fees for blockchain transactions. Fees vary based on network
                      congestion but are typically low on Base Sepolia.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Can I cancel an escrow?</h4>
                    <p className="text-gray-300">
                      Once created and funded, escrows cannot be cancelled. However, clients can request a refund
                      after the deadline if work wasn't delivered.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "technical" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-4">Technical Documentation</h2>
                <p className="text-gray-300 text-lg mb-6">
                  In-depth technical details for developers and advanced users.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Architecture</h3>
                <div className="bg-gray-700 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Smart Contracts</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li><strong>FreelanceEscrow.sol:</strong> Main escrow contract handling creation, deposits, and releases</li>
                      <li><strong>Solidity Version:</strong> ^0.8.19-0.8.21</li>
                      <li><strong>Network:</strong> Base Sepolia Testnet (Chain ID: 84532)</li>
                      <li><strong>Contract Address:</strong> <code className="bg-gray-800 px-2 py-1 rounded">0xD81d0685ACF1d3Cd3FCbDCDE0B1F78260818678f</code></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-2 mt-4">Frontend Stack</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li><strong>Framework:</strong> Next.js 14 (App Router)</li>
                      <li><strong>Language:</strong> TypeScript 5.3.3</li>
                      <li><strong>Web3 Libraries:</strong> Wagmi 1.4.13, Viem 1.21.3</li>
                      <li><strong>Wallet Connection:</strong> RainbowKit 1.3.x</li>
                      <li><strong>Styling:</strong> TailwindCSS</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-2 mt-4">Development Tools</h4>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      <li><strong>Smart Contract Development:</strong> Hardhat</li>
                      <li><strong>Package Manager:</strong> pnpm (workspace monorepo)</li>
                      <li><strong>Testing:</strong> Hardhat test framework</li>
                      <li><strong>Type Generation:</strong> TypeChain</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-green-400">Smart Contract Functions</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-3 text-yellow-300">createEscrow</h4>
                    <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      function createEscrow(address _freelancer) external returns (uint256)
                    </code>
                    <p className="text-gray-300 mt-3">
                      Creates a new escrow with the specified freelancer address. Returns the escrow ID.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-3 text-yellow-300">depositFunds</h4>
                    <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      function depositFunds(uint256 _id, address _token, uint256 _amount) external
                    </code>
                    <p className="text-gray-300 mt-3">
                      Deposits the specified amount of tokens into the escrow. Requires prior token approval.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-3 text-yellow-300">releaseFunds</h4>
                    <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      function releaseFunds(uint256 _id) external
                    </code>
                    <p className="text-gray-300 mt-3">
                      Releases all funds from the escrow to the freelancer. Only callable by the client.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-3 text-yellow-300">releaseWithSignature</h4>
                    <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      function releaseWithSignature(uint256 _id, bytes memory _signature) external
                    </code>
                    <p className="text-gray-300 mt-3">
                      Allows freelancer to claim funds using a client-signed EIP-712 authorization.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-3 text-yellow-300">requestRefund</h4>
                    <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
                      function requestRefund(uint256 _id) external
                    </code>
                    <p className="text-gray-300 mt-3">
                      Allows client to request a refund after the deadline if work wasn't delivered.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-purple-400">EIP-712 Signature Schema</h3>
                <div className="bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">
                    RealSlimShady uses EIP-712 typed data signing for secure off-chain authorizations:
                  </p>
                  <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`{
  domain: {
    name: "FreelanceEscrow",
    version: "1",
    chainId: 84532,
    verifyingContract: "0xD81d0685ACF1d3Cd3FCbDCDE0B1F78260818678f"
  },
  types: {
    ReleaseAuthorization: [
      { name: "escrowId", type: "uint256" },
      { name: "freelancer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" }
    ]
  }
}`}
                  </code>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-red-400">Security Considerations</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Reentrancy Protection</h4>
                    <p className="text-gray-300">
                      All state-changing functions use OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Safe Token Transfers</h4>
                    <p className="text-gray-300">
                      Uses SafeERC20 library for all token transfers to handle non-standard ERC20 implementations.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Signature Validation</h4>
                    <p className="text-gray-300">
                      EIP-712 signatures are validated using ECDSA.recover to ensure authenticity and prevent replay attacks.
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Access Control</h4>
                    <p className="text-gray-300">
                      Only authorized parties (client or freelancer) can perform actions on their respective escrows.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-orange-400">Integration Guide</h3>
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-3">Contract ABI Location</h4>
                  <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto mb-4">
                    frontend/abi/FreelanceEscrow.json
                  </code>

                  <h4 className="text-lg font-semibold mb-3 mt-6">Environment Variables</h4>
                  <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`NEXT_PUBLIC_ESCROW_ADDRESS=0xD81d0685ACF1d3Cd3FCbDCDE0B1F78260818678f
NEXT_PUBLIC_NETWORK_ID=84532
NEXT_PUBLIC_ALCHEMY_API_KEY=your_api_key`}
                  </code>

                  <h4 className="text-lg font-semibold mb-3 mt-6">Example Integration</h4>
                  <code className="block bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`import { useContractWrite } from 'wagmi';
import { ESCROW_ABI, ESCROW_ADDRESS } from '@/lib/contracts';

const { write: createEscrow } = useContractWrite({
  address: ESCROW_ADDRESS,
  abi: ESCROW_ABI,
  functionName: 'createEscrow',
});

// Create escrow
createEscrow({
  args: ['0xFreelancerAddress'],
});`}
                  </code>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 text-pink-400">API Reference</h3>
                <div className="bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-300 mb-4">
                    All blockchain interactions are handled through Wagmi hooks. No traditional REST API is required.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <code className="text-yellow-300">useGetEscrow(id)</code>
                      <p className="text-gray-400 text-sm mt-1">Fetches escrow data by ID</p>
                    </div>
                    <div>
                      <code className="text-yellow-300">useAllEscrows()</code>
                      <p className="text-gray-400 text-sm mt-1">Fetches all escrows from the contract</p>
                    </div>
                    <div>
                      <code className="text-yellow-300">useCreateEscrow()</code>
                      <p className="text-gray-400 text-sm mt-1">Hook for creating new escrows</p>
                    </div>
                    <div>
                      <code className="text-yellow-300">useDepositFunds()</code>
                      <p className="text-gray-400 text-sm mt-1">Hook for depositing funds into escrow</p>
                    </div>
                    <div>
                      <code className="text-yellow-300">useReleaseFunds()</code>
                      <p className="text-gray-400 text-sm mt-1">Hook for releasing funds to freelancer</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p>Need more help? Visit our <Link href="/" className="text-blue-400 hover:text-blue-300">homepage</Link> or check the <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">dashboard</Link>.</p>
        </div>
      </div>
    </div>
  );
}
