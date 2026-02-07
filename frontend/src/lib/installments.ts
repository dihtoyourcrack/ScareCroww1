/**
 * Installment Utilities
 * Handles installment scheduling, HTTP logging, and payout tracking
 */

export interface Installment {
  index: number;
  amount: string;
  isPaid: boolean;
  paidAt?: number;
  txHash?: string;
  dueDate?: number;
}

export interface InstallmentSchedule {
  escrowId: string;
  totalInstallments: number;
  installmentAmount: string;
  totalAmount: string;
  installmentsPaid: number;
  installments: Installment[];
}

export interface InstallmentPayoutResponse {
  success: boolean;
  txHash?: string;
  message: string;
  timestamp: number;
  gasUsed?: string;
  blockNumber?: number;
}

/**
 * HTTP Logging endpoint for installment payouts
 * Sends transaction details to logging service
 */
export async function logInstallmentPayout(data: {
  escrowId: string;
  installmentIndex: number;
  actor: string;
  recipient: string;
  amount: string;
  txHash?: string;
  status: "pending" | "success" | "failed";
  message?: string;
}): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_HTTP_LOGGING_URL || "https://httpbin.org/post";
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: "installment_payout",
        ...data,
      }),
    });

    if (!response.ok) {
      console.warn("HTTP logging failed:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to log installment payout:", error);
  }
}

/**
 * Generate installment schedule from escrow data
 */
export function generateInstallmentSchedule(
  escrowId: string,
  totalAmount: bigint,
  totalInstallments: number,
  installmentsPaid: number
): InstallmentSchedule {
  const installmentAmount = totalAmount / BigInt(totalInstallments);
  const remainder = totalAmount % BigInt(totalInstallments);
  
  const installments: Installment[] = [];
  
  for (let i = 0; i < totalInstallments; i++) {
    const isLast = i === totalInstallments - 1;
    const amount = isLast 
      ? (installmentAmount + remainder).toString()
      : installmentAmount.toString();
    
    installments.push({
      index: i + 1,
      amount,
      isPaid: i < installmentsPaid,
      dueDate: Date.now() + (i * 7 * 24 * 60 * 60 * 1000), // Weekly schedule
    });
  }
  
  return {
    escrowId,
    totalInstallments,
    installmentAmount: installmentAmount.toString(),
    totalAmount: totalAmount.toString(),
    installmentsPaid,
    installments,
  };
}

/**
 * Format installment status for display
 */
export function getInstallmentStatusText(installment: Installment): {
  text: string;
  color: string;
} {
  if (installment.isPaid) {
    return { text: "Paid", color: "success" };
  }
  
  if (installment.dueDate && installment.dueDate < Date.now()) {
    return { text: "Overdue", color: "danger" };
  }
  
  return { text: "Pending", color: "warning" };
}

/**
 * Calculate next installment due
 */
export function getNextInstallment(schedule: InstallmentSchedule): Installment | null {
  return schedule.installments.find(i => !i.isPaid) || null;
}

/**
 * Calculate total amount paid so far
 */
export function getTotalPaid(schedule: InstallmentSchedule): bigint {
  return schedule.installments
    .filter(i => i.isPaid)
    .reduce((sum, i) => sum + BigInt(i.amount), BigInt(0));
}

/**
 * Calculate remaining balance
 */
export function getRemainingBalance(schedule: InstallmentSchedule): bigint {
  return BigInt(schedule.totalAmount) - getTotalPaid(schedule);
}

/**
 * Format installment progress percentage
 */
export function getProgressPercentage(schedule: InstallmentSchedule): number {
  return Math.round((schedule.installmentsPaid / schedule.totalInstallments) * 100);
}
