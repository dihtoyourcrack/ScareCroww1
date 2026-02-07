"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const facts = [
    "Secure escrow payments powered by smart contracts on Base Sepolia",
    "Support for installment-based payments for milestone projects",
    "EIP-712 signatures enable gasless payment authorizations",
    "Cross-chain bridging with Uniswap integration",
    "ENS domain support for human-readable addresses",
    "Complete transaction audit trail for transparency",
    "Zero custody - funds always secured in smart contracts",
    "Refund protection after deadline expiration",
  ];

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Marquee Facts Header */}
      <div className="bg-blue-950 border-b border-blue-800 py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm text-blue-200 mx-8">
            {facts[currentFactIndex]}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            RealSlimShady
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Decentralized escrow platform for secure freelance payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Launch App
            </Link>
            <Link
              href="/docs"
              className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              Documentation
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3">Secure Escrow</h3>
            <p className="text-gray-400">
              Smart contract-based escrow system ensures funds are protected until work is completed and approved
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-3">Cross-Chain</h3>
            <p className="text-gray-400">
              Bridge payments across multiple blockchains with Uniswap-powered token swaps
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-3">EIP-712 Signatures</h3>
            <p className="text-gray-400">
              Off-chain authorization allows freelancers to claim payments without client transactions
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Installment Payments</h3>
            <p className="text-gray-400">
              Split payments into multiple installments for milestone-based project delivery
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold mb-3">ENS Support</h3>
            <p className="text-gray-400">
              Use human-readable ENS names instead of complex wallet addresses for easy transfers
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
            <div className="text-3xl mb-4">📜</div>
            <h3 className="text-xl font-semibold mb-3">Transaction Logs</h3>
            <p className="text-gray-400">
              Complete audit trail of all escrow activities with timestamps and messages
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800 rounded-xl p-8 md:p-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Create Escrow</h3>
              <p className="text-sm text-gray-400">Set up escrow with freelancer address and payment amount</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Deposit Funds</h3>
              <p className="text-sm text-gray-400">Client deposits USDC into the smart contract</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Complete Work</h3>
              <p className="text-sm text-gray-400">Freelancer delivers agreed work with payment secured</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Paid</h3>
              <p className="text-sm text-gray-400">Client releases funds or provides signature to claim</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">Ready to get started?</p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Connect Wallet & Launch
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
