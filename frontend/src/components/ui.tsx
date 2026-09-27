'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { Armchair, Boxes, Car, Bike, WashingMachine, Package } from 'lucide-react';
import { num } from '@/lib/format';
import type { Locale } from '@/i18n/dict';

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ value, locale, suffix = '' }: { value: number; locale: Locale; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });

  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on('change', (v) => {
    if (ref.current) ref.current.textContent = num(Math.round(v), locale) + suffix;
  }), [spring, locale, suffix]);

  return <span ref={ref}>{num(0, locale)}{suffix}</span>;
}

const ICONS: Record<string, typeof Package> = {
  furniture: Armchair, vehicle: Car, motorcycle: Bike, pallet: Boxes, appliance: WashingMachine, other: Package,
};
export const CatIcon = ({ cat, size = 18 }: { cat: string; size?: number }) => {
  const I = ICONS[cat] ?? Package;
  return <I size={size} />;
};
