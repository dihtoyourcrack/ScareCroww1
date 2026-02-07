"use client";

import { useReleaseFunds } from "@/hooks/useEscrowContract";
import { useLiFiBridge } from "@/hooks/useLiFiBridge";
import { useState } from "react";
import { parseUnits } from "viem";

interface ReleaseAndBridgeButtonProps {
  escrowId: number;
  freelancerAddress: string;
  amount: string; // amount in USDC
  fromChainId: number;
}

export const ReleaseAndBridgeButton = ({
  escrowId,
  freelancerAddress,
  amount,
  fromChainId,
}: ReleaseAndBridgeButtonProps) => {
  const { releaseFunds, isLoading: isReleasing } = useReleaseFunds();
  const { bridgeUSDC, bridgeLoading } = useLiFiBridge();
  const [step, setStep] = useState<"idle" | "releasing" | "bridging" | "complete">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleReleaseAndBridge = async () => {
    if (!freelancerAddress || !amount) {
      alert("Missing freelancer address or amount");
      return;
    }

    try {
      setError(null);
      
      // Step 1: Release funds on-chain
      setStep("releasing");
      console.log("Releasing funds for escrow", escrowId);
      
      if (!releaseFunds) {
        throw new Error("Release function not available");
      }

      // Call release funds
      releaseFunds({
        args: [BigInt(escrowId)],
      });

      // Wait a moment for transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Bridge funds via LiFi
      setStep("bridging");
      console.log("Bridging", amount, "USDC to chain", fromChainId);

      const amountInSmallestUnit = parseUnits(amount, 6).toString();

      await bridgeUSDC({
        fromChain: 84531, // Base Sepolia (where contract is deployed)
        toChain: fromChainId, // User selected chain
        amount: amountInSmallestUnit,
        fromAddress: freelancerAddress,
        toAddress: freelancerAddress,
      });

      setStep("complete");
      alert("✅ Funds released and bridging to destination chain!");

      // Reset after 3 seconds
      setTimeout(() => setStep("idle"), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Release and bridge error:", errorMsg);
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
      setStep("idle");
    }
  };

  const getButtonText = () => {
    if (step === "releasing") return "Releasing on-chain...";
    if (step === "bridging") return "Bridging to destination...";
    if (step === "complete") return "✅ Complete!";
    return "Release & Bridge";
  };

  const isLoading = isReleasing || bridgeLoading || step !== "idle";

  return (
    <div className="space-y-2">
      <button
        onClick={handleReleaseAndBridge}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
          isLoading
            ? "bg-gray-600 opacity-50 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 active:scale-95"
        } text-white`}
      >
        {getButtonText()}
      </button>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};
