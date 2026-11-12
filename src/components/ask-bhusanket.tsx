'use client';

import {useJourney} from '@/lib/navigation';
import {SourceCitation} from './nasa-source';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import '@/styles/companion.css';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Check, ChevronDown, LoaderCircle, PanelRight, Send, Sparkles, Trash2, X, Maximize2, Minimize2, Database, ChartNoAxesCombined, Download, MapPin, FlaskConical, ShieldCheck } from 'lucide-react';
import {PROTOTYPE_QUESTIONS} from '@/lib/prototype-chat';
import type {GuideTopic} from '@/lib/evidence-guide';
import { getAnalysisContext, type AnalysisContext } from '@/lib/analysis-context';

type Evidence = { analysis_id?: string; dataset?: { short_name: string }; location?: { label: string }; period?: { start_year: number; end_year: number }; trend?: { slope_per_decade: number | null; p_value: number | null; ci_95: [number, number] | null }; verdict?: string; variable?: { id?: string; label?: string; unit: string }; quality?: { missing_percent: number; valid_observations?: number; total_observations?: number; warnings: string[] }; provenance?: { source_url: string; mode: string } };
type Reply = { id: string; question: string; answer: string; label: string; contextId?: string; evidence: Evidence | null; kind: 'prototype'; language: 'en' | 'bn'; references?:{title:string;url:string}[] };


function EvidenceAttachment({ evidence }: { evidence: Evidence }) {
  if (!evidence.dataset) return null;
  return <details className="assistant-evidence"><summary><span><Check size={13} />{evidence.provenance?.mode === "FIXTURE" ? "Synthetic teaching record" : "Verified evidence"}</span><ChevronDown size={13} /></summary><strong>{evidence.verdict}</strong><span>{evidence.dataset.short_name} · {evidence.period?.start_year}–{evidence.period?.end_year} · {evidence.provenance?.mode}</span><dl><div><dt>Slope / decade</dt><dd>{evidence.trend?.slope_per_decade?.toFixed(3) ?? 'Withheld'} {evidence.variable?.unit}</dd></div><div><dt>p-value</dt><dd>{evidence.trend?.p_value?.toPrecision(3) ?? 'Withheld'}</dd></div><div><dt>95% slope interval</dt><dd>{evidence.trend?.ci_95?.map(value => value.toFixed(3)).join(' to ') ?? 'Withheld'}</dd></div></dl>{evidence.quality && <p className="assistant-quality-note">{evidence.quality.missing_percent.toFixed(1)}% missing aggregate periods. A point/grid estimate is not a district average. A trend cannot identify its cause.</p>}{evidence.quality?.warnings.map(warning => <p className="assistant-quality-note" key={warning}>{warning}</p>)}{evidence.provenance?.source_url.startsWith('https://') && <a href={evidence.provenance.source_url} target="_blank" rel="noreferrer">Original NASA source <ArrowUpRight size={13} /></a>}{evidence.analysis_id && <div className="assistant-record-actions"><a href={`/api/v1/data-passport/${encodeURIComponent(evidence.analysis_id)}`} target="_blank" rel="noreferrer"><Database size={12}/>Data Passport</a><a href={`/api/v1/export/${encodeURIComponent(evidence.analysis_id)}.json`} download><Download size={12}/>Evidence JSON</a></div>}<SourceCitation compact mode={evidence.provenance?.mode} actualRequest={evidence.provenance?.source_url}/><small>{evidence.analysis_id}</small></details>;
}

