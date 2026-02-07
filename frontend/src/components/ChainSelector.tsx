"use client";

import { useState } from "react";

export const SUPPORTED_CHAINS = [
  { id: 84531, name: "Base Sepolia", testnet: true },
  { id: 1, name: "Ethereum", testnet: false },
  { id: 137, name: "Polygon", testnet: false },
  { id: 56, name: "BSC", testnet: false },
  { id: 43114, name: "Avalanche", testnet: false },
  { id: 42161, name: "Arbitrum", testnet: false },
];

interface ChainSelectorProps {
  onChange: (chainId: number) => void;
  currentChain?: number;
  label?: string;
}

export const ChainSelector = ({
  onChange,
  currentChain = SUPPORTED_CHAINS[0].id,
  label = "Target Chain",
}: ChainSelectorProps) => {
  const [selected, setSelected] = useState(currentChain);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelected(id);
    onChange(id);
  };

  return (
    <div>
      <label className="block text-white mb-2 font-semibold">{label}</label>
      <select
        value={selected}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
      >
        {SUPPORTED_CHAINS.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name} {chain.testnet ? "(Testnet)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
};
