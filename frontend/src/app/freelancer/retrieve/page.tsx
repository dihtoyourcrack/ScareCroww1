"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import ConnectWallet from "@/components/wallet/ConnectWallet";
import { useAllEscrows } from "@/hooks/useAllEscrows";
import EscrowCard from "@/components/escrow/EscrowCard";
import { ReleaseWithSignatureModal } from "@/components/escrow/ReleaseWithSignatureModal";
import ClaimFundsModal from "@/components/escrow/ClaimFundsModal";
import { isDemoMode, getDemoEscrows, addDemoBalance, markEscrowAsClaimed, isEscrowClaimed } from "@/lib/demo";
import { DemoWalletBalance } from "@/components/DemoWalletBalance";
import type { DemoEscrow } from "@/lib/demo";

export default function FreelancerRetrievePage() {
  const { address, isConnected } = useAccount();
  const { escrows, isLoading } = useAllEscrows();
  const [selectedEscrow, setSelectedEscrow] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge on-chain and demo escrows
  const demoEscrows = isDemoMode() ? getDemoEscrows() : [];
  const freelancerEscrows = isConnected && address
    ? [
        ...escrows.filter((e: any) => 
          e.freelancer?.toLowerCase() === address.toLowerCase() && 
          e.funded && 
          !e.released
        ),
        ...demoEscrows
          .filter((de: DemoEscrow) => 
            de.freelancer && de.freelancer.toLowerCase() === address.toLowerCase() &&
            de.funded &&
            !de.released
          )
          .map((de: DemoEscrow) => ({
            id: de.id,
            client: de.client,
            freelancer: de.freelancer,
            usdcAmount: BigInt(de.amount),
            funded: de.funded,
            released: de.released,
            refunded: de.refunded || false,
            deadline: typeof de.deadline === 'number' ? BigInt(de.deadline) : BigInt(0),
            totalInstallments: BigInt(0),
            installmentsPaid: BigInt(0),
            installmentAmount: BigInt(0),
            paidAmount: BigInt(0),
            remaining: BigInt(de.amount),
            isDemo: true,
          })),
      ]
    : [];

  const handleClaim = async (escrow: any) => {
    if (isDemoMode()) {
      // Instant claim without signatures
      if (isEscrowClaimed(escrow.id)) {
        alert('This escrow has already been claimed!');
        return;
      }
      
      addDemoBalance(
        address!,
        escrow.destinationChainId,
        escrow.amount,
        escrow.tokenAddress
      );
      markEscrowAsClaimed(escrow.id);
      alert(`Claim successful! ${escrow.amount} tokens added to your wallet.`);
      return;
    }
    
    // Real mode - existing logic
    // ...existing code...
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Retrieve Your Earnings</h1>
            <p className="text-lg text-slate-600">
              Connect your wallet to view and claim funds from your escrows
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-12 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-slate-600 mb-8">
              Please connect your wallet to view escrows where you are the freelancer
            </p>
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Retrieve Your Earnings</h1>
          <p className="text-lg text-slate-600">
            Request client-signed releases for your active escrows
          </p>

        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading your escrows...</p>
          </div>
        ) : freelancerEscrows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-12 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Active Escrows</h2>
            <p className="text-slate-600">
              You don't have any funded, unreleased escrows where you are the freelancer.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {freelancerEscrows.map((escrow: any) => {
                // Get amount - handle both on-chain escrows (amount as string) and demo escrows (usdcAmount as bigint)
                const usdcAmountBigInt: bigint = escrow.usdcAmount 
                  ? (typeof escrow.usdcAmount === 'bigint' ? escrow.usdcAmount : BigInt(escrow.usdcAmount))
                  : (escrow.amount ? BigInt(escrow.amount) : BigInt(0));
                const paidAmountBigInt: bigint = typeof escrow.paidAmount === 'bigint' 
                  ? escrow.paidAmount 
                  : BigInt(Number(escrow.paidAmount) || 0);
                const remaining: bigint = usdcAmountBigInt - paidAmountBigInt;
                const amount = formatUnits(usdcAmountBigInt, 6);
                const status = escrow.released ? "released" : escrow.funded ? "funded" : "pending";
                const escrowIdNum: number = typeof escrow.id === 'string' ? parseInt(escrow.id) : Number(escrow.id);
                
                return (
                  <div key={`escrow-${escrow.id}`} className="relative">
                    <EscrowCard
                      id={String(escrow.id)}
                      client={escrow.client}
                      freelancer={escrow.freelancer}
                      amount={amount}
                      funded={escrow.funded}
                      status={status}
                    />
                    {remaining > BigInt(0) && (
                      <button
                        onClick={() => setSelectedEscrow({ ...escrow, remaining })}
                        className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                      >
                        Request Signed Release / Claim
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedEscrow && isDemoMode() && (
        <ClaimFundsModal
          isOpen={true}
          onClose={() => setSelectedEscrow(null)}
          escrow={selectedEscrow}
          remainingBalance={selectedEscrow.remaining}
          onSuccess={() => window.location.reload()}
        />
      )}

      {selectedEscrow && !isDemoMode() && (
        <ReleaseWithSignatureModal
          isOpen={true}
          onClose={() => setSelectedEscrow(null)}
          escrowId={Number(selectedEscrow.id)}
          remainingBalance={selectedEscrow.remaining}
          freelancerAddress={selectedEscrow.freelancer}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
