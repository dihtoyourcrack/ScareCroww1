"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useAllEscrows } from "@/hooks/useAllEscrows";
import { formatUnits } from "viem";
import { ESCROW_ADDRESS } from "@/lib/contracts";
import { getDemoEscrows, isDemoMode } from "@/lib/demo";
import { TransactionLogViewer } from "@/components/escrow/TransactionLogViewer";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedEscrow, setExpandedEscrow] = useState<number | null>(null);
  const { escrows, isLoading } = useAllEscrows({ autoRefresh: false });

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

  // Filter escrows relevant to current user - SHOW ALL (funded and unfunded)
  const allUserEscrows = escrows.filter(
    (e) => 
      e.client?.toLowerCase() === address?.toLowerCase() ||
      e.freelancer?.toLowerCase() === address?.toLowerCase()
  );

  // Show ALL escrows in dashboard (including unfunded ones)
  const onChainUserEscrows = allUserEscrows; // No filter - show everything

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
      <div className="flex items-center justify-center min-h-screen text-text">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-text">Dashboard</h1>
          <p className="text-muted-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-text">Dashboard</h1>
          <p className="text-muted-text mb-6">Connect your wallet to view your escrows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-accent hover:opacity-90 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-text">Dashboard</h1>
          <p className="text-muted-text">
            Connected: <code className="bg-page-bg px-2 py-1 rounded text-sm">{address?.slice(0, 10)}...</code>
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-muted-text text-sm uppercase mb-2">Active Escrows</h3>
                <p className="text-3xl font-bold text-text">{activeEscrows.length}</p>
              </div>
              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-muted-text text-sm uppercase mb-2">Completed</h3>
                <p className="text-3xl font-bold text-text">{completedEscrows.length}</p>
              </div>
              <div className="bg-surface rounded-lg p-6">
                <h3 className="text-muted-text text-sm uppercase mb-2">Total Volume</h3>
                <p className="text-3xl font-bold text-text">${totalVolume.toFixed(2)}</p>
              </div>
            </div>

            {userEscrows.length === 0 ? (
              <div className="space-y-6">
                <div className="bg-surface rounded-lg p-12 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-text">No Escrows Yet</h2>
                    <p className="text-muted-text mb-6">
                    {escrows.length === 0 
                      ? "No escrows have been created on this contract yet."
                      : `Found ${escrows.length} total escrow(s), but none match your address.`}
                  </p>
                  <Link
                      href="/"
                      className="inline-block accent-bg hover:opacity-90 px-8 py-3 rounded-lg font-semibold transition"
                  >
                    Create Your First Escrow
                  </Link>
                </div>

                {/* Debug Panel */}
                <details className="bg-surface rounded-lg p-4">
                  <summary className="cursor-pointer text-sm text-muted-text hover:text-muted-text">
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
                      <pre className="bg-page-bg p-2 rounded mt-1 overflow-auto max-h-60">
                        {JSON.stringify(escrows, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-2 p-2 bg-surface rounded">
                      <p className="text-muted-text">💡 <strong>Tip:</strong> Open browser console (F12) for detailed logs</p>
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="space-y-4">
                  {userEscrows.map((escrow) => {
                  const isClient = escrow.client?.toLowerCase() === address?.toLowerCase();
                  const isDemo = !!(escrow as any).isDemo;
                  const statusColors: Record<string, string> = {
                    Created: "bg-warning/20 text-warning",
                    Deposited: "bg-info/20 text-info",
                    Released: "bg-success/20 text-success",
                    Refunded: "bg-danger/20 text-danger",
                  };
                  const statusClass = statusColors[(escrow.status as string) || ""] || 'bg-page-bg text-muted-text';
                  const isExpanded = expandedEscrow === escrow.id;

                  return (
                    <div key={escrow.id} className="bg-surface rounded-lg overflow-hidden border border-border">
                      {/* Escrow Summary Row */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-text font-mono">#{escrow.id}</span>
                            {isDemo && (
                              <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded font-semibold">DEMO</span>
                            )}
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${isClient ? 'accent-bg text-text' : 'bg-page-bg text-muted-text'}`}>
                              {isClient ? "👤 Client" : "💼 Freelancer"}
                            </span>
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${statusClass}`}>
                              {escrow.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-text">
                              {escrow.amount 
                                ? `$${parseFloat(formatUnits(BigInt(escrow.amount), 6)).toFixed(2)}` 
                                : "$0.00"}
                            </div>
                            <div className="text-sm text-muted-text">USDC</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-muted-text uppercase mb-1">Client</div>
                            <div className="text-sm text-text font-mono">{escrow.client?.slice(0, 10)}...{escrow.client?.slice(-8)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-text uppercase mb-1">Freelancer</div>
                            <div className="text-sm text-text font-mono">{escrow.freelancer?.slice(0, 10)}...{escrow.freelancer?.slice(-8)}</div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link
                            href={`/escrow/${escrow.id}`}
                            className="flex-1 text-center accent-bg hover:opacity-90 px-4 py-2 rounded-lg text-text font-semibold transition text-sm"
                          >
                            View Full Details →
                          </Link>
                          <button
                            onClick={() => setExpandedEscrow(isExpanded ? null : Number(escrow.id))}
                            className="px-4 py-2 bg-page-bg hover:bg-surface rounded-lg text-text text-sm font-semibold transition"
                          >
                            {isExpanded ? "Hide" : "Show"} Transaction Logs
                          </button>
                        </div>
                      </div>

                      {/* Transaction Logs Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-700 bg-gray-900 p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">📜 Transaction History</h3>
                          <TransactionLogViewer escrowId={String(escrow.id)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
