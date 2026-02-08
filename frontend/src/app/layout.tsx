"use client";

import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { ReactNode } from "react";
import PageTransition from "@/components/ui/PageTransition";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Navigation } from "@/components/Navigation";

const { chains, publicClient } = configureChains(
  [baseSepolia],
  [publicProvider()]
);

// Use connectors without WalletConnect to avoid project ID errors
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains, projectId: "mock" }),
      coinbaseWallet({ chains, appName: "Cross-Chain Escrow" }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              <Navigation />
              <main>
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
