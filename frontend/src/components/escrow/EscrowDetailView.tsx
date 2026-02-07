"use client";

import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useReleaseFunds } from "@/hooks/useEscrowContract";
import { ReleaseAndBridgeButton } from "./ReleaseAndBridgeButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface EscrowDetailViewProps {
  escrowId: number;
  escrowData: any;
  message?: string | null;
  loadingMessage?: boolean;
}

export default function EscrowDetailView({
  escrowId,
  escrowData,
  message,
  loadingMessage,
}: EscrowDetailViewProps) {
  const { address: userAddress } = useAccount();
  const { releaseFunds, isLoading: isReleasing, error: releaseError } = useReleaseFunds();
  const [targetChain, setTargetChain] = useState(8453);
  const [releaseTxStatus, setReleaseTxStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  if (!escrowData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Loading escrow data...</p>
      </div>
    );
  }

  const [client, freelancer, usdcAmount, funded, released, refunded, deadline] =
    escrowData as any[];

  const isClient = userAddress?.toLowerCase() === client?.toLowerCase();
  const isFreelancer = userAddress?.toLowerCase() === freelancer?.toLowerCase();
  const formattedAmount = formatUnits(usdcAmount || 0n, 6);

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

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-white">${formattedAmount}</p>
          <p className="text-gray-500 text-xs mt-1">USDC</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase mb-1">Funded</p>
          <p className={`text-xl font-bold ${funded ? "text-green-400" : "text-gray-400"}`}>
            {funded ? "✓" : "✗"}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase mb-1">Released</p>
          <p className={`text-xl font-bold ${released ? "text-green-400" : "text-gray-400"}`}>
            {released ? "✓" : "✗"}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs uppercase mb-1">Status</p>
          <p className="text-xl font-bold">
            {released ? "Completed" : refunded ? "Refunded" : funded ? "Active" : "Pending"}
          </p>
        </div>
      </div>

      {/* Participant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white">Client</h3>
          <p className="font-mono text-sm break-all mb-3 text-gray-300">{client}</p>
          {isClient && (
            <div className="bg-blue-900 rounded px-3 py-1 inline-block">
              <p className="text-blue-200 text-xs font-semibold">Your Account</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white">Freelancer</h3>
          <p className="font-mono text-sm break-all mb-3 text-gray-300">{freelancer}</p>
          {isFreelancer && (
            <div className="bg-green-900 rounded px-3 py-1 inline-block">
              <p className="text-green-200 text-xs font-semibold">Your Account</p>
            </div>
          )}
        </div>
      </div>

      {/* Message from IPFS */}
      {message && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white">Message</h3>
          {loadingMessage ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
          )}
        </div>
      )}

      {/* Client Actions */}
      {isClient && !released && !refunded && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Release Funds</h2>

          {releaseTxStatus.status !== "idle" && (
            <div
              className={`rounded-lg p-3 mb-4 text-sm ${
                releaseTxStatus.status === "pending"
                  ? "bg-blue-900 border border-blue-700 text-blue-200"
                  : releaseTxStatus.status === "success"
                  ? "bg-green-900 border border-green-700 text-green-200"
                  : "bg-red-900 border border-red-700 text-red-200"
              }`}
            >
              {releaseTxStatus.message}
            </div>
          )}

          {releaseError && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4 text-sm text-red-200">
              {releaseError instanceof Error ? releaseError.message : String(releaseError)}
            </div>
          )}

          <button
            onClick={handleRelease}
            disabled={isReleasing || releaseTxStatus.status === "pending"}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition mb-4"
          >
            {isReleasing || releaseTxStatus.status === "pending"
              ? "⏳ Processing..."
              : "✓ Release Funds to Freelancer"}
          </button>

          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-3 font-semibold">
              Bridge to Destination Chain (Optional)
            </label>
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 mb-3"
            >
              <option value={8453}>Base</option>
              <option value={1}>Ethereum</option>
              <option value={137}>Polygon</option>
              <option value={42161}>Arbitrum</option>
              <option value={10}>Optimism</option>
            </select>

            <ReleaseAndBridgeButton
              escrowId={escrowId}
              freelancerAddress={freelancer}
              amount={formattedAmount}
              fromChainId={targetChain}
            />
          </div>
        </div>
      )}

      {/* Freelancer Status */}
      {isFreelancer && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Payment Status</h2>

          {!funded && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-200">⏳ Waiting for client to deposit funds...</p>
            </div>
          )}

          {funded && !released && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-200">💼 Escrow is funded and awaiting release from the client</p>
            </div>
          )}

          {released && (
            <div className="space-y-3">
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <p className="text-green-200 font-semibold">✅ Payment Released!</p>
                <p className="text-green-300 text-sm mt-1">
                  ${formattedAmount} USDC has been sent to your address
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