export function AskBhuSanket() {
  const pathname = usePathname(); const reduced = useReducedMotion();
  const assistant=useJourney('assistant',{open:false}); const {open}=assistant.value; const setOpen=assistant.field('open'); const [docked, setDocked] = useState(false); const [expanded, setExpanded] = useState(true);
  const [attachedEvidence, setAttachedEvidence] = useState<Evidence | null>(null);
  const [context, setContext] = useState<AnalysisContext | null>(null);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [evidenceLoading,setEvidenceLoading]=useState(false);const [evidenceError,setEvidenceError]=useState('');const [evidenceAttempt,setEvidenceAttempt]=useState(0);
  const [question, setQuestion] = useState(''); const [replies, setReplies] = useState<Reply[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const field = useRef<HTMLTextAreaElement>(null); const launcher = useRef<HTMLButtonElement>(null); const bottom = useRef<HTMLDivElement>(null);const lastReply=useRef<HTMLElement>(null);
  const controller = useRef<AbortController | null>(null);const generation=useRef(0);
  const current = context?.id && context.path === pathname ? context : null;

  useEffect(() => {
    const listener = (event: Event) => setContext((event as CustomEvent<AnalysisContext>).detail);
    const show = (event:Event) => {const proposed=(event as CustomEvent<{question?:string}>).detail?.question;if(proposed)setQuestion(proposed);setOpen(true);};
    queueMicrotask(() => setContext(getAnalysisContext()));
    window.addEventListener('bhu-analysis', listener); window.addEventListener('bhu-open-assistant', show);
    const invalidate=()=>{generation.current++;controller.current?.abort();};
    return () => { invalidate();window.removeEventListener('bhu-analysis', listener);window.removeEventListener('bhu-open-assistant', show); };
  }, [setOpen]);
  useEffect(()=>{generation.current++;controller.current?.abort();queueMicrotask(()=>{setBusy(false);setError('');});},[open,current?.id]);
  const attached = current?.id && attachedEvidence?.analysis_id === current.id ? attachedEvidence : null;
  useEffect(() => {
    if(!open||!current?.id){queueMicrotask(()=>{setEvidenceLoading(false);setEvidenceError('');setAttachedEvidence(null);});return;}
    const id=current.id,abort=new AbortController();
    queueMicrotask(()=>{setEvidenceLoading(true);setEvidenceError('');});
    fetch(`/api/v1/export/${encodeURIComponent(id)}.json`,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(20000)])}).then(async response=>{const record=await response.json();if(!response.ok)throw Error(record.detail||'The selected record is unavailable. Run the investigation again.');if(record.analysis_id!==id)throw Error('The evidence identity does not match. Run the investigation again.');return record;}).then(record=>{if(!abort.signal.aborted)setAttachedEvidence(record);}).catch(cause=>{if(!abort.signal.aborted)setEvidenceError(cause instanceof Error?cause.message:'Evidence could not load. Retry the connection.');}).finally(()=>{if(!abort.signal.aborted)setEvidenceLoading(false);});
    return()=>abort.abort();
  },[open,current?.id,evidenceAttempt]);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);
  useEffect(() => { document.body.dataset.assistantDocked = String(open && docked && pathname === '/research'); return () => { delete document.body.dataset.assistantDocked; }; }, [open, docked, pathname]);
  useEffect(()=>{if(busy)bottom.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});else lastReply.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});},[replies,busy,reduced]);
  function close(){generation.current++;controller.current?.abort();setBusy(false);assistant.navigate({open:false},true);launcher.current?.focus();}

  async function ask(text:string,reviewed=false,topic:GuideTopic='summary') {
    if(busy||(!reviewed&&!text.trim()))return;
    const snapshot=current,lang=language,ticket=++generation.current;
    controller.current?.abort();controller.current=new AbortController();const signal=controller.current.signal;
    setBusy(true);setError('');
    try{
      const labels:Record<GuideTopic,string>={summary:lang==='bn'?'যাচাইকৃত সারাংশ':'Read the verified summary',chart:lang==='bn'?'এই চার্ট বুঝিয়ে বলো':'Explain this chart',uncertainty:lang==='bn'?'অনিশ্চয়তা কী বোঝায়?':'What does uncertainty mean?',limits:lang==='bn'?'এই তথ্য কী বলতে পারে না?':'What can this record not tell me?','confidence-interval':lang==='bn'?'আস্থা ব্যবধান কী?':'What is a confidence interval?'};
      const response=await fetch('/api/assistant/prototype',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:reviewed?labels[topic]:text,topic:reviewed?topic:undefined,analysis_id:snapshot?.id,language:lang}),signal:AbortSignal.any([signal,AbortSignal.timeout(25000)])});
      let data;try{data=await response.json();}catch{throw Error('The assistant returned an unreadable response. Check that the local Next.js server is running.');}
      if(!response.ok){throw Error(typeof data.detail==='string'?data.detail:'The explanation could not be loaded. Retry your question.');}
      if(typeof data.answer!=='string'||!data.answer.trim()||data.generated!==false||data.prototype!==true)throw Error('The assistant response could not be verified.');
      if(signal.aborted||ticket!==generation.current)return;
      setReplies(previous=>[...previous.slice(-23),{id:crypto.randomUUID(),question:reviewed?labels[topic]:text,answer:[data.evidence_notice,data.answer].filter(Boolean).join('\n'),label:data.context?snapshot?.label??'Verified investigation':'Earth science guide',contextId:data.context?.analysis_id,evidence:data.context??null,kind:'prototype',language:data.language==='bn'?'bn':'en',references:data.references}]);
      if(!reviewed)setQuestion(previous=>previous===text?'':previous);
    }catch(cause){if(!signal.aborted&&ticket===generation.current)setError(cause instanceof Error?cause.message:'Explanation unavailable. Your question is preserved.');}
    finally{if(ticket===generation.current)setBusy(false);}
  }

  return <div className={`ask-bhu ${open ? 'is-open' : ''} ${docked && pathname === '/research' ? 'is-docked' : ''} ${expanded ? 'companion-expanded' : 'companion-compact'}`}>
    <button ref={launcher} className="ask-launch" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls="ask-bhu-panel"><span className="assistant-orbit"><Sparkles size={18} /></span><span>Ask BhuSanket<small>Your science companion</small></span>{open ? <X size={17} /> : <ArrowUpRight size={17} />}</button>
    <AnimatePresence>{open && <motion.aside id="ask-bhu-panel" role="dialog" aria-label="Ask BhuSanket science companion" className="ask-panel" initial={{ opacity: 0, x: reduced ? 0 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : 24 }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <header className="assistant-header"><div className="assistant-orbit"><Sparkles size={21} /></div><div><span className="eyebrow">YOUR SCIENCE COMPANION</span><h2>Ask BhuSanket</h2></div>{pathname === '/research' && <button className="assistant-dock" aria-label={docked ? 'Undock assistant' : 'Dock assistant beside the workspace'} aria-pressed={docked} onClick={() => { setDocked(!docked); setExpanded(false); }}><PanelRight size={17} /></button>}<button className="assistant-expand" aria-label={expanded ? "Use compact assistant" : "Expand science companion"} aria-pressed={expanded} onClick={() => { setExpanded(!expanded); setDocked(false); }}>{expanded ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}</button><button aria-label="Close assistant" onClick={close}><X size={19} /></button></header>
      <div className="companion-layout"><aside className="companion-context-rail"><div className="companion-orbital-view"><Image src="/images/nasa-iss-earth-poster.jpg" alt="Earth seen from the ISS in April 2016" fill sizes="360px"/><span>EARTH FROM ISS / APR 2016<br/>NASA JOHNSON / HISTORICAL CONTEXT</span></div><div className="companion-identity"><span className="eyebrow">ASK BETTER QUESTIONS</span><h3>Every answer<br/>begins with<br/><em>the evidence.</em></h3><p>{language === "bn" ? "বিজ্ঞান বুঝুন। অনিশ্চয়তা নিয়ে প্রশ্ন করুন। উৎস অনুসরণ করুন।" : "A companion for the chart, the method and the questions that come next."}</p></div><section className="companion-live-context" aria-label="Current verified analysis"><span className="eyebrow"><FlaskConical size={13}/> YOUR ANALYSIS CONTEXT</span>{attached ? <><h4><MapPin size={16}/>{attached.location?.label}</h4><p>{attached.variable?.label}<br/>{attached.period?.start_year}–{attached.period?.end_year} / {attached.provenance?.mode}</p><dl><div><dt>Dataset</dt><dd>{attached.dataset?.short_name}</dd></div><div><dt>Missing periods</dt><dd>{attached.quality ? `${attached.quality.missing_percent.toFixed(1)}%` : "Not returned"}</dd></div><div><dt>Slope / decade</dt><dd>{attached.trend?.slope_per_decade?.toFixed(3) ?? "Withheld"} {attached.variable?.unit}</dd></div><div><dt>p-value</dt><dd>{attached.trend?.p_value?.toPrecision(3) ?? "Withheld"}</dd></div><div><dt>95% slope interval / decade</dt><dd>{attached.trend?.ci_95?.map(value => value.toFixed(3)).join(" to ") ?? "Withheld"}</dd></div></dl><p><strong>{attached.verdict}</strong></p>{attached.provenance?.source_url.startsWith("https://") && <a className="companion-download" href={attached.provenance.source_url} target="_blank" rel="noreferrer">NASA source <ArrowUpRight size={12}/></a>}<p className="companion-context-limit">{attached.provenance?.mode === "FIXTURE" ? "Synthetic fixture. These are not NASA observations." : "A point/source-grid record. It does not identify causes, forecast conditions or represent a district average."}</p>{(pathname === "/research" || pathname === "/explore") && <div className="companion-context-links"><a href="#observed-record" onClick={close}><ChartNoAxesCombined size={14}/>Inspect chart</a><a href="#data-passport" onClick={close}><Database size={14}/>Data Passport</a></div>}<a className="companion-download" href={`/api/v1/export/${encodeURIComponent(attached.analysis_id!)}.json`} download><Download size={13}/>Download verified record</a></> : <><h4>{current ? "Opening the attached record…" : "No analysis attached yet."}</h4><p>{evidenceError||"Run an investigation or open an evidence exhibit. Its location, period, source and quality will appear here."}</p>{current&&!evidenceLoading&&<button className="reviewed-summary" onClick={()=>setEvidenceAttempt(value=>value+1)}>Retry evidence connection</button>}</>}</section><p className="companion-science-promise"><ShieldCheck size={14}/>Computed evidence remains authoritative. This prototype explains reviewed material; the scientific engine calculates results.</p></aside><div className="companion-conversation-column"><div className="ask-context"><span className="signal-dot" /><div><strong>{current?.label || 'A space for your questions'}</strong><small>{attached?'Verified analysis loaded':current?'Analysis selected; verification pending':'Open a record to attach its evidence'}</small></div>{attached && <Check size={15} />}</div>
      <div className="ask-language"><div><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button><button lang="bn" aria-pressed={language === 'bn'} onClick={() => setLanguage('bn')}>বাংলা</button></div><span className="provider-connected"><i />{language==='bn'?'Prototype · AI API লাগে না':'Prototype · no AI API'}</span></div>
      <div className="assistant-conversation" aria-live="polite" aria-busy={busy}>
        {!replies.length && <div className="assistant-welcome"><BookOpen size={30} strokeWidth={1.2} /><h3>Let’s make the<br /><em>evidence make sense.</em></h3><p>{language === 'bn' ? 'পছন্দের প্রশ্ন বেছে নাও বা নিজে লিখো। এই prototype reviewed Earth-science উত্তর ব্যবহার করে; generative AI নয়।' : 'Try a suggested question or type your own. This prototype uses reviewed Earth-science answers, not generative AI.'}</p></div>}
        {replies.map((reply,index) => <motion.article ref={index===replies.length-1?lastReply:null} className="assistant-reply" key={reply.id} initial={reduced ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}><div className="assistant-question">{reply.question}</div><span className="reply-context">{reply.label}{reply.contextId && reply.contextId !== current?.id ? ' · earlier analysis' : ''}</span><div className="assistant-answer" lang={reply.language}>{reply.answer.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<small>{reply.language==='bn'?'Prototype উত্তর · reviewed content, AI নয়':'Prototype response · reviewed content, not AI'}</small>{reply.references?.map(reference=><a className="assistant-reference" key={reference.url} href={reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a>)}</div>{reply.evidence && <EvidenceAttachment evidence={reply.evidence} />}</motion.article>)}
        {busy && <div className="ask-loading" role="status"><LoaderCircle className="spin" size={16} /> Preparing the explanation…</div>}
        {error && <p className="ask-error" role="alert">{error}</p>}
        {current && <button className="reviewed-summary" disabled={busy} onClick={() => void ask('', true)}><ShieldIcon />{language === 'bn' ? 'যাচাইকৃত সারাংশ পড়ুন' : 'Read verified summary'}<ArrowUpRight size={14} /></button>}
        <div ref={bottom} />
      </div>
      <div className="assistant-bottom"><p className="assistant-guide-label">{language==='bn'?'Prototype science guide · AI key লাগে না':'Prototype science guide · no AI key needed'}</p><div className="companion-direct-actions"><button disabled={busy} onClick={()=>void ask('',true,'chart')}>{language==='bn'?'এই চার্ট বুঝিয়ে বলো':'Explain this chart'}</button><button disabled={busy} onClick={()=>void ask('',true,'confidence-interval')}>{language==='bn'?'আস্থা ব্যবধান কী?':'Explain confidence interval'}</button></div><div className="ask-prompts">{PROTOTYPE_QUESTIONS[language].slice(0,replies.length?2:4).map(prompt=><button key={prompt} disabled={busy} onClick={()=>void ask(prompt)}>{prompt}<ArrowUpRight size={12}/></button>)}</div><form onSubmit={event => { event.preventDefault(); void ask(question); }}><label className="sr-only" htmlFor="ask-question">Your question / আপনার প্রশ্ন</label><textarea ref={field} id="ask-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1200} rows={2} placeholder={language==='bn'?'বৃষ্টি, তাপমাত্রা, NASA বা trend নিয়ে প্রশ্ন করো…':'Ask about rainfall, temperature, NASA or trends…'} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void ask(question); } }} /><div><span>Evidence first. Always.</span><button disabled={busy || !question.trim()} aria-label="Send question">{busy ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />}</button></div></form><div className="assistant-footer"><span>Questions stay in this session.</span>{replies.length > 0 && <button disabled={busy} onClick={() => setReplies([])}><Trash2 size={12} /> Clear</button>}</div></div></div></div>
    </motion.aside>}</AnimatePresence>
  </div>;
}
function ShieldIcon() { return <Check size={15} />; }
