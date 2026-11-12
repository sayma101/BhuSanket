'use client';

import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowRight, CalendarDays, RefreshCw, Thermometer, TriangleAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {ChartGuide} from './chart-guide';
import { api, downloadFile } from '@/lib/api';
import type { Claim, DataMode, Location } from '@/lib/types';

interface HotDaysResult {
  schema_version: string; location: Location; threshold_c: number; definition: string;
  series: { year: number; days_above_threshold: number | null; coverage: number }[];
  provenance: { source_url: string; retrieved_at: string | null; mode: string };
}

export function DailyCase({ claims, onSelect }: { claims: Claim[]; onSelect: (id: string) => void }) {
  const [daily, setDaily] = useState<{ date: string; index: number } | null>(null);
  useEffect(() => {
    // Compute after hydration, with a specified timezone so the same day selects the same preset.
    Promise.resolve().then(() => {
      const date = new Date(); const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      const value = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0);
      const dateKey = `${value('year')}-${String(value('month')).padStart(2, '0')}-${String(value('day')).padStart(2, '0')}`;
      setDaily({ date: dateKey, index: Math.floor(Date.UTC(value('year'), value('month') - 1, value('day')) / 86400000) });
    });
  }, []);
  const claim = daily && claims.length ? claims[daily.index % claims.length] : null;
  return <section className="daily-case"><div className="daily-case-icon"><CalendarDays size={24} /></div><div><span className="eyebrow">OPTIONAL EXTENSION / DAILY CASE {daily ? `· ${daily.date} · DHAKA TIME` : ''}</span><h2>One question to carry into today.</h2>{claim ? <><p>{claim.text}</p><small>A daily rotation of defined investigation presets. The verdict is computed only when you open the record.</small></> : <p>Daily cases become available when the verified preset library is loaded from the evidence service.</p>}</div>{claim && <button className="small-button" onClick={() => { onSelect(claim.id); document.querySelector('.investigation-grid')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }}>Open today’s case <ArrowRight size={16} /></button>}</section>;
}

export function HotDaysCounter({ locationId, locationLabel, mode }: { locationId: string; locationLabel: string; mode: DataMode }) {
  const [threshold, setThreshold] = useState(35); const [result, setResult] = useState<HotDaysResult | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const count = async () => {
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api.post<HotDaysResult>('/hot-days', { location_id: locationId, threshold_c: threshold, mode })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Daily measurements could not be loaded.'); }
    finally { setBusy(false); }
  };
  const completeYears = result?.series.filter(item => item.days_above_threshold !== null).length ?? 0;
  return <section className="hot-days-tool"><div className="section-header"><div><span className="eyebrow">OPTIONAL EXTENSION / DAILY TEMPERATURE METRIC</span><h2>Hot days. A definition you can inspect.</h2><p>Count days above a stated daily maximum air-temperature threshold. This uses the full prepared 1991–2024 daily record, independently of the trend-analysis window.</p></div><Thermometer size={28} /></div><div className="hot-days-controls"><div><span className="eyebrow">PREPARED LOCATION</span><strong>{locationLabel}</strong><small>NASA POWER · T2M_MAX · {mode.toUpperCase()} mode</small></div><label className="field-label">Daily maximum exceeds (°C)<input type="number" min="-50" max="65" step="0.5" value={threshold} onChange={event => setThreshold(Math.max(-50, Math.min(65, Number(event.target.value))))} /></label><button className="small-button" onClick={() => void count()} disabled={busy || locationId === 'custom'}>{busy ? <RefreshCw className="spin" size={15} /> : <Thermometer size={15} />}{busy ? 'Inspecting daily record…' : 'Count observed days'}</button></div>{locationId === 'custom' && <p className="control-note">Choose a named prepared location to use this counter. Custom coordinates are available in the main trend investigation.</p>}{error && <p className="hot-days-error" role="alert"><TriangleAlert size={15} />{error}</p>}{result && <div className="hot-days-result"><div className="evidence-status"><span className={`data-badge ${result.provenance.mode.toLowerCase()}`}>{result.provenance.mode === 'FIXTURE' ? 'DEMO FIXTURE · SYNTHETIC' : result.provenance.mode === 'LIVE' ? 'LIVE DATA' : 'CACHED NASA DATA'}</span><span>{completeYears} complete years / {result.series.length} years · strictly &gt; {result.threshold_c}°C</span></div><div className="hot-days-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.series} margin={{ top: 20, right: 20, bottom: 20, left: 8 }}><CartesianGrid vertical={false} stroke="#d5dbd4" strokeDasharray="3 5" /><XAxis dataKey="year" tick={{ fill: '#566b68', fontSize: 9 }} interval={5} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#566b68', fontSize: 10 }} width={45} axisLine={false} tickLine={false} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#566b68', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#132238', color: '#f6f5f0', border: 0, fontSize: 11 }} formatter={(value) => [value === null ? 'Incomplete year · withheld' : value, `Days > ${result.threshold_c}°C`]} labelFormatter={year => `Year ${year}`} /><Bar dataKey="days_above_threshold" fill="#168c88" radius={[2, 2, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div><ChartGuide kind="bar" result={{variable:{id:'HOT_DAYS',label:`Days with daily maximum above ${result.threshold_c} °C`,unit:'days'},dataset:{short_name:'NASA POWER / T2M_MAX'},series:result.series,quality:{missing_percent:100*(1-completeYears/result.series.length),warnings:['Incomplete years are withheld; no official heatwave definition is inferred.']},provenance:result.provenance}}/><p className="hot-days-definition">{result.definition}</p><div className="hot-days-years"><details><summary>Inspect counts and completeness by year</summary><div className="hot-days-year-table"><table><thead><tr><th>Year</th><th>Days above threshold</th><th>Daily coverage</th></tr></thead><tbody>{result.series.map(item => <tr key={item.year}><td>{item.year}</td><td>{item.days_above_threshold ?? 'Withheld · incomplete'}</td><td>{(item.coverage * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></details></div><div className="export-actions"><button onClick={() => downloadFile(`hot-days-${result.location.id}-${result.threshold_c}C.json`, JSON.stringify(result, null, 2))}><ArrowDownToLine size={14} />Counter + source JSON</button><button onClick={() => downloadFile(`hot-days-${result.location.id}-${result.threshold_c}C.csv`, `year,days_above_${result.threshold_c}C,coverage\n${result.series.map(item => `${item.year},${item.days_above_threshold ?? ''},${item.coverage}`).join('\n')}`, 'text/csv')}><ArrowDownToLine size={14} />Annual counts CSV</button></div><p className="passport-note">Retrieval: {result.provenance.retrieved_at ?? 'Not applicable · synthetic fixture'}. Counts describe the measured record; they do not define an official heatwave, attribute a cause or forecast future heat.</p></div>}</section>;
}
