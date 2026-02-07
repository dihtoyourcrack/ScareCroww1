/**
 * HTTP Transaction Logger
 * Posts transaction events to logging endpoint for audit trail
 */

export interface LogEvent {
  escrowId: string;
  action: string;
  actor: string;
  reason?: string;
  txHash?: string;
  meta?: Record<string, any>;
  timestamp?: number;
  network?: string;
}

export interface LogResponse {
  success: boolean;
  id?: string;
  message?: string;
}

/**
 * Send transaction log to HTTP endpoint
 * Uses httpbin.org for demo, replace with your logging service
 */
export async function httpLog(event: LogEvent): Promise<LogResponse> {
  const endpoint = process.env.NEXT_PUBLIC_HTTP_LOGGING_URL || "https://httpbin.org/post";
  
  const payload = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    network: event.network || "base-sepolia",
    source: "crosschain-escrow-frontend",
  };

  try {
    console.log("📤 HTTP Log:", payload);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log("✅ HTTP Log Response:", {
      status: response.status,
      url: endpoint,
      timestamp: new Date().toISOString(),
    });

    return {
      success: response.ok,
      id: data.id || "demo-log-" + Date.now(),
      message: response.ok 
        ? "Transaction logged successfully" 
        : "Logging failed: " + response.statusText,
    };
  } catch (error) {
    console.error("❌ HTTP Log Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Log installment payout with detailed information
 */
export async function logInstallmentEvent(
  escrowId: string,
  installmentIndex: number,
  actor: string,
  txHash: string,
  amount: string,
  status: "pending" | "success" | "failed"
): Promise<LogResponse> {
  return httpLog({
    escrowId,
    action: "installment_release",
    actor,
    txHash,
    reason: `Installment #${installmentIndex} ${status}`,
    meta: {
      installmentIndex,
      amount,
      status,
    },
  });
}

/**
 * Store HTTP logs in localStorage for demo mode
 */
export function saveHttpLogLocally(event: LogEvent): void {
  const key = `http-logs:${event.escrowId}`;
  const existing = localStorage.getItem(key);
  const logs = existing ? JSON.parse(existing) : [];
  
  logs.push({
    ...event,
    timestamp: event.timestamp || Date.now(),
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });
  
  localStorage.setItem(key, JSON.stringify(logs));
}

/**
 * Retrieve HTTP logs from localStorage
 */
export function getHttpLogsLocally(escrowId?: string): Array<LogEvent & { id: string }> {
  if (escrowId) {
    const key = `http-logs:${escrowId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  // Get all logs
  const allLogs: Array<LogEvent & { id: string }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("http-logs:")) {
      const data = localStorage.getItem(key);
      if (data) {
        allLogs.push(...JSON.parse(data));
      }
    }
  }
  
  return allLogs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * Clear all HTTP logs
 */
export function clearHttpLogs(escrowId?: string): void {
  if (escrowId) {
    localStorage.removeItem(`http-logs:${escrowId}`);
  } else {
    // Clear all logs
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("http-logs:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}
