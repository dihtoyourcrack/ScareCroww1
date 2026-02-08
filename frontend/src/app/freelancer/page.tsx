"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useAllEscrows } from "@/hooks/useAllEscrows";
import { formatUnits } from "viem";
import { getDemoEscrows, isDemoMode } from "@/lib/demo";
import { DemoWalletBalance } from "@/components/DemoWalletBalance";

export default function FreelancerPage() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const { escrows, isLoading } = useAllEscrows({ autoRefresh: false }); // Disabled auto-refresh

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get demo escrows if in demo mode
  const demoEscrows = isDemoMode() ? getDemoEscrows() : [];
  const demoFreelancerEscrows = demoEscrows.filter(
    (e) => e.freelancer?.toLowerCase() === address?.toLowerCase()
  );

  // Filter escrows where current user is the freelancer
  const onChainFreelancerEscrows = escrows.filter(
    (e) => e.freelancer?.toLowerCase() === address?.toLowerCase()
  );

  // Merge demo and on-chain escrows
  const freelancerEscrows = [...demoFreelancerEscrows, ...onChainFreelancerEscrows];

  // Only show funded escrows (actual incoming payments)
  const fundedEscrows = freelancerEscrows.filter(
    (e) => e.funded && e.amount && BigInt(e.amount) > 0n
  );

  const pendingPayments = fundedEscrows.filter((e) => e.status === "Deposited");
  const receivedPayments = fundedEscrows.filter((e) => e.status === "Released");
  
  const totalPending = pendingPayments.reduce((sum, e) => {
    if (e.amount) {
      return sum + parseFloat(formatUnits(BigInt(e.amount), 6));
    }
    return sum;
  }, 0);

  const totalReceived = receivedPayments.reduce((sum, e) => {
    if (e.amount) {
      return sum + parseFloat(formatUnits(BigInt(e.amount), 6));
    }
    return sum;
  }, 0);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Freelancer Portal</h1>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Freelancer Portal</h1>
          <p className="text-gray-300 mb-6">
            Connect your wallet to view incoming payments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Freelancer Portal</h1>
          <p className="text-gray-400">Track your incoming payments and completed work</p>
        </div>

        {/* Claim Funds CTA */}
        <div className="mb-8">
          <Link
            href="/freelancer/retrieve"
            className="block bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-sky-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">💳 Claim Your Funds</h2>
                <p className="text-sky-100">Request client-signed releases and withdraw your earnings</p>
              </div>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Pending Payments</div>
            <div className="text-3xl font-bold text-yellow-400">
              ${totalPending.toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {pendingPayments.length} escrow{pendingPayments.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Received Payments</div>
            <div className="text-3xl font-bold text-green-400">
              ${totalReceived.toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {receivedPayments.length} payment{receivedPayments.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Total Earnings</div>
            <div className="text-3xl font-bold text-blue-400">
              ${(totalPending + totalReceived).toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {fundedEscrows.length} total project{fundedEscrows.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm mr-3">
                {pendingPayments.length}
              </span>
              Pending Payments
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Escrow ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pendingPayments.map((escrow) => {
                    const isDemo = !!(escrow as any).isDemo;
                    return (
                      <tr key={escrow.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          #{escrow.id}
                          {isDemo && (
                            <span className="ml-2 text-xs text-blue-400 opacity-60">demo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {escrow.client ? `${escrow.client.slice(0, 6)}...${escrow.client.slice(-4)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-400">
                          ${
                            escrow.amount
                              ? (() => {
                                  try {
                                    return parseFloat(formatUnits(BigInt(escrow.amount), 6)).toFixed(2);
                                  } catch {
                                    return parseFloat(escrow.amount).toFixed(2);
                                  }
                                })()
                              : '0.00'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            Awaiting Release
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/freelancer/retrieve`}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Claim Funds →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Received Payments Section */}
        {receivedPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm mr-3">
                {receivedPayments.length}
              </span>
              Received Payments
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Escrow ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {receivedPayments.map((escrow) => {
                    const isDemo = !!(escrow as any).isDemo;
                    return (
                      <tr key={escrow.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          #{escrow.id}
                          {isDemo && (
                            <span className="ml-2 text-xs text-blue-400 opacity-60">demo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {escrow.client ? `${escrow.client.slice(0, 6)}...${escrow.client.slice(-4)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                          ${
                            escrow.amount
                              ? (() => {
                                  try {
                                    return parseFloat(formatUnits(BigInt(escrow.amount), 6)).toFixed(2);
                                  } catch {
                                    return parseFloat(escrow.amount).toFixed(2);
                                  }
                                })()
                              : '0.00'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            ✓ Released
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/freelancer/retrieve`}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            View Claim →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {fundedEscrows.length === 0 && !isLoading && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Incoming Payments Yet
            </h3>
            <p className="text-gray-500">
              When clients deposit funds for your work, they'll appear here.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-400">Loading your escrows...</p>
          </div>
        )}
      </div>
    </div>
  );
}
