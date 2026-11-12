import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const backendCode=ts.transpileModule(fs.readFileSync('src/lib/backend-url.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const backendModule='data:text/javascript;base64,'+Buffer.from(backendCode).toString('base64');
const compiled=ts.transpileModule(fs.readFileSync('src/app/api/assistant/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("'@/lib/backend-url'",JSON.stringify(backendModule));
const route=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const originalFetch=globalThis.fetch;const key=process.env.OPENAI_API_KEY;const model=process.env.OPENAI_MODEL;let checks=0;
const request=body=>new Request('http://localhost:3001/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
try{
 delete process.env.OPENAI_API_KEY;delete process.env.OPENAI_MODEL;
 assert.equal((await (await route.GET()).json()).configured,false);checks++;
 assert.equal((await route.POST(request({question:'Explain'}))).status,503);checks++;
 process.env.OPENAI_API_KEY='unit-test-not-a-real-key';process.env.OPENAI_MODEL='test-model';
 assert.equal((await route.POST(request({question:'Explain',analysis_id:'../../secret'}))).status,400);checks++;
 const evidence={analysis_id:'bhu-test',dataset:{short_name:'POWER_DAILY'},period:{start_year:1991,end_year:2024},trend:{slope_per_decade:-.4,p_value:.02},verdict:'Significant decrease',provenance:{mode:'CACHED',source_url:'https://power.larc.nasa.gov'}};
 let providerInput;
 globalThis.fetch=async(url,options)=>{if(String(url).includes('/export/'))return Response.json(evidence);providerInput=JSON.parse(options.body);return Response.json({output:[{content:[{type:'output_text',text:'This record supports a decrease. The trend cannot identify its cause.'}]}]});};
 const response=await route.POST(request({question:'Why?',analysis_id:'bhu-test',trend:{p_value:0}}));const data=await response.json();assert.equal(response.status,200);assert.equal(data.context.trend.p_value,.02);assert.equal(providerInput.store,false);assert.equal(JSON.parse(providerInput.input).verified_evidence.trend.p_value,.02);checks++;
 globalThis.fetch=async url=>String(url).includes('/export/')?Response.json(evidence):Response.json({output:[{content:[{type:'output_text',text:'Invented 999 degrees'}]}]});
 assert.equal((await route.POST(request({question:'Explain',analysis_id:'bhu-test'}))).status,502);checks++;
 globalThis.fetch=async()=>new Response('',{status:404});assert.equal((await route.POST(request({question:'Explain',analysis_id:'bhu-missing'}))).status,409);checks++;
 const cross=new Request('http://localhost:3001/api/assistant',{method:'POST',headers:{Origin:'https://unrelated.example'},body:'{}'});assert.equal((await route.POST(cross)).status,403);checks++;
 console.log(`${checks} assistant boundary checks passed (mock provider; no live API call).`);
}finally{globalThis.fetch=originalFetch;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
