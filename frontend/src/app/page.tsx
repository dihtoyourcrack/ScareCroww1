"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScrollVelocity from "@/components/ui/ScrollVelocity";
import BlurText from "@/components/ui/BlurText";
import TextPressure from "@/components/ui/TextPressure";
import Prism from "@/components/ui/Prism";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  const facts = [
    "Secure escrow payments powered by smart contracts on Base Sepolia",
    "Support for installment-based payments for milestone projects",
    "EIP-712 signatures enable gasless payment authorizations",
    "Cross-chain bridging with Uniswap integration",
    "ENS domain support for human-readable addresses",
    "Complete transaction audit trail for transparency",
    "Zero custody - funds always secured in smart contracts",
    "Refund protection after deadline expiration",
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Prism Background - Animated 3D Prism */}
      <div className="fixed inset-0 z-0" style={{ height: '100vh', width: '100vw' }}>
        <Prism
          animationType="3drotate"
          timeScale={0.3}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.2}
          glow={1.2}
          bloom={1}
        />
      </div>
      
      {/* Dark overlay to ensure text readability */}
      <div className="fixed inset-0 bg-black/40 z-[1] pointer-events-none" />

      {/* Scroll Velocity Facts Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <ScrollVelocity
          texts={[facts.join(' • ')]}
          velocity={50}
          numCopies={2}
          className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          parallaxClassName="py-3 overflow-hidden"
          scrollerClassName="flex whitespace-nowrap text-sm font-medium"
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Text Pressure Header */}
        <div className="mb-12" style={{ height: '200px' }}>
          <TextPressure
            text="RealSlimShady"
            textColor="transparent"
            className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            minFontSize={40}
            weight={true}
            width={true}
            italic={true}
            flex={true}
          />
        </div>

        {/* Blur Text Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <BlurText
            text="Decentralized escrow platform for secure freelance payments"
            delay={100}
            animateBy="words"
            direction="bottom"
            className="text-xl md:text-2xl text-white font-bold mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg text-white transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              Launch App
            </Link>
            <Link
              href="/docs"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-lg font-bold text-lg text-white transition-all hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              Documentation
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Secure Escrow</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Smart contract-based escrow system ensures funds are protected until work is completed and approved
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Cross-Chain</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Bridge payments across multiple blockchains with Uniswap-powered token swaps
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">EIP-712 Signatures</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Off-chain authorization allows freelancers to claim payments without client transactions
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Installment Payments</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Split payments into multiple installments for milestone-based project delivery
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="text-3xl mb-4">🏷️</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ENS Support</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Use human-readable ENS names instead of complex wallet addresses for easy transfers
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 hover:bg-black/50 transition-all border border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="text-3xl mb-4">📜</div>
            <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Transaction Logs</h3>
            <p className="text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              Complete audit trail of all escrow activities with timestamps and messages
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-2xl">
                1
              </div>
              <h3 className="font-bold mb-2 text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Create Escrow</h3>
              <p className="text-sm text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Set up escrow with freelancer address and payment amount</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-2xl">
                2
              </div>
              <h3 className="font-bold mb-2 text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Deposit Funds</h3>
              <p className="text-sm text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Client deposits USDC into the smart contract</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-2xl">
                3
              </div>
              <h3 className="font-bold mb-2 text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Complete Work</h3>
              <p className="text-sm text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Freelancer delivers agreed work with payment secured</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-2xl">
                4
              </div>
              <h3 className="font-bold mb-2 text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Get Paid</h3>
              <p className="text-sm text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Client releases funds or provides signature to claim</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-white/90 mb-6 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Ready to get started?</p>
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 px-10 py-4 rounded-lg font-bold text-lg text-white transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            Connect Wallet & Launch
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
