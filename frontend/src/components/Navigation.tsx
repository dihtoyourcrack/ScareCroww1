"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from 'next/dynamic';
import GlassSurface from '@/components/ui/GlassSurface';
import { useState } from "react";
import useReducedMotion from '@/hooks/useReducedMotion';

export function Navigation() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useReducedMotion();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Launch App" },
    { href: "/freelancer", label: "Freelancer Portal" },
    { href: "/freelancer/retrieve", label: "Claim Funds" },
    { href: "/docs", label: "Documentation" }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-extrabold text-text">RealSlimShady</span>
            </Link>

            <div className="hidden md:flex items-center bg-surface/80 backdrop-blur-sm rounded-full px-2 py-1 gap-1">
              <ul className="flex items-center gap-1">{
                navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        isActive(link.href) ? 'bg-accent text-white' : 'text-white hover:bg-surface/60'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              }</ul>
            </div>
          </div>

            <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/create" className="px-4 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:opacity-95 transition">Create Escrow</Link>
              <GlassSurface borderRadius={9999} style={{ padding: '4px' }}>
                <div className="flex items-center gap-2">
                  <ConnectButton />
                  <button
                    aria-pressed={reducedMotion}
                    title={reducedMotion ? "Animations disabled" : "Disable animations"}
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium transition ${reducedMotion ? 'bg-page-bg text-muted-text' : 'bg-accent text-white'}`}
                  >
                    {reducedMotion ? 'Motion Off' : 'Motion On'}
                  </button>
                </div>
              </GlassSurface>
            </div>

            <button
              className="md:hidden p-2 rounded-full bg-surface/80"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="md:hidden mt-2 bg-surface/90 rounded-lg p-2 shadow-sm">
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${isActive(link.href) ? 'bg-accent text-white' : 'text-white hover:bg-surface/70'}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <div className="pt-1">
                  <ConnectButton />
                </div>
              </li>
              <li>
                <Link href="/create" className="block mt-2 px-4 py-2 rounded-lg bg-accent text-white text-center font-semibold" onClick={() => setMobileOpen(false)}>Create Escrow</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
