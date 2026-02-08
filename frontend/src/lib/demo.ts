// Consolidated demo utilities used by the app (no duplicate exports)

const DEMO_STORAGE_KEY = "demo:storage";
const DEMO_LOGS_KEY = "demo:logs";
const DEMO_COUNTER_KEY = "demo:counter";
const DEMO_WALLET_KEY = "demo_wallet_balance";
const DEMO_CLAIMED_ESCROWS_KEY = "demo_claimed_escrows";
const DEMO_ESCROWS_KEY = "demo:escrows";

/** Check if demo mode is enabled (env OR local toggle) */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return localStorage.getItem("demo:enabled") === "1";
}

/** Clear all demo data */
export function clearDemoData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_STORAGE_KEY);
  localStorage.removeItem(DEMO_LOGS_KEY);
  localStorage.removeItem(DEMO_COUNTER_KEY);
  localStorage.removeItem(DEMO_WALLET_KEY);
  localStorage.removeItem(DEMO_CLAIMED_ESCROWS_KEY);
  localStorage.removeItem(DEMO_ESCROWS_KEY);
  // Also clear session storage and any other cached data
  sessionStorage.clear();
  // Reset demo mode
  localStorage.removeItem("demo:enabled");
}

/** Toggle demo mode on/off */
export function toggleDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) localStorage.setItem("demo:enabled", "1");
  else localStorage.removeItem("demo:enabled");
}

/** Simulate a background transaction with optional delay and logging */
export function backgroundTx<T = any>(fn: () => T, delayMs = 800): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const result = fn();
        // append log
        try {
          const logs = JSON.parse(localStorage.getItem(DEMO_LOGS_KEY) || "[]");
          logs.push({ ts: Date.now(), result });
          localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(logs));
        } catch {}
        resolve(result);
      } catch (e) {
        resolve(undefined as any);
      }
    }, delayMs);
  });
}

/** Save a demo log entry */
export function saveDemoLog(entry: any): void {
  if (typeof window === "undefined") return;
  try {
    const logs = JSON.parse(localStorage.getItem(DEMO_LOGS_KEY) || "[]");
    logs.push({ ts: Date.now(), ...entry });
    localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(logs));
  } catch {}
}

