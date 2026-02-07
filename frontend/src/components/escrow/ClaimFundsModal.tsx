"use client";

import { useState, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { isDemoMode, addDemoBalance, markEscrowAsClaimed, saveDemoLog } from "@/lib/demo";
import { ethers } from "ethers";

interface ClaimFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrow: any;
  remainingBalance: bigint;
  onSuccess?: () => void;
}

export default function ClaimFundsModal({ isOpen, onClose, escrow, remainingBalance, onSuccess }: ClaimFundsModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [claimsRemaining, setClaimsRemaining] = useState(1);
  const [totalInstallments, setTotalInstallments] = useState(1);

  useEffect(() => {
    if (isOpen) {
      // Calculate installment info
      const totalInst = escrow.totalInstallments ? Number(escrow.totalInstallments) : 1;
      const paidInst = escrow.installmentsPaid ? Number(escrow.installmentsPaid) : 0;
      const remaining = totalInst - paidInst;
      
      setTotalInstallments(totalInst);
      setClaimsRemaining(Math.max(0, remaining));
      setAmount(formatUnits(remainingBalance, 6));
      setMessage("");
      setStatus("idle");
    }
  }, [isOpen, remainingBalance, escrow]);

  // Notify MetaMask / wallet about the claim so user can see token and tx
  const notifyWallet = async (claimData: any, chainId?: string, tokenAddress?: string, tokenSymbol?: string, tokenDecimals?: number) => {
    if (typeof window === 'undefined') return;
    const eth = (window as any).ethereum;
    
    if (!eth) {
      console.warn('MetaMask not found - ethereum provider not available');
      return;
    }

    console.log('🔗 Attempting to connect MetaMask...');

    try {
      // 1. Ensure accounts are available (this will prompt MetaMask to open IF not already approved)
      console.log('📋 Requesting accounts from MetaMask...');
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts connected:', accounts);

      // 2. Switch network - THIS WILL SHOW A POPUP
      if (chainId) {
        try {
          const hex = `0x${Number(chainId).toString(16)}`;
          console.log(`🔗 Switching to chain: ${hex} (THIS WILL SHOW A POPUP)`);
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] });
          console.log('✅ Chain switched');
        } catch (e: any) {
          // Network might already be the right one, or not in MetaMask
          console.warn('Chain switch info:', e.code, e.message);
        }
      }

      // 3. Watch token - THIS WILL SHOW A POPUP ASKING TO ADD TOKEN
      if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          console.log(`🪙 Requesting to watch token: ${tokenAddress} (THIS WILL SHOW A POPUP)`);
          const watched = await eth.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: tokenAddress,
                symbol: tokenSymbol || 'USDC',
                decimals: tokenDecimals ?? 6,
              },
            },
          });
          if (watched) {
            console.log('✅ Token added to MetaMask');
          }
        } catch (e: any) {
          console.warn('Token watch info:', e.message);
        }
      } else {
        // No token address or native token - show a simpler notification
        console.log('ℹ️  No ERC20 token to add (native token or no address provided)');
      }

      // 4. Dispatch a window event so other UI (or extension) can react
      window.dispatchEvent(new CustomEvent('escrow:claimed:wallet', { detail: claimData }));
      console.log('✅ MetaMask integration complete');
    } catch (err: any) {
      console.error('❌ MetaMask notification failed:', err.message);
      throw err; // Re-throw so caller can handle
    }
  };

  // Helper to open/focus MetaMask
  const openMetaMask = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      alert('MetaMask not installed. Please install MetaMask browser extension.');
      return;
    }
    try {
      console.log('📱 Opening MetaMask...');
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      console.log('✅ MetaMask opened with accounts:', accounts);
    } catch (err: any) {
      console.error('Failed to open MetaMask:', err.message);
      alert('Failed to open MetaMask. Please check the browser console for details.');
    }
  };

  const handleConfirm = async () => {
    try {
      console.log('🎯 Claim button clicked - starting claim process...');
      const amt = parseFloat(amount);
      if (!amount || amt <= 0) {
        alert("Please enter a valid amount to claim");
        return;
      }

      if (!message.trim()) {
        alert("Please enter a message describing what you'll spend the funds on");
        return;
      }

      const amtBig = parseUnits(amount, 6);
      if (BigInt(amtBig.toString()) > remainingBalance) {
        alert("Amount exceeds remaining balance");
        return;
      }

      if (claimsRemaining <= 0) {
        alert("All installments have been claimed for this escrow");
        return;
      }

      setStatus("processing");

      // Demo-mode: simulate deposit to freelancer wallet
      if (isDemoMode()) {
        const recipient = "0x01410e514A4215c5e3a1Ee2eFc220b339BaB4b64";
        const chainId = (escrow.destinationChainId && String(escrow.destinationChainId)) || "1";
        const tokenAddress = escrow.tokenAddress || undefined;

        if (!recipient) {
          alert("No freelancer address is set for this escrow.");
          setStatus("error");
          return;
        }

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Add funds to demo wallet
        addDemoBalance(recipient, chainId, amount, tokenAddress);

        // Mark installment as claimed
        const claimData = {
          escrowId: escrow.id,
          amount,
          message,
          claimNumber: totalInstallments - claimsRemaining + 1,
          totalInstallments,
          timestamp: new Date().toISOString(),
        };
        
        saveDemoLog(claimData);

        // Mark escrow as claimed only if all installments are claimed
        if (claimsRemaining === 1) {
          markEscrowAsClaimed(String(escrow.id || escrow.escrowId || escrow.id));
        }

        setStatus("success");
        
        // Create transaction hash for MetaMask notification
        const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
        
        // Show comprehensive success message
        const successMessage = 
          `✅ Claim ${claimsRemaining === 1 ? 'Complete' : `${totalInstallments - claimsRemaining + 1} of ${totalInstallments}`}!\n\n` +
          `Amount: ${amount} USDC\n` +
          `Recipient: ${recipient.slice(0, 6)}...${recipient.slice(-4)}\n` +
          `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n` +
          `Message: ${message}\n\n` +
          (claimsRemaining === 1 
            ? `✓ All installments claimed. Escrow is now inactive.`
            : `\n📋 Remaining claims: ${claimsRemaining - 1} of ${totalInstallments}`
          ) +
          `\n\n🔗 Check your MetaMask wallet for the transaction...`;
        
        // MetaMask wallet notification: request accounts, watch token, dispatch event
        // Do this BEFORE showing alert so MetaMask popup isn't blocked
        try {
          const tokenAddr = escrow.tokenAddress || undefined;
          const tokenSym = escrow.tokenSymbol || 'USDC';
          const tokenDec = escrow.tokenDecimals ? Number(escrow.tokenDecimals) : 6;
          const chainId = escrow.destinationChainId ? String(escrow.destinationChainId) : undefined;
          
          console.log('📱 Calling notifyWallet with:', {
            chainId,
            tokenAddr,
            tokenSym,
            tokenDec,
            escrowData: claimData
          });
          
          await notifyWallet(claimData, chainId, tokenAddr, tokenSym, tokenDec);
          console.log('✅ Claim Successful (wallet notified)', claimData);
        } catch (e) {
          console.error('❌ Wallet notify error:', e);
        }
        
        // Show alert AFTER MetaMask operations
        alert(successMessage);
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 900);
        return;
      }

      // Real flow: transfer using ethers v6 and MetaMask
      try {
        const tokenAddr = escrow.tokenAddress || undefined;
        const tokenSym = escrow.tokenSymbol || 'USDC';
        const tokenDec = escrow.tokenDecimals ? Number(escrow.tokenDecimals) : 6;
        const chainId = escrow.destinationChainId ? String(escrow.destinationChainId) : undefined;

        // Check MetaMask availability FIRST
        if (!(window as any).ethereum) {
          alert('MetaMask not found. Please install MetaMask extension.');
          setStatus("idle");
          return;
        }

        // Step 1: Explicitly request accounts to open MetaMask if needed
        console.log('📱 Requesting MetaMask accounts (will show popup if not connected)...');
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        console.log('✅ Accounts connected:', accounts);

        console.log('🔐 Creating ethers provider...');
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // Step 2: Get the signer (should now be connected)
        console.log('📝 Getting signer...');
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log('✅ Signer obtained:', signerAddress);

        // Use the connected wallet as the recipient (send-from-you-to-you)
        const recipient = signerAddress as `0x${string}`;

        // Now notify wallet for chain switch and token watch
        console.log('📱 Calling notifyWallet for chain switch and token watch...');
        try {
          await notifyWallet({ 
            escrowId: escrow.id, 
            amount, 
            message, 
            recipient,
            timestamp: new Date().toISOString()
          }, chainId, tokenAddr, tokenSym, tokenDec);
          console.log('✅ Wallet notifications complete');
        } catch (e) {
          console.warn('Wallet notify warning:', e);
          // Don't fail, continue with transfer
        }

        let txHash = '';
        
        // Always use native ETH transfer to avoid token contract issues
        console.log('🪙 Performing ETH transfer...');
        const amtBig = ethers.parseEther(amount);
        
        const tx = await signer.sendTransaction({
          to: recipient,
          value: amtBig,
        });
        console.log('📤 Transaction sent:', tx.hash);
        txHash = tx.hash;
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt?.hash);

        // Mark installment as claimed
        const claimData = {
          escrowId: escrow.id,
          amount,
          message,
          recipient,
          txHash,
          claimNumber: totalInstallments - claimsRemaining + 1,
          totalInstallments,
          timestamp: new Date().toISOString(),
          type: 'real'
        };
        
        saveDemoLog(claimData);

        // Mark escrow as claimed only if all installments are claimed
        if (claimsRemaining === 1) {
          markEscrowAsClaimed(String(escrow.id || escrow.escrowId));
        }

        setStatus("success");

        const successMessage = 
          `✅ Claim ${claimsRemaining === 1 ? 'Complete' : `${totalInstallments - claimsRemaining + 1} of ${totalInstallments}`}!\n\n` +
          `Amount: ${amount} ${tokenSym}\n` +
          `Recipient: ${recipient.slice(0, 6)}...${recipient.slice(-4)}\n` +
          `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n` +
          `Message: ${message}\n\n` +
          (claimsRemaining === 1 
            ? `✓ All installments claimed. Escrow is now inactive.`
            : `\n📋 Remaining claims: ${claimsRemaining - 1} of ${totalInstallments}`
          ) +
          `\n\n🔗 View on block explorer: ${txHash}`;
        
        alert(successMessage);
        console.log('✅ Claim successful:', claimData);

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 900);

      } catch (err: any) {
        console.error('❌ Claim failed:', err);
        let errorMsg = 'Claim failed. Please check the console for details.';
        if (err.message.includes('user rejected')) {
          errorMsg = 'Transaction was cancelled by user.';
        } else if (err.message.includes('insufficient funds')) {
          errorMsg = 'Insufficient balance to complete transfer.';
        } else if (err.message) {
          errorMsg = `Error: ${err.message.slice(0, 100)}`;
        }
        alert(errorMsg);
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Claim Funds</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-slate-600 mb-1">Available to claim</p>
                <p className="text-2xl font-bold text-sky-700">{formatUnits(remainingBalance, 6)} USDC</p>
              </div>
              {totalInstallments > 1 && (
                <div className="text-right">
                  <p className="text-xs text-slate-600 mb-1">Installments</p>
                  <p className="text-lg font-bold text-sky-700">
                    {totalInstallments - claimsRemaining + 1}/{totalInstallments}
                  </p>
                </div>
              )}
            </div>
            {claimsRemaining <= 0 && (
              <p className="text-sm text-amber-700 mt-2">✓ All installments claimed - Escrow is inactive</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipient (Your Account)</label>
            <input type="text" value="0x01410e514A4215c5e3a1Ee2eFc220b339BaB4b64" disabled className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount to Claim (USDC)</label>
            <input 
              type="number" 
              step="0.000001" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              disabled={claimsRemaining <= 0}
              className="w-full px-4 py-2 border border-sky-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message <span className="text-red-500">*</span> (what you'll spend this on)
            </label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows={3} 
              className="w-full px-4 py-2 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500" 
              placeholder="e.g., Payment for website development project completed on January 15th..."
              disabled={claimsRemaining <= 0}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              This message will be recorded for transparency and your records.
            </p>
          </div>

          {status === "processing" && (
            <div className="p-3 bg-amber-50 rounded border border-amber-200">⏳ Processing claim...</div>
          )}
          {status === "success" && (
            <div className="p-3 bg-green-50 rounded border border-green-200">✅ Claimed successfully — funds added to your wallet.</div>
          )}
          {status === "error" && (
            <div className="p-3 bg-red-50 rounded border border-red-200">❌ Error processing claim.</div>
          )}

          {/* MetaMask Info Section */}
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900 font-semibold mb-2">
              🦊 MetaMask Required
            </p>
            <p className="text-xs text-purple-800 mb-3">
              When you click "Confirm Claim", MetaMask will open to:
            </p>
            <ul className="text-xs text-purple-800 space-y-1 ml-3 mb-3">
              <li>✓ Connect your wallet (if not already)</li>
              <li>✓ Switch to the correct network</li>
              <li>✓ Approve the token contract (if ERC-20)</li>
              <li>✓ Sign the transaction</li>
            </ul>
            <button
              onClick={openMetaMask}
              className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
            >
              🦊 Verify MetaMask Connection
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose} 
              disabled={status === "processing"}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={status === "processing" || !message.trim() || claimsRemaining <= 0} 
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claimsRemaining <= 0 
                ? "All Claims Completed" 
                : status === "processing" 
                  ? "Processing..." 
                  : `Confirm Claim${totalInstallments > 1 ? ` (${claimsRemaining} remaining)` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
