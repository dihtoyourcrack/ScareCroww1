"use client";

import { useState, useEffect } from "react";
import { useReleaseWithSignature, useGetNonce } from "@/hooks/useEscrowContract";
import { parseUnits, formatUnits } from "viem";

interface ReleaseWithSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowId: number;
  remainingBalance: bigint;
  freelancerAddress: string;
  onSuccess?: () => void;
}

export function ReleaseWithSignatureModal({
  isOpen,
  onClose,
  escrowId,
  remainingBalance,
  freelancerAddress,
  onSuccess,
}: ReleaseWithSignatureModalProps) {
  const [amount, setAmount] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualSignature, setManualSignature] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "signing" | "submitting" | "success" | "error">("idle");

  const { nonce, refetch: refetchNonce } = useGetNonce(escrowId);
  const { signAndRelease, isSigning, isSubmitting, signError } = useReleaseWithSignature();

  useEffect(() => {
    if (isOpen) {
      refetchNonce();
      setAmount(formatUnits(remainingBalance, 6)); // USDC has 6 decimals
      setManualSignature("");
      setMessage("");
      setStatus("idle");
    }
  }, [isOpen, remainingBalance, refetchNonce]);

  const handleSubmit = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      const amountBigInt = parseUnits(amount, 6);
      if (amountBigInt > remainingBalance) {
        alert("Amount exceeds remaining balance");
        return;
      }

      if (!nonce && nonce !== BigInt(0)) {
        alert("Unable to fetch nonce. Please try again.");
        return;
      }

      setStatus(manualMode ? "submitting" : "signing");

      const sig = manualMode && manualSignature
        ? (manualSignature as `0x${string}`)
        : undefined;

      await signAndRelease(
        BigInt(escrowId),
        amountBigInt,
        nonce,
        sig
      );

      setStatus("success");
      
      // Log via HTTP if configured
      if (message && typeof window !== 'undefined') {
        const httpLogUrl = process.env.NEXT_PUBLIC_HTTP_LOGGING_URL;
        if (httpLogUrl) {
          try {
            await fetch(httpLogUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                escrowId,
                from: 'client_signature',
                to: freelancerAddress,
                amount: amount,
                action: 'signature_release',
                message,
                timestamp: Date.now(),
              }),
            });
          } catch (e) {
            console.warn('HTTP logging failed:', e);
          }
        }
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Release with signature failed:", error);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Release with Signature</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Remaining Balance */}
          <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
            <p className="text-sm text-slate-600 mb-1">Remaining Balance</p>
            <p className="text-2xl font-bold text-sky-700">
              {formatUnits(remainingBalance, 6)} USDC
            </p>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recipient (Freelancer)
            </label>
            <input
              type="text"
              value={freelancerAddress}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount to Release (USDC)
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter amount"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Add a note about this release..."
            />
          </div>

          {/* Nonce Display */}
          {nonce !== undefined && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">Current Nonce:</span> {nonce.toString()}
            </div>
          )}

          {/* Manual Mode Toggle */}
          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Manual signature mode</span>
            </label>
          </div>

          {/* Manual Signature Input */}
          {manualMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste Signature (0x...)
              </label>
              <textarea
                value={manualSignature}
                onChange={(e) => setManualSignature(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                placeholder="0x..."
              />
              <p className="text-xs text-slate-500 mt-1">
                In manual mode, you must provide a valid EIP-712 signature from the client wallet.
              </p>
            </div>
          )}

          {/* Status Messages */}
          {status === "signing" && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                🔏 Please sign the message in your wallet...
              </p>
            </div>
          )}

          {status === "submitting" && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                ⏳ Submitting transaction...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✅ Release successful!
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                ❌ {signError?.message || "Transaction failed. Please try again."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSigning || isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSigning || isSubmitting || status === "success"}
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSigning
                ? "Signing..."
                : isSubmitting
                ? "Submitting..."
                : manualMode
                ? "Submit with Signature"
                : "Sign & Release"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
