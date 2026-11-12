'use client';

import {useJourney} from '@/lib/navigation';
import {SourceCitation} from './nasa-source';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import '@/styles/companion.css';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Check, ChevronDown, LoaderCircle, PanelRight, Send, Sparkles, Trash2, X, Maximize2, Minimize2, Database, ChartNoAxesCombined, Download, MapPin, FlaskConical, ShieldCheck } from 'lucide-react';
import { getAnalysisContext, type AnalysisContext } from '@/lib/analysis-context';

type Evidence = { analysis_id?: string; dataset?: { short_name: string }; location?: { label: string }; period?: { start_year: number; end_year: number }; trend?: { slope_per_decade: number | null; p_value: number | null; ci_95: [number, number] | null }; verdict?: string; variable?: { id?: string; label?: string; unit: string }; quality?: { missing_percent: number; valid_observations?: number; total_observations?: number; warnings: string[] }; provenance?: { source_url: string; mode: string } };
type Reply = { id: string; question: string; answer: string; label: string; contextId?: string; evidence: Evidence | null; kind: 'ai' | 'reviewed'; language: 'en' | 'bn' };
const promptsBn = ['এই চার্টটি বুঝিয়ে বলো।', 'অনিশ্চয়তা কী বোঝায়?', 'এই তথ্য কী বলতে পারে না?', 'আস্থা ব্যবধান শব্দটি বুঝিয়ে বলো।'];
const prompts = ['Explain this chart.', 'What does the uncertainty mean?', 'What can this record not tell me?', 'Explain the term confidence interval.'];

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
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(''); const [replies, setReplies] = useState<Reply[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const field = useRef<HTMLTextAreaElement>(null); const launcher = useRef<HTMLButtonElement>(null); const bottom = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const current = context?.id && context.path === pathname ? context : null;

  useEffect(() => {
    const listener = (event: Event) => setContext((event as CustomEvent<AnalysisContext>).detail);
    const show = (event:Event) => {const proposed=(event as CustomEvent<{question?:string}>).detail?.question;if(proposed)setQuestion(proposed);setOpen(true);};
    queueMicrotask(() => setContext(getAnalysisContext()));
    window.addEventListener('bhu-analysis', listener); window.addEventListener('bhu-open-assistant', show);
    const status = new AbortController();
    fetch('/api/assistant', { signal: status.signal }).then(response => response.json()).then(data => setConfigured(data.configured)).catch(() => { if (!status.signal.aborted) setConfigured(false); });
    return () => { status.abort(); controller.current?.abort(); window.removeEventListener('bhu-analysis', listener); window.removeEventListener('bhu-open-assistant', show); };
  }, [setOpen]);
  const attached = current?.id && attachedEvidence?.analysis_id === current.id ? attachedEvidence : null;
  useEffect(() => {
    if (!open || !current?.id) return;
    const abort = new AbortController();
    fetch(`/api/v1/export/${encodeURIComponent(current.id)}.json`, { signal: abort.signal }).then(response => { if (!response.ok) throw Error(); return response.json(); }).then(record => { if (!abort.signal.aborted) setAttachedEvidence(record); }).catch(() => { /* The reviewed-summary action reports verification errors without inventing context. */ });
    return () => abort.abort();
  }, [open, current?.id]);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);
  useEffect(() => { document.body.dataset.assistantDocked = String(open && docked && pathname === '/research'); return () => { delete document.body.dataset.assistantDocked; }; }, [open, docked, pathname]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' }); }, [replies, busy, reduced]);
  function close() { controller.current?.abort();setBusy(false);assistant.navigate({open:false},true); launcher.current?.focus(); }

  async function ask(text: string, reviewed = false) {
    if ((!text.trim() && !reviewed) || busy) return;
    if (!reviewed && !configured) { setError('The AI service is not connected. You can read a verified summary of the selected analysis below.'); return; }
    if (reviewed && !current) return;
    const snapshot = current; const lang = language;
    controller.current = new AbortController(); const signal = controller.current.signal;
    setBusy(true); setError(''); setQuestion('');
    try {
      let answer: string; let evidence: Evidence | null;
      if (reviewed) {
        const [explanation, record] = await Promise.all([
          fetch('/api/v1/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysis_id: snapshot!.id, language: lang }), signal }),
          fetch(`/api/v1/export/${encodeURIComponent(snapshot!.id)}.json`, { signal }),
        ]);
        if (!explanation.ok || !record.ok) throw Error('The selected record could not be verified. Run the investigation again.');
        const data = await explanation.json(); evidence = await record.json(); answer = data.explanation;
      } else {
        const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text, analysis_id: snapshot?.id, language: lang }), signal });
        const data = await response.json(); if (!response.ok) throw Error(data.detail);
        answer = data.answer; evidence = data.context;
      }
      setReplies(previous => [...previous.slice(-23), { id: crypto.randomUUID(), question: reviewed ? lang === 'bn' ? 'যাচাইকৃত ফলাফল বুঝিয়ে বলো।' : 'Read the verified summary.' : text, answer, label: snapshot?.label ?? 'Earth science concepts', contextId: snapshot?.id, evidence, kind: reviewed ? 'reviewed' : 'ai', language: lang }]);
    } catch (cause) { if (!signal.aborted) { setError(cause instanceof Error ? cause.message : 'Explanation unavailable.'); setQuestion(text); } }
    finally { if (!signal.aborted) setBusy(false); }
  }

  return <div className={`ask-bhu ${open ? 'is-open' : ''} ${docked && pathname === '/research' ? 'is-docked' : ''} ${expanded ? 'companion-expanded' : 'companion-compact'}`}>
    <button ref={launcher} className="ask-launch" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls="ask-bhu-panel"><span className="assistant-orbit"><Sparkles size={18} /></span><span>Ask BhuSanket<small>Your science companion</small></span>{open ? <X size={17} /> : <ArrowUpRight size={17} />}</button>
    <AnimatePresence>{open && <motion.aside id="ask-bhu-panel" role="dialog" aria-label="Ask BhuSanket science companion" className="ask-panel" initial={{ opacity: 0, x: reduced ? 0 : 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : 24 }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <header className="assistant-header"><div className="assistant-orbit"><Sparkles size={21} /></div><div><span className="eyebrow">YOUR SCIENCE COMPANION</span><h2>Ask BhuSanket</h2></div>{pathname === '/research' && <button className="assistant-dock" aria-label={docked ? 'Undock assistant' : 'Dock assistant beside the workspace'} aria-pressed={docked} onClick={() => { setDocked(!docked); setExpanded(false); }}><PanelRight size={17} /></button>}<button className="assistant-expand" aria-label={expanded ? "Use compact assistant" : "Expand science companion"} aria-pressed={expanded} onClick={() => { setExpanded(!expanded); setDocked(false); }}>{expanded ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}</button><button aria-label="Close assistant" onClick={close}><X size={19} /></button></header>
      <div className="companion-layout"><aside className="companion-context-rail"><div className="companion-orbital-view"><Image src="/images/nasa-iss-earth-poster.jpg" alt="Earth seen from the ISS in April 2016" fill sizes="360px"/><span>EARTH FROM ISS / APR 2016<br/>NASA JOHNSON / HISTORICAL CONTEXT</span></div><div className="companion-identity"><span className="eyebrow">ASK BETTER QUESTIONS</span><h3>Every answer<br/>begins with<br/><em>the evidence.</em></h3><p>{language === "bn" ? "বিজ্ঞান বুঝুন। অনিশ্চয়তা নিয়ে প্রশ্ন করুন। উৎস অনুসরণ করুন।" : "A companion for the chart, the method and the questions that come next."}</p></div><section className="companion-live-context" aria-label="Current verified analysis"><span className="eyebrow"><FlaskConical size={13}/> YOUR ANALYSIS CONTEXT</span>{attached ? <><h4><MapPin size={16}/>{attached.location?.label}</h4><p>{attached.variable?.label}<br/>{attached.period?.start_year}–{attached.period?.end_year} / {attached.provenance?.mode}</p><dl><div><dt>Dataset</dt><dd>{attached.dataset?.short_name}</dd></div><div><dt>Missing periods</dt><dd>{attached.quality ? `${attached.quality.missing_percent.toFixed(1)}%` : "Not returned"}</dd></div><div><dt>Slope / decade</dt><dd>{attached.trend?.slope_per_decade?.toFixed(3) ?? "Withheld"} {attached.variable?.unit}</dd></div><div><dt>p-value</dt><dd>{attached.trend?.p_value?.toPrecision(3) ?? "Withheld"}</dd></div><div><dt>95% slope interval / decade</dt><dd>{attached.trend?.ci_95?.map(value => value.toFixed(3)).join(" to ") ?? "Withheld"}</dd></div></dl><p><strong>{attached.verdict}</strong></p>{attached.provenance?.source_url.startsWith("https://") && <a className="companion-download" href={attached.provenance.source_url} target="_blank" rel="noreferrer">NASA source <ArrowUpRight size={12}/></a>}<p className="companion-context-limit">{attached.provenance?.mode === "FIXTURE" ? "Synthetic fixture. These are not NASA observations." : "A point/source-grid record. It does not identify causes, forecast conditions or represent a district average."}</p>{(pathname === "/research" || pathname === "/explore") && <div className="companion-context-links"><a href="#observed-record" onClick={close}><ChartNoAxesCombined size={14}/>Inspect chart</a><a href="#data-passport" onClick={close}><Database size={14}/>Data Passport</a></div>}<a className="companion-download" href={`/api/v1/export/${encodeURIComponent(attached.analysis_id!)}.json`} download><Download size={13}/>Download verified record</a></> : <><h4>{current ? "Opening the attached record…" : "No analysis attached yet."}</h4><p>Run an investigation or open an evidence exhibit. Its location, period, source and quality will appear here.</p></>}</section><p className="companion-science-promise"><ShieldCheck size={14}/>Computed evidence remains authoritative. AI explains it; the scientific engine calculates it.</p></aside><div className="companion-conversation-column"><div className="ask-context"><span className="signal-dot" /><div><strong>{current?.label || 'A space for your questions'}</strong><small>{current ? 'Connected to a verified analysis' : 'Open a record to attach its evidence'}</small></div>{current && <Check size={15} />}</div>
      <div className="ask-language"><div><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button><button lang="bn" aria-pressed={language === 'bn'} onClick={() => setLanguage('bn')}>বাংলা</button></div><span className={configured ? 'provider-connected' : ''}><i />{configured === null ? 'Checking service' : configured ? 'Vercel AI Gateway' : 'AI not connected'}</span></div>
      <div className="assistant-conversation" aria-live="polite" aria-busy={busy}>
        {!replies.length && <div className="assistant-welcome"><BookOpen size={30} strokeWidth={1.2} /><h3>Let’s make the<br /><em>evidence make sense.</em></h3><p>{language === 'bn' ? 'চার্ট, অনিশ্চয়তা এবং তথ্যের সীমাবদ্ধতা বুঝুন। প্রতিটি ফলাফলের উৎস দেখুন।' : 'Understand the chart, question the uncertainty and follow the source. Your evidence stays at the centre.'}</p></div>}
        {replies.map(reply => <motion.article className="assistant-reply" key={reply.id} initial={reduced ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}><div className="assistant-question">{reply.question}</div><span className="reply-context">{reply.label}{reply.contextId && reply.contextId !== current?.id ? ' · earlier analysis' : ''}</span><div className="assistant-answer" lang={reply.language}>{reply.answer.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<small>{reply.kind === 'reviewed' ? 'Reviewed scientific template · no generative AI' : 'AI explanation · verify against the computed record'}</small></div>{reply.evidence && <EvidenceAttachment evidence={reply.evidence} />}</motion.article>)}
        {busy && <div className="ask-loading" role="status"><LoaderCircle className="spin" size={16} /> Reading the verified evidence…</div>}
        {error && <p className="ask-error" role="alert">{error}</p>}
        {configured === false && <div className="assistant-service-note"><span>AI service is not configured.</span><p>Free-form AI answers are unavailable. You can still read a labelled, reviewed summary of the attached scientific result.</p><p>Reviewed summaries are available for an attached record and are labelled as templates, not AI answers.</p><a href="/methods">Read data & methods <ArrowUpRight size={12} /></a></div>}
        {current && <button className="reviewed-summary" disabled={busy} onClick={() => void ask('', true)}><ShieldIcon />{language === 'bn' ? 'যাচাইকৃত সারাংশ পড়ুন' : 'Read verified summary'}<ArrowUpRight size={14} /></button>}
        <div ref={bottom} />
      </div>
      <div className="assistant-bottom"><div className="companion-direct-actions"><button onClick={()=>setQuestion(language==='bn'?'এই চার্ট বুঝিয়ে বলো।':'Explain this chart and its uncertainty.')}>Explain this chart</button><button onClick={()=>setQuestion(language==='bn'?'আস্থা ব্যবধান কী?':'Explain the term confidence interval.')}>Explain this term</button></div><div className="ask-prompts">{(language === "bn" ? promptsBn : prompts).slice(0, replies.length ? 2 : 4).map(prompt => <button key={prompt} disabled={busy} onClick={() => configured ? void ask(prompt) : setQuestion(prompt)}>{prompt}<ArrowUpRight size={12} /></button>)}</div><form onSubmit={event => { event.preventDefault(); void ask(question); }}><label className="sr-only" htmlFor="ask-question">Your question / আপনার প্রশ্ন</label><textarea ref={field} id="ask-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1200} rows={2} placeholder={language === 'bn' ? 'এই তথ্য সম্পর্কে প্রশ্ন করুন…' : 'Ask about this evidence…'} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(question); } }} /><div><span>Evidence first. Always.</span><button disabled={busy || !question.trim() || configured !== true} aria-label="Send question">{busy ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />}</button></div></form><div className="assistant-footer"><span>Questions stay in this session.</span>{replies.length > 0 && <button disabled={busy} onClick={() => setReplies([])}><Trash2 size={12} /> Clear</button>}</div></div></div></div>
    </motion.aside>}</AnimatePresence>
  </div>;
}
function ShieldIcon() { return <Check size={15} />; }
