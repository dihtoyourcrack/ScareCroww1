"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useBlockNumber } from "wagmi";
import { ESCROW_ADDRESS, ESCROW_ABI } from "@/lib/contracts";
import { parseAbiItem } from "viem";

interface EscrowEvent {
  id: number;
  client: string;
  freelancer: string;
  amount?: string;
  status: "Created" | "Deposited" | "Released" | "Refunded";
  timestamp: number;
  txHash: string;
}

export const useEscrowEvents = () => {
  const [escrows, setEscrows] = useState<EscrowEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    if (!publicClient) {
      console.log("⚠️ Public client not available yet");
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        console.log("📡 Fetching escrow events from contract:", ESCROW_ADDRESS);
        console.log("📡 Using chain:", publicClient.chain?.name || "unknown");

        // Try to get recent block number first
        let fromBlock: bigint;
        try {
          const currentBlock = await publicClient.getBlockNumber();
          // Get events from last 10000 blocks or genesis
          fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;
          console.log("📡 Fetching from block", fromBlock.toString(), "to latest");
        } catch (err) {
          console.log("⚠️ Could not get block number, using genesis");
          fromBlock = 0n;
        }

        // Get EscrowCreated events
        const createdLogs = await publicClient.getLogs({
          address: ESCROW_ADDRESS as `0x${string}`,
          event: parseAbiItem('event EscrowCreated(uint256 indexed id, address client, address freelancer)'),
          fromBlock,
          toBlock: 'latest',
        });

        console.log("📋 Found", createdLogs.length, "EscrowCreated events", createdLogs);

        // Get Deposited events
        const depositedLogs = await publicClient.getLogs({
          address: ESCROW_ADDRESS as `0x${string}`,
          event: parseAbiItem('event Deposited(uint256 indexed id, uint256 amount)'),
          fromBlock,
          toBlock: 'latest',
        });
        console.log("💰 Found", depositedLogs.length, "Deposited events", depositedLogs);

        // Get Released events
        const releasedLogs = await publicClient.getLogs({
          address: ESCROW_ADDRESS as `0x${string}`,
          event: parseAbiItem('event Released(uint256 indexed id, uint256 amount)'),
          fromBlock,
          toBlock: 'latest',
        });
        console.log("🔓 Found", releasedLogs.length, "Released events", releasedLogs);

        // Get Refunded events
        const refundedLogs = await publicClient.getLogs({
          address: ESCROW_ADDRESS as `0x${string}`,
          event: parseAbiItem('event Refunded(uint256 indexed id)'),
          fromBlock,
          toBlock: 'latest',
        });
        console.log("🔄 Found", refundedLogs.length, "Refunded events", refundedLogs);

        // Build escrow map
        const escrowMap = new Map<number, EscrowEvent>();

        // Process created events
        createdLogs.forEach((log) => {
          const { id, client, freelancer } = log.args as any;
          const block = log.blockNumber ? Number(log.blockNumber) : Date.now();
          
          escrowMap.set(Number(id), {
            id: Number(id),
            client: client as string,
            freelancer: freelancer as string,
            status: "Created",
            timestamp: block,
            txHash: log.transactionHash || "",
          });
        });

        // Update with deposited events
        depositedLogs.forEach((log) => {
          const { id, amount } = log.args as any;
          const escrow = escrowMap.get(Number(id));
          if (escrow) {
            escrow.status = "Deposited";
            escrow.amount = String(amount);
          }
        });

        // Update with released events
        releasedLogs.forEach((log) => {
          const { id, amount } = log.args as any;
          const escrow = escrowMap.get(Number(id));
          if (escrow) {
            escrow.status = "Released";
            escrow.amount = String(amount);
          }
        });

        // Update with refunded events
        refundedLogs.forEach((log) => {
          const { id } = log.args as any;
          const escrow = escrowMap.get(Number(id));
          if (escrow) {
            escrow.status = "Refunded";
          }
        });

        const escrowList = Array.from(escrowMap.values()).sort((a, b) => b.id - a.id);
        console.log("✓ Processed", escrowList.length, "unique escrows:", escrowList);
        setEscrows(escrowList);
        
        if (escrowList.length === 0) {
          console.log("⚠️ No escrows found. Contract address:", ESCROW_ADDRESS);
          console.log("⚠️ Make sure escrows have been created on this contract");
        }
      } catch (error) {
        console.error("❌ Error fetching escrow events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [publicClient, blockNumber]); // Re-fetch when new block arrives

  return { escrows, isLoading };
};
