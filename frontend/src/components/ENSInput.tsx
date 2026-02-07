"use client";

export default function ENSInput() {
  return (
    <div>
      <label className="block text-white mb-2">Recipient (ENS or Address)</label>
      <input
        type="text"
        placeholder="vitalik.eth or 0x..."
        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
      />
    </div>
  );
}
