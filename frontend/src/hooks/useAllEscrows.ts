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

export const useAllEscrows = (opts: { autoRefresh?: boolean } = { autoRefresh: true }) => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Get the total count of escrows
  const { data: escrowCount } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "escrowCount",
    watch: true, // Watch for changes
  });

  // Note: Block watching removed - escrowCount watch is sufficient for detecting changes

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
        
        // Limit to 50 escrows max to avoid RPC rate limiting
        const maxEscrows = Math.min(count, 50);
        console.log(`📋 Fetching ${maxEscrows} escrows (out of ${count} total)`);
        
        // Fetch each escrow (IDs start from 0)
        for (let i = 0; i < maxEscrows; i++) {
          escrowPromises.push(
            publicClient.readContract({
              address: ESCROW_ADDRESS,
              abi: ESCROW_ABI,
              functionName: "escrows",
              args: [i],
            })
              .catch((error) => {
                console.warn(`⚠️ Error fetching escrow ${i}:`, error.message);
                // Return null on error to continue loading other escrows
                return null;
              })
          );
        }

        const escrowsData = await Promise.all(escrowPromises);
        console.log("📋 Fetched escrow data:", escrowsData.filter(Boolean).length, "escrows");

        const processedEscrows: Escrow[] = escrowsData
          .filter(Boolean) // Remove failed requests
          .map((data: any, index) => {
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

        console.log("✓ Processed escrows:", processedEscrows.length);
        setEscrows(processedEscrows);
      } catch (error: any) {
        if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
          console.warn("⚠️ RPC rate limited - waiting before retry...");
          // Retry after 5 seconds
          setTimeout(() => fetchAllEscrows(), 5000);
        } else {
          console.error("❌ Error fetching escrows:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEscrows();
  }, [publicClient, escrowCount]); // Only watch escrowCount, not blockNumber - avoids 4s polling refresh

  return { escrows, isLoading };
};
