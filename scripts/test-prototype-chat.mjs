import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const url=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
const backend=url(compile('src/lib/backend-url.ts'));
const evidence=url(compile('src/lib/assistant-evidence.ts').replace("'./backend-url'",JSON.stringify(backend)));
const guide=url(compile('src/lib/evidence-guide.ts'));
const knowledge=url(compile('src/lib/prototype-chat.ts').replace("'./evidence-guide'",JSON.stringify(guide)));
const {POST}=await import(url(compile('src/app/api/assistant/prototype/route.ts').replace("'@/lib/assistant-evidence'",JSON.stringify(evidence)).replace("'@/lib/evidence-guide'",JSON.stringify(guide)).replace("'@/lib/prototype-chat'",JSON.stringify(knowledge))));
const {PROTOTYPE_QUESTIONS}=await import(knowledge);
const originalFetch=globalThis.fetch,originalBackend=process.env.BACKEND_URL,originalVercel=process.env.VERCEL;
const request=body=>new Request('http://localhost:3000/api/assistant/prototype',{method:'POST',headers:{'Content-Type':'application/json',Host:'127.0.0.1:3000',Origin:'http://127.0.0.1:3000'},body:JSON.stringify(body)});
let checks=0,calls=0;const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
try{
 delete process.env.VERCEL;process.env.BACKEND_URL='http://127.0.0.1:8000';
 globalThis.fetch=async()=>{calls++;throw Error('No external service allowed');};
 for(const [question,topic]of [['Hello','greeting'],['What is your name?','about'],['What is rainfall?','rainfall'],['What is temperature?','temperature'],['What is climate?','weather'],['Which NASA data do you use?','nasa'],['What is a p-value?','pvalue'],['Explain Theil-Sen slope','slope'],['What is a trend?','trend'],['Explain confidence interval','confidence-interval'],['How do I use Student Lab?','student'],['How does Claim Court work?','court'],['What is a Data Passport?','passport'],['Can you forecast floods?','limits'],['Thank you','thanks'],['Pizza recipe please','unknown']]){
  const response=await POST(request({question}));const data=await response.json();check(`Typed question: ${question}`,()=>{assert.equal(response.status,200);assert.equal(data.topic,topic);assert.equal(data.generated,false);assert.equal(data.prototype,true);assert.equal(data.context,null);assert.ok(data.answer.length>40);});
 }
 for(const question of PROTOTYPE_QUESTIONS.bn){const response=await POST(request({question}));const data=await response.json();check('Bengali suggestions produce reviewed Bengali answers',()=>{assert.equal(response.status,200);assert.equal(data.language,'bn');assert.notEqual(data.topic,'unknown');assert.match(data.answer,/[\u0980-\u09ff]/);});}
 check('General prototype questions make no backend or AI requests',()=>assert.equal(calls,0));
 const record={analysis_id:'bhu-prototype-test',location:{label:'Dhaka'},variable:{id:'PRECTOTCORR',label:'Rainfall',unit:'mm'},period:{start_year:1991,end_year:2024},provenance:{mode:'CACHED'},interpretation:{en:'The actual test record has no significant trend.',bn:'আসল test record-এ significant trend পাওয়া যায়নি।'},trend:{p_value:.4},quality:{warnings:[]}};
 globalThis.fetch=async()=>Response.json(record);
 const finding=await (await POST(request({question:'Has rainfall in Dhaka increased?',analysis_id:record.analysis_id}))).json();check('A local trend answer uses the real saved interpretation',()=>{assert.equal(finding.usesRecord,true);assert.match(finding.answer,/no significant trend/);assert.equal(finding.context.trend.p_value,.4);});
 const wrongPlace=await (await POST(request({question:'Has rainfall in Sylhet increased?',analysis_id:record.analysis_id}))).json();check('A different requested place cannot inherit the current result',()=>{assert.equal(wrongPlace.usesRecord,false);assert.equal(wrongPlace.context,null);assert.match(wrongPlace.answer,/different location/);});
 const wrongVariable=await (await POST(request({question:'Has temperature in Dhaka increased?',analysis_id:record.analysis_id}))).json();check('A different requested variable cannot inherit a rainfall result',()=>assert.equal(wrongVariable.usesRecord,false));
 globalThis.fetch=async()=>new Response('',{status:404});const stale=await (await POST(request({question:'Explain this chart',analysis_id:record.analysis_id}))).json();check('Missing evidence gives labelled general help without invented findings',()=>{assert.ok(stale.evidence_notice);assert.equal(stale.context,null);assert.equal(stale.generated,false);});
 const invalid=await POST(request({question:'Explain',analysis_id:'../../secret'}));check('Invalid analysis identity is rejected',()=>assert.equal(invalid.status,400));
 const empty=await POST(request({question:''}));check('Empty input is rejected',()=>assert.equal(empty.status,400));
 console.log(`${checks} prototype checks passed; no API key or real AI needed.`);
}finally{globalThis.fetch=originalFetch;for(const[key,value]of [['BACKEND_URL',originalBackend],['VERCEL',originalVercel]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
