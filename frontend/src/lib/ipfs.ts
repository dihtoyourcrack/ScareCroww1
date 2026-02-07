import axios from "axios";

// Using Pinata as IPFS provider (free tier available)
const PINATA_API = "https://api.pinata.cloud";
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

export interface IPFSUploadResponse {
  ipfsHash: string;
  pinataUrl: string;
}

/**
 * Upload JSON data to IPFS via Pinata
 * Returns IPFS hash (CID) for storage in smart contract
 */
export async function uploadToIPFS(data: {
  message: string;
  escrowId?: string;
  timestamp: number;
}): Promise<IPFSUploadResponse> {
  try {
    if (!PINATA_JWT) {
      console.warn("PINATA_JWT not set - returning mock hash");
      // Return a mock CID for demo purposes
      return {
        ipfsHash: "QmVASxQ6Yoqoo1CD2Z7ZyswSGJ6gVXvkUYvs7ynVtQXXX",
        pinataUrl: `https://gateway.pinata.cloud/ipfs/QmVASxQ6Yoqoo1CD2Z7ZyswSGJ6gVXvkUYvs7ynVtQXXX`,
      };
    }

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("file", jsonBlob, "metadata.json");

    // Pinata options for metadata
    const pinataOptions = {
      cidVersion: 1,
    };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    const response = await axios.post(
      `${PINATA_API}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { IpfsHash } = response.data;

    return {
      ipfsHash: IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
    };
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

/**
 * Retrieve IPFS data from Pinata gateway
 */
export async function retrieveFromIPFS(
  ipfsHash: string
): Promise<{
  message: string;
  escrowId?: string;
  timestamp: number;
}> {
  try {
    const response = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    );
    return response.data;
  } catch (error) {
    console.error("IPFS retrieval error:", error);
    throw new Error("Failed to retrieve from IPFS");
  }
}

/**
 * Simple fallback: store data in localStorage for demo
 * (not recommended for production)
 */
export function uploadToLocalStorage(
  data: {
    message: string;
    escrowId?: string;
    timestamp: number;
  }
): string {
  const cid = `local_${Date.now()}`;
  localStorage.setItem(`ipfs_${cid}`, JSON.stringify(data));
  return cid;
}

export function retrieveFromLocalStorage(
  cid: string
): {
  message: string;
  escrowId?: string;
  timestamp: number;
} | null {
  const data = localStorage.getItem(`ipfs_${cid}`);
  return data ? JSON.parse(data) : null;
}
