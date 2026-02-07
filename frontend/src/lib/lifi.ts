import axios from "axios";

const LIFI_API = "https://li.quest/v1";

export async function getBridgeQuote(params: {
  fromChain: string;
  fromToken: string;
  toChain: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
}) {
  try {
    const response = await axios.get(`${LIFI_API}/quote`, {
      params,
      headers: {
        "x-lifi-api-key": process.env.NEXT_PUBLIC_LIFI_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("LiFi quote error:", error);
    throw error;
  }
}

export async function executeBridge(quote: any, signer: any) {
  // Execute the bridge transaction via LiFi
  const tx = await signer.sendTransaction({
    to: quote.transactionRequest.to,
    from: quote.transactionRequest.from,
    data: quote.transactionRequest.data,
    value: quote.transactionRequest.value,
    gasLimit: quote.transactionRequest.gasLimit,
    gasPrice: quote.transactionRequest.gasPrice,
  });

  return tx;
}
