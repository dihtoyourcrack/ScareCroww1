"use client";

import { useEffect, useState } from "react";
import { useCreateEscrow, useCreateEscrowWithInstallments, useDepositFunds, useTokenApproval } from "@/hooks/useEscrowContract";
import { useENS } from "@/hooks/useENS";
import { uploadToIPFS, uploadToLocalStorage } from "@/lib/ipfs";
import { ESCROW_ADDRESS } from "@/lib/contracts";
import { isAddress, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { CHAINS, TOKENS } from "@shared/constants/chains";
import { 
  isDemoMode, 
  createDemoEscrow, 
  backgroundTx,
  simulateDelay,
  addDemoBalance
} from "@/lib/demo";

const TOKEN_LIST = [
  { symbol: "USDC", address: "0x833589fcd6edb6e08f4c7c32d4f71b1566469c18", decimals: 6 },
  { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", decimals: 18 },
];

const CHAIN_LIST = Object.values(CHAINS);

export default function CreateEscrowForm() {
  const { isConnected, address: walletAddress } = useAccount();
  const [freelancerInput, setFreelancerInput] = useState("");
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [token, setToken] = useState(TOKEN_LIST[0]);
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("1");
  const [destinationChain, setDestinationChain] = useState(CHAIN_LIST[0]);
  const [message, setMessage] = useState("");
  const [isResolvingENS, setIsResolvingENS] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<"create" | "deposit">("create");
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [messageCID, setMessageCID] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    status: "idle" | "pending" | "success" | "error";
    hash?: string;
    message?: string;
  }>({ status: "idle" });

  const { createEscrow, isLoading: isCreating, error: createError, hash: createHash } = useCreateEscrow();
  const { createEscrowWithInstallments, isLoading: isCreatingWithInstallments, hash: createWithInstallmentsHash } = useCreateEscrowWithInstallments();
  const { depositFunds, isLoading: isDepositing, error: depositError } = useDepositFunds();
  const { approve, isLoading: isApproving, hash: approveHash } = useTokenApproval(token.address as `0x${string}`);
  const { resolve } = useENS();

  // Watch for transaction hash and update status
  useEffect(() => {
    const txHash = createHash || createWithInstallmentsHash;
    if (txHash && txStatus.status === "pending") {
      setTxStatus({
        status: "success",
        hash: txHash,
        message: "✅ Escrow creation transaction submitted!",
      });
      // Set a temporary escrow ID - in production, parse this from events
      setEscrowId("0");
    }
  }, [createHash, createWithInstallmentsHash]);

  // Watch for loading state
  useEffect(() => {
    if ((isCreating || isCreatingWithInstallments) && txStatus.status !== "pending") {
      setTxStatus({
        status: "pending",
        message: "⏳ Waiting for transaction confirmation...",
      });
    }
  }, [isCreating, isCreatingWithInstallments]);

  // Watch for errors
  useEffect(() => {
    if (createError) {
      setSubmitError(createError.message);
      setTxStatus({
        status: "error",
        message: `❌ Error: ${createError.message}`,
      });
    }
  }, [createError]);

  // Watch for approval completion
  useEffect(() => {
    if (approveHash && !isApproved) {
      setIsApproved(true);
      setTxStatus({
        status: "success",
        hash: approveHash,
        message: "✅ Token approved! You can now deposit.",
      });
    }
  }, [approveHash, isApproved]);

  // Auto-advance to deposit step when escrow is created
  useEffect(() => {
    if (!isCreating && escrowId && step === "create") {
      setTxStatus({
        status: "success",
        message: `✅ Escrow created! Ready for deposit.`,
      });
      // Auto-advance to deposit step after short delay
      setTimeout(() => setStep("deposit"), 2000);
    }
  }, [escrowId, isCreating, step]);

  const handleResolveENS = async () => {
    if (!freelancerInput.trim()) {
      alert("Please enter an address or ENS name");
      return;
    }

    setIsResolvingENS(true);
    try {
      console.log("🔍 Resolving ENS:", freelancerInput);
      if (isAddress(freelancerInput)) {
        console.log("✓ Valid address detected:", freelancerInput);
        setFreelancerAddress(freelancerInput);
      } else if (freelancerInput.endsWith(".eth")) {
        console.log("🌐 Resolving .eth name:", freelancerInput);
        const resolved = await resolve(freelancerInput);
        if (resolved && isAddress(resolved)) {
          console.log("✓ ENS resolved to:", resolved);
          setFreelancerAddress(resolved);
        } else {
          console.log("❌ ENS resolution failed");
          alert("ENS name not found. Please enter a valid .eth name or address.");
        }
      } else {
        alert("Please enter a valid Ethereum address (0x...) or .eth domain");
      }
    } catch (error) {
      console.error("❌ ENS resolution error:", error);
      alert("Error resolving address. Please try again.");
    } finally {
      setIsResolvingENS(false);
    }
  };

  const uploadMessageToIPFS = async (msg: string): Promise<string> => {
    if (!msg.trim()) return "";
    
    try {
      setTxStatus({
        status: "pending",
        message: "Uploading message to IPFS...",
      });

      const uploadData = {
        message: msg,
        timestamp: Math.floor(Date.now() / 1000),
      };

      const response = await uploadToIPFS(uploadData);
      console.log("✓ Message uploaded to IPFS:", response.ipfsHash);
      return response.ipfsHash;
    } catch (error) {
      console.warn("IPFS upload failed, falling back to localStorage:", error);
      const cid = uploadToLocalStorage({
        message: msg,
        timestamp: Math.floor(Date.now() / 1000),
      });
      return cid;
    }
  };

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setTxStatus({ status: "idle" });

    console.log("📝 Create escrow form submission started");

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!freelancerAddress || !isAddress(freelancerAddress)) {
      alert("Please resolve a valid freelancer address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setTxStatus({
        status: "pending",
        message: "Uploading message to IPFS...",
      });

      // Upload message to IPFS if provided
      let cid = "";
      if (message.trim()) {
        cid = await uploadMessageToIPFS(message);
        setMessageCID(cid);
      }

      const numInstallments = parseInt(installments);

      console.log("🚀 Creating escrow:", {
        freelancer: freelancerAddress,
        totalInstallments: numInstallments,
        amount,
        messageCID: cid || "none",
      });

      setTxStatus({
        status: "pending",
        message: "Creating escrow contract...",
      });

      // Call the appropriate contract function based on installments
      if (numInstallments > 1) {
        // Create escrow with installments
        createEscrowWithInstallments?.({
          args: [freelancerAddress as `0x${string}`, BigInt(numInstallments)],
        });
      } else {
        // Create simple escrow
        createEscrow?.({
          args: [freelancerAddress as `0x${string}`],
        });
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create escrow";
      console.error("❌ Create escrow error:", errorMsg);
      setSubmitError(errorMsg);
      setTxStatus({ status: "error", message: `Error: ${errorMsg}` });
    }
  };

  const handleDepositFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!walletAddress || !isConnected) {
      alert("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const amountInSmallestUnit = parseUnits(amount, token.decimals);

      // If not approved yet, approve first
      if (!isApproved && token.symbol !== "ETH") {
        setTxStatus({
          status: "pending",
          message: "Step 1/2: Approving token...",
        });

        console.log("🔐 Approving USDC for escrow contract:", {
          token: token.address,
          spender: ESCROW_ADDRESS,
          amount: amountInSmallestUnit.toString(),
        });

        approve?.({
          args: [ESCROW_ADDRESS, amountInSmallestUnit],
        });

        return; // Wait for approval to complete, then user clicks deposit again
      }

      // Once approved, proceed to deposit
      setTxStatus({
        status: "pending",
        message: "Step 2/2: Depositing funds...",
      });

      console.log("💰 Depositing funds:", {
        amount,
        token: token.symbol,
        escrowId: escrowId || "0",
      });

      depositFunds?.({
        args: [BigInt(escrowId || "0"), token.address as `0x${string}`, amountInSmallestUnit],
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to deposit funds";
      console.error("❌ Deposit error:", errorMsg);
      setSubmitError(errorMsg);
      setTxStatus({
        status: "error",
        message: `Error: ${errorMsg}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex gap-4 items-center">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
            step === "create" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
          }`}
        >
          1
        </div>
        <div className={`flex-1 h-1 ${step === "create" ? "bg-gray-600" : "bg-green-600"}`}></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
            step === "deposit" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300"
          }`}
        >
          2
        </div>
      </div>

      {step === "create" && (
        <form onSubmit={handleCreateEscrow} className="space-y-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-white">Step 1: Create Escrow</h2>

          {/* Status Messages */}
          {txStatus.status !== "idle" && (
            <div
              className={`rounded-lg p-4 text-sm ${
                txStatus.status === "pending"
                  ? "bg-blue-900 border border-blue-700 text-blue-200"
                  : txStatus.status === "success"
                  ? "bg-green-900 border border-green-700 text-green-200"
                  : "bg-red-900 border border-red-700 text-red-200"
              }`}
            >
              <p className="font-semibold">
                {txStatus.status === "pending" && "⏳ "}
                {txStatus.status === "success" && "✓ "}
                {txStatus.status === "error" && "✗ "}
                {txStatus.message}
              </p>
              {txStatus.hash && txStatus.hash.startsWith?.('0x') && (
                <div className="mt-2">
                  <p className="text-xs font-mono break-all">
                    {txStatus.hash.slice(0, 10)}...{txStatus.hash.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">❌ {submitError}</p>
            </div>
          )}

          {(createError || depositError) && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">
                ❌ {createError ? (createError instanceof Error ? createError.message : String(createError)) : (depositError instanceof Error ? depositError.message : String(depositError))}
              </p>
            </div>
          )}

          {/* Freelancer Address */}
          <div>
            <label className="block text-white mb-2 font-semibold">Freelancer Address or ENS</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={freelancerInput}
                onChange={(e) => setFreelancerInput(e.target.value)}
                placeholder="0x... or name.eth"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleResolveENS}
                disabled={isResolvingENS}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm"
              >
                {isResolvingENS ? "..." : "Resolve"}
              </button>
            </div>
            {freelancerAddress && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {freelancerAddress.slice(0, 10)}...{freelancerAddress.slice(-8)}
              </p>
            )}
          </div>

          {/* Token Selection */}
          <div>
            <label className="block text-white mb-2 font-semibold">Token</label>
            <select
              value={token.symbol}
              onChange={(e) => {
                const selected = TOKEN_LIST.find((t) => t.symbol === e.target.value);
                if (selected) setToken(selected);
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              {TOKEN_LIST.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white mb-2 font-semibold">Amount ({token.symbol})</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
            />
          </div>

          {/* Installments */}
          <div>
            <label className="block text-white mb-2 font-semibold">Number of Installments</label>
            <input
              type="number"
              min="1"
              max="12"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              Amount per installment: {amount && installments ? (parseFloat(amount) / parseFloat(installments)).toFixed(4) : "0"} {token.symbol}
            </p>
          </div>

          {/* Destination Chain */}
          <div>
            <label className="block text-white mb-2 font-semibold">Freelancer Destination Chain</label>
            <select
              value={destinationChain.id}
              onChange={(e) => {
                const selected = CHAIN_LIST.find((c) => c.id === parseInt(e.target.value));
                if (selected) setDestinationChain(selected);
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
            >
              {CHAIN_LIST.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-white mb-2 font-semibold">
              Message (Optional - will be uploaded to IPFS)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note or description for the freelancer..."
              rows={3}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              {message.length} characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !freelancerAddress || !amount || txStatus.status === "pending"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {isCreating || txStatus.status === "pending"
              ? "⏳ Creating Escrow..."
              : txStatus.status === "success"
              ? "✓ Proceeding to Deposit..."
              : "Create Escrow"}
          </button>
        </form>
      )}

      {step === "deposit" && (
        <form onSubmit={handleDepositFunds} className="space-y-4 max-w-2xl">
          <h2 className="text-2xl font-bold text-white">Step 2: Deposit Funds</h2>

          {txStatus.status !== "idle" && (
            <div
              className={`rounded-lg p-4 text-sm ${
                txStatus.status === "pending"
                  ? "bg-blue-900 border border-blue-700 text-blue-200"
                  : txStatus.status === "success"
                  ? "bg-green-900 border border-green-700 text-green-200"
                  : "bg-red-900 border border-red-700 text-red-200"
              }`}
            >
              <p className="font-semibold">
                {txStatus.status === "pending" && "⏳ "}
                {txStatus.status === "success" && "✓ "}
                {txStatus.status === "error" && "✗ "}
                {txStatus.message}
              </p>
            </div>
          )}

          {submitError && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3">
              <p className="text-red-200 text-sm">❌ {submitError}</p>
            </div>
          )}

          {/* Review Summary */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-white">Escrow Summary</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Freelancer: {freelancerAddress.slice(0, 10)}...{freelancerAddress.slice(-8)}</p>
              <p>Total Amount: {amount} {token.symbol}</p>
              <p>Installments: {installments} x {(parseFloat(amount) / parseFloat(installments)).toFixed(4)} {token.symbol}</p>
              <p>Destination Chain: {destinationChain.name}</p>
              {messageCID && <p>Message: Uploaded to IPFS ({messageCID.slice(0, 8)}...)</p>}
            </div>
          </div>

          {/* Token Approval Notice */}
          {!isApproved && token.symbol !== "ETH" && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-200 text-sm">
                ⚠️ Step 1: Approve the escrow contract to spend your {token.symbol}
              </p>
            </div>
          )}

          {isApproved && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-3">
              <p className="text-green-200 text-sm">
                ✅ Token approved! Ready to deposit.
              </p>
            </div>
          )}

          {/* Deposit Button */}
          <button
            type="submit"
            disabled={isDepositing || isApproving || txStatus.status === "pending"}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {isApproving
              ? "⏳ Approving Token..."
              : isDepositing || txStatus.status === "pending"
              ? "⏳ Depositing..."
              : txStatus.status === "success"
              ? "✓ Complete!"
              : !isApproved && token.symbol !== "ETH"
              ? `Step 1: Approve ${token.symbol}`
              : `Step 2: Deposit ${amount} ${token.symbol}`}
          </button>

          <button
            type="button"
            onClick={() => setStep("create")}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg text-sm"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}
