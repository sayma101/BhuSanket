'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Fingerprint, Globe2, GraduationCap, Microscope, Radio, Scale, ShieldCheck, Droplets, Thermometer, Leaf, Waves } from 'lucide-react';
import { CinematicEarth } from './cinematic-earth';
import { Reveal } from './experience';
import { SourceGallery } from './source-gallery';
import '@/styles/hero.css';
import type { TrendResult } from '@/lib/types';

function RecordPreview({ result }: { result: TrendResult }) {
  const values = result.series.flatMap(row => row.value === null ? [] : [row.value]);
  const low = Math.min(...values); const range = Math.max(...values) - low || 1;
  const path = result.series.map((row, i) => { if (row.value === null) return ''; const command = i === 0 || result.series[i - 1].value === null ? 'M' : 'L'; return `${command}${18 + i / Math.max(1, result.series.length - 1) * 464},${150 - (row.value - low) / range * 118}`; }).join(' ');
  return <svg className="home-record" viewBox="0 0 500 180" role="img" aria-label="Verified Dhaka summer temperature observations, 1991 to 2024; missing periods remain disconnected"><path d="M18 48H482M18 99H482M18 150H482" className="record-grid" /><path d={path} className="record-line" /><text x="18" y="175">1991</text><text x="482" y="175" textAnchor="end">2024</text></svg>;
}

