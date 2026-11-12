'use client';
import {sourceUrl} from '@/lib/nasa-sources';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Database, GitCompareArrows, Orbit, SlidersHorizontal } from 'lucide-react';
import { AskEvidenceButton } from './experience';

export function ResearchBenchHeader() {
  return <header className="bench-header">
    <div className="bench-header-image"><Image src="/images/nasa-iss-earth-poster.jpg" alt="Earth's atmosphere seen from the International Space Station in April 2016" fill sizes="(max-width:800px) 100vw, 65vw" /></div>
    <div className="bench-title"><span className="eyebrow">RESEARCH WORKSPACE</span><h1>The Evidence Bench</h1><p>Analyse long-term change. Test the signal. Compare the evidence.</p></div>
    <div className="bench-header-actions"><AskEvidenceButton label="Discuss this evidence" /><a href="#data-passport"><Database size={14}/>Data Passport <ArrowDown size={12}/></a></div>
    <a className="bench-image-credit" href={sourceUrl('iss-film')} target="_blank" rel="noreferrer">EARTH FROM ISS / APR 2016 / NASA JOHNSON<br/>HISTORICAL CONTEXT <ArrowUpRight size={11}/></a>
  </header>;
}

export function ResearchBenchInstruments() {
  return <nav className="bench-instruments" aria-label="Research instruments">
    <a href="#analysis-window"><SlidersHorizontal size={26}/><span><strong>Full record vs selected window</strong><small>See how the conclusion changes</small></span><ArrowDown size={14}/></a>
    <a href="#trend-divergence"><GitCompareArrows size={26}/><span><strong>Trend Divergence Detector</strong><small>Two locations. Compatible evidence.</small></span><ArrowDown size={14}/></a>
    <a href="#mission-evidence"><Orbit size={26}/><span><strong>NASA Mission-to-Evidence Trail</strong><small>Follow every step to the source</small></span><ArrowDown size={14}/></a>
  </nav>;
}
