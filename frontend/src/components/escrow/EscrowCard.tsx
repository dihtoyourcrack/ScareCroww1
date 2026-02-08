"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCancelEscrow } from "@/hooks/useEscrowContract";
import { formatUnits } from "viem";
import Link from "next/link";

interface EscrowCardProps {
  id: string;
  client: string;
  freelancer: string;
  amount: string;
  funded: boolean;
  status: string;
}

export default function EscrowCard({
  id,
  client,
  freelancer,
  amount,
  funded,
  status,
}: EscrowCardProps) {
  const { address } = useAccount();
  const { cancelEscrow, isLoading: isCancelling } = useCancelEscrow();
  const [showConfirm, setShowConfirm] = useState(false);

  const isClient = address?.toLowerCase() === client?.toLowerCase();
  const canDelete = isClient && !funded;

  const handleDelete = async () => {
    if (!cancelEscrow) return;

    try {
      await cancelEscrow({
        args: [BigInt(id)],
      });
      setShowConfirm(false);
    } catch (error) {
      console.error("Error cancelling escrow:", error);
    }
  };

  const formattedAmount = amount
    ? (() => {
        try {
          // Try to convert to BigInt (for integer amounts like "1000000")
          const bigAmount = BigInt(amount);
          return parseFloat(formatUnits(bigAmount, 6)).toFixed(2);
        } catch {
          // If amount is already a decimal string (like "0.997"), use it directly
          return parseFloat(amount).toFixed(2);
        }
      })()
    : "0.00";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released":
        return "text-green-400 bg-green-500/20";
      case "Deposited":
        return "text-blue-400 bg-blue-500/20";
      case "Refunded":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="bg-surface rounded-lg p-6 border border-border hover:border-accent transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-muted-text text-sm">Escrow #{id}</p>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
          <p className="text-text font-semibold mb-1">
            Freelancer: {freelancer?.slice(0, 6)}...{freelancer?.slice(-4)}
          </p>
          <p className="text-2xl font-bold text-text">${formattedAmount}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/escrow/${id}`}
            className="accent-bg hover:opacity-90 px-4 py-2 rounded-lg text-text text-sm font-medium text-center"
          >
            View Details
          </Link>

          {canDelete && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600/10 hover:bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg text-red-400 text-sm font-medium"
            >
              Delete
            </button>
          )}

          {showConfirm && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 px-4 py-2 rounded-lg text-text text-sm font-medium"
              >
                {isCancelling ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-page-bg hover:bg-surface px-4 py-2 rounded-lg text-text text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {!funded && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-warning text-sm">
            ⚠️ Not funded yet - awaiting deposit
          </p>
        </div>
      )}
    </div>
  );
}

