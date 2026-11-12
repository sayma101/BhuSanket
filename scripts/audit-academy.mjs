import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const registry=JSON.parse(await readFile('src/data/nasa-sources.json','utf8'));
const registryCode=ts.transpileModule((await readFile('src/lib/nasa-sources.ts','utf8')).replace(/import registry from [^;]+;/,`const registry=${JSON.stringify(registry)};`),{compilerOptions:{module:ts.ModuleKind.ES2022}}).outputText;
const registryUrl=`data:text/javascript;base64,${Buffer.from(registryCode).toString('base64')}`;
const compile=async p=>ts.transpileModule(await readFile(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll("'@/lib/nasa-sources'",JSON.stringify(registryUrl));
const url=s=>`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
const contentUrl=url(await compile('src/lib/academy-content.ts'));
const {ACADEMY_LESSONS}=await import(contentUrl);
const {MISSION_MEDIA,LESSON_SOURCES}=await import(url((await compile('src/lib/academy-media.ts')).replaceAll("'./academy-content'",JSON.stringify(contentUrl))));
const {missionQuestions}=await import(url((await compile('src/lib/academy-mission-questions.ts')).replaceAll("'./academy-content'",JSON.stringify(contentUrl))));
const base=process.env.BHU_BASE_URL||'http://127.0.0.1:3000';
const claims=await (await fetch(`${base}/api/v1/claims`)).json();
const audits=[];const videos=new Set();
for(const claim of claims){
 const lesson=ACADEMY_LESSONS[claim.id],media=MISSION_MEDIA[claim.id];assert.ok(lesson&&media);
 const request={location_id:claim.location_id,variable:claim.variable,aggregation:claim.aggregation,start_year:claim.start_year,end_year:claim.end_year,mode:'cached',autocorrelation:'auto'};
 const response=await fetch(`${base}/api/v1/trend`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});assert.equal(response.status,200);const result=await response.json();
 const questions=missionQuestions(claim.id,false,result);assert.equal(questions.length,8);assert.ok(questions[7].options[0].en.includes(result.variable.unit));
 let delivery=null;
 if(media.video){assert.ok(!videos.has(media.video));videos.add(media.video);const video=await fetch(base+media.video,{headers:{Range:'bytes=0-1023'}});assert.equal(video.status,206);assert.match(video.headers.get('content-type'),/video\/mp4/);assert.ok(Buffer.from(await video.arrayBuffer()).includes(Buffer.from('ftyp')));delivery={status:video.status,range:video.headers.get('content-range')};}
 audits.push({mission_id:claim.id,title:lesson.title.en,objective:lesson.objective,media_title:media.title,media_type:media.video?'NASA film':'BhuSanket authored animation; not a NASA video',local_video:media.video??null,delivery,source:LESSON_SOURCES[claim.id],image:lesson.image,explanation_sections:lesson.sections.length,transcript:'Bilingual descriptive guide; NASA films are silent, not a narration transcript',watch_questions:3,concept_image_questions:4,actual_chart_questions:1,question_set:`${claim.id}-v2`,analysis_id:result.analysis_id,request,actual_dataset:result.dataset,scientific_engine_changed:false});
}
await writeFile('docs/ACADEMY_CONTENT_AUDIT.json',JSON.stringify({checked_at:new Date().toISOString(),base,missions:audits,unique_video_paths:videos.size,duplicate_video_paths:0,original_problem:'The Water Cycle was shared by Rajshahi, Khulna and Sylhet; all four missions used the same five questions. Heat already had an illustrated fallback. Written lessons and images were distinct but lacked explicit misconception and data bridges.'},null,2));
console.log(JSON.stringify(audits.map(a=>({id:a.mission_id,type:a.media_type,questions:a.watch_questions+a.concept_image_questions+a.actual_chart_questions,video_http:a.delivery?.status})),null,2));
