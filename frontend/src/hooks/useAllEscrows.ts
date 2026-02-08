"use client";

import { useEffect, useState, useRef } from "react";
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

const CACHE_KEY = "escrows_cache";
const CACHE_TIMESTAMP_KEY = "escrows_cache_timestamp";
const CACHE_DURATION = 30000; // Cache for 30 seconds
let lastFetchTime = 0;
let fetchTimeout: NodeJS.Timeout | null = null;

export const useAllEscrows = (opts: { autoRefresh?: boolean } = { autoRefresh: false }) => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const retryCountRef = useRef(0);

  // Get the total count of escrows - NO watch to avoid frequent refetches
  const { data: escrowCount } = useContractRead({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "escrowCount",
    watch: false, // DISABLED - prevents excessive RPC calls
  });

  // Load from cache on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cachedTime = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && cachedTime) {
        const timeSinceCache = Date.now() - parseInt(cachedTime);
        if (timeSinceCache < CACHE_DURATION) {
          console.log('📦 Loading escrows from cache');
          setEscrows(JSON.parse(cached));
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
  }, []);

  useEffect(() => {
    const fetchAllEscrows = async () => {
      if (!publicClient || !escrowCount) {
        console.log("⏳ Waiting for client and escrow count...");
        return;
      }

      try {
        setIsLoading(true);
        const count = Number(escrowCount);
        console.log("📊 Total escrows in contract:", count);

        if (count === 0) {
          console.log("ℹ️ No escrows created yet");
          setEscrows([]);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify([]));
          sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
          setIsLoading(false);
          return;
        }

        // Limit to 50 escrows max to avoid RPC rate limiting
        const maxEscrows = Math.min(count, 50);
        console.log(`📋 Fetching ${maxEscrows} escrows (out of ${count} total)`);
        
        const escrowPromises = [];
        
        // Fetch each escrow (IDs start from 0)
        for (let i = 0; i < maxEscrows; i++) {
          escrowPromises.push(
            publicClient.readContract({
              address: ESCROW_ADDRESS,
              abi: ESCROW_ABI,
              functionName: "escrows",
              args: [i],
            })
              .catch((error: any) => {
                if (error.message?.includes("429")) {
                  throw error; // Re-throw to trigger backoff
                }
                console.warn(`⚠️ Error fetching escrow ${i}:`, error.message);
                return null;
              })
          );
        }

        const escrowsData = await Promise.all(escrowPromises);
        console.log("📋 Fetched escrow data:", escrowsData.filter(Boolean).length, "escrows");

        const processedEscrows: Escrow[] = escrowsData
          .filter(Boolean)
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
        
        // Cache the escrows
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(processedEscrows));
          sessionStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
        }
        
        // Reset retry count on success
        retryCountRef.current = 0;
        lastFetchTime = Date.now();
      } catch (error: any) {
        if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
          // Exponential backoff: 2s, 4s, 8s, 16s
          const backoffTime = Math.min(2000 * Math.pow(2, retryCountRef.current), 30000);
          retryCountRef.current++;
          
          console.warn(`⚠️ RPC rate limited (attempt ${retryCountRef.current}). Retrying in ${backoffTime}ms...`);
          
          // Clear existing timeout to avoid stacking
          if (fetchTimeout) clearTimeout(fetchTimeout);
          
          // Schedule retry with backoff
          fetchTimeout = setTimeout(() => fetchAllEscrows(), backoffTime);
        } else {
          console.error("❌ Error fetching escrows:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: Only fetch if at least 10 seconds have passed
    const timeSinceLastFetch = Date.now() - lastFetchTime;
    if (timeSinceLastFetch > 10000) {
      fetchAllEscrows();
    } else {
      console.log(`⏱️ Skipping fetch - last fetch was ${timeSinceLastFetch}ms ago`);
      setIsLoading(false);
    }

    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [publicClient, escrowCount, opts.autoRefresh]);

  return { escrows, isLoading };
};
