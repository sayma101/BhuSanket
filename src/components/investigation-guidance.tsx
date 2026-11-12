'use client';
import type { TrendResult } from '@/lib/types';
import { AskEvidenceButton } from './experience';
import '@/styles/guided-workspaces.css';

export function InvestigationJourney({hasRecord,pending}:{hasRecord:boolean;pending:boolean}){
 return <nav className="investigation-journey" aria-label="Scientific investigation"><a href="#research-setup"><b>01</b><span>Define your question<small>Choose place, measurement and period</small></span></a><a href="#observed-record"><b>02</b><span>Examine the record<small>{pending?'Run analysis to verify your selections':hasRecord?'Read observations, trend and uncertainty':'Open a prepared NASA record'}</small></span></a><a href="#data-passport"><b>03</b><span>Trace & share evidence<small>Keep the source and limitations</small></span></a></nav>;
}
export function ResearchFinding({result,language,pending}:{result:TrendResult;language:'en'|'bn';pending:boolean}){
 const bn=language==='bn';
 return <section className="guided-finding" aria-label="Plain-language main finding"><header><span>{pending?(bn?'আগের বিশ্লেষণ — নতুন নির্বাচন এখনো যাচাই হয়নি':'PREVIOUS ANALYSIS — NEW SELECTIONS NOT YET VERIFIED'):(bn?'তোমার অনুসন্ধানের ফল':'YOUR INVESTIGATION FINDING')}</span><strong>{result.location.label} · {result.period.start_year}–{result.period.end_year}</strong></header><h2>{result.verdict}</h2><p lang={language}>{result.interpretation[language]}</p><div className="finding-explanations"><article><h3>{bn?'অনিশ্চয়তা বোঝো':'Read the uncertainty'}</h3><p>{bn?'ঢাল পরিবর্তনের হার। আস্থা ব্যবধান তার অনিশ্চয়তা বোঝায়; এটি ভবিষ্যৎ মানের পূর্বাভাস নয়।':'The slope estimates the rate of change. Its confidence interval describes uncertainty under the method’s assumptions; it is not a forecast interval.'}</p></article><article><h3>{bn?'তথ্যের পূর্ণতা দেখো':'Check data quality'}</h3><p>{result.quality.valid_observations} / {result.quality.total_observations} {bn?'ব্যবহারযোগ্য সময়কাল। অনুপস্থিত মান শূন্য নয়। বিন্দুর মান জেলার গড় নয়।':'valid periods. Missing observations are not zero. A point estimate is not a district average.'}</p></article></div><AskEvidenceButton label={bn?'এই চার্ট বুঝিয়ে বলো':'Explain this chart'} question={bn?'এই চার্ট এবং এর সীমাবদ্ধতা বুঝিয়ে বলো।':'Explain this chart and its limitations.'}/></section>;
}
