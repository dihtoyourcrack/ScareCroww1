export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: string | number, decimals = 2) {
  return Number(amount).toFixed(decimals);
}

export async function resolveENS(ensName: string) {
  // ENS resolution would be implemented here
  return ensName;
}