/** Retrieve demo logs */
export function getDemoLogs(): any[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEMO_LOGS_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Simple delay helper used by UI simulations */
export function simulateDelay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a fake transaction hash for demo UI */
export function makeFakeTxHash(): string {
  // produce a 32-byte hex string prefixed with 0x
  const rand = () => Math.floor(Math.random() * 16).toString(16);
  let s = "";
  for (let i = 0; i < 64; i++) s += rand();
  return `0x${s}`;
}

// Demo escrow types and helpers
export interface DemoEscrow {
  id: string;
  client?: string;
  freelancer?: string;
  amount: string;
  tokenAddress?: string | null;
  destinationChainId?: string | number;
  createdAt?: string;
  status?: "open" | "claimed" | "cancelled";
  funded?: boolean;
  released?: boolean;
  refunded?: boolean;
  deadline?: number;
}

const defaultDemoEscrows: DemoEscrow[] = [
  {
    id: "demo-1",
    client: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    freelancer: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    amount: "1000",
    tokenAddress: null,
    destinationChainId: "1",
    createdAt: new Date().toISOString(),
    status: "open",
    funded: true,
    released: false,
    refunded: false,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
  },
  {
    id: "demo-2",
    client: "0xcccccccccccccccccccccccccccccccccccccccc",
    freelancer: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    amount: "500",
    tokenAddress: null,
    destinationChainId: "137",
    createdAt: new Date().toISOString(),
    status: "open",
    funded: true,
    released: false,
    refunded: false,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 15, // 15 days from now
  },
];

/** Get demo escrows from storage (seeds defaults if empty) */
export function getDemoEscrows(): DemoEscrow[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(DEMO_ESCROWS_KEY);
  if (!stored) {
    localStorage.setItem(DEMO_ESCROWS_KEY, JSON.stringify(defaultDemoEscrows));
    return [...defaultDemoEscrows];
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed;
    return [...defaultDemoEscrows];
  } catch {
    return [...defaultDemoEscrows];
  }
}

/** Add or update a demo escrow */
export function addDemoEscrow(escrow: DemoEscrow): void {
  if (typeof window === "undefined") return;
  const escrows = getDemoEscrows();
  const idx = escrows.findIndex((e) => e.id === escrow.id);
  if (idx >= 0) escrows[idx] = { ...escrows[idx], ...escrow };
  else escrows.push(escrow);
  localStorage.setItem(DEMO_ESCROWS_KEY, JSON.stringify(escrows));
}

/** Create a demo escrow (simulated background tx) */
export async function createDemoEscrow(partial: Partial<DemoEscrow>): Promise<DemoEscrow> {
  const escrow: DemoEscrow = {
    id: partial.id || `demo-${Date.now()}`,
    client: partial.client,
    freelancer: partial.freelancer,
    amount: partial.amount || "0",
    tokenAddress: partial.tokenAddress ?? null,
    destinationChainId: partial.destinationChainId ?? "1",
    createdAt: new Date().toISOString(),
    status: partial.status || "open",
    funded: partial.funded ?? true,
    released: partial.released ?? false,
    refunded: partial.refunded ?? false,
    deadline: partial.deadline ?? Math.floor(Date.now() / 1000) + 86400 * 30,
  };
  await backgroundTx(() => addDemoEscrow(escrow), 600);
  return escrow;
}

// Demo wallet state types and helpers
export interface DemoWalletBalance {
  address: string;
  balances: {
    [chainId: string]: {
      native: string;
      tokens: { [tokenAddress: string]: string };
    };
  };
}

export const getDemoWalletBalance = (address: string): DemoWalletBalance => {
  if (typeof window === "undefined") return { address, balances: {} };
  const stored = localStorage.getItem(DEMO_WALLET_KEY);
  if (!stored) return { address, balances: {} };
  try {
    const allBalances = JSON.parse(stored);
    return allBalances[address.toLowerCase()] || { address, balances: {} };
  } catch {
    return { address, balances: {} };
  }
};

export const addDemoBalance = (
  address: string,
  chainId: string,
  amount: string,
  tokenAddress?: string
) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(DEMO_WALLET_KEY);
  const allBalances = stored ? JSON.parse(stored) : {};
  const addressKey = address.toLowerCase();
  if (!allBalances[addressKey]) allBalances[addressKey] = { address, balances: {} };
  if (!allBalances[addressKey].balances[chainId]) allBalances[addressKey].balances[chainId] = { native: "0", tokens: {} };
  if (tokenAddress) {
    const current = allBalances[addressKey].balances[chainId].tokens[tokenAddress] || "0";
    allBalances[addressKey].balances[chainId].tokens[tokenAddress] = (parseFloat(current) + parseFloat(amount)).toString();
  } else {
    const current = allBalances[addressKey].balances[chainId].native || "0";
    allBalances[addressKey].balances[chainId].native = (parseFloat(current) + parseFloat(amount)).toString();
  }
  localStorage.setItem(DEMO_WALLET_KEY, JSON.stringify(allBalances));
};

export const markEscrowAsClaimed = (escrowId: string) => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(DEMO_CLAIMED_ESCROWS_KEY);
  const claimed = stored ? JSON.parse(stored) : [];
  if (!claimed.includes(escrowId)) {
    claimed.push(escrowId);
    localStorage.setItem(DEMO_CLAIMED_ESCROWS_KEY, JSON.stringify(claimed));
  }
  // also mark status on escrows list
  const escrows = getDemoEscrows();
  const idx = escrows.findIndex((e) => e.id === escrowId);
  if (idx >= 0) {
    escrows[idx].status = "claimed";
    localStorage.setItem(DEMO_ESCROWS_KEY, JSON.stringify(escrows));
  }
};

export const isEscrowClaimed = (escrowId: string): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(DEMO_CLAIMED_ESCROWS_KEY);
  const claimed = stored ? JSON.parse(stored) : [];
  return claimed.includes(escrowId);
};
