"use client";

import {useSessionState} from '@/lib/navigation';
import {SourceCitation} from './nasa-source';
import { useEffect, useState } from "react";
import {motion, useReducedMotion} from "framer-motion";
import {AskEvidenceButton} from "./experience";
import Link from "next/link";
import {publishAnalysis} from '@/lib/analysis-context';
import {ChartGuide} from './chart-guide';
import { ArrowUpRight, Fingerprint, Search, ShieldCheck } from "lucide-react";
import "@/styles/learning.css";

export type LearningClaim = { id: string; text: string; location_id: string; variable: string; aggregation: string; start_year: number; end_year: number; direction: string };
export type LearningResult = {
  analysis_id: string; series: { year: number; value: number | null; coverage: number }[]; full_record?: { period: { start_year: number; end_year: number } }; comparison_verdict?: string;
  variable: { id: string; label: string; unit: string }; location: { label: string };
  trend: { direction: string; slope_per_decade: number | null; p_value: number | null; ci_95: [number, number] | null; test_variant: string };
  verdict: string; window_sensitive: boolean; interpretation: { en: string; bn: string };
  quality: { missing_percent: number; warnings: string[] }; provenance: { mode: string; source_url: string };
};
export async function learningRequest<T>(path: string, body?: unknown, publish = true): Promise<T> {
  const pagePath = typeof window === "undefined" ? "" : window.location.pathname;
  const response = await fetch(`/api/v1${path}`, body === undefined ? undefined : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) { const details = await response.json().catch(() => null); throw new Error(typeof details?.detail === "string" ? details.detail : `Evidence service returned ${response.status}. Start the backend or prepare the NASA cache.`); }
  const data = await response.json(); if(publish && typeof window !== 'undefined' && window.location.pathname === pagePath){if(path === '/trend') publishAnalysis(data); if(path === '/claim-check') publishAnalysis(data.result);} return data;
}
export function claimRequest(claim: LearningClaim) { return { location_id: claim.location_id, variable: claim.variable, aggregation: claim.aggregation, start_year: claim.start_year, end_year: claim.end_year, mode: "cached", autocorrelation: "auto" }; }
export function useLearningClaims() {
  const [claims, setClaims] = useState<LearningClaim[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; learningRequest<LearningClaim[]>("/claims").then(data => { if (active) setClaims(data); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  return { claims, error };
}
export function LearningChart({ result, guided = true }: { result: LearningResult; guided?: boolean }) {
  const reduced = useReducedMotion();
  const points = result.series.filter((point): point is { year: number; value: number; coverage: number } => point.value !== null && Number.isFinite(point.value));
  if (points.length === 0) return <p className="learning-note">No valid observations are available for this record.</p>;
  const min = Math.min(...points.map(p => p.value)); const max = Math.max(...points.map(p => p.value)); const span = max - min || 1;
  const start = result.series[0].year; const end = result.series.at(-1)!.year;
  const x = (year: number) => 55 + (year - start) / (end - start || 1) * 650;
  const y = (value: number) => 205 - (value - min) / span * 150;
  let d = ""; let broken = true;
  for (const point of result.series) { if (point.value === null) { broken = true; continue; } d += `${broken ? "M" : "L"}${x(point.year)},${y(point.value)} `; broken = false; }
  return <figure className="learning-chart"><figcaption><span>{result.variable.label} · {result.variable.unit}</span><span>{result.provenance.mode} DATA</span></figcaption><svg viewBox="0 0 750 255" role="img" aria-label={`${result.variable.label} observations from ${start} to ${end}. Gaps remain unconnected.`}><title>Observed series; gaps are not interpolated</title>{[0, 0.5, 1].map(f => <g key={f}><line x1="55" y1={205 - f * 150} x2="705" y2={205 - f * 150} stroke="currentColor" opacity=".12"/><text x="45" y={210 - f * 150} textAnchor="end">{(min + f * span).toFixed(1)}</text></g>)}<motion.path d={d} fill="none" stroke="#17766c" strokeWidth="2.5" initial={reduced ? false : {pathLength:0}} whileInView={{pathLength:1}} viewport={{once:true}} transition={{duration:1,ease:"easeOut"}}/>{points.map(p => <circle key={p.year} cx={x(p.year)} cy={y(p.value)} r="2.7" fill="#168C88"><title>{p.year}: {p.value.toFixed(3)} {result.variable.unit}; coverage {(p.coverage * (p.coverage <= 1 ? 100 : 1)).toFixed(1)}%</title></circle>)}<text x="55" y="240">{start}</text><text x="705" y="240" textAnchor="end">{end}</text><text x="380" y="240" textAnchor="middle">Calendar year</text></svg>{guided && <ChartGuide result={result}/>}<SourceCitation compact mode={result.provenance.mode} actualRequest={result.provenance.source_url}/></figure>;
}

export function ClaimChecker() {
  const { claims, error: loadError } = useLearningClaims();
  const [selected, setSelected] = useSessionState('checker:selected',""); const [result, setResult] = useSessionState<LearningResult | null>('checker:result',null); const [claimVerdict, setClaimVerdict] = useSessionState('checker:claimVerdict',""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("claim"); if (id&&!Object.hasOwn(window.history.state?.__bhuDrafts??{},'checker:selected')) queueMicrotask(() => setSelected(id)); }, [setSelected]);
  const claim = claims.find(c => c.id === selected) ?? claims[0];
  async function investigate() { if (!claim) return; setBusy(true); setError(""); setResult(null); setClaimVerdict(""); try { const checked = await learningRequest<{ result: LearningResult; claim_verdict: string }>("/claim-check", { claim_id: claim.id }); setResult(checked.result); setClaimVerdict(checked.claim_verdict); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <div className="learning-page checker-page"><div className="learning-kicker"><Fingerprint size={16}/> PUBLIC EVIDENCE DESK / 04</div><header className="learning-intro"><p className="learning-eyebrow">CLIMATE CLAIM CHECKER</p><h1>A bold claim.<br/><em>A better question.</em></h1><p>Choose a defined claim. Follow the NASA record. Let the computed evidence decide what it supports.</p></header><section className="learning-panel"><label className="learning-field">Choose a claim<select value={claim?.id ?? ""} onChange={e => { setSelected(e.target.value); setResult(null); setError(""); }}>{claims.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}</select></label>{claim && <div className="claim-metadata"><span>{claim.location_id}</span><span>{claim.variable}</span><span>{claim.aggregation}</span><span>{claim.start_year}—{claim.end_year}</span></div>}<button className="learning-button" disabled={!claim || busy} onClick={investigate}><Search size={17}/>{busy ? "Tracing the evidence…" : "Test this claim"}</button><p className="learning-note">Preset claims map to an explicit place, measurement, season and period. No AI chooses the verdict.</p></section>{(loadError || error) && <p role="alert" className="learning-error">{loadError || error}</p>}{result && <section className="learning-panel result-reveal"><div className="learning-kicker"><ShieldCheck size={17}/>{result.provenance.mode} · {result.analysis_id}</div><h2>{claimVerdict}</h2><p><strong>Scientific result: {result.verdict}</strong></p><p>{result.interpretation.en}</p><AskEvidenceButton label="Explain the checked claim"/><LearningChart result={result}/><div className="learning-stat-row"><span>Slope / decade<strong>{result.trend.slope_per_decade?.toFixed(3) ?? "Withheld"} {result.variable.unit}</strong></span><span>p-value<strong>{result.trend.p_value?.toPrecision(3) ?? "Withheld"}</strong></span><span>Missing observations<strong>{result.quality.missing_percent.toFixed(1)}%</strong></span></div>{result.window_sensitive && <p className="learning-caution">Window sensitivity detected. Inspect the selected interval beside the full record.</p>}<p className="learning-note">A trend test does not establish a cause or predict future conditions. Non-significance does not prove no change.</p><Link href={`/explore?claim=${encodeURIComponent(claim.id)}`} className="learning-text-link">Open the full investigation <ArrowUpRight size={16}/></Link></section>}</div>;
}
