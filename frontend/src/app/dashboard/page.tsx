"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useAllEscrows } from "@/hooks/useAllEscrows";
import { formatUnits } from "viem";
import { ESCROW_ADDRESS } from "@/lib/contracts";
import { getDemoEscrows, isDemoMode } from "@/lib/demo";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const { escrows, isLoading } = useAllEscrows();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (escrows.length > 0) {
      console.log("📊 Dashboard - Total escrows found:", escrows.length);
      console.log("📊 Dashboard - All escrows:", escrows);
      console.log("📊 Dashboard - Your address:", address);
      console.log("📊 Dashboard - Your escrows:", userEscrows);
    }
  }, [escrows, address]);

  // Get demo escrows if in demo mode
  const demoEscrows = isDemoMode() ? getDemoEscrows() : [];
  const demoUserEscrows = demoEscrows.filter(
    (e) => 
      e.client?.toLowerCase() === address?.toLowerCase() ||
      e.freelancer?.toLowerCase() === address?.toLowerCase()
  );

  // Filter escrows relevant to current user (only funded escrows)
  const allUserEscrows = escrows.filter(
    (e) => 
      e.client?.toLowerCase() === address?.toLowerCase() ||
      e.freelancer?.toLowerCase() === address?.toLowerCase()
  );

  // Only show funded escrows in dashboard (filter out $0 and unfunded)
  const onChainUserEscrows = allUserEscrows.filter(
    (e) => e.funded && e.amount && BigInt(e.amount) > 0n
  );

  // Merge demo escrows with on-chain escrows (demo first for visibility)
  const userEscrows = [...demoUserEscrows, ...onChainUserEscrows];

  const activeEscrows = userEscrows.filter((e) => e.status === "Deposited");
  const completedEscrows = userEscrows.filter((e) => e.status === "Released");
  
  // Total volume: only count Deposited and Released (exclude Refunded)
  const totalVolume = userEscrows
    .filter((e) => e.status === "Deposited" || e.status === "Released")
    .reduce((sum, e) => {
      if (e.amount) {
        return sum + parseFloat(formatUnits(BigInt(e.amount), 6));
      }
      return sum;
    }, 0);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-300 mb-6">Connect your wallet to view your escrows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-300">
            Connected: <code className="bg-gray-700 px-2 py-1 rounded text-sm">{address?.slice(0, 10)}...</code>
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm uppercase mb-2">Active Escrows</h3>
                <p className="text-3xl font-bold">{activeEscrows.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm uppercase mb-2">Completed</h3>
                <p className="text-3xl font-bold">{completedEscrows.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm uppercase mb-2">Total Volume</h3>
                <p className="text-3xl font-bold">${totalVolume.toFixed(2)}</p>
              </div>
            </div>

            {userEscrows.length === 0 ? (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                  <h2 className="text-2xl font-bold mb-4">No Escrows Yet</h2>
                  <p className="text-gray-300 mb-6">
                    {escrows.length === 0 
                      ? "No escrows have been created on this contract yet."
                      : `Found ${escrows.length} total escrow(s), but none match your address.`}
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
                  >
                    Create Your First Escrow
                  </Link>
                </div>

                {/* Debug Panel */}
                <details className="bg-gray-800 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                    🔍 Debug Information (Click to expand)
                  </summary>
                  <div className="mt-4 space-y-2 text-xs font-mono">
                    <p><strong>Contract Address:</strong> {ESCROW_ADDRESS}</p>
                    <p><strong>Your Address:</strong> {address}</p>
                    <p><strong>Total Escrows Found:</strong> {escrows.length}</p>
                    <p><strong>Your Escrows:</strong> {userEscrows.length}</p>
                    <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
                    <div className="mt-2">
                      <strong>All Escrows:</strong>
                      <pre className="bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-60">
                        {JSON.stringify(escrows, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-2 p-2 bg-blue-900 rounded">
                      <p className="text-blue-200">💡 <strong>Tip:</strong> Open browser console (F12) for detailed logs</p>
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Role</th>
                      <th className="px-6 py-4 text-left font-semibold">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {userEscrows.map((escrow) => {
                      const isClient = escrow.client?.toLowerCase() === address?.toLowerCase();
                      const isDemo = !!(escrow as any).isDemo;
                      const statusColors: Record<string, string> = {
                        Created: "bg-yellow-900 text-yellow-200",
                        Deposited: "bg-blue-900 text-blue-200",
                        Released: "bg-green-900 text-green-200",
                        Refunded: "bg-red-900 text-red-200",
                      };

                      const statusClass = statusColors[(escrow.status as string) || ""] || 'bg-gray-900 text-gray-200';

                      return (
                        <tr key={escrow.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 font-mono">
                            #{escrow.id}
                            {isDemo && (
                              <span className="ml-2 text-xs text-blue-400 opacity-60">demo</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${isClient ? 'bg-purple-900 text-purple-200' : 'bg-indigo-900 text-indigo-200'}`}>
                              {isClient ? "Client" : "Freelancer"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {escrow.amount 
                              ? `$${parseFloat(formatUnits(BigInt(escrow.amount), 6)).toFixed(2)}` 
                              : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass}`}>
                              {escrow.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/escrow/${escrow.id}`}
                              className="text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                              View Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
