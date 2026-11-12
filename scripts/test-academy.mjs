import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const registry=JSON.parse(await readFile('src/data/nasa-sources.json','utf8'));
const registryCode=ts.transpileModule((await readFile('src/lib/nasa-sources.ts','utf8')).replace(/import registry from [^;]+;/,`const registry=${JSON.stringify(registry)};`),{compilerOptions:{module:ts.ModuleKind.ES2022}}).outputText;
const registryUrl=`data:text/javascript;base64,${Buffer.from(registryCode).toString('base64')}`;
const compile = async file => ts.transpileModule(await readFile(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll("'@/lib/nasa-sources'",JSON.stringify(registryUrl));
const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const contentUrl = url(await compile('src/lib/academy-content.ts'));
const content = await import(contentUrl);
const missionUrl=url((await compile('src/lib/academy-mission-questions.ts')).replaceAll("'./academy-content'",JSON.stringify(contentUrl)));
const missions=await import(missionUrl);
const media=await import(url((await compile('src/lib/academy-media.ts')).replaceAll("'./academy-content'",JSON.stringify(contentUrl))));
const quiz = await import(url((await compile('src/lib/academy-quiz.ts')).replaceAll("'./academy-content'",JSON.stringify(contentUrl)).replaceAll("'./academy-mission-questions'",JSON.stringify(missionUrl))));

test('Knowledge checks compute actual results and preserve submitted answers',()=>{
 const full=[0,1,2,1,1];const copy=[...full];
 assert.equal(quiz.scoreAcademyQuiz(full),5);assert.deepEqual(full,copy);
 assert.equal(quiz.scoreAcademyQuiz([1,0,0,0,0]),0);
 assert.equal(quiz.scoreAcademyQuiz([0,0,2,0,1]),3);
});
test('Incomplete, sparse and invalid submissions cannot earn a score',()=>{
 for(const answers of [[],[0,1,2,1],[-1,1,2,1,1],[0,1,2,1,2],[0,NaN,2,1,1],[0,1.5,2,1,1],Array(5),[0,1,2,1,1,0],null]){
  assert.throws(()=>quiz.scoreAcademyQuiz(answers),/Complete every question/);
 }
});
test('All original mission lessons have substantial English and Bangla content',async()=>{
 assert.deepEqual(Object.keys(content.ACADEMY_LESSONS).sort(),['dhaka-summer','khulna-monsoon','rajshahi-rain','sylhet-rain']);
 for(const lesson of Object.values(content.ACADEMY_LESSONS)){
  assert.ok(lesson.sections.length>=3&&lesson.sections.length<=5);
  assert.ok(lesson.words.length>=3);assert.ok(lesson.takeaways.length>=3);
  const bilingual=[lesson.title,lesson.description,lesson.objective,lesson.question,...lesson.takeaways,...lesson.sections.flatMap(s=>[s.title,s.body,s.example]),...lesson.words.flatMap(w=>[w.term,w.meaning])];
  for(const line of bilingual){assert.ok(line.en.trim().length>2);assert.match(line.bn,/[\u0980-\u09ff]/);assert.ok(!line.bn.includes('�'));}
  assert.match(lesson.image.source,/^https:\/\//);await access(`public${lesson.image.src}`);
 }
});
test('Question feedback and visual questions remain available in both languages',()=>{
 assert.ok(quiz.ACADEMY_QUESTIONS.some(q=>q.kind==='true-false'));
 assert.ok(quiz.ACADEMY_QUESTIONS.some(q=>q.visual==='chart'));
 assert.ok(quiz.ACADEMY_QUESTIONS.some(q=>q.visual==='image'));
 for(const q of quiz.ACADEMY_QUESTIONS){assert.ok(q.correct>=0&&q.correct<q.options.length);for(const v of [q.prompt,q.why,...q.options]){assert.ok(v.en.length>2);assert.match(v.bn,/[\u0980-\u09ff]/);}}
});
test('Educational film is local, attributed and separate from measurements',async()=>{
 const manifest=JSON.parse(await readFile('docs/ACADEMY_MEDIA.json','utf8'));
 assert.ok(JSON.stringify(manifest).includes('svs.gsfc.nasa.gov/10501'));
 await access('public/images/academy-water-cycle-2009.mp4');await access('public/images/academy-water-cycle-poster.webp');
 assert.equal(content.WATER_TRANSCRIPT.length,4);assert.equal(content.HEAT_STORY.length,5);
});

test('Every mission has distinct media and unique bilingual assessments',()=>{
 const titles=new Set(),ids=new Set(),videos=[];
 for(const id of Object.keys(content.ACADEMY_LESSONS)){
  const lesson=media.MISSION_MEDIA[id];titles.add(lesson.title.en);if(lesson.video)videos.push(lesson.video);
  assert.equal(lesson.scenes.length,3);assert.ok(lesson.misconception.bn);assert.ok(lesson.dataset.bn);
  for(const scene of lesson.scenes)for(const value of [scene.title,scene.body,scene.think]){assert.ok(value.en);assert.match(value.bn,/[\u0980-\u09ff]/);}
  const watched=missions.missionQuestions(id,true);assert.equal(watched.length,3);
  const questions=missions.missionQuestions(id);assert.equal(questions.length,7);
  for(const question of questions){assert.ok(!ids.has(question.id));ids.add(question.id);assert.ok(question.why.bn);}
  assert.equal(quiz.scoreAcademyQuiz(questions.map(q=>q.correct),questions),7);
  const record={location:{label:'Prepared point'},variable:{unit:id==='dhaka-summer'?'?C':'mm'},series:[{year:1991,value:12.345,coverage:1}]};
  const actual=missions.missionQuestions(id,false,record);assert.equal(actual.length,8);assert.match(actual[7].options[0].en,/12.35/);
  assert.equal(quiz.scoreAcademyQuiz(actual.map(q=>q.correct),actual),8);
  assert.throws(()=>quiz.scoreAcademyQuiz(Array(8),actual));
  const saved={answers:actual.map(q=>q.correct),questions:actual,question_set:`${id}-v2`};assert.deepEqual(quiz.questionsForRecord(saved),actual);
 }
 assert.equal(titles.size,4);assert.equal(videos.length,new Set(videos).size);assert.equal(videos.length,2);
});
