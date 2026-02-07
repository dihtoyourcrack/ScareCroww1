"use client";

import { useAccount } from "wagmi";
import { getDemoWalletBalance, isDemoMode } from "@/lib/demo";
import { useEffect, useState } from "react";

export function DemoWalletBalance() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isDemoMode() || !address) return;

    const updateBalance = () => {
      const walletBalance = getDemoWalletBalance(address);
      setBalance(walletBalance);
    };

    updateBalance();
    const interval = setInterval(updateBalance, 1000);
    return () => clearInterval(interval);
  }, [address, mounted]);

  if (!mounted || !isDemoMode() || !address || !balance) {
    return null;
  }

  const hasBalances = Object.keys(balance.balances).length > 0;

  return (
    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-green-400 mb-3">
        💰 Demo Wallet Balance
      </h3>
      {!hasBalances ? (
        <p className="text-gray-400 text-sm">No claimed funds yet</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(balance.balances).map(([chainId, chainBalance]: [string, any]) => (
            <div key={chainId} className="bg-gray-800/50 rounded p-3">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Chain ID: {chainId}
              </div>
              {parseFloat(chainBalance.native) > 0 && (
                <div className="text-white font-mono">
                  Native: {chainBalance.native} tokens
                </div>
              )}
              {Object.entries(chainBalance.tokens).map(([token, amount]: [string, any]) => (
                <div key={token} className="text-white font-mono text-sm">
                  {token.slice(0, 6)}...{token.slice(-4)}: {amount}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
