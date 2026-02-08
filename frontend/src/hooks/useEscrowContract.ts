"use client";

import { useContractWrite, useContractRead, useAccount, useWalletClient, useNetwork } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/lib/contracts";
import { useState } from "react";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
] as const;

export function useCreateEscrow() {
  const { data: hash, write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "createEscrow",
  });

  return {
    createEscrow: write,
    hash,
    isLoading,
    isError,
    error,
  };
}

export function useDepositFunds() {
  const { data: hash, write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "depositFunds",
  });

  return {
    depositFunds: write,
    hash,
    isLoading,
    isError,
    error,
  };
}

export function useTokenApproval(tokenAddress: `0x${string}`) {
  const { data: hash, write, isLoading, isError, error } = useContractWrite({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "approve",
  });

  return {
    approve: write,
    hash,
    isLoading,
    isError,
    error,
  };
}

export function useReleaseFunds() {
  const { write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "releaseFunds",
  });

  return {
    releaseFunds: write,
    isLoading,
    isError,
    error,
  };
}

export function useRequestRefund() {
  const { write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "requestRefund",
  });

  return {
    requestRefund: write,
    isLoading,
    isError,
    error,
  };
}

export function useCancelEscrow() {
  const { write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "cancelEscrow",
  });

  return {
    cancelEscrow: write,
    isLoading,
    isError,
    error,
  };
}

export function useLogTransaction() {
  const { write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "logTransaction",
  });

  return {
    logTransaction: write,
    isLoading,
    isError,
    error,
  };
}

export function useReleaseInstallment() {
  const { write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "releaseInstallment",
  });

  return {
    releaseInstallment: write,
    isLoading,
    isError,
    error,
  };
}

export function useCreateEscrowWithInstallments() {
  const { data: hash, write, isLoading, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "createEscrowWithInstallments",
  });

  return {
    createEscrowWithInstallments: write,
    hash,
    isLoading,
    isError,
    error,
  };
}

export function useGetEscrow(escrowId: number) {
  const { data, isLoading, isError, error } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "escrows",
    args: [escrowId],
  });

  return {
    escrow: data,
    isLoading,
    isError,
    error,
  };
}

export function useGetNonce(escrowId: number) {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "nonceOf",
    args: [escrowId],
  });

  return {
    nonce: data as bigint | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useReleaseWithSignature() {
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<Error | null>(null);

  const { write, isLoading: isSubmitting, isError, error } = useContractWrite({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "releaseWithSignature",
  });

  const signAndRelease = async (
    escrowId: bigint,
    amount: bigint,
    nonce: bigint,
    manualSignature?: `0x${string}`
  ) => {
    try {
      setSignError(null);

      let signature: `0x${string}`;

      if (manualSignature) {
        // Use provided signature (demo/manual mode)
        signature = manualSignature;
      } else {
        // Request in-app wallet signing
        if (!walletClient) {
          throw new Error("Wallet not connected");
        }
        if (!chain) {
          throw new Error("Chain not detected");
        }

        setIsSigning(true);

        const domain = {
          name: "FreelanceEscrow",
          version: "1",
          chainId: chain.id,
          verifyingContract: ESCROW_ADDRESS,
        } as const;

        const types = {
          Release: [
            { name: "id", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "amount", type: "uint256" },
          ],
        } as const;

        const message = {
          id: escrowId,
          nonce: nonce,
          amount: amount,
        };

        signature = await walletClient.signTypedData({
          domain,
          types,
          primaryType: "Release",
          message,
        });

        setIsSigning(false);
      }

      // Submit transaction
      write?.({
        args: [escrowId, amount, nonce, signature],
      });

      return signature;
    } catch (err) {
      setIsSigning(false);
      setSignError(err as Error);
      throw err;
    }
  };

  return {
    signAndRelease,
    isSigning,
    isSubmitting,
    isError,
    error,
    signError,
  };
}

// Hook to get the current escrow count
export function useEscrowCount() {
  const { data: count } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "escrowCount",
    watch: true,
  });

  return {
    escrowCount: count ? Number(count) : 0,
  };
}
