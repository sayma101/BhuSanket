import {isAssistantSameOrigin,loadAssistantEvidence} from '@/lib/assistant-evidence';
import {GUIDE_TOPICS,type GuideTopic} from '@/lib/evidence-guide';
import {needsPrototypeEvidence,prototypeReply,prototypeTopic,PROTOTYPE_QUESTIONS} from '@/lib/prototype-chat';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
  if(!isAssistantSameOrigin(request))return Response.json({detail:'Origin mismatch.'},{status:403});
  let body;try{const raw=await request.text();if(raw.length>5000)throw Error();body=JSON.parse(raw);}catch{return Response.json({detail:'Invalid prototype question.'},{status:400});}
  if(!body||typeof body.question!=='string'||!body.question.trim()||body.question.length>1200)return Response.json({detail:'Enter a question of at most 1200 characters.'},{status:400});
  if(body.topic!==undefined&&!GUIDE_TOPICS.includes(body.topic))return Response.json({detail:'Unknown guide action.'},{status:400});
  if(body.analysis_id!==undefined&&(typeof body.analysis_id!=='string'||!/^bhu-[a-zA-Z0-9-]{1,100}$/.test(body.analysis_id)))return Response.json({detail:'Invalid analysis ID.'},{status:400});
  const language=body.language==='bn'||/[\u0980-\u09ff]/.test(body.question)?'bn':'en';
  const explicit=body.topic as GuideTopic|undefined,topic=prototypeTopic(body.question,explicit);
  let record,evidenceNotice:string|undefined;
  if(body.analysis_id&&needsPrototypeEvidence(topic)){
    try{record=await loadAssistantEvidence(body.analysis_id,request.signal);}catch{evidenceNotice=language==='bn'?'সংযুক্ত record যাচাই করা যায়নি। সাধারণ পাঠ দেখানো হচ্ছে; আসল ফল পেতে investigation আবার চালাও।':'The attached record could not be verified. This is a general explanation; run the investigation again for its actual finding.';}
  }
  const reply=prototypeReply(body.question,language,record,explicit);
  return Response.json({...reply,language,generated:false,prototype:true,method:'Reviewed rule-based prototype; no AI provider',context:reply.usesRecord?record:null,evidence_notice:evidenceNotice,suggestions:PROTOTYPE_QUESTIONS[language],references:[{title:'Data, methods and NASA source registry',url:'/methods#source-registry'}]});
}
