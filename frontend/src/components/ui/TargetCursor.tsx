"use client";

import { useEffect, useRef, useState } from "react";

export default function TargetCursor({
  spinDuration = 2,
  hideDefaultCursor = true,
  parallaxOn = true,
  hoverDuration = 0.2
}: any) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hasTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasTouch || prefersReduced) return; // disable on touch devices or when user prefers reduced motion
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !cursorRef.current) return;
    const cursor = cursorRef.current;
    const dot = dotRef.current;

    if (hideDefaultCursor) document.body.style.cursor = "none";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const move = (x: number, y: number) => {
      targetX = x;
      targetY = y;
    };

    const onMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      if (cursor) cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      if (dot) dot.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Hover handlers for elements with .cursor-target
    const targets = new Set<HTMLElement>();

    const enter = (ev: Event) => {
      const t = ev.target as HTMLElement;
      if (!t) return;
      const el = t.closest?.(".cursor-target") as HTMLElement | null;
      if (el) targets.add(el);
      if (cursor) cursor.classList.add("cursor--active");
    };

    const leave = (ev: Event) => {
      const t = ev.target as HTMLElement;
      const el = t?.closest?.(".cursor-target") as HTMLElement | null;
      if (el) targets.delete(el);
      if (targets.size === 0 && cursor) cursor.classList.remove("cursor--active");
    };

    window.addEventListener("mouseover", enter);
    window.addEventListener("mouseout", leave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", enter);
      window.removeEventListener("mouseout", leave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideDefaultCursor) document.body.style.cursor = "";
    };
  }, [enabled, hideDefaultCursor]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="target-cursor-wrapper fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999]"
        style={{ transform: `translate(${window?.innerWidth / 2}px, ${window?.innerHeight / 2}px)` }}
      >
        <div className="target-cursor-dot" ref={dotRef} style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--accent)', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="target-cursor-corner corner-tl" style={{ position: 'absolute', left: '50%', top: '50%', width: 12, height: 12, border: `2px solid var(--accent)`, transform: 'translate(-150%,-150%)' }} />
        <div className="target-cursor-corner corner-tr" style={{ position: 'absolute', left: '50%', top: '50%', width: 12, height: 12, border: `2px solid var(--accent)`, transform: 'translate(50%,-150%)' }} />
        <div className="target-cursor-corner corner-br" style={{ position: 'absolute', left: '50%', top: '50%', width: 12, height: 12, border: `2px solid var(--accent)`, transform: 'translate(50%,50%)' }} />
        <div className="target-cursor-corner corner-bl" style={{ position: 'absolute', left: '50%', top: '50%', width: 12, height: 12, border: `2px solid var(--accent)`, transform: 'translate(-150%,50%)' }} />
      </div>
      <style jsx>{`
        .target-cursor-wrapper { transform: translate(-50%, -50%); }
        .target-cursor-dot { transition: transform 0.12s linear; }
        .target-cursor-wrapper .cursor--active { transform: scale(1.12); }
      `}</style>
    </>
  );
}
