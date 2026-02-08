"use client";

import CreateEscrowForm from "@/components/escrow/CreateEscrowForm";

export default function CreatePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Create Escrow</h1>
        <p className="text-gray-400 mt-2">Create a new escrow and deposit funds for your freelancer.</p>
      </div>

      <CreateEscrowForm />
    </div>
  );
}
"use client";

import CreateEscrowForm from "@/components/escrow/CreateEscrowForm";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Escrow</h1>
            <p className="text-gray-400">
              Set up a new escrow for your freelancer with installments and cross-chain support
            </p>
          </div>

          <CreateEscrowForm />
        </div>
      </div>
    </div>
  );
}