export function Home() {
  const [preview, setPreview] = useState<TrendResult | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/trend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location_id: 'dhaka', variable: 'T2M', start_year: 1991, end_year: 2024, aggregation: 'summer', mode: 'cached' }), signal: controller.signal }).then(response => response.ok ? response.json() : null).then(setPreview).catch(() => {});
    return () => controller.abort();
  }, []);

  return <div className="observatory-home">
    <section className="hero signal-hero" aria-labelledby="hero-title">
      <CinematicEarth />
      <div className="hero-content"><h1 id="hero-title">Every change<br />leaves a <em>signal.</em></h1><p className="hero-description">Explore how rainfall, heat and water systems are changing across Bangladesh using real NASA Earth-science data.</p><div className="hero-actions"><Link href="/explore" className="button primary">Explore Earth <ArrowUpRight size={20} /></Link><Link href="/student-lab" className="button hero-secondary">Start Learning <ArrowRight size={19} /></Link></div></div>
    </section>

    <div className="trust-strip"><span><Globe2 size={17} /> Real NASA source records</span><span><Fingerprint size={17} /> Every result has a Data Passport</span><span><ShieldCheck size={17} /> Uncertainty stays in the picture</span></div>

    <section className="delta-chapter" id="the-delta"><div className="delta-chapter-image"><Image src="/images/ganges-delta-2000.jpg" alt="Branches of the Ganges–Brahmaputra delta, historical Terra MODIS context" fill sizes="(max-width:800px) 100vw, 65vw" /><div className="delta-crosshair" aria-hidden="true"><span /><i /></div><div className="image-caption">THE BENGAL DELTA<span>TERRA / MODIS · 28 DEC 2000 · CONTEXT IMAGE</span></div></div><Reveal className="delta-chapter-copy"><span className="eyebrow">01 / A PLACE YOU KNOW</span><h2>One delta.<br />Countless<br /><em>connections.</em></h2><p>Land, water and atmosphere meet here. So do the questions that matter to us.</p><p>A satellite image helps us look closer. A measured record helps us test what we think we see.</p><Link href="/explore" className="text-link">Find your place on Earth <ArrowUpRight size={18} /></Link><span className="chapter-coordinate">21°–27° N / 88°–93° E</span></Reveal></section>

    <section className="question-section section-shell" id="questions"><Reveal className="section-heading"><div><span className="eyebrow">02 / FOLLOW YOUR CURIOSITY</span><h2>Big questions.<br /><em>Closer to home.</em></h2></div><p>Start with something you have noticed.<br />Let the record challenge your first impression.</p></Reveal><div className="question-grid">{[
      { n: '01', icon: Thermometer, title: 'Is it getting hotter?', desc: 'Air temperature at two metres', href: '/explore?variable=T2M', tag: 'ATMOSPHERE', status: 'NASA POWER · available', className: 'heat-question' },
      { n: '02', icon: Droplets, title: 'Is the rain changing?', desc: 'Annual and seasonal accumulation', href: '/explore?variable=PRECTOTCORR', tag: 'WATER', status: 'NASA POWER · available', className: 'rain-question' },
      { n: '03', icon: Leaf, title: 'Is the land getting greener?', desc: 'Discover vegetation observations', href: '/research?catalogue=vegetation#dataset-catalogue', tag: 'LAND', status: 'MODIS · adapter planned', className: 'land-question' },
      { n: '04', icon: Waves, title: 'Where is water stored?', desc: 'Discover regional water-storage signals', href: '/research?catalogue=water#dataset-catalogue', tag: 'EARTH SYSTEMS', status: 'GRACE · adapter planned', className: 'storage-question' },
    ].map((question, i) => <Reveal key={question.n} delay={i * .07}><Link href={question.href} className={`discovery-question ${question.className}`}><div><span>{question.n} / {question.tag}</span><question.icon size={27} strokeWidth={1.2} /></div><h3>{question.title}</h3><p>{question.desc}</p><footer><span>{question.status}</span><ArrowUpRight size={21} /></footer></Link></Reveal>)}</div></section>

    <section className="record-chapter section-shell"><Reveal><span className="eyebrow">03 / A PATTERN IS ONLY THE BEGINNING</span><h2>A line can tell a story.<br /><em>Evidence asks more.</em></h2><p>Change the time window. Inspect the uncertainty. Keep the full record beside your conclusion.</p><Link href="/research" className="text-link">Open the Research Workspace <ArrowUpRight size={18} /></Link></Reveal><Reveal className="home-case-sheet" delay={.1}><div className="case-sheet-heading"><span>OBSERVED RECORD / DHAKA</span><span className="source-badge analysis">{preview ? 'Cached NASA data' : 'Prepared investigation'}</span></div><h3>Summer air temperature</h3><p>March–May · NASA POWER · °C</p>{preview ? <><RecordPreview result={preview} /><div className="case-sheet-evidence"><div><span>THEIL–SEN / DECADE</span><strong>{preview.trend.slope_per_decade?.toFixed(3) ?? 'Withheld'} °C</strong></div><div><span>95% SLOPE INTERVAL</span><strong>{preview.trend.ci_95?.map(value => value.toFixed(3)).join(' to ') ?? 'Withheld'}</strong></div></div><small>{preview.verdict} · A trend test does not establish cause.</small></> : <div className="home-case-empty"><Radio size={30} /><p>The prepared record is ready to investigate when the evidence service is running.</p></div>}<Link href="/explore?claim=dhaka-summer">Inspect this case <ArrowUpRight size={17} /></Link></Reveal></section>

    <section className="workspaces-section section-shell"><Reveal className="section-heading"><div><span className="eyebrow">04 / CHOOSE YOUR INSTRUMENT</span><h2>Different ways in.<br /><em>One shared evidence.</em></h2></div><p>Explore a place. Learn by investigating.<br />Or follow every step of the method.</p></Reveal><div className="workspace-links">{[
      { n: '01', icon: Globe2, title: 'Explore Earth', desc: 'An atlas for your curiosity. Choose a place and discover what its record can tell you.', href: '/explore', tag: 'THE OBSERVATORY', className: 'explore-card' },
      { n: '02', icon: GraduationCap, title: 'Student Lab', desc: 'Make a prediction. Read the clues. Build a conclusion you can explain.', href: '/student-lab', tag: 'THE FIELD SCHOOL', className: 'student-card' },
      { n: '03', icon: Microscope, title: 'Research Workspace', desc: 'Inspect quality, compare periods and export a complete, traceable investigation.', href: '/research', tag: 'THE WORKBENCH', className: 'research-card' },
    ].map(workspace => <Link href={workspace.href} className={`workspace-card ${workspace.className}`} key={workspace.n}><div><span>{workspace.n} / {workspace.tag}</span><workspace.icon size={25} strokeWidth={1.3} /></div><div className="workspace-visual" aria-hidden="true"><span>{workspace.n === '01' ? '↗' : workspace.n === '02' ? 'Aa' : '∑'}</span><i /><i /><i /></div><h3>{workspace.title}</h3><p>{workspace.desc}</p><span className="workspace-enter">Enter workspace <ArrowUpRight size={19} /></span></Link>)}</div></section>

    <section className="court-teaser section-shell"><Reveal className="court-seal"><Scale size={42} strokeWidth={1} /><span>CLAIM<br />COURT</span><small>EVIDENCE OVER ASSUMPTIONS</small></Reveal><Reveal><span className="eyebrow">05 / THE EARTH EVIDENCE TRIBUNAL</span><h2>A compelling claim.<br /><em>Can it stand trial?</em></h2><p>Three evidence tokens. Four investigation tools. A verdict grounded in the same scientific record.</p><Link href="/claim-court" className="button paper-button">Open a case <ArrowUpRight size={18} /></Link><Link href="/claims" className="court-checker-link">Or use the Climate Claim Checker <ArrowRight size={16} /></Link></Reveal></section>

    <section className="sources-section section-shell"><Reveal className="section-heading"><div><span className="eyebrow">06 / KNOW WHAT YOU ARE LOOKING AT</span><h2>From NASA.<br /><em>With a paper trail.</em></h2></div><Link href="/methods" className="text-link">Data, methods & credits <ArrowUpRight size={17} /></Link></Reveal><SourceGallery /><div className="home-trail">{['Source record', 'Quality control', 'Aggregation', 'Trend & uncertainty', 'Data Passport'].map((stage, i) => <div key={stage}><span>0{i + 1}</span><p>{stage}</p><ArrowRight size={15} /></div>)}</div></section>

    <section className="closing-section section-shell"><Reveal><span className="eyebrow">YOUR QUESTION BELONGS HERE.</span><h2>Look at Earth.<br /><em>See the evidence.</em></h2><Link href="/explore" className="button primary">Start your investigation <ArrowUpRight size={19} /></Link></Reveal></section>
  </div>;
}
