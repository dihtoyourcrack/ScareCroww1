"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isDemoMode, clearDemoData } from "@/lib/demo";
import { useState, useEffect } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  useEffect(() => {
    setShowDemoBanner(isDemoMode());
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/freelancer", label: "Freelancer Portal" },
    { href: "/freelancer/retrieve", label: "Claim Funds" },
    { href: "/docs", label: "Documentation" },
  ];

  const isActive = (path: string) => pathname === path;

  const handleResetDemo = () => {
    if (confirm('Reset all demo data? This will clear wallet balances and claimed escrows.')) {
      clearDemoData();
      window.location.reload();
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      {showDemoBanner && (
        <div className="bg-blue-900/50 border-b border-blue-700/50 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <span className="text-sm text-blue-200">
              Testing environment active
            </span>
            <button
              onClick={handleResetDemo}
              className="text-xs px-3 py-1 bg-blue-800/50 hover:bg-blue-800 text-blue-100 rounded border border-blue-600/50 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">
                RealSlimShady
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
