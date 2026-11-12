'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { TrendResult } from '@/lib/types';
import { ArrowUpRight, MapPin } from 'lucide-react';

export type PointEvidence = { id: string; year: number; value: number | null; coverage: number };
export const POINT_PALETTE = ['#7daec4', '#8fc8bb', '#d4d8a5', '#d8b270', '#d18661'];
export function pointColour(value: number | null | undefined, domain: [number, number] | null) {
  if (value == null || !domain) return '#77858a';
  const fraction = domain[0] === domain[1] ? .5 : (value - domain[0]) / (domain[1] - domain[0]);
  return POINT_PALETTE[Math.max(0, Math.min(4, Math.floor(fraction * 5)))];
}

export function usePointEvidence(result: TrendResult | null, month: number) {
  const [records, setRecords] = useState<TrendResult[]>([]);
  const [completedScope, setCompletedScope] = useState('');
  const [year, setYear] = useState(2024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const variable = result?.variable.id;
  const aggregation = result?.aggregation;
  const mode = result?.provenance.mode === 'FIXTURE' ? 'fixture' : 'cached';
  const calendarMonth = aggregation === 'monthly' ? month : 1;
  const scope = JSON.stringify([variable, aggregation, calendarMonth, mode]);
  useEffect(() => {
    if (!variable || !aggregation) return;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setLoading(true); setRecords([]); setError(''); } });
    Promise.all(['dhaka', 'rajshahi', 'khulna', 'sylhet', 'sunamganj', 'kathmandu'].map(async location_id => {
      const response = await fetch('/api/v1/trend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location_id, variable, start_year: 1991, end_year: 2024, aggregation, month: calendarMonth, mode }), signal: controller.signal });
      if (!response.ok) throw Error('Prepared point records could not be loaded. No spatial field has been substituted.');
      return response.json() as Promise<TrendResult>;
    })).then(data => { if (!controller.signal.aborted) setRecords(data); }).catch(cause => { if (!controller.signal.aborted) setError(cause.message); }).finally(() => { if (!controller.signal.aborted) { setLoading(false); setCompletedScope(scope); } });
    return () => controller.abort();
  }, [variable, aggregation, calendarMonth, mode, scope]);
  const activeRecords = useMemo(() => completedScope === scope ? records : [], [completedScope, scope, records]);
  const domain = useMemo<[number, number] | null>(() => {
    const values = activeRecords.flatMap(record => record.series.flatMap(row => row.value === null ? [] : [row.value]));
    return values.length ? [Math.min(...values), Math.max(...values)] : null;
  }, [activeRecords]);
  const points = activeRecords.map(record => { const point = record.series.find(row => row.year === year); return { id: record.location.id, year, value: point?.value ?? null, coverage: point?.coverage ?? 0 }; });
  return { records: activeRecords, year, setYear, loading: loading || Boolean(variable && completedScope !== scope), error, points, domain };
}

export type PointLayer = ReturnType<typeof usePointEvidence>;
type Layer = PointLayer;
export function getPointObservation(result: TrendResult | null, layer: PointLayer) {
  if (!result) return { row: undefined, mode: null };
  const selected = result.series.find(point => point.year === layer.year);
  if (selected) return { row: selected, mode: result.provenance.mode };
  const prepared = layer.records.find(record => record.location.id === result.location.id);
  return { row: prepared?.series.find(point => point.year === layer.year), mode: prepared?.provenance.mode ?? null };
}
export function MapEvidenceControls({ result, layer, onLocation, pending = false }: { result: TrendResult | null; layer: Layer; onLocation: (id: string) => void; pending?: boolean }) {
  if (!result) return <div className="map-evidence-loading" role="status">Select a place to open its measured record.</div>;
  return <div className="map-evidence-controls" aria-busy={layer.loading || pending}>
    <div className="map-year-control"><div><span className="eyebrow">OBSERVED YEAR / POINT ESTIMATES</span><strong>{layer.year}</strong></div><label className="sr-only" htmlFor="observed-year">Observed year on the map</label><input id="observed-year" type="range" min="1991" max="2024" value={layer.year} disabled={pending || layer.loading} onChange={event => layer.setYear(Number(event.target.value))} /><div className="map-year-endpoints"><span>1991</span><span>{result.aggregation} · {result.variable.unit}</span><span>2024</span></div></div>
    <div className="map-numeric-legend"><span>{result.provenance.mode === 'FIXTURE' ? 'SYNTHETIC POINTS' : 'CACHED NASA POWER POINTS'}</span><div className="legend-swatches">{POINT_PALETTE.map(colour => <i key={colour} style={{ background: colour }} />)}</div><div><span>{layer.domain?.[0].toFixed(1) ?? '—'}</span><span>{result.variable.unit}</span><span>{layer.domain?.[1].toFixed(1) ?? '—'}</span></div><small>Fixed scale across all prepared points, 1991–2024. Grey: unavailable. Colours are not hazard categories.</small></div>
    <div className="map-site-values" aria-label="Prepared point measurements">{layer.points.map(point => <button key={point.id} disabled={pending || layer.loading} aria-pressed={point.id === result.location.id} onClick={() => onLocation(point.id)}><i style={{ background: pointColour(point.value, layer.domain) }} /><span>{point.id === 'kathmandu' ? 'Kathmandu' : point.id.replace(/^./, letter => letter.toUpperCase())}</span><strong>{point.value === null ? '—' : point.value.toFixed(1)}</strong></button>)}</div>
    {layer.loading && <p role="status">Loading prepared point records…</p>}{layer.error && <p role="alert">{layer.error}</p>}
  </div>;
}

