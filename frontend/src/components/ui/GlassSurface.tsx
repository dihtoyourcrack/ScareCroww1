"use client";

import { useEffect, useRef, useId } from "react";

export default function GlassSurface({
  children,
  width = 'auto',
  height = 'auto',
  borderRadius = 14,
  brightness = 50,
  opacity = 0.9,
  blur = 10,
  className = '',
  style = {}
}: any) {
  const unique = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${unique}`;
  const feImageRef = useRef<SVGFEImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      if (!feImageRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${Math.ceil(rect.width)}' height='${Math.ceil(rect.height)}'><rect width='100%' height='100%' fill='rgba(255,255,255,${(brightness/100)})'/></svg>`;
      feImageRef.current.setAttribute('href', `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [brightness]);

  return (
    <div ref={containerRef} className={`glass-surface ${className}`} style={{ width, height, borderRadius, ...style }}>
      <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '0', height: '0' }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef as any} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feGaussianBlur in="map" stdDeviation={blur} result="blurred" />
            <feBlend in="SourceGraphic" in2="blurred" mode="screen" />
          </filter>
        </defs>
      </svg>

      <div style={{ filter: `url(#${filterId})`, WebkitFilter: `url(#${filterId})` }} className="glass-surface__content">
        {children}
      </div>

      <style jsx>{`
        .glass-surface { position: relative; display: inline-block; overflow: hidden; }
        .glass-surface__content { position: relative; z-index: 1; padding: 6px; }
      `}</style>
    </div>
  );
}
