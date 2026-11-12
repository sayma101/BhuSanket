// Executes the production history hooks with deterministic hook/storage/history adapters.
// This checks transitions and recovery; it is not browser/rendered UI verification.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const listeners=new Map(), storage=new Map();
globalThis.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
globalThis.location={href:'http://localhost/student-lab',pathname:'/student-lab'};
const entries=[{data:{__NA:true,tree:'next-router'},url:location.href}];let cursor=0;
function dispatch(){for(const fn of [...(listeners.get('popstate')??[])])fn({state:entries[cursor].data});}
function move(delta){cursor=Math.max(0,Math.min(entries.length-1,cursor+delta));location.href=entries[cursor].url;location.pathname=new URL(location.href).pathname;dispatch();}
const history={get state(){return entries[cursor].data;},get length(){return entries.length;},
 pushState(data,unused,url){const target=new URL(url??location.href,location.href);entries.splice(cursor+1);entries.push({data:structuredClone(data),url:target.href});cursor++;location.href=target.href;location.pathname=target.pathname;},
 replaceState(data,unused,url){const target=new URL(url??location.href,location.href);entries[cursor]={data:structuredClone(data),url:target.href};location.href=target.href;location.pathname=target.pathname;},
 back(){move(-1);},forward(){move(1);}};