export function LocationInspector({ result, layer, pending = false, children }: { result: TrendResult | null; layer: Layer; pending?: boolean; children?: ReactNode }) {
  if (!result) return <aside className="location-inspector"><MapPin size={25} /><h2>A place. A question.</h2>{children}<p>Select a point on the map to begin an investigation.</p></aside>;
  const { row, mode } = getPointObservation(result, layer);
  return <aside className="location-inspector" aria-busy={pending}><span className="eyebrow"><MapPin size={13} /> SELECTED POINT</span><h2>{result.location.label}</h2><span className="inspector-coordinates">{result.location.lat.toFixed(3)}° / {result.location.lon.toFixed(3)}°</span>{children}<div className="inspector-observation"><span>{result.variable.label} · {layer.year}</span><strong>{pending ? 'Updating…' : row?.value == null ? 'Unavailable' : row.value.toFixed(2)}<small>{pending || row?.value == null ? '' : result.variable.unit}</small></strong><p>{pending ? 'The previous verified record stays visible until the new request completes.' : `${result.aggregation} · ${row ? `${(row.coverage * 100).toFixed(1)}% source-day coverage` : 'Outside the available point record'}`}</p></div><span className={`source-badge ${result.provenance.mode === 'FIXTURE' ? 'planned' : 'analysis'}`}>{result.provenance.mode === 'FIXTURE' ? 'Synthetic fixture' : `NASA POWER · ${mode === 'LIVE' ? 'live retrieval' : 'cached point / grid'}`}</span><p className="inspector-definition">{result.variable.id === 'PRECTOTCORR' ? 'Accumulated precipitation from daily estimates. Rainfall is an input to the water system; it is not a flood measurement.' : result.variable.id.startsWith('T2M') ? 'Air temperature at two metres. This differs from satellite land-surface temperature.' : 'A source-grid estimate at this coordinate. Read the units, aggregation and coverage alongside the value.'}</p><a href="#observed-record" className="text-link">Inspect the full evidence <ArrowUpRight size={17} /></a><small>Point estimates are not district averages. Imagery is historical context.</small></aside>;
}

const topics: Record<string, { title: string; text: string; status: string }> = {
  rain: { title: 'Rain is an input. A flood is a different question.', text: 'Daily POWER precipitation is accumulated into annual or like-for-like seasonal totals. River levels, drainage and flood exposure require other evidence.', status: 'POWER precipitation available · IMERG adapter not validated' },
  temperature: { title: 'Air and land surface tell different stories.', text: 'POWER describes air at two metres. MODIS land-surface temperature describes surface retrievals. The two measurements have different physical meanings.', status: 'POWER air temperature available · MODIS LST adapter planned' },
  soil: { title: 'Soil holds a different kind of water.', text: 'Surface and root-zone soil moisture require a specific SMAP product and quality pipeline. Neither is a direct river-level measurement.', status: 'SMAP adapter planned' },
  storage: { title: 'Stored water has a much larger footprint.', text: 'GRACE water-storage anomalies describe regional change relative to a baseline. They combine water compartments and cannot identify a local well level.', status: 'GRACE adapter planned' },
  vegetation: { title: 'Greenness begins a question, not a verdict.', text: 'Vegetation indices describe reflectance. Quality flags, clouds, season and land cover matter before interpreting a greenness record.', status: 'MODIS vegetation adapter planned' },
};
export function EnvironmentDiscovery({ result, onVariable, selectedTopic, onTopicChange }: { result: TrendResult | null; onVariable: (variable: string) => void; selectedTopic?: string; onTopicChange?: (topic: string) => void }) {
  const [topic, setTopic] = useState<string | null>(null);
  const active = selectedTopic ?? topic ?? (result?.variable.id === 'PRECTOTCORR' ? 'rain' : 'temperature');
  const selected = topics[active];
  return <section className="environment-discovery"><div className="environment-visual"><Image src="/images/sundarbans-landsat-2000.jpg" alt="Historical Landsat composite of the Sundarbans mangroves" fill sizes="(max-width:760px) 100vw, 30vw" /><span>SUNDARBANS / LANDSAT 7<br />1999–2000 COMPOSITE · CONTEXT IMAGE</span></div><div className="environment-story"><span className="eyebrow">CONNECTED EARTH / UNDERSTAND THE MEASUREMENT</span><div className="environment-topics">{Object.entries(topics).map(([id, item]) => <button key={id} aria-pressed={active === id} onClick={() => { setTopic(id); onTopicChange?.(id); if (id === 'rain') onVariable('PRECTOTCORR'); if (id === 'temperature') onVariable('T2M'); }}>{id === 'rain' ? 'Rainfall' : id === 'temperature' ? 'Temperature' : id === 'soil' ? 'Soil moisture' : id === 'storage' ? 'Water storage' : 'Vegetation'}<span className="sr-only"> · {item.status}</span></button>)}</div><h2>{selected.title}</h2><p>{selected.text}</p><span className="environment-status">{selected.status}</span><Link href="/research#dataset-catalogue" className="text-link">Inspect the data catalogue <ArrowUpRight size={15} /></Link></div></section>;
}
