"use client";

import { useParams } from "next/navigation";
import { useGetEscrow, useReleaseFunds, useRequestRefund } from "@/hooks/useEscrowContract";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { ReleaseAndBridgeButton } from "@/components/escrow/ReleaseAndBridgeButton";
import { ReleaseWithSignatureModal } from "@/components/escrow/ReleaseWithSignatureModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { TransactionLogViewer, AddTransactionLog } from "@/components/escrow/TransactionLogViewer";
import { InstallmentScheduleUI } from "@/components/escrow/InstallmentScheduleUI";
import { getDemoEscrows, isDemoMode } from "@/lib/demo";

export default function EscrowDetailPage() {
  const params = useParams();
  const escrowId = parseInt(params.id as string);
  const { address: userAddress } = useAccount();
  const { escrow: onChainEscrow, isLoading } = useGetEscrow(escrowId);
  const { releaseFunds, isLoading: isReleasing, error: releaseError } = useReleaseFunds();
  const { requestRefund, isLoading: isRefunding, error: refundError } = useRequestRefund();
  const [targetChain, setTargetChain] = useState(8453); // Base mainnet by default
  const [escrow, setEscrow] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [releaseTxStatus, setReleaseTxStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [refundTxStatus, setRefundTxStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Fix hydration error by ensuring client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for demo escrows first
  useEffect(() => {
    if (isDemoMode()) {
      const demoEscrows = getDemoEscrows();
      const demoEscrow = demoEscrows.find(e => e.id === escrowId.toString());
      if (demoEscrow) {
        // Convert demo escrow to tuple format matching contract
        setEscrow([
          demoEscrow.client,
          demoEscrow.freelancer,
          BigInt(demoEscrow.amount),
          demoEscrow.funded,
          demoEscrow.released,
          demoEscrow.refunded,
          demoEscrow.deadline,
          BigInt(0), // totalInstallments
          BigInt(0), // installmentsPaid
          BigInt(0), // installmentAmount
        ]);
        return;
      }
    }
    // Use on-chain data if no demo escrow found
    if (onChainEscrow) {
      setEscrow(onChainEscrow);
    }
  }, [escrowId, onChainEscrow]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center border border-border max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-danger mb-2 font-semibold text-lg">Escrow Not Found</p>
          <p className="text-slate-600 mb-6 text-sm">
            Escrow #{escrowId} doesn't exist yet or is still being created.
          </p>
          <div className="flex gap-3">
            <a href="/dashboard" className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
              ← Dashboard
            </a>
            <a href="/create" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
              Create Escrow
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Safely destructure escrow with defaults for missing fields
  const client = escrow?.[0];
  const freelancer = escrow?.[1];
  const usdcAmount = escrow?.[2] || BigInt(0);
  const funded = escrow?.[3] || false;
  const released = escrow?.[4] || false;
  const refunded = escrow?.[5] || false;
  const deadline = escrow?.[6] || BigInt(0);
  const totalInstallments = escrow?.[7] ? Number(escrow[7]) : 0;
  const installmentsPaid = escrow?.[8] ? Number(escrow[8]) : 0;
  const installmentAmount = escrow?.[9] || BigInt(0);

  const handleRelease = async () => {
    try {
      setReleaseTxStatus({
        status: "pending",
        message: "Releasing funds to freelancer...",
      });

      releaseFunds?.({
        args: [BigInt(escrowId)],
      });

      setReleaseTxStatus({
        status: "pending",
        message: "⏳ Waiting for transaction confirmation...",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setReleaseTxStatus({
        status: "error",
        message: `Error: ${errorMsg}`,
      });
    }
  };

  const handleRequestRefund = async () => {
    try {
      setRefundTxStatus({
        status: "pending",
        message: "Requesting refund...",
      });

      requestRefund?.({
        args: [BigInt(escrowId)],
      });

      setRefundTxStatus({
        status: "pending",
        message: "⏳ Waiting for transaction confirmation...",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setRefundTxStatus({
        status: "error",
        message: `Error: ${errorMsg}`,
      });
    }
  };

  const isClient = userAddress?.toLowerCase() === client?.toLowerCase();
  const isFreelancer = userAddress?.toLowerCase() === freelancer?.toLowerCase();
  const formattedAmount = formatUnits(usdcAmount || 0n, 6);
  const daysUntilRefund = Math.max(0, Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
  const hasInstallments = Number(totalInstallments) > 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/dashboard" className="text-primary hover:text-primary-hover mb-4 inline-block font-medium">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Escrow #{escrowId}</h1>
          <p className="text-muted">Secure payment management on Base Sepolia</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <p className="text-muted text-sm uppercase mb-2 font-medium">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">${formattedAmount}</p>
            <p className="text-muted text-sm mt-1">USDC</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <p className="text-muted text-sm uppercase mb-2 font-medium">Funded</p>
            <p className={`text-2xl font-bold ${funded ? "text-success" : "text-muted"}`}>
              {funded ? "✓ Yes" : "✗ No"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <p className="text-muted text-sm uppercase mb-2 font-medium">Released</p>
            <p className={`text-2xl font-bold ${released ? "text-success" : "text-muted"}`}>
              {released ? "✓ Yes" : "✗ No"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <p className="text-muted text-sm uppercase mb-2 font-medium">Status</p>
            <p className="text-2xl font-bold text-gray-900">
              {released ? (
                <span className="text-success">Completed</span>
              ) : refunded ? (
                <span className="text-danger">Refunded</span>
              ) : funded ? (
                <span className="text-info">Active</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </p>
          </div>
        </div>

        {/* Installment Schedule (if applicable) */}
        {hasInstallments && funded && !refunded && (
          <div className="mb-8">
            <InstallmentScheduleUI
              escrowId={escrowId.toString()}
              totalAmount={usdcAmount || 0n}
              totalInstallments={Number(totalInstallments)}
              installmentsPaid={Number(installmentsPaid)}
              isClient={isClient}
              freelancerAddress={freelancer}
            />
          </div>
        )}

        {/* Participant Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Client</h3>
            <p className="font-mono text-sm break-all mb-3 text-muted">{client}</p>
            {isClient && (
              <div className="bg-primary-light rounded-lg px-3 py-2 inline-block border border-primary/20">
                <p className="text-primary text-xs font-semibold">✓ Your Account</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Freelancer</h3>
            <p className="font-mono text-sm break-all mb-3 text-muted">{freelancer}</p>
            {isFreelancer && (
              <div className="bg-success/10 rounded-lg px-3 py-2 inline-block border border-success/20">
                <p className="text-success text-xs font-semibold">✓ Your Account</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Actions */}
        {isClient && (
          <div className="bg-white rounded-2xl shadow-card p-8 border border-border mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Client Actions</h2>

            {refunded && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
                <p className="text-warning font-medium">⚠️ Funds have been refunded to you</p>
              </div>
            )}

            {released && (
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
                <p className="text-success font-medium">✓ Funds have been released to the freelancer</p>
              </div>
            )}

            {!released && !refunded && !hasInstallments && (
              <div className="space-y-6">
                {/* Check if escrow is funded first */}
                {!funded && (
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <p className="text-warning font-medium">⚠️ Escrow must be funded before you can release funds</p>
                    <p className="text-warning/80 text-sm mt-2">Complete the deposit step first</p>
                  </div>
                )}

                {/* Release with Signature */}
                {funded && (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
                    <h3 className="font-semibold mb-2 text-gray-900">💳 Client-Signed Release</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Sign a release authorization that allows the freelancer to claim funds on-chain
                    </p>
                    <button
                      onClick={() => setShowSignatureModal(true)}
                      className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      🔏 Sign Release Authorization
                    </button>
                  </div>
                )}

                {/* Release Funds */}
                {funded && (
                  <div className="bg-background rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Release Full Payment</h3>

                    {releaseTxStatus.status !== "idle" && (
                      <div
                        className={`rounded-xl p-4 mb-4 text-sm font-medium ${
                          releaseTxStatus.status === "pending"
                            ? "bg-info/10 border border-info/20 text-info"
                            : releaseTxStatus.status === "success"
                            ? "bg-success/10 border border-success/20 text-success"
                            : "bg-danger/10 border border-danger/20 text-danger"
                        }`}
                      >
                        {releaseTxStatus.message}
                      </div>
                    )}

                    {releaseError && (
                      <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-4 text-sm text-danger font-medium">
                        {String(releaseError).includes("Already released") ? (
                          <>
                            <p className="font-semibold">✓ This escrow has already been released!</p>
                            <p className="text-sm mt-1">Refresh the page to see the updated status.</p>
                            <button
                              onClick={() => window.location.reload()}
                              className="mt-3 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
                            >
                              🔄 Refresh Page
                            </button>
                          </>
                        ) : (
                          releaseError instanceof Error ? releaseError.message : String(releaseError)
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleRelease}
                      disabled={isReleasing || releaseTxStatus.status === "pending"}
                      className="w-full bg-success hover:bg-success/90 disabled:bg-muted disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      {isReleasing || releaseTxStatus.status === "pending"
                        ? "⏳ Processing..."
                        : "✓ Release $" + formattedAmount + " to Freelancer"}
                    </button>

                    <p className="text-muted text-sm mt-3">
                      💡 Once released, funds will be securely transferred to the freelancer's wallet on Base Sepolia
                    </p>
                  </div>
                )}

                {/* Bridge to Destination */}
                {funded && (
                  <div className="bg-background rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Bridge to Destination Chain</h3>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-900 mb-2 font-medium">Select Destination Chain</label>
                      <select
                        value={targetChain}
                        onChange={(e) => setTargetChain(parseInt(e.target.value))}
                        className="w-full bg-white text-gray-900 px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition-all"
                      >
                        <option value={8453}>Base</option>
                        <option value={1}>Ethereum</option>
                        <option value={137}>Polygon</option>
                        <option value={42161}>Arbitrum</option>
                        <option value={10}>Optimism</option>
                      </select>
                    </div>

                    <ReleaseAndBridgeButton
                      escrowId={escrowId}
                      freelancerAddress={freelancer}
                      amount={formattedAmount}
                      fromChainId={targetChain}
                    />
                  </div>
                )}

                {/* Request Refund */}
                {daysUntilRefund === 0 && (
                  <div className="bg-background rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Request Refund</h3>

                    {refundTxStatus.status !== "idle" && (
                      <div
                        className={`rounded-xl p-4 mb-4 text-sm font-medium ${
                          refundTxStatus.status === "pending"
                            ? "bg-info/10 border border-info/20 text-info"
                            : refundTxStatus.status === "success"
                            ? "bg-success/10 border border-success/20 text-success"
                            : "bg-danger/10 border border-danger/20 text-danger"
                        }`}
                      >
                        {refundTxStatus.message}
                      </div>
                    )}

                    {refundError && (
                      <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-4 text-sm text-danger font-medium">
                        {refundError instanceof Error ? refundError.message : String(refundError)}
                      </div>
                    )}

                    <button
                      onClick={handleRequestRefund}
                      disabled={isRefunding || refundTxStatus.status === "pending"}
                      className="w-full bg-danger hover:bg-danger/90 disabled:bg-muted disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      {isRefunding || refundTxStatus.status === "pending"
                        ? "⏳ Processing..."
                        : "🔙 Request Refund"}
                    </button>

                    <p className="text-muted text-sm mt-3">
                      ⚠️ Refund deadline has passed. You can now request a refund to your wallet.
                    </p>
                  </div>
                )}

                {daysUntilRefund > 0 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <p className="text-warning text-sm font-medium">
                      💡 You can request a refund in <strong>{daysUntilRefund} day{daysUntilRefund !== 1 ? "s" : ""}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Freelancer Status */}
        {isFreelancer && (
          <div className="bg-white rounded-2xl shadow-card p-8 border border-border mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Payment Status</h2>

            {!funded && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                <p className="text-warning font-medium">⏳ Waiting for client to deposit funds...</p>
              </div>
            )}

            {funded && !released && (
              <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                <p className="text-info font-medium">💼 Escrow is funded and awaiting release from the client</p>
              </div>
            )}

            {released && (
              <div className="space-y-4">
                <div className="bg-success/10 border border-success/20 rounded-xl p-6">
                  <p className="text-success font-semibold text-lg">✓ Payment Released!</p>
                  <p className="text-success/80 mt-2">
                    ${formattedAmount} USDC has been securely transferred to your wallet
                  </p>
                </div>

                <div className="bg-background rounded-xl p-4">
                  <p className="text-muted text-sm">
                    💡 You can now bridge your USDC to your preferred chain using the bridge functionality.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generic View (not client or freelancer) */}
        {!isClient && !isFreelancer && (
          <div className="bg-white rounded-xl shadow-card p-6 border border-border mb-8">
            <p className="text-muted">You are viewing this escrow as a third party</p>
          </div>
        )}

        {/* Transaction Log Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionLogViewer escrowId={escrowId.toString()} />
          
          {(isClient || isFreelancer) && (
            <AddTransactionLog escrowId={escrowId.toString()} />
          )}
        </div>
      </div>

      {/* Release with Signature Modal */}
      {showSignatureModal && (
        <ReleaseWithSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          escrowId={escrowId}
          remainingBalance={usdcAmount || BigInt(0)}
          freelancerAddress={freelancer}
          onSuccess={() => {
            setShowSignatureModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}