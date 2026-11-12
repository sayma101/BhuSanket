export type AnalysisContext = { id: string; label: string; path: string };
let latest: AnalysisContext | null = null;
export function getAnalysisContext() { return latest; }
export function publishAnalysis(value:unknown){
 if(typeof window==='undefined'||!value||typeof value!=='object')return;
 const record=value as {analysis_id?:string;variable?:{label:string};location?:{label:string}};
 if(record.analysis_id){latest={id:record.analysis_id,label:[record.location?.label,record.variable?.label].filter(Boolean).join(' · '),path:window.location.pathname};window.dispatchEvent(new CustomEvent('bhu-analysis',{detail:latest}));}
}
export function clearAnalysis(){latest=null;if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('bhu-analysis',{detail:{id:'',label:'',path:window.location.pathname}}));}
