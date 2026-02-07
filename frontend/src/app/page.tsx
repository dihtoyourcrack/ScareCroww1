"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import CreateEscrowForm from "@/components/escrow/CreateEscrowForm";

export default function Home() {
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-6">Cross-chain Escrow</h1>
        <p className="text-xl text-gray-300 mb-8">
          Secure freelance payments across multiple blockchains with confidence
        </p>

        {isMounted && isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-400">Smart contract managed escrow</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Cross-chain</h3>
              <p className="text-gray-400">Uniswap powered swaps</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Simple</h3>
              <p className="text-gray-400">ENS support for easy addresses</p>
            </div>
          </div>
        )}
      </div>

      {isMounted && isConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Create New Escrow</h2>
            <CreateEscrowForm />
          </div>

          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-center font-semibold transition"
              >
                View Dashboard
              </Link>
              <p className="text-gray-400 text-sm">
                Once you create an escrow, you'll receive an ID. Use it to deposit funds, release payments, or request refunds.
              </p>
              <div className="bg-gray-700 rounded-lg p-4 mt-4">
                <p className="text-gray-300 text-sm">
                  <strong>Network:</strong> Base Sepolia Testnet
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Contract:</strong>{" "}
                  <code className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {process.env.NEXT_PUBLIC_ESCROW_ADDRESS?.slice(0, 10)}...
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : isMounted ? (
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Connect your wallet using the button in the navigation bar to get started with creating and managing escrows.
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-300">Initializing wallet connection...</p>
        </div>
      )}
    </div>
  );
}
