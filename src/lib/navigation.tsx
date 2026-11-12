'use client';

import {useCallback, useEffect, useMemo, useRef, useState, type SetStateAction, type RefObject} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';

const NAV = '__bhuNavigation';
const VIEWS = '__bhuViews';
const DRAFTS = '__bhuDrafts';
const PREFIX = 'bhu-session-v1:';
function read<T>(key:string, fallback:T):T {
  try { const raw=sessionStorage.getItem(PREFIX+key); return raw===null?fallback:JSON.parse(raw); } catch { return fallback; }
}
function save(key:string,value:unknown) {try{sessionStorage.setItem(PREFIX+key,JSON.stringify(value));}catch{/* Navigation still works without optional storage. */}}

/** Preserve selections/drafts on route unmount; never persist transient loading/errors. */
export function useSessionState<T>(key:string, initial:T|(()=>T)) {
  const [value,setValue]=useState(initial);
  const latest=useRef(value);
  const active=useRef(true);
  useEffect(()=>{
    active.current=true;
    const restore=()=>{
      const drafts=window.history.state?.[DRAFTS]??{};
      const restored=Object.hasOwn(drafts,key)?drafts[key] as T:read(key,latest.current);
      latest.current=restored;setValue(restored);save(key,restored);
      if(!Object.hasOwn(drafts,key))window.history.replaceState({...window.history.state,[DRAFTS]:{...drafts,[key]:restored}},'');
    };
    queueMicrotask(()=>{if(active.current)restore();});window.addEventListener('popstate',restore);return()=>{active.current=false;window.removeEventListener('popstate',restore);};
  },[key]);
  const update=useCallback((action:SetStateAction<T>)=> {
    if(!active.current)return;
    const next=typeof action==='function'?(action as (v:T)=>T)(latest.current):action;
    latest.current=next;save(key,next);setValue(next);
    const path=location.pathname;
    queueMicrotask(()=>{if(location.pathname===path)window.history.replaceState({...window.history.state,[DRAFTS]:{...window.history.state?.[DRAFTS],[key]:next}},'');});
  },[key]);
  return [value,update] as const;
}

/** Mark only history created inside this app; history.length can include external sites. */
export function NavigationHistory() {
  useEffect(()=>{
    const session=read('navigation-id',crypto.randomUUID());save('navigation-id',session);
    const history=window.history, push=history.pushState, replace=history.replaceState;
    if(history.state?.[NAV]?.session!==session)replace.call(history,{...history.state,[NAV]:{session,index:0}},'');
    history.pushState=function(data,unused,url){
      const index=(history.state?.[NAV]?.index??0)+1;
      const samePath=!url||new URL(url,location.href).pathname===location.pathname;
      push.call(history,{...data,...(!samePath?{[VIEWS]:{},[DRAFTS]:{}}:{}),[NAV]:{session,index}},unused,url);
    };
    history.replaceState=function(data,unused,url){replace.call(history,{...data,[NAV]:history.state?.[NAV]??{session,index:0}},unused,url);};
    return()=>{history.pushState=push;history.replaceState=replace;};
  },[]);
  return null;
}

type JourneyEntry<T>={value:T;previous?:T};
/** Logical view changes get real history entries, with Next's history fields retained. */
export function useJourney<T extends object>(key:string,initial:T) {
  const [value,setValue]=useState(initial);
  const current=useRef(initial), pending=useRef(false), direction=useRef<'forward'|'back'|'replace'>('forward');
  const active=useRef(true);
  const path=usePathname();
  useEffect(()=>{
    active.current=true;
    const restore=()=>{
      const entry=window.history.state?.[VIEWS]?.[key] as JourneyEntry<T>|undefined;
      const next=entry?.value??read(key,initial);current.current=next;save(key,next);setValue(next);
      if(!entry)window.history.replaceState({...window.history.state,[VIEWS]:{...window.history.state?.[VIEWS],[key]:{value:next}}},'');
    };
    queueMicrotask(()=>{if(active.current)restore();});window.addEventListener('popstate',restore);
    return()=>{active.current=false;window.removeEventListener('popstate',restore);};
    // A journey is scoped by its stable key and route, not a new defaults object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,path]);
  const navigate=useCallback((action:SetStateAction<T>,back=false,replace=false) => {
    if(!active.current)return;
    current.current=typeof action==='function'?(action as (v:T)=>T)(current.current):action;
    setValue(current.current);save(key,current.current);if(back)direction.current='back';else if(replace)direction.current='replace';
    if(pending.current)return;pending.current=true;const originPath=location.pathname;
    queueMicrotask(()=>{
      pending.current=false;if(location.pathname!==originPath)return;
      const views=window.history.state?.[VIEWS]??{}, old=views[key] as JourneyEntry<T>|undefined, next=current.current;
      const backwards=direction.current==='back', replacing=direction.current==='replace';direction.current='forward';
      if(JSON.stringify(old?.value)===JSON.stringify(next))return;
      if(backwards&&JSON.stringify(old?.previous)===JSON.stringify(next)){window.history.back();return;}
      const state={...window.history.state,[VIEWS]:{...views,[key]:{value:next,previous:backwards?undefined:old?.value}}};
      if(backwards||replacing)window.history.replaceState(state,'');else window.history.pushState(state,'');
    });
  },[key]);
  // These closures run only as event setters; constructing them does not read a ref.
  // eslint-disable-next-line react-hooks/refs, react-hooks/exhaustive-deps
  const setters=useMemo(()=>Object.fromEntries(Object.keys(initial).map(name=>[name,(action:SetStateAction<unknown>)=>navigate(v=>({...v,[name]:typeof action==='function'?action(v[name as keyof T]):action}))])),[navigate]);
  function field<K extends keyof T>(name:K) {return setters[name as string] as (action:SetStateAction<T[K]>)=>void;}
  return {value,field,navigate};
}

export function BackButton({fallback='/',label='Back'}:{fallback?:string;label?:string}) {
  const router=useRouter();
  return <button type="button" className="workspace-back" onClick={()=>{
    if(window.history.state?.[NAV]?.index>0)router.back();
    else router.replace(fallback.startsWith('/')&&!fallback.startsWith('//')?fallback:'/');
  }}><ArrowLeft size={16}/>{label}</button>;
}

/** Native dialogs close on Back/Escape and reopen on Forward without leaving the page. */
export function useHistoryDialog(key:string,ref:RefObject<HTMLDialogElement|null>) {
  const journey=useJourney(key,{open:false});
  const open=()=>journey.navigate({open:true});
  const close=()=>journey.navigate({open:false},true);
  useEffect(()=>{
    const dialog=ref.current;if(!dialog)return;
    if(journey.value.open&&!dialog.open)dialog.showModal();
    if(!journey.value.open&&dialog.open)dialog.close();
    const cancel=(event:Event)=>{event.preventDefault();close();};
    dialog.addEventListener('cancel',cancel);return()=>dialog.removeEventListener('cancel',cancel);
    // The journey owns dialog visibility, including Escape and popstate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[journey.value.open,ref]);
  return {open,close};
}
