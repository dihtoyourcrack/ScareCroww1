"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useContractRead } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/lib/contracts";

interface Escrow {
  id: number;
  client: string;
  freelancer: string;
  amount: string;
  status: "Created" | "Deposited" | "Released" | "Refunded";
  funded: boolean;
  released: boolean;
  refunded: boolean;
  deadline: number;
}

export const useAllEscrows = () => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blockNumber, setBlockNumber] = useState<bigint>(0n);
  const publicClient = usePublicClient();

  // Get the total count of escrows
  const { data: escrowCount } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "escrowCount",
    watch: true, // Watch for changes
  });

  // Watch for new blocks to trigger refresh when escrows are updated
  useEffect(() => {
    if (!publicClient) return;

    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: (newBlockNumber) => {
        setBlockNumber(newBlockNumber);
      },
      emitOnBegin: true,
      poll: true,
      pollingInterval: 4000, // Poll every 4 seconds
    });

    return () => unwatch();
  }, [publicClient]);

  useEffect(() => {
    const fetchAllEscrows = async () => {
      if (!publicClient || !escrowCount) {
        console.log("⏳ Waiting for client and escrow count...");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const count = Number(escrowCount);
        console.log("📊 Total escrows in contract:", count);

        if (count === 0) {
          console.log("ℹ️ No escrows created yet");
          setEscrows([]);
          setIsLoading(false);
          return;
        }

        const escrowPromises = [];
        
        // Fetch each escrow (IDs start from 0)
        for (let i = 0; i < count; i++) {
          escrowPromises.push(
            publicClient.readContract({
              address: ESCROW_ADDRESS,
              abi: ESCROW_ABI,
              functionName: "escrows",
              args: [i],
            })
          );
        }

        const escrowsData = await Promise.all(escrowPromises);
        console.log("📋 Fetched escrow data:", escrowsData);

        const processedEscrows: Escrow[] = escrowsData.map((data: any, index) => {
          const [client, freelancer, usdcAmount, funded, released, refunded, deadline] = data;
          
          let status: "Created" | "Deposited" | "Released" | "Refunded" = "Created";
          if (refunded) status = "Refunded";
          else if (released) status = "Released";
          else if (funded) status = "Deposited";

          return {
            id: index,
            client: client as string,
            freelancer: freelancer as string,
            amount: String(usdcAmount),
            status,
            funded: funded as boolean,
            released: released as boolean,
            refunded: refunded as boolean,
            deadline: Number(deadline),
          };
        });

        console.log("✓ Processed escrows:", processedEscrows);
        setEscrows(processedEscrows);
      } catch (error) {
        console.error("❌ Error fetching escrows:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEscrows();
  }, [publicClient, escrowCount, blockNumber]); // Added blockNumber to trigger refresh on new blocks

  return { escrows, isLoading };
};
