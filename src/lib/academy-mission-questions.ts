import {bi} from './academy-content';
import type {AcademyQuestion} from './academy-quiz';
import type {LearningResult} from '@/components/claim-checker';
const tf=(id:string,en:string,bn:string,correct:boolean,why:string,local:string):AcademyQuestion=>({id,prompt:bi(en,bn),options:[bi('True','সত্য'),bi('False','মিথ্যা')],correct:correct?0:1,why:bi(why,local),kind:'true-false'});
export const MISSION_QUESTIONS:Record<string,AcademyQuestion[]>={
'dhaka-summer':[
 tf('heat-energy','Sunlight can heat the ground before energy is exchanged with the air.','বাতাসের সঙ্গে শক্তি বিনিময়ের আগে সূর্যের আলো ভূমিকে গরম করতে পারে।',true,'The lesson separates incoming solar energy, surface heating and air measurement.','পাঠে সৌরশক্তি, ভূমি গরম হওয়া ও বাতাসের মাপ আলাদা করা হয়েছে।'),
 tf('heat-sensor','A thermal surface image measures exactly the same quantity as POWER T2M.','তাপীয় ভূমির ছবি ও POWER T2M ঠিক একই রাশি মাপে।',false,'T2M is air at two metres; thermal surface retrievals describe the surface.','T2M দুই মিটারের বাতাস; তাপীয় মাপ ভূমির উপরিভাগের।'),
 tf('heat-window','This mission keeps March–May fixed across years.','এই মিশনে প্রতি বছরের মার্চ–মে সময় একই রাখা হয়।',true,'A consistent seasonal window avoids mixing summer with winter.','একই ঋতু রাখলে গ্রীষ্ম ও শীত মিশে যায় না।'),
 tf('heat-weather','One unusually hot afternoon proves a long-term Dhaka trend.','একটি অস্বাভাবিক গরম বিকেল ঢাকার দীর্ঘ প্রবণতা প্রমাণ করে।',false,'Weather on one day does not establish change across many years.','এক দিনের আবহাওয়া বহু বছরের পরিবর্তন প্রতিষ্ঠা করে না।'),
 tf('heat-urban','This single point trend establishes an urban heat-island cause.','এই এক বিন্দুর প্রবণতা শহুরে তাপদ্বীপের কারণ প্রতিষ্ঠা করে।',false,'Urban/rural contrasts and other evidence are needed for attribution.','কারণ নির্ধারণে শহর-গ্রামের তুলনা ও অন্য প্রমাণ দরকার।'),
 tf('heat-unit','The mission’s seasonal T2M values are expressed in degrees Celsius.','এই মিশনে ঋতুর T2M মান সেলসিয়াসে প্রকাশিত।',true,'The data chart labels the air-temperature unit as °C.','বাতাসের তাপমাত্রার চার্টে একক °C লেখা থাকে।'),
 {...tf('heat-image','This Landsat landscape image alone proves the multi-year air-temperature claim.','এই Landsat ভূদৃশ্যের ছবি একাই বহু বছরের বাতাসের তাপমাত্রার দাবি প্রমাণ করে।',false,'The image is dated landscape context, separate from the POWER time series.','ছবি তারিখযুক্ত ভূদৃশ্য; POWER সময়ক্রমিক তথ্য আলাদা।'),visual:'image'}],
'rajshahi-rain':[
 tf('rain-evaporate','In the NASA film, solar heating helps water evaporate from the ocean.','NASA film-এ সৌর তাপে সমুদ্রের পানি বাষ্প হয়।',true,'The film follows water from ocean evaporation into the atmosphere.','Film-এ সমুদ্র থেকে পানি বাতাসে যাওয়ার পথ দেখা যায়।'),
 tf('rain-cloud','A single cloud image gives Rajshahi’s annual rainfall total.','একটি মেঘের ছবি রাজশাহীর বছরের মোট বৃষ্টি জানায়।',false,'Cloud context is not a complete year of measured or estimated precipitation.','মেঘের ছবি পুরো বছরের অধঃক্ষেপণের মাপ বা আনুমানিক তথ্য নয়।'),
 tf('rain-return','The water-cycle film also follows water returning through the landscape.','জলচক্র film-এ ভূদৃশ্য দিয়ে পানি ফেরার পথও আছে।',true,'The conceptual cycle connects atmosphere, land and ocean.','ধারণামূলক চক্র বাতাস, ভূমি ও সমুদ্র যুক্ত করে।'),
 tf('rain-total','Annual accumulation adds daily rainfall over the complete year.','বার্ষিক মোটে পূর্ণ বছরের দৈনিক বৃষ্টি যোগ হয়।',true,'A complete annual total needs the required daily source coverage.','পূর্ণ বার্ষিক মোটের জন্য প্রয়োজনীয় দৈনিক উৎস-তথ্য লাগে।'),
 tf('rain-missing','A missing Rajshahi rainfall total should be treated as zero.','রাজশাহীর অনুপস্থিত মোট বৃষ্টিকে শূন্য ধরতে হবে।',false,'A gap means insufficient source data, not necessarily no rain.','ফাঁক মানে উৎস-তথ্যের ঘাটতি; বৃষ্টি হয়নি এমন নয়।'),
 tf('rain-flood','A rainfall trend alone establishes flood depth.','বৃষ্টির প্রবণতা একাই বন্যার গভীরতা জানায়।',false,'River, terrain and drainage evidence are distinct from rainfall totals.','নদী, ভূপ্রকৃতি ও নিষ্কাশনের প্রমাণ বৃষ্টির মোট থেকে আলাদা।'),
 {...tf('rain-image','The Bengal delta context image is a local measurement of Rajshahi rainfall.','বঙ্গীয় বদ্বীপের ছবিটি রাজশাহীর স্থানীয় বৃষ্টির মাপ।',false,'It is regional landscape context, not the local precipitation series.','এটি আঞ্চলিক ভূদৃশ্য; স্থানীয় অধঃক্ষেপণের তথ্য নয়।'),visual:'image'}],
'khulna-monsoon':[
 tf('monsoon-wind','The regional NASA monsoon film is identical to this mission’s Khulna POWER rainfall series.','NASA-এর আঞ্চলিক monsoon film ও খুলনার POWER বৃষ্টির তথ্য একই।',false,'The regional visualization combines satellite/model information; the mission analyses a separate POWER point series.','আঞ্চলিক visualization-এ স্যাটেলাইট ও মডেল আছে; মিশনের POWER বিন্দুর তথ্য আলাদা।'),
 tf('monsoon-months','The mission adds rainfall over June, July, August and September.','মিশনে জুন, জুলাই, আগস্ট ও সেপ্টেম্বরের বৃষ্টি যোগ হয়।',true,'Those four months define the fixed analysis season.','এই চার মাস নির্ধারিত বিশ্লেষণের ঋতু।'),
 tf('monsoon-tide','Rainfall totals and tidal water levels are different quantities.','মোট বৃষ্টি ও জোয়ারের পানির উচ্চতা আলাদা রাশি।',true,'Connected water systems still need distinct measurements.','পানির ব্যবস্থা যুক্ত হলেও আলাদা মাপ লাগে।'),
 tf('monsoon-onset','A fixed June–September total detects the exact monsoon onset date.','স্থির জুন–সেপ্টেম্বর মোট বর্ষার সঠিক শুরুর তারিখ বলে।',false,'This aggregation does not diagnose onset or withdrawal.','এই মোট দিয়ে বর্ষা শুরু বা বিদায় নির্ধারণ হয় না।'),
 tf('monsoon-annual','A full-year total answers exactly the same question as the monsoon total.','পুরো বছরের মোট ও বর্ষার মোট ঠিক একই প্রশ্নের উত্তর।',false,'The annual total includes other months and is a separate metric.','বার্ষিক মোটে অন্য মাস থাকে; মাপটি আলাদা।'),
 tf('monsoon-coverage','Incomplete daily rainfall coverage can invalidate a seasonal accumulation.','দিনের বৃষ্টির অসম্পূর্ণ তথ্য ঋতুর মোটকে অবৈধ করতে পারে।',true,'A partial sum could wrongly appear dry, so missing totals stay gaps.','অসম্পূর্ণ যোগফলকে কম বৃষ্টি মনে হতে পারে; তাই ফাঁক থাকে।'),
 {...tf('monsoon-composite','The Sundarbans composite is a measurement of today’s tidal height.','সুন্দরবনের যৌথ ছবিটি আজকের জোয়ারের উচ্চতার মাপ।',false,'It combines historical observations and provides landscape context.','এটি পুরনো পর্যবেক্ষণ মিলিয়ে ভূদৃশ্যের প্রেক্ষাপট দেয়।'),visual:'image'}],
'sylhet-rain':[
 tf('sylhet-dates','The paired satellite views in this lesson are from May–June 2007.','এই পাঠের জোড়া স্যাটেলাইট ছবি মে–জুন ২০০৭-এর।',true,'Their dates must stay attached to any interpretation.','ব্যাখ্যার সঙ্গে তারিখ রাখা জরুরি।'),
 tf('sylhet-colour','False-colour intensity directly reports annual rainfall in millimetres.','প্রদর্শনের রঙের তীব্রতা সরাসরি মিলিমিটারে বার্ষিক বৃষ্টি জানায়।',false,'Band-to-colour mapping helps interpretation but is not rainfall calibration.','ব্যান্ডের প্রদর্শনরং বুঝতে সাহায্য করে; বৃষ্টির ক্যালিব্রেশন নয়।'),
 tf('sylhet-history','The historical images are a current flood map.','পুরনো ছবিগুলো বর্তমান বন্যার মানচিত্র।',false,'A 2007 observation cannot establish current conditions.','২০০৭-এর পর্যবেক্ষণ বর্তমান অবস্থা প্রতিষ্ঠা করে না।'),
 tf('sylhet-record','The annual rainfall claim needs the defined multi-year POWER series.','বার্ষিক বৃষ্টির দাবির জন্য নির্ধারিত বহু বছরের POWER তথ্য লাগে।',true,'A dated image pair cannot replace a multi-decade measurement record.','তারিখযুক্ত জোড়া ছবি বহু দশকের মাপের বদলি নয়।'),
 tf('sylhet-point','The Sylhet point/grid estimate is automatically a district average.','সিলেটের বিন্দু বা গ্রিডের মান স্বয়ংক্রিয়ভাবে জেলার গড়।',false,'A coordinate estimate has its own spatial support, not district averaging.','স্থানাঙ্কের মানের নিজস্ব স্থানিক পরিসর থাকে; জেলার গড় নয়।'),
 tf('sylhet-water','Water extent in an image and rainfall depth are the same measurement.','ছবিতে পানির বিস্তার ও বৃষ্টির গভীরতা একই মাপ।',false,'Area and precipitation depth describe different physical quantities.','বিস্তার ও অধঃক্ষেপণের গভীরতা আলাদা ভৌত রাশি।'),
 {...tf('sylhet-image','Both dates and the false-colour treatment matter when comparing these images.','ছবি তুলনায় দুটি তারিখ ও প্রদর্শনের রং গুরুত্বপূর্ণ।',true,'A fair image comparison needs acquisition and display context.','সঠিক তুলনায় ছবি তোলার সময় ও প্রদর্শনের প্রেক্ষাপট লাগে।'),visual:'image'}]
};
// Multiple-choice questions complement true/false and image interpretation.
const choices:Record<string,{prompt:ReturnType<typeof bi>;options:ReturnType<typeof bi>[]}[]>={
 'dhaka-summer':[
 {prompt:bi('What supplies energy that heats the surface in the lesson?','পাঠে ভূমি গরম হওয়ার শক্তির উৎস কী?'),options:[bi('Sunlight','সূর্যের আলো'),bi('A calendar label','পঞ্জিকার নাম'),bi('The chart colour','চার্টের রং')]},
 {prompt:bi('What is needed to investigate a long-term Dhaka heat pattern?','ঢাকার দীর্ঘ সময়ের গরমের ধরন জানতে কী দরকার?'),options:[bi('Many years of the same defined seasonal air-temperature measurement','একই সংজ্ঞায়িত ঋতুর অনেক বছরের বাতাসের তাপমাত্রা'),bi('One hot afternoon','একটি গরম বিকেল'),bi('A single photograph','একটি ছবি')]}],
 'rajshahi-rain':[
 {prompt:bi('In the NASA film, what helps ocean water evaporate?','NASA film-এ সমুদ্রের পানি বাষ্প হতে কী সাহায্য করে?'),options:[bi('Solar heating','সৌর তাপ'),bi('A rainfall chart axis','বৃষ্টির চার্টের অক্ষ'),bi('A district boundary','জেলার সীমানা')]},
 {prompt:bi('How is the mission’s annual rainfall total formed?','মিশনে বার্ষিক মোট বৃষ্টি কীভাবে তৈরি হয়?'),options:[bi('Add daily rainfall across a complete calendar year','পূর্ণ পঞ্জিকা বছরের দৈনিক বৃষ্টি যোগ করে'),bi('Read image colours','ছবির রং দেখে'),bi('Use river height as rainfall','নদীর উচ্চতাকে বৃষ্টি ধরে')]}],
 'khulna-monsoon':[
 {prompt:bi('What does the NASA monsoon film provide?','NASA monsoon film কী দেয়?'),options:[bi('A regional visualization using satellite information and models','স্যাটেলাইট ও মডেলভিত্তিক আঞ্চলিক visualization'),bi('Today’s Khulna tidal gauge reading','আজ খুলনার জোয়ারের যন্ত্রের মান'),bi('The identical POWER point analysis used by this mission','এই মিশনের হুবহু POWER বিন্দু বিশ্লেষণ')]},
 {prompt:bi('What does this mission’s monsoon aggregation calculate?','মিশনে বর্ষার aggregation কী হিসাব করে?'),options:[bi('Rainfall accumulated over the fixed June–September window','নির্দিষ্ট জুন–সেপ্টেম্বর সময়ের মোট বৃষ্টি'),bi('The exact onset date','শুরুর সঠিক তারিখ'),bi('The tidal water level','জোয়ারের পানির উচ্চতা')]}],
 'sylhet-rain':[
 {prompt:bi('Which dates belong to the paired MODIS context in this lesson?','পাঠের জোড়া MODIS ছবির সময় কোনটি?'),options:[bi('May–June 2007','মে–জুন ২০০৭'),bi('Live conditions today','আজকের সরাসরি অবস্থা'),bi('Every year from 1991–2024','১৯৯১–২০২৪-এর সব বছর')]},
 {prompt:bi('Which evidence tests the mission’s annual rainfall claim?','মিশনের বার্ষিক বৃষ্টির দাবি কোন প্রমাণ দিয়ে পরীক্ষা হয়?'),options:[bi('The defined multi-year POWER PRECTOTCORR series','সংজ্ঞায়িত বহু বছরের POWER PRECTOTCORR তথ্য'),bi('Only the image colours','শুধু ছবির রং'),bi('A current flood map that is not integrated','চালু না থাকা বর্তমান বন্যার মানচিত্র')]}]
};
for(const [id,pair] of Object.entries(choices))for(const [index,question] of pair.entries()){const slot=index===0?0:3;MISSION_QUESTIONS[id][slot]={...MISSION_QUESTIONS[id][slot],...question,correct:0,kind:undefined};}
export function missionQuestions(id:string,watch=false,result?:LearningResult):AcademyQuestion[]{
 const questions=MISSION_QUESTIONS[id];if(!questions)throw Error('Unknown mission question set.');
 if(watch)return questions.slice(0,3);
 if(!result)return questions;
 const row=result.series.find(p=>p.value!==null);
 if(!row)return questions;
 const right=`${row.value!.toFixed(2)} ${result.variable.unit}`;
 return [...questions,{id:`${id}-actual-record`,prompt:bi(`In the actual ${result.location.label} chart, what is the reported value for ${row.year}?`,`প্রকৃত ${result.location.label} চার্টে ${row.year} সালের মান কত?`),options:[bi(right,right),bi('Every missing year is zero','অনুপস্থিত সব বছর শূন্য'),bi('The image colour is the measurement','ছবির রংই মাপ')],correct:0,visual:'chart',why:bi(`Read the returned record: ${row.year} = ${right}; source-day coverage ${(row.coverage*100).toFixed(1)}%. This is a point/grid estimate.`,`ফেরত আসা তথ্য পড়ো: ${row.year} = ${right}; উৎসের দিনের পূর্ণতা ${(row.coverage*100).toFixed(1)}%। এটি বিন্দু বা গ্রিডের মান।`)}];
}
