'use client';

import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function ExperienceProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ duration: .35, ease: [.22, 1, .36, 1] }}>{children}</MotionConfig>;
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65, delay }}>{children}</motion.div>;
}

export function AskEvidenceButton({ label = 'Ask about this evidence', question }: { label?: string; question?: string }) {
  return <button className="inline-ask" onClick={() => window.dispatchEvent(new CustomEvent('bhu-open-assistant',{detail:{question}}))}><span className="signal-dot" />{label}<span aria-hidden="true">↗</span></button>;
}
