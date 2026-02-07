"use client";

import { ReactNode } from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      {message && <p className="text-gray-300 text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface TransactionStatusProps {
  status: "idle" | "pending" | "success" | "error";
  message?: string;
  txHash?: string;
  onClose?: () => void;
}

export function TransactionStatus({ status, message, txHash, onClose }: TransactionStatusProps) {
  if (status === "idle") return null;

  const statusConfig = {
    pending: {
      bg: "bg-blue-900 border-blue-700",
      text: "text-blue-200",
      icon: "⏳",
    },
    success: {
      bg: "bg-green-900 border-green-700",
      text: "text-green-200",
      icon: "✓",
    },
    error: {
      bg: "bg-red-900 border-red-700",
      text: "text-red-200",
      icon: "✗",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`rounded-lg border p-4 ${config.bg} ${config.text}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold">
            {config.icon} {message || `Transaction ${status}`}
          </p>
          {txHash && txHash.startsWith && txHash.startsWith('0x') && (
            <div className="mt-2">
              <p className="text-xs font-mono break-all">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
              <a 
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline mt-1 inline-block opacity-80 hover:opacity-100"
              >
                View on BaseScan →
              </a>
            </div>
          )}
        </div>
        {onClose && status !== "pending" && (
          <button
            onClick={onClose}
            className="ml-4 text-sm opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

interface ButtonWithStatusProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  successText?: string;
  loadingText?: string;
  errorText?: string;
}

export function ButtonWithStatus({
  onClick,
  isLoading,
  isSuccess,
  isError,
  disabled,
  children,
  className = "",
  successText = "Success ✓",
  loadingText = "Processing...",
  errorText = "Failed ✗",
}: ButtonWithStatusProps) {
  const getButtonText = () => {
    if (isLoading) return loadingText;
    if (isSuccess) return successText;
    if (isError) return errorText;
    return children;
  };

  const getButtonClass = () => {
    let baseClass = className || "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition";
    
    if (isLoading || disabled) {
      baseClass += " opacity-50 cursor-not-allowed";
    }
    
    if (isSuccess) {
      baseClass = baseClass.replace("bg-blue-600", "bg-green-600");
    }
    
    if (isError) {
      baseClass = baseClass.replace("bg-blue-600", "bg-red-600");
    }
    
    return baseClass;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={getButtonClass()}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      )}
      {getButtonText()}
    </button>
  );
}

export default LoadingSpinner;
