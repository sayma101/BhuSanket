import {EvidenceError,loadAssistantEvidence,isAssistantSameOrigin} from '@/lib/assistant-evidence';
import {evidenceGuide,GUIDE_TOPICS,type GuideTopic} from '@/lib/evidence-guide';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  if(!isAssistantSameOrigin(request))return Response.json({detail:'Origin mismatch.'},{status:403});
  let body;try{const raw=await request.text();if(raw.length>3000)throw Error();body=JSON.parse(raw);}catch{return Response.json({detail:'Invalid guide request.'},{status:400});}
  if(!body||!GUIDE_TOPICS.includes(body.topic))return Response.json({detail:'Choose an available evidence-guide topic.'},{status:400});
  try{
    const topic=body.topic as GuideTopic,language=body.language==='bn'?'bn':'en';
    const record=body.analysis_id?await loadAssistantEvidence(body.analysis_id,request.signal):undefined;
    if(!record&&topic!=='confidence-interval')return Response.json({detail:'Run an investigation first, then use Explain this chart or Read verified summary.'},{status:409});
    return Response.json({answer:evidenceGuide(topic,language,record),context:record??null,generated:false,method:'Reviewed evidence guide; no generative AI',references:[{title:'BhuSanket data, methods and source registry',url:'/methods#source-registry'}]});
  }catch(error){return Response.json({detail:error instanceof Error?error.message:'Evidence guide unavailable.'},{status:error instanceof EvidenceError?error.status:503});}
}
