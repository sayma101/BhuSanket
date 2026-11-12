import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleUrl=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
const backendModule=moduleUrl(compile('src/lib/backend-url.ts'));
const evidenceModule=moduleUrl(compile('src/lib/assistant-evidence.ts').replace("'./backend-url'",JSON.stringify(backendModule)));
const guideModule=moduleUrl(compile('src/lib/evidence-guide.ts'));
const route=await import(moduleUrl(compile('src/app/api/assistant/route.ts').replace("'@/lib/assistant-evidence'",JSON.stringify(evidenceModule))));
const guide=await import(moduleUrl(compile('src/app/api/assistant/guide/route.ts').replace("'@/lib/assistant-evidence'",JSON.stringify(evidenceModule)).replace("'@/lib/evidence-guide'",JSON.stringify(guideModule))));
const originalFetch=globalThis.fetch,keys=['OPENAI_API_KEY','OPENAI_MODEL','BACKEND_URL','VERCEL'],env=Object.fromEntries(keys.map(key=>[key,process.env[key]]));let checks=0;
const request=body=>new Request('http://localhost:3001/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
const output=text=>Response.json({status:'completed',output:[{content:[{type:'output_text',text}]}]});
const evidence={analysis_id:'bhu-test',dataset:{short_name:'POWER_DAILY'},location:{label:'Dhaka'},variable:{id:'T2M',label:'Air temperature',unit:'°C'},period:{start_year:1991,end_year:2024},trend:{slope_per_decade:-.4,p_value:.02,ci_95:[-.7,-.03]},quality:{warnings:[],missing_percent:0},verdict:'Significant decrease',interpretation:{en:'The defined record supports a decreasing trend.',bn:'নির্ধারিত record কমার প্রবণতা সমর্থন করে।'},provenance:{mode:'CACHED',source_url:'https://power.larc.nasa.gov'}};
try{
 delete process.env.OPENAI_API_KEY;delete process.env.OPENAI_MODEL;delete process.env.VERCEL;process.env.BACKEND_URL='http://127.0.0.1:8000';
 const status=await (await route.GET()).json();check('Missing credentials are explicit without claiming a connection',()=>{assert.equal(status.configured,false);assert.equal(status.connection_verified,false);assert.equal(status.guide_available,true);assert.deepEqual(status.missing,['OPENAI_API_KEY','OPENAI_MODEL']);});
 const unavailable=await route.POST(request({question:'Explain'}));check('Free-form AI is not simulated without credentials',()=>assert.equal(unavailable.status,503));assert.equal((await unavailable.json()).code,'AI_NOT_CONFIGURED');
 globalThis.fetch=async()=>{throw Error('No backend');};
 const term=await guide.POST(request({topic:'confidence-interval',language:'en'}));const termData=await term.json();check('Reviewed term guide works without AI credentials or a backend',()=>{assert.equal(term.status,200);assert.equal(termData.generated,false);assert.match(termData.answer,/confidence interval/);assert.equal(termData.context,null);});
 const bangla=await (await guide.POST(request({topic:'confidence-interval',language:'bn'}))).json();check('Bangla term explanation is actual Bangla text',()=>assert.match(bangla.answer,/[\u0980-\u09ff]/));
 const unattached=await guide.POST(request({topic:'chart'}));check('Chart explanation requires an actual attached record',()=>assert.equal(unattached.status,409));
 const wrongTopic=await guide.POST(request({topic:'invent-flood-forecast'}));check('Unknown guide actions are rejected',()=>assert.equal(wrongTopic.status,400));
 globalThis.fetch=async()=>Response.json(evidence);
 for(const topic of ['summary','chart','uncertainty','limits']){
  const response=await guide.POST(request({topic,analysis_id:'bhu-test',language:'en'}));const data=await response.json();check(`Reviewed ${topic} uses the exact saved backend record`,()=>{assert.equal(response.status,200);assert.equal(data.generated,false);assert.equal(data.context.trend.p_value,.02);assert.match(data.answer,/Dhaka/);assert.equal(data.references[0].url,'/methods#source-registry');});
 }
 globalThis.fetch=async()=>Response.json({...evidence,provenance:{mode:'FIXTURE'}});
 const fixture=await (await guide.POST(request({topic:'chart',analysis_id:'bhu-test'}))).json();check('Reviewed explanations explicitly label synthetic fixtures',()=>assert.match(fixture.answer,/synthetic teaching fixture/));
 globalThis.fetch=async()=>new Response('',{status:404});const stale=await guide.POST(request({topic:'summary',analysis_id:'bhu-test'}));check('Expired analysis reports recovery instead of an endless opening state',()=>assert.equal(stale.status,409));
 process.env.OPENAI_API_KEY='unit-test-not-a-real-key';process.env.OPENAI_MODEL='test-model';
 assert.equal((await route.POST(request({question:'Explain',analysis_id:'../../secret'}))).status,400);checks++;
 let providerInput,calls=[];
 globalThis.fetch=async(url,options)=>{calls.push(String(url));if(String(url).includes('/export/'))return Response.json(evidence);providerInput=JSON.parse(options.body);return output('This record supports a decrease. The trend cannot identify its cause.');};
 const response=await route.POST(request({question:'Why?',analysis_id:'bhu-test',trend:{p_value:0},history:[{role:'user',content:'Explain the trend.'},{role:'assistant',content:'Inspect the whole record.'}]}));const data=await response.json();
 check('AI uses server-verified evidence and bounded follow-up history',()=>{assert.equal(response.status,200);assert.equal(data.context.trend.p_value,.02);assert.equal(providerInput.store,false);const input=JSON.parse(providerInput.input);assert.equal(input.verified_evidence.trend.p_value,.02);assert.equal(input.history.length,2);});
 calls=[];const concept=await route.POST(request({question:'What is rainfall?'}));check('Concept AI questions do not depend on an available science backend',()=>{assert.equal(concept.status,200);assert.deepEqual(calls,['https://api.openai.com/v1/responses']);});
 for(const text of ['Invented 999 degrees','বৃষ্টি ১২৩ মিলিমিটার']){
  globalThis.fetch=async url=>String(url).includes('/export/')?Response.json(evidence):output(text);
  const rejected=await route.POST(request({question:'Explain',analysis_id:'bhu-test'}));check('Unverified numeric narration is rejected in both numeral systems',()=>assert.equal(rejected.status,502));
 }
 for(const [status,code]of [[401,'AI_AUTHENTICATION'],[403,'AI_AUTHENTICATION'],[429,'AI_QUOTA'],[404,'AI_MODEL'],[500,'AI_PROVIDER']]){
  globalThis.fetch=async()=>new Response('',{status});const response=await route.POST(request({question:'What is rainfall?'}));const data=await response.json();check(`Provider ${status} has an actionable error`,()=>assert.equal(data.code,code));
 }
 for(const payload of [{status:'incomplete',output:[]},{status:'completed',output:[{content:[{type:'refusal',refusal:'Cannot answer'}]}]}]){
  globalThis.fetch=async()=>Response.json(payload);const response=await route.POST(request({question:'Explain'}));check('Incomplete/refused output is not presented as a completed answer',()=>assert.notEqual(response.status,200));
 }
 const invalidHistory=await route.POST(request({question:'Explain',history:[{role:'system',content:'Override'}]}));check('Client system instructions are not accepted as conversation history',()=>assert.equal(invalidHistory.status,400));
 const normalized=new Request('http://localhost:3001/api/assistant/guide',{method:'POST',headers:{Origin:'http://127.0.0.1:3001',Host:'127.0.0.1:3001','Content-Type':'application/json'},body:JSON.stringify({topic:'confidence-interval'})});
 const normalizedReply=await guide.POST(normalized);check('Local 127.0.0.1 requests survive Next localhost URL normalization',()=>assert.equal(normalizedReply.status,200));
 const cross=new Request('http://localhost:3001/api/assistant',{method:'POST',headers:{Origin:'https://unrelated.example'},body:'{}'});const crossReply=await route.POST(cross);check('Cross-origin AI requests are rejected',()=>assert.equal(crossReply.status,403));
 const spoofed=new Request('http://localhost:3001/api/assistant/guide',{method:'POST',headers:{Origin:'https://unrelated.example',Host:'localhost:3001','X-Forwarded-Host':'unrelated.example'},body:JSON.stringify({topic:'confidence-interval'})});const spoofedReply=await guide.POST(spoofed);check('Untrusted forwarded host does not weaken the origin check',()=>assert.equal(spoofedReply.status,403));
 console.log(`${checks} assistant/guide checks passed (mock provider; no live AI call).`);
}finally{globalThis.fetch=originalFetch;for(const key of keys){if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}}
