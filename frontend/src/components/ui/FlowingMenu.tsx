"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import useReducedMotion from '@/hooks/useReducedMotion';

import './FlowingMenu.css';

function FlowingMenu({ items = [], speed = 15, textColor = '#fff', bgColor = '#060010', marqueeBgColor = '#fff', marqueeTextColor = '#060010', borderColor = '#fff' }: any) {
  const [reduced, setReduced] = useState(false);
  const [userReduced] = useReducedMotion();

  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const onChange = () => setReduced(!!(mq && mq.matches) || !!(typeof document !== 'undefined' && document.documentElement.classList.contains('reduced-motion')) || !!userReduced);
    onChange();
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, [userReduced]);

  if (reduced) {
    // Reduced-motion fallback: static list without marquee animations
    return (
      <div className="menu-wrap" style={{ backgroundColor: bgColor }} aria-hidden={false}>
        <nav className="menu">
          {items.map((item: any, idx: number) => (
            <div className="menu__item" key={idx} style={{ borderColor }}>
              <a href={item.link} className="menu__item-link" style={{ color: textColor }}>{item.text}</a>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu">
        {items.map((item: any, idx: number) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }: any) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const marqueeInnerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<any>(null);
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Only initialize GSAP animation when present and user hasn't requested reduced motion
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const manualReduced = typeof document !== 'undefined' && document.documentElement.classList.contains('reduced-motion');
      if (!prefersReduced && !manualReduced && !userReduced) {
        animationRef.current = gsap.to(marqueeInnerRef.current, { x: -contentWidth, duration: speed, ease: 'none', repeat: -1 });
      }
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => { clearTimeout(timer); if (animationRef.current) animationRef.current.kill(); };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = (ev: MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = (ev as any).clientX - rect.left;
    const y = (ev as any).clientY - rect.top;
    const edge = y < rect.height / 2 ? 'top' : 'bottom';

    gsap.timeline({ defaults: { duration: 0.6, ease: 'expo' } })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = (ev as any).clientX - rect.left;
    const y = (ev as any).clientY - rect.top;
    const edge = y < rect.height / 2 ? 'top' : 'bottom';

    gsap.timeline({ defaults: { duration: 0.6, ease: 'expo' } })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div className="menu__item" ref={itemRef} style={{ borderColor }}>
      <a className="menu__item-link cursor-pointer" href={link} onMouseEnter={(e) => handleMouseEnter(e as any)} onMouseLeave={(e) => handleMouseLeave(e as any)} style={{ color: textColor }}>
        {text}
      </a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
