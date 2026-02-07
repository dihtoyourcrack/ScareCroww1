"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useReleaseInstallment } from "@/hooks/useEscrowContract";
import { 
  generateInstallmentSchedule, 
  getNextInstallment, 
  getProgressPercentage,
  getRemainingBalance,
  getTotalPaid,
  type InstallmentSchedule 
} from "@/lib/installments";
import { httpLog, logInstallmentEvent, saveHttpLogLocally } from "@/lib/httpLogger";
import { isDemoMode, simulateDelay, makeFakeTxHash, saveDemoLog } from "@/lib/demo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface InstallmentScheduleUIProps {
  escrowId: string;
  totalAmount: bigint;
  totalInstallments: number;
  installmentsPaid: number;
  isClient: boolean;
  freelancerAddress: string;
}

export function InstallmentScheduleUI({
  escrowId,
  totalAmount,
  totalInstallments,
  installmentsPaid,
  isClient,
  freelancerAddress,
}: InstallmentScheduleUIProps) {
  const { address: userAddress } = useAccount();
  const { releaseInstallment, isLoading: isReleasing } = useReleaseInstallment();
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const schedule = generateInstallmentSchedule(
    escrowId,
    totalAmount,
    totalInstallments,
    installmentsPaid
  );

  const nextInstallment = getNextInstallment(schedule);
  const progressPercent = getProgressPercentage(schedule);
  const totalPaid = getTotalPaid(schedule);
  const remainingBalance = getRemainingBalance(schedule);

  const handleReleaseInstallment = async () => {
    if (!nextInstallment || !userAddress) return;

    setProcessingIndex(nextInstallment.index);
    setStatusMessage({ type: "info", text: "Preparing installment release..." });

    try {
      // Demo mode: instant success
      if (isDemoMode()) {
        await simulateDelay(800);
        const fakeTx = makeFakeTxHash();
        
        // Save demo log
        saveDemoLog({
          escrowId,
          actor: userAddress,
          reason: `Installment #${nextInstallment.index} of ${totalInstallments} released - ${formatUnits(BigInt(nextInstallment.amount), 6)} USDC`,
          action: "installment",
          timestamp: Math.floor(Date.now() / 1000),
          transactionHash: fakeTx,
          isDemo: true,
        });

        // HTTP log
        await logInstallmentEvent(
          escrowId,
          nextInstallment.index,
          userAddress,
          fakeTx,
          nextInstallment.amount,
          "success"
        );

        saveHttpLogLocally({
          escrowId,
          action: "installment_release",
          actor: userAddress,
          txHash: fakeTx,
          reason: `Installment #${nextInstallment.index} released successfully`,
          meta: {
            installmentIndex: nextInstallment.index,
            amount: nextInstallment.amount,
            recipient: freelancerAddress,
          },
        });

        setLastTxHash(fakeTx);
        setStatusMessage({
          type: "success",
          text: `✓ Installment #${nextInstallment.index} released successfully! Transaction received.`,
        });
      } else {
        // Real blockchain transaction
        setStatusMessage({ type: "info", text: "Submitting transaction to Base Sepolia..." });
        
        releaseInstallment?.({
          args: [BigInt(escrowId)],
        });

        // HTTP log (pending)
        await logInstallmentEvent(
          escrowId,
          nextInstallment.index,
          userAddress,
          "",
          nextInstallment.amount,
          "pending"
        );

        setStatusMessage({
          type: "info",
          text: "Transaction submitted. Waiting for confirmation on Base Sepolia testnet...",
        });
      }
    } catch (error: any) {
      console.error("Installment release error:", error);
      
      // HTTP log (failed)
      await logInstallmentEvent(
        escrowId,
        nextInstallment.index,
        userAddress,
        "",
        nextInstallment.amount,
        "failed"
      );

      setStatusMessage({
        type: "error",
        text: error?.message || "Failed to release installment. Please try again.",
      });
    } finally {
      setProcessingIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Payment Schedule</h2>
          <span className="text-sm text-muted">
            {installmentsPaid} of {totalInstallments} Installments Released
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Progress</span>
            <span className="font-semibold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background rounded-xl p-4">
          <p className="text-sm text-muted mb-1">Total Amount</p>
          <p className="text-2xl font-semibold text-gray-900">
            ${formatUnits(totalAmount, 6)}
          </p>
        </div>
        <div className="bg-background rounded-xl p-4">
          <p className="text-sm text-muted mb-1">Paid So Far</p>
          <p className="text-2xl font-semibold text-success">
            ${formatUnits(totalPaid, 6)}
          </p>
        </div>
        <div className="bg-background rounded-xl p-4">
          <p className="text-sm text-muted mb-1">Remaining</p>
          <p className="text-2xl font-semibold text-warning">
            ${formatUnits(remainingBalance, 6)}
          </p>
        </div>
      </div>

      {/* Next Payment Action */}
      {nextInstallment && isClient && (
        <div className="bg-blue-50 border border-primary-light rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Next Installment Ready
              </h3>
              <p className="text-sm text-muted">
                Installment #{nextInstallment.index} · ${formatUnits(BigInt(nextInstallment.amount), 6)} USDC
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
              Pending
            </span>
          </div>

          <button
            onClick={handleReleaseInstallment}
            disabled={isReleasing || processingIndex !== null}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processingIndex === nextInstallment.index ? (
              <>
                <LoadingSpinner />
                <span>Releasing Installment...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Release ${formatUnits(BigInt(nextInstallment.amount), 6)} to Freelancer</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`rounded-xl p-4 ${
            statusMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : statusMessage.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          <p className="text-sm font-medium">{statusMessage.text}</p>
          {lastTxHash && (
            <p className="text-xs mt-2 font-mono break-all">
              Transaction: {lastTxHash}
            </p>
          )}
        </div>
      )}

      {/* Installment List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">All Installments</h3>
        <div className="space-y-2">
          {schedule.installments.map((installment) => (
            <div
              key={installment.index}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                installment.isPaid
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    installment.isPaid
                      ? "bg-success text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {installment.index}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Installment #{installment.index}
                  </p>
                  <p className="text-sm text-muted">
                    ${formatUnits(BigInt(installment.amount), 6)} USDC
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  installment.isPaid
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {installment.isPaid ? "✓ Paid" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Info */}
      <div className="bg-background rounded-xl p-4 text-center">
        <p className="text-xs text-muted">
          💡 All transactions are processed on <strong className="text-gray-900">Base Sepolia Testnet</strong>
        </p>
        <p className="text-xs text-muted mt-1">
          Get testnet USDC from{" "}
          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover underline"
          >
            Circle Faucet
          </a>
        </p>
      </div>
    </div>
  );
}
