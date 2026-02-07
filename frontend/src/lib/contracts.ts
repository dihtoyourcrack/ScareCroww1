import abi from "../../abi/FreelanceEscrow.json";

export const ESCROW_ADDRESS = (
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x01410e514A4215c5e3a1Ee2eFc220b339BaB4b64"
) as `0x${string}`;

export const ESCROW_ABI = abi.abi || abi;