globalThis.window={history,addEventListener:(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener:(name,fn)=>listeners.get(name)?.delete(fn)};
let instance,index;const depsEqual=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
const hookApi={
 useState(initial){const slot=index++;if(!(slot in instance.slots))instance.slots[slot]=typeof initial==='function'?initial():initial;const owner=instance;return [owner.slots[slot],value=>owner.slots[slot]=typeof value==='function'?value(owner.slots[slot]):value];},
 useRef(initial){const slot=index++;return instance.slots[slot]??= {current:initial};},
 useEffect(fn,deps){const slot=index++;const old=instance.slots[slot];if(!old||!depsEqual(old.deps,deps)){old?.cleanup?.();instance.slots[slot]={deps};const owner=instance;owner.effects.push(()=>{owner.slots[slot].cleanup=fn();});}},
 useMemo(fn,deps){const slot=index++;const old=instance.slots[slot];if(!old||!depsEqual(old.deps,deps))instance.slots[slot]={deps,value:fn()};return instance.slots[slot].value;},
 useCallback(fn,deps){return hookApi.useMemo(()=>fn,deps);},
};
const routes=[];
globalThis.__navigationTest={...hookApi,usePathname:()=>location.pathname,useRouter:()=>({back:()=>history.back(),replace:path=>routes.push(path)})};
let code=ts.transpileModule(await readFile('src/lib/navigation.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
code=code.replace(/import \{([^}]+)\} from 'react';/, 'const {$1}=globalThis.__navigationTest;')
 .replace(/import \{([^}]+)\} from 'next\/navigation';/,'const {$1}=globalThis.__navigationTest;')
 .replace(/import \{ ArrowLeft \} from 'lucide-react';/, 'const ArrowLeft="arrow";');
code='const React={createElement:(type,props,...children)=>({type,props,children})};\n'+code;
const hooks=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
function mount(fn){const owner={slots:[],effects:[],fn};owner.render=()=>{instance=owner;index=0;const value=fn();for(const effect of owner.effects.splice(0))effect();return value;};owner.unmount=()=>{for(const slot of owner.slots)slot?.cleanup?.();};return owner;}
const tick=()=>new Promise(resolve=>setImmediate(resolve));let checks=0;
function check(name,fn){fn();console.log('PASS',name);checks++;}
const provider=mount(()=>hooks.NavigationHistory());provider.render();
const mission=mount(()=>hooks.useJourney('academy-view',{mission:null,step:0}));let view=mission.render();await tick();view=mission.render();
const draft=mount(()=>hooks.useSessionState('academy:prediction',''));let text=draft.render();await tick();text=draft.render();
view.navigate({mission:'rain',step:0});text[1]('Rain may have increased');await tick();view=mission.render();
check('Entry preserves Next router state and increments owned history',()=>{assert.equal(history.state.__NA,true);assert.equal(history.state.tree,'next-router');assert.equal(history.state.__bhuNavigation.index,1);});
view.field('step')(1);view.field('step')(2);await tick();view=mission.render();
check('Batched logical transition adds one entry',()=>{assert.equal(view.value.step,2);assert.equal(history.state.__bhuNavigation.index,2);});
history.back();await tick();view=mission.render();text=draft.render();
check('Browser Back restores mission/step and its prediction',()=>{assert.deepEqual(view.value,{mission:'rain',step:0});assert.equal(text[0],'Rain may have increased');});
history.forward();await tick();view=mission.render();
check('Browser Forward restores the later logical step',()=>assert.equal(view.value.step,2));
const length=history.length;view.navigate({mission:'rain',step:0},true);await tick();view=mission.render();
check('Visible logical Back consumes matching history without adding a loop',()=>{assert.equal(history.length,length);assert.equal(view.value.step,0);assert.equal(history.state.__bhuNavigation.index,1);});
view.navigate({mission:'heat',step:0});text[1]('Heat prediction');await tick();history.back();await tick();view=mission.render();text=draft.render();
check('Returning from another mission recovers the earlier mission draft',()=>{assert.equal(view.value.mission,'rain');assert.equal(text[0],'Rain may have increased');});
const drawer=mount(()=>hooks.useJourney('assistant',{open:false}));let assistant=drawer.render();await tick();assistant=drawer.render();assistant.field('open')(true);await tick();history.back();await tick();assistant=drawer.render();
check('Browser Back closes the assistant before leaving the page',()=>{assert.equal(assistant.value.open,false);assert.equal(location.pathname,'/student-lab');});
const dialog={open:false,events:new Map(),showModal(){this.open=true;},close(){this.open=false;},addEventListener(n,f){this.events.set(n,f);},removeEventListener(n){this.events.delete(n);}};
const modal=mount(()=>hooks.useHistoryDialog('atlas-image',{current:dialog}));let controls=modal.render();await tick();controls=modal.render();controls.open();await tick();controls=modal.render();
check('History dialog opens',()=>assert.equal(dialog.open,true));
history.back();await tick();controls=modal.render();check('Browser Back closes native dialog',()=>assert.equal(dialog.open,false));
history.forward();await tick();controls=modal.render();check('Forward reopens native dialog',()=>assert.equal(dialog.open,true));
let prevented=false;dialog.events.get('cancel')({preventDefault(){prevented=true;}});await tick();controls=modal.render();
check('Escape consumes dialog history and closes it',()=>{assert.equal(prevented,true);assert.equal(dialog.open,false);});
history.pushState({__NA:true},'', '/research');
check('Route navigation does not carry stale local journey/draft snapshots',()=>{assert.deepEqual(history.state.__bhuViews,{});assert.deepEqual(history.state.__bhuDrafts,{});});
const button=mount(()=>hooks.BackButton({fallback:'/explore'}));button.render().props.onClick();
check('Page Back follows the owned prior page',()=>assert.equal(location.pathname,'/student-lab'));
history.replaceState({...history.state,__bhuNavigation:{index:0}},'');
// The wrapper deliberately preserves the marker, so simulate a direct-entry document.
entries[cursor].data.__bhuNavigation.index=0;button.render().props.onClick();
check('Direct-entry Back uses the explicit safe route',()=>assert.equal(routes.at(-1),'/explore'));
const unsafe=mount(()=>hooks.BackButton({fallback:'//external.example'}));unsafe.render().props.onClick();
check('Unsafe fallback is replaced by home',()=>assert.equal(routes.at(-1),'/'));
storage.set('bhu-session-v1:corrupt','invalid json');const corrupt=mount(()=>hooks.useSessionState('corrupt','safe'));corrupt.render();await tick();check('Corrupt optional storage falls back safely',()=>assert.equal(corrupt.render()[0],'safe'));
const abandoned=mount(()=>hooks.useSessionState('abandoned','original'));abandoned.render();await tick();const updateAbandoned=abandoned.render()[1];abandoned.unmount();updateAbandoned('late network response');await tick();
check('A late response cannot overwrite drafts after unmount',()=>assert.equal(storage.get('bhu-session-v1:abandoned'),'"original"'));
const departed=mount(()=>hooks.useJourney('departed',{step:0}));departed.render();await tick();const lateJourney=departed.render();departed.unmount();const priorLength=history.length;lateJourney.navigate({step:4});await tick();
check('A late response cannot push a journey after unmount',()=>assert.equal(history.length,priorLength));
console.log(`${checks} navigation checks passed; no browser UI QA claimed.`);
