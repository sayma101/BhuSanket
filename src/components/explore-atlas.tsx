'use client';
import {useHistoryDialog} from '@/lib/navigation';
import {sourceUrl} from '@/lib/nasa-sources';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, CloudRain, Compass, Database, Droplets, Expand, FlaskConical, Globe2, Layers3, Leaf, MapPin, ShieldCheck, SlidersHorizontal, Sun, Thermometer, TriangleAlert, Waves, Wind, X } from 'lucide-react';
import type { Aggregation, Location, TrendResult } from '@/lib/types';
import { EarthMap } from './earth-map';
import { EvidenceChart, SlopeInterval } from './evidence-chart';
import { getPointObservation, LocationInspector, MapEvidenceControls, POINT_PALETTE, type PointLayer } from './environment-discovery';

type AtlasProps = {
  result: TrendResult | null;
  layer: PointLayer;
  locations: Location[];
  selected: string;
  variable: string;
  variables: { id: string; label: string; unit: string }[];
  aggregation: Aggregation;
  month: number;
  global: boolean;
  pending: boolean;
  error: string;
  controls: ReactNode;
  onLocation: (id: string) => void;
  onPoint: (lat: number, lon: number, label?: string) => void;
  onVariable: (id: string) => void;
  onAggregation: (aggregation: Aggregation) => void;
  onMonth: (month: number) => void;
  onGlobal: () => void;
};

const layers = [
  { id: 'PRECTOTCORR', label: 'Rainfall', icon: CloudRain },
  { id: 'T2M', label: 'Temperature', icon: Thermometer },
  { id: 'RH2M', label: 'Humidity', icon: Droplets },
  { id: 'ALLSKY_SFC_SW_DWN', label: 'Solar radiation', icon: Sun },
];

function periodName(aggregation: string, month?: number) {
  if (aggregation === 'summer') return 'March–May';
  if (aggregation === 'monsoon') return 'June–September';
  if (aggregation === 'monthly') return month ? new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' }) : 'Same calendar month';
  return 'Annual';
}

