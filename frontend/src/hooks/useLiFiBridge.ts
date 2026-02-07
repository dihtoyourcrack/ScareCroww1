"use client";

import { LiFi } from "@lifi/sdk";
import { useState } from "react";

const lifi = new LiFi({
  integrator: "crosschain-escrow",
});

export interface BridgeParams {
  fromChain: number;
  toChain: number;
  amount: string; // in smallest unit, e.g., USDC decimals
  fromAddress: string;
  toAddress: string;
  tokenAddress?: string; // USDC address on source chain
}

export const useLiFiBridge = () => {
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);

  const bridgeUSDC = async (params: BridgeParams) => {
    setBridgeLoading(true);
    setBridgeError(null);

    try {
      console.log("Fetching bridge quote for:", params);

      // Get quote for USDC bridge
      const quote = await lifi.getQuote({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.tokenAddress || "0x833589fCD6eDb6E08f4c7C32D4f71b1566469c18",
        toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b1566469c18", // USDC standard
        fromAmount: params.amount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
      });

      console.log("Bridge quote received:", quote);

      // Return quote for user approval and execution via UI
      return {
        quote,
        status: "ready",
        message: `Route found: Ready to execute`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Bridge error:", errorMessage);
      setBridgeError(errorMessage);
      throw error;
    } finally {
      setBridgeLoading(false);
    }
  };

  return { bridgeUSDC, bridgeLoading, bridgeError };
};
