import { usePublicClient } from "wagmi";
import { isAddress } from "viem";

export function useENS() {
  const publicClient = usePublicClient();

  async function resolve(nameOrAddress: string) {
    // If already an address, return it
    if (isAddress(nameOrAddress)) {
      return nameOrAddress;
    }

    // Try to resolve ENS name (requires publicClient with ENS support)
    if (nameOrAddress.endsWith(".eth")) {
      try {
        const address = await publicClient?.getEnsAddress({ name: nameOrAddress });
        return address || null;
      } catch (error) {
        console.error("ENS resolution error:", error);
        return null;
      }
    }

    return null;
  }

  return { resolve };
}
