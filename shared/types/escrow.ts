export enum EscrowStatus {
  PENDING = "PENDING",
  FUNDED = "FUNDED",
  COMPLETED = "COMPLETED",
  DISPUTED = "DISPUTED",
  CANCELLED = "CANCELLED",
}

export interface Escrow {
  id: string;
  employer: string;
  freelancer: string;
  amount: string;
  token: string;
  status: EscrowStatus;
  createdAt: number;
  description: string;
}

export interface CreateEscrowInput {
  freelancer: string;
  amount: string;
  token: string;
  description: string;
}
