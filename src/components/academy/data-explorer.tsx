'use client';

import {useSessionState} from '@/lib/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { LearningChart, claimRequest, type LearningClaim, type LearningResult } from '../claim-checker';
import { ChartGuide } from '../chart-guide';
import { publishAnalysis } from '@/lib/analysis-context';
import type { AcademyLanguage } from '@/lib/academy-content';

type Place = { id:string; label:string };
export function AcademyDataExplorer({ mission, base, language }: { mission:LearningClaim; base:LearningResult; language:AcademyLanguage }) {
  const bn = language === 'bn';
  const [places,setPlaces] = useState<Place[]>([]);
  const [location,setLocation] = useSessionState(`academy-explorer:${mission.id}:${base.analysis_id}:location`,mission.location_id);
  const [start,setStart] = useSessionState(`academy-explorer:${mission.id}:${base.analysis_id}:start`,mission.start_year);
  const [end,setEnd] = useSessionState(`academy-explorer:${mission.id}:${base.analysis_id}:end`,mission.end_year);
  const [record,setRecord] = useSessionState(`academy-explorer:${mission.id}:${base.analysis_id}:record`,base);
  const [year,setYear] = useSessionState(`academy-explorer:${mission.id}:${base.analysis_id}:year`,base.series.at(-1)?.year ?? mission.end_year);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const request = useRef<AbortController|null>(null);
  const selected = record.series.find(row => row.year === year);
  const same = record.analysis_id === base.analysis_id;
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/v1/locations',{signal:abort.signal}).then(response => {if(!response.ok)throw Error();return response.json();}).then(data => {if(!abort.signal.aborted && Array.isArray(data))setPlaces(data);}).catch(() => { /* The current prepared mission remains selectable. */ });
    return () => {abort.abort();request.current?.abort();};
  },[]);
  async function update() {
    request.current?.abort();
    const abort = new AbortController();request.current = abort;
    setBusy(true);setError('');
    try {
      const response = await fetch('/api/v1/trend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...claimRequest(mission),location_id:location,start_year:start,end_year:end}),signal:abort.signal});
      const data = await response.json();
      if(!response.ok)throw Error(typeof data.detail === 'string' ? data.detail : 'The selected record could not be loaded.');
      if(!abort.signal.aborted){setRecord(data);setYear(data.series.at(-1)?.year ?? end);publishAnalysis(data);}
    } catch(cause) {if(!abort.signal.aborted)setError(cause instanceof Error ? cause.message : 'The selected record could not be loaded.');}
    finally {if(!abort.signal.aborted)setBusy(false);}
  }
  function reset() {request.current?.abort();setBusy(false);setError('');setRecord(base);setYear(base.series.at(-1)?.year ?? mission.end_year);setLocation(mission.location_id);setStart(mission.start_year);setEnd(mission.end_year);publishAnalysis(base);}
  return <div className="academy-data-explorer"><header><span className="academy-kicker">{bn ? 'প্রকৃত NASA POWER তথ্য' : 'ACTUAL NASA POWER DATA'}</span><h2>{bn ? 'চার্টকে একটি প্রশ্ন করো' : 'Ask the chart a question'}</h2><p>{bn ? 'একটি বিন্দু, একটি মাপ, বছরের ক্রমে সাজানো। আগে অক্ষ ও একক পড়ো; তারপর ওঠানামা দেখো।' : 'One point, one measurement, arranged through time. Read the axes and unit first, then look at the variation.'}</p></header><div className="academy-explorer-controls"><label>{bn ? 'প্রস্তুত স্থান' : 'Prepared location'}<select value={location} onChange={event => setLocation(event.target.value)}>{places.length ? places.map(place => <option key={place.id} value={place.id}>{place.label}</option>) : <option value={mission.location_id}>{base.location.label}</option>}</select></label><label>{bn ? 'শুরুর বছর' : 'From year'}<select value={start} onChange={event => setStart(Number(event.target.value))}>{Array.from({length:34},(_,index) => 1991+index).filter(value => value<end).map(value => <option key={value}>{value}</option>)}</select></label><label>{bn ? 'শেষের বছর' : 'To year'}<select value={end} onChange={event => setEnd(Number(event.target.value))}>{Array.from({length:34},(_,index) => 1991+index).filter(value => value>start).map(value => <option key={value}>{value}</option>)}</select></label><button className="academy-button" disabled={busy} onClick={() => void update()}><Search size={16}/>{busy ? (bn ? 'তথ্য খুলছে…' : 'Opening record…') : (bn ? 'এই তথ্য দেখো' : 'Update view')}</button></div><div className="academy-chart-record-heading"><strong>{record.location.label} / {record.series[0]?.year}–{record.series.at(-1)?.year}</strong><span>{record.provenance.mode} · NASA POWER · {record.variable.unit}</span></div><div aria-busy={busy} className={busy ? 'academy-data-pending' : ''}><LearningChart result={record} guided={false}/></div><div className="academy-observation"><label>{bn ? 'একটি বছর পড়ো' : 'Read one year'}<select value={year} onChange={event => setYear(Number(event.target.value))}>{record.series.map(row => <option key={row.year}>{row.year}</option>)}</select></label><strong>{selected?.value == null ? (bn ? 'তথ্য নেই' : 'Unavailable') : `${selected.value.toFixed(2)} ${record.variable.unit}`}</strong><p>{selected ? `${(selected.coverage*100).toFixed(1)}% ${bn ? 'উৎসের দিনের তথ্য আছে' : 'source-day coverage'}` : (bn ? 'এই বছর পাওয়া যায়নি।' : 'No row for this year.')}</p></div><div className="academy-chart-coach"><article><strong>{bn ? 'বাম থেকে ডানে = সময়' : 'Left to right = time'}</strong><p>{bn ? 'প্রতিটি বিন্দু একটি বছর। আগের সঙ্গে পরের বছর তুলনা করো।' : 'Each point belongs to a year. Compare earlier and later parts of the record.'}</p></article><article><strong>{bn ? 'উপর থেকে নিচে = মাপ' : 'Up and down = the measurement'}</strong><p>{record.variable.label} · {record.variable.unit}. {bn ? 'ফাঁককে শূন্য ধরো না।' : 'A gap is not zero.'}</p></article></div>{!same && <p className="academy-notice">{bn ? 'এটি পাশের অনুসন্ধান। পরের ধাপে মূল মিশনের স্থান ও সময়ের তথ্য দিয়েই তোমার verdict দেখা হবে।' : 'This is a side exploration. Your mission verdict will still use the original mission location and period.'}</p>}<p className="academy-data-limit">{bn ? 'এই চার্ট পরিবর্তন দেখাতে পারে; কারণ, ভবিষ্যৎ আবহাওয়া বা জেলার গড় প্রমাণ করে না।' : 'This chart can show change. It cannot establish causes, forecast weather or represent a district average.'}</p><div className="academy-data-actions"><a href={record.provenance.source_url} target="_blank" rel="noreferrer">{bn ? 'মূল NASA উৎস দেখো' : 'Inspect the NASA source'}<ExternalLink size={14}/></a><button className="academy-quiet-button" onClick={reset}><RotateCcw size={14}/>{bn ? 'মূল মিশনের তথ্য' : 'Return to mission record'}</button></div><details className="academy-advanced"><summary>{bn ? 'আরও জানতে: চার্ট, পরীক্ষা ও অনিশ্চয়তা' : 'Learn more: chart reading, tests & uncertainty'}<span>+</span></summary><ChartGuide result={record}/></details>{error && <p className="academy-error" role="alert">{error}</p>}<p className="academy-media-note">{bn ? 'স্থান বা সময় বদলালে “এই তথ্য দেখো” চাপো। চার্টের শিরোনাম সর্বদা বর্তমানে দেখানো record-এর।' : 'After changing a selection, choose Update view. The chart heading always describes the record currently displayed.'}<ArrowRight size={13}/></p></div>;
}
