"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useLogTransaction } from "@/hooks/useEscrowContract";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/lib/contracts";
import { formatDistanceToNow } from "date-fns";
import { getDemoLogs } from "@/lib/demo";

interface TransactionLog {
  escrowId: string;
  actor: string;
  reason: string;
  action: string;
  timestamp: number;
  blockNumber: bigint;
  transactionHash: string;
}

interface TransactionLogViewerProps {
  escrowId: string;
}

export function TransactionLogViewer({ escrowId }: TransactionLogViewerProps) {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchLogs() {
      if (!publicClient) return;

      setIsLoading(true);
      try {
        // Get demo logs from localStorage and convert to TransactionLog format
        const demoLogs = getDemoLogs()
          .filter((log: any) => String(log.escrowId) === String(escrowId))
          .map((log: any) => ({
            ...log,
            blockNumber: BigInt(0), // Demo logs have no block
            transactionHash: log.transactionHash || "", // Ensure transactionHash exists
          }));
        
        const filter = await publicClient.createContractEventFilter({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          eventName: "TransactionLog",
          args: {
            escrowId: BigInt(escrowId),
          },
          fromBlock: BigInt(0),
        });

        const events = await publicClient.getFilterLogs({ filter });

        const parsedLogs: TransactionLog[] = await Promise.all(
          events.map(async (event: any) => {
            const block = await publicClient.getBlock({
              blockNumber: event.blockNumber,
            });

            return {
              escrowId: event.args?.escrowId?.toString() || "",
              actor: (event.args?.actor as string) || "",
              reason: (event.args?.reason as string) || "",
              action: (event.args?.action as string) || "",
              timestamp: Number(block.timestamp),
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            };
          })
        );

        // Merge demo logs with on-chain logs (demo first)
        const allLogs = [...demoLogs, ...parsedLogs].sort((a, b) => b.timestamp - a.timestamp);
        setLogs(allLogs);
      } catch (error) {
        console.error("Error fetching transaction logs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [escrowId, publicClient]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "release":
      case "signature_release":
        return "💸";
      case "deposit":
        return "💰";
      case "refund":
        return "↩️";
      case "bridge":
        return "🌉";
      case "installment":
        return "📊";
      case "update":
        return "📝";
      default:
        return "📋";
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "release":
      case "signature_release":
        return "text-green-400 bg-green-500/20";
      case "deposit":
        return "text-blue-400 bg-blue-500/20";
      case "refund":
        return "text-red-400 bg-red-500/20";
      case "bridge":
        return "text-purple-400 bg-purple-500/20";
      case "installment":
        return "text-sky-400 bg-sky-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction Log</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <p className="mt-2 text-gray-400 text-sm">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction Log</h3>
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">No transaction logs yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Logs will appear when parties add transaction reasons
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span>Transaction Log</span>
        <span className="text-sm font-normal text-gray-400">
          {logs.length} entr{logs.length === 1 ? "y" : "ies"}
        </span>
      </h3>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <div
            key={`${log.transactionHash}-${index}`}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{getActionIcon(log.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(log.timestamp * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-2">{log.reason}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="font-mono">
                    By: {log.actor.slice(0, 6)}...{log.actor.slice(-4)}
                  </span>
                  <a
                    href={`https://basescan.org/tx/${log.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Tx ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddTransactionLog({ escrowId }: { escrowId: string }) {
  const [reason, setReason] = useState("");
  const [action, setAction] = useState("update");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logTransaction } = useLogTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !logTransaction) return;

    setIsSubmitting(true);
    try {
      await logTransaction({
        args: [BigInt(escrowId), reason, action],
      });
      setReason("");
      // Optional: Show success notification
    } catch (error) {
      console.error("Error logging transaction:", error);
      // Optional: Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Add Transaction Note</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Action Type
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="update">Update</option>
            <option value="deposit">Deposit</option>
            <option value="release">Release</option>
            <option value="refund">Refund</option>
            <option value="bridge">Bridge</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Reason / Note
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Milestone 1 completed - website frontend delivered"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !reason.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Transaction Log"}
        </button>
      </form>
    </div>
  );
}
