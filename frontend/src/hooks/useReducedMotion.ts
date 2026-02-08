"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "rss_reduced_motion";

export default function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (reduced) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, reduced ? "true" : "false");
    } catch (e) {}
  }, [reduced]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (ev: MediaQueryListEvent) => {
      // only update if user hasn't explicitly set a preference
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        setReduced(ev.matches);
      }
    };
    try {
      // older browsers
      if (mq.addEventListener) mq.addEventListener("change", listener);
      else mq.addListener(listener as any);
    } catch (e) {}
    return () => {
      try {
        if (mq.removeEventListener) mq.removeEventListener("change", listener);
        else mq.removeListener(listener as any);
      } catch (e) {}
    };
  }, []);

  const set = useCallback((v: boolean) => setReduced(!!v), []);

  return [reduced, set] as const;
}
