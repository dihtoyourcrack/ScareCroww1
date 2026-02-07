"use client";

import { useState } from "react";
import { useLiFiBridge } from "./useLiFiBridge";

export interface BridgeTransaction {
  id: string;
  fromChain: number;
  toChain: number;
  amount: string;
  status: "pending" | "success" | "failed";
  transactionHash?: string;
  error?: string;
}

export function useBridge() {
  const { bridgeUSDC, bridgeLoading, bridgeError } = useLiFiBridge();
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);

  const bridge = async (
    fromChain: number,
    toChain: number,
    amount: string,
    fromAddress: string,
    toAddress: string,
    tokenAddress?: string
  ) => {
    const txId = `bridge_${Date.now()}`;

    const newTx: BridgeTransaction = {
      id: txId,
      fromChain,
      toChain,
      amount,
      status: "pending",
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      const result = await bridgeUSDC({
        fromChain,
        toChain,
        amount,
        fromAddress,
        toAddress,
        tokenAddress,
      });

      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === txId
            ? {
                ...tx,
                status: "success",
                transactionHash: (result as any)?.hash,
              }
            : tx
        )
      );

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === txId
            ? {
                ...tx,
                status: "failed",
                error: errorMsg,
              }
            : tx
        )
      );
      throw error;
    }
  };

  return {
    bridge,
    transactions,
    isLoading: bridgeLoading,
    error: bridgeError,
  };
}