export function ExploreAtlas({ result, layer, locations, selected, variable, variables, aggregation, month, global, pending, error, controls, onLocation, onPoint, onVariable, onAggregation, onMonth, onGlobal }: AtlasProps) {
  const settings = useRef<HTMLDialogElement>(null); const controlsDialog=useHistoryDialog('atlas-controls',settings);
  const stage = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  return <section className="explore-stage" ref={stage} aria-labelledby="explore-title">
    <div className="explore-map-canvas"><EarthMap locations={locations} selected={selected} global={global} onSelect={onLocation} onPoint={onPoint} measurements={layer.points} measurementUnit={result?.variable.unit} domain={layer.domain} pending={pending || layer.loading} presentation="immersive" /></div>
    <div className="atlas-vignette" aria-hidden="true" />

    <div className="atlas-editorial-rail">
      <div className="atlas-edition"><Compass size={14} /><span>A BANGLADESH FIELD ATLAS</span></div>
      <h1 id="explore-title">Explore our<br />changing<br /><em>Bangladesh.</em></h1>
      <p className="atlas-introduction">A place you know.<br />An Earth system to understand.<br />Follow the NASA record.</p>

      <div className="atlas-place-control"><label htmlFor="atlas-location"><MapPin size={16} /> YOUR PLACE</label><select id="atlas-location" value={selected} onChange={event => onLocation(event.target.value)}>{locations.map(location => <option key={location.id} value={location.id}>{location.label}{location.id === 'custom' ? '' : ' · prepared point'}</option>)}</select></div>
      <div className="atlas-year-instrument"><label htmlFor="atlas-observed-year">OBSERVED YEAR <strong>{layer.year}</strong></label><div className="atlas-year-buttons"><button aria-label="Previous observed year" disabled={layer.year <= 1991 || pending || layer.loading} onClick={() => layer.setYear(layer.year - 1)}><ChevronLeft size={15} /></button><select aria-label="Observed year" value={layer.year} disabled={pending || layer.loading} onChange={event => layer.setYear(Number(event.target.value))}>{Array.from({ length: 34 }, (_, index) => <option key={index} value={1991 + index}>{1991 + index}</option>)}</select><button aria-label="Next observed year" disabled={layer.year >= 2024 || pending || layer.loading} onClick={() => layer.setYear(layer.year + 1)}><ChevronRight size={15} /></button></div><input id="atlas-observed-year" type="range" min="1991" max="2024" value={layer.year} disabled={pending || layer.loading} onChange={event => layer.setYear(Number(event.target.value))} /><div className="atlas-year-limits"><span>1991</span><span>2024</span></div></div>

      <fieldset className="atlas-aggregation"><legend>READ THE RECORD BY</legend>{([{ id: 'annual', label: 'Annual' }, { id: 'summer', label: 'Mar–May' }, { id: 'monsoon', label: 'Jun–Sep' }, { id: 'monthly', label: 'Month' }] as const).map(option => <button key={option.id} aria-pressed={aggregation === option.id} onClick={() => onAggregation(option.id)}>{option.label}</button>)}</fieldset>
      {aggregation === 'monthly' && <label className="atlas-month-control">Calendar month<select value={month} onChange={event => onMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{periodName('monthly', index + 1)}</option>)}</select></label>}

      <div className="atlas-rail-actions"><button onClick={() => controlsDialog.open()}><SlidersHorizontal size={16} /><span>Analysis controls<small>Variable, coordinates & data mode</small></span><ArrowUpRight size={15} /></button><a href="#observed-record"><FlaskConical size={17} /><span>Track change<small>Test the historical evidence</small></span><ArrowDown size={15} /></a><button onClick={onGlobal}><Globe2 size={17} /><span>{global ? 'Return to Bangladesh' : 'See the global atlas'}</span><ArrowUpRight size={15} /></button></div>
      <p className="atlas-source-note"><Database size={13} /><span>NASA POWER · point / grid estimates<br /><strong>Satellite image ≠ measured data.</strong></span></p>
    </div>

    <div className="atlas-top-coordinate" aria-hidden="true">EARTH SYSTEMS / {global ? 'GLOBAL VIEW' : 'BANGLADESH'}<span>LOOK CLOSER. ASK BETTER QUESTIONS.</span></div>

    <motion.section className="atlas-evidence-panel" aria-label="Selected location evidence" initial={reduced ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>
      <div className="atlas-panel-masthead"><span><span className="signal-dot" /> SELECTED LOCATION</span><span>NASA POWER</span></div>
      <LocationInspector result={result} layer={layer} pending={pending}>
      <label className="atlas-variable-selector"><span>ENVIRONMENTAL VARIABLE</span><select value={variable} onChange={event => onVariable(event.target.value)}>{variables.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></LocationInspector>
      {result && <div className={`atlas-historical-trend ${pending ? 'atlas-evidence-pending' : ''}`} aria-busy={pending}><header><h2>Historical record <span>{result.period.start_year}–{result.period.end_year}</span></h2><small>{periodName(result.aggregation, month)} · {result.provenance.mode}</small></header><EvidenceChart key={result.analysis_id} result={result} compact variant="atlas" /><div className="atlas-trend-statistics"><div><span>THEIL–SEN / DECADE</span><strong>{result.trend.slope_per_decade == null ? 'Withheld' : `${result.trend.slope_per_decade >= 0 ? '+' : ''}${result.trend.slope_per_decade.toFixed(3)}`}<small>{result.variable.unit}</small></strong></div><div><span>p-VALUE</span><strong>{result.trend.p_value?.toPrecision(3) ?? 'Withheld'}</strong></div><div className="atlas-verdict"><ShieldCheck size={15} /><span>{result.verdict}</span></div></div><details className="atlas-slope-disclosure"><summary>95% slope interval <span>+</span></summary><SlopeInterval result={result} unit={result.variable.unit} /></details><div className="atlas-evidence-links"><a href="#observed-record">View full evidence <ArrowRight size={15} /></a><a href="#data-passport">Data Passport <ArrowUpRight size={14} /></a></div></div>}
      {(pending || layer.loading) && <div className="atlas-request-state" role="status"><span className="signal-dot" />{pending ? 'Opening the verified record…' : 'Loading prepared point observations…'}</div>}
      {(error || layer.error) && <p className="atlas-request-error" role="alert"><TriangleAlert size={16} />{error || layer.error}</p>}
    </motion.section>

    <div className="atlas-layer-dock" aria-label="Environmental point layers"><span>EXPLORE A SIGNAL</span><div>{layers.map(item => <button key={item.id} aria-pressed={variable === item.id || item.id === 'T2M' && variable === 'T2M_MAX'} onClick={() => onVariable(item.id)}><item.icon size={21} strokeWidth={1.4} /><span>{item.label}</span></button>)}<button disabled title="Wind speed is not available in this build's validated API." aria-label="Wind speed: not available in the validated API"><Wind size={21} strokeWidth={1.4} /><span>Wind speed<small>Not available</small></span></button></div></div>

    <details className="atlas-floating-legend"><summary><Layers3 size={15} />Point value legend<span>+</span></summary><p>{result?.variable.label ?? 'Selected variable'} · {result?.variable.unit ?? 'units from the record'}</p><div className="atlas-colour-ramp">{POINT_PALETTE.map(colour => <i key={colour} style={{ background: colour }} />)}</div><div className="atlas-legend-endpoints"><span>{layer.domain?.[0].toFixed(1) ?? '—'}</span><span>{layer.domain?.[1].toFixed(1) ?? '—'}</span></div><small>Fixed across all prepared points, 1991–2024. Grey = unavailable. No interpolation or hazard categories.</small></details>

    <dialog className="atlas-controls-modal" ref={settings} onClick={event => { if (event.target === event.currentTarget) controlsDialog.close(); }}><div className="atlas-dialog-heading"><div><span className="eyebrow">THE GEOGRAPHICAL INSTRUMENT</span><h2>Your investigation</h2></div><button aria-label="Close analysis controls" onClick={() => controlsDialog.close()}><X size={21} /></button></div>{controls}</dialog>
  </section>;
}

const measurementCopy: Record<string, { what: string; why: string; limits: string; icon: typeof CloudRain }> = {
  PRECTOTCORR: { icon: CloudRain, what: 'Accumulated precipitation, added from daily POWER estimates over the selected year, season or calendar month. The result is expressed in millimetres.', why: 'Rainfall is an input to water availability, ecosystems and cropping calendars. Comparing the same season helps make a meaningful question.', limits: 'Rainfall alone cannot measure flood depth, river level, drought or groundwater storage. This point estimate is not a district average.' },
  T2M: { icon: Thermometer, what: 'Mean air temperature at two metres, averaged over the selected year, season or same calendar month. Units are degrees Celsius.', why: 'Air temperature helps investigate seasonal heat conditions and changes in the local environmental record.', limits: 'This is not the temperature of roofs, roads or soil. A trend does not identify its cause or forecast future heat.' },
  T2M_MAX: { icon: Thermometer, what: 'The mean of daily maximum air temperatures over the selected period, in degrees Celsius. It is not the single hottest day.', why: 'Typical daytime maxima offer a different perspective on heat from the mean air-temperature record.', limits: 'A seasonal mean of daily maxima is not a heatwave count, a health-risk estimate or land-surface temperature.' },
  RH2M: { icon: Droplets, what: 'Mean relative humidity at two metres, expressed as a percentage. It describes how close the air is to saturation at its temperature.', why: 'Humidity connects atmospheric moisture, evaporation and questions about seasonal environmental conditions.', limits: 'Relative humidity is not soil moisture or the amount of water stored underground. It does not establish the cause of a trend.' },
  ALLSKY_SFC_SW_DWN: { icon: Sun, what: 'Mean daily all-sky shortwave solar energy reaching the surface during the selected period, in MJ/m²/day.', why: 'Surface solar energy helps frame land-energy and solar-resource questions. Clouds and the measurement definition matter.', limits: 'This is not sunshine duration, wind energy or a forecast of electricity generation at a particular installation.' },
};

export function ExploreMeasurementGuide({ result, layer, pending }: { result: TrendResult | null; layer: PointLayer; pending: boolean }) {
  const measurement = measurementCopy[result?.variable.id ?? 'T2M'];
  const { row } = getPointObservation(result, layer);
  const reading = !result || pending ? 'Choose a point and open its verified record. The exact value, unit and source-day coverage will appear together.' : row?.value == null ? `The ${layer.year} value is unavailable for this point and aggregation. An unavailable observation is not zero.` : `${result.location.label}: ${row.value.toFixed(2)} ${result.variable.unit} for ${periodName(result.aggregation)} ${layer.year}, with ${(row.coverage * 100).toFixed(1)}% source-day coverage. Compare like-for-like periods; a single year does not establish a trend.`;
  return <section className="atlas-measurement-guide" id="measurement-guide" aria-labelledby="measurement-guide-title"><header><span className="eyebrow">THE FIELD NOTE / UNDERSTAND THE MEASUREMENT</span><h2 id="measurement-guide-title">Make the signal <em>make sense.</em></h2><span>01—04</span></header><div>{[
    { title: 'What are we measuring?', text: measurement.what, icon: measurement.icon },
    { title: 'Why does it matter?', text: measurement.why, icon: Leaf },
    { title: 'What does this value mean?', text: reading, icon: FlaskConical },
    { title: 'What can it NOT tell us?', text: measurement.limits, icon: TriangleAlert },
  ].map((item, index) => <article key={item.title}><span className="atlas-explanation-number">0{index + 1}</span><item.icon size={25} strokeWidth={1.25} /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>;
}

const imagery = {
  dhaka: { src: '/images/dhaka-landsat-2022.jpg', title: 'A city shaped by rivers.', mission: 'Landsat 8 / OLI', date: '20 March 2022', place: 'Dhaka', alt: 'Historical Landsat view of Dhaka and its surrounding rivers', text: 'Look at the relationship between urban land and branching waterways. This image is geographical context; it does not measure air temperature or a rainfall trend.', source: sourceUrl('dhaka-image'), credit: 'NASA Earth Observatory / Lauren Dauphin · USGS Landsat data' },
  khulna: { src: '/images/sundarbans-landsat-2000.jpg', title: 'Where land meets the tide.', mission: 'Landsat 7', date: '1999–2000 composite', place: 'Sundarbans / Khulna region', alt: 'Historical Landsat composite of mangroves and channels in the Sundarbans', text: 'Mangroves, channels and the Bay of Bengal form a connected landscape. This multi-date composite is context for the Khulna region, not a rainfall or water-level measurement.', source: sourceUrl('sundarbans'), credit: 'Jesse Allen / NASA Earth Observatory' },
  sylhet: { src: '/images/sylhet-modis-2007.jpg', title: 'A landscape across seasons.', mission: 'Terra & Aqua / MODIS', date: 'May–June 2007 · false colour', place: 'Sylhet region', alt: 'Paired false-colour MODIS views of northeastern Bangladesh in May and June 2007', text: 'This original paired figure compares Terra on 1 May with Aqua on 20 June 2007. False colour helps distinguish land and water. It cannot establish a multiyear rainfall trend.', source: sourceUrl('sylhet-image'), credit: 'NASA GSFC / MODIS Rapid Response Team' },
  regional: { src: '/images/ganges-delta-2000.jpg', title: 'One delta. Connected systems.', mission: 'Terra / MODIS', date: '28 December 2000', place: 'Bengal Delta / regional context', alt: 'Historical Terra MODIS image of the Bengal delta', text: 'Follow the rivers, sediment and coastline of the Bengal delta. This regional image is a starting point for questions, not a local photograph of every selected location.', source: sourceUrl('delta'), credit: 'Jacques Descloitres / MODIS Land Team / NASA Earth Observatory' },
};

export function ExploreSatelliteContext({ locationId }: { locationId: string }) {
  const image = locationId === 'dhaka' ? imagery.dhaka : locationId === 'khulna' ? imagery.khulna : locationId === 'sylhet' || locationId === 'sunamganj' ? imagery.sylhet : imagery.regional;
  const dialog = useRef<HTMLDialogElement>(null); const imageDialog=useHistoryDialog('atlas-image',dialog);
  return <section className="atlas-satellite-context" id="satellite-context"><div className="atlas-context-photo"><Image src={image.src} alt={image.alt} fill sizes="(max-width:800px) 100vw, 45vw" /><span>CONTEXTUAL SATELLITE VIEW</span><button aria-label="Enlarge contextual satellite image" onClick={() => imageDialog.open()}><Expand size={19} /></button></div><div className="atlas-context-story"><span className="eyebrow">SATELLITE CONTEXT / {image.place.toUpperCase()}</span><h2>{image.title}</h2><dl><div><dt>MISSION / INSTRUMENT</dt><dd>{image.mission}</dd></div><div><dt>OBSERVATION DATE</dt><dd>{image.date}</dd></div></dl><p>{image.text}</p><a href={image.source} target="_blank" rel="noreferrer">Inspect the NASA image source <ArrowUpRight size={16} /></a><small>{image.credit}</small></div><dialog className="atlas-image-modal" ref={dialog} onClick={event => { if (event.target === event.currentTarget) imageDialog.close(); }}><header><div><strong>{image.place}</strong><span>{image.mission} · {image.date}</span></div><button aria-label="Close satellite image" onClick={() => imageDialog.close()}><X size={22} /></button></header><div><Image src={image.src} alt={image.alt} fill sizes="90vw" /></div><p>{image.credit} · Historical context, separate from measured data.</p></dialog></section>;
}

export function ExploreDiscovery({ onTopic }: { onTopic: (topic: string) => void }) {
  return <section className="atlas-discovery" aria-labelledby="atlas-discovery-title"><header><span className="eyebrow">THE NEXT QUESTION</span><h2 id="atlas-discovery-title">There is more <em>to discover.</em></h2></header><div>
    <a href="#observed-record" className="atlas-discovery-entry"><Image src="/images/dhaka-landsat-2022.jpg" alt="" fill sizes="(max-width:700px) 50vw, 25vw" /><FlaskConical size={24} /><h3>Climate signals</h3><p>Inspect a measured historical record.</p><span>Open the evidence <ArrowRight size={14} /></span></a>
    <Link href="/research?variable=T2M_MAX" className="atlas-discovery-entry"><Image src="/images/nasa-iss-earth-poster.jpg" alt="" fill sizes="(max-width:700px) 50vw, 25vw" /><Thermometer size={24} /><h3>Extreme events</h3><p>Begin with a defined daily heat metric.</p><span>Research / Hot-days Counter <ArrowUpRight size={14} /></span></Link>
    <a href="#earth-systems" onClick={() => onTopic('vegetation')} className="atlas-discovery-entry"><Image src="/images/sundarbans-landsat-2000.jpg" alt="" fill sizes="(max-width:700px) 50vw, 25vw" /><Leaf size={24} /><h3>Land & vegetation</h3><p>Learn what greenness can tell us.</p><span>Educational / adapter planned <ArrowRight size={14} /></span></a>
    <a href="#earth-systems" onClick={() => onTopic('storage')} className="atlas-discovery-entry"><Image src="/images/ganges-delta-2000.jpg" alt="" fill sizes="(max-width:700px) 50vw, 25vw" /><Waves size={24} /><h3>Water systems</h3><p>Rainfall, soil and stored water.</p><span>Educational / availability explained <ArrowRight size={14} /></span></a>
  </div><p className="atlas-discovery-note"><BookOpen size={14} /> Extreme-event risk needs evidence beyond a trend. The Hot-days Counter measures days above a defined threshold; it is not an official heatwave or warning system.</p></section>;
}

export function ExplorePreparedRecords({ result, layer, pending, onLocation }: { result: TrendResult | null; layer: PointLayer; pending: boolean; onLocation: (id: string) => void }) {
  return <details className="atlas-prepared-records"><summary><Database size={16} /><span>Inspect all prepared point observations</span><span>+</span></summary><MapEvidenceControls result={result} layer={layer} pending={pending} onLocation={onLocation} /></details>;
}
