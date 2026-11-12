import {evidenceBackendUrl} from './backend-url';
import type {TrendResult} from './types';

/** Next's internal URL may use localhost while the browser uses 127.0.0.1.
 * Compare Origin against the incoming Host, never an arbitrary forwarded host. */
export function isAssistantSameOrigin(request:Request):boolean {
  const origin=request.headers.get('origin');if(!origin)return true;
  try{
    const url=new URL(request.url),source=new URL(origin);
    const host=request.headers.get('host')||url.host;
    const forwarded=request.headers.get('x-forwarded-proto');
    const protocol=forwarded==='https'||forwarded==='http'?`${forwarded}:`:url.protocol;
    return ['http:','https:'].includes(source.protocol)&&source.host.toLowerCase()===host.toLowerCase()&&source.protocol===protocol;
  }catch{return false;}
}

export class EvidenceError extends Error {
  constructor(message:string,public status:number){super(message);}
}
export async function loadAssistantEvidence(id:unknown,signal?:AbortSignal):Promise<TrendResult> {
  if(typeof id!=='string'||!/^bhu-[a-zA-Z0-9-]{1,100}$/.test(id))throw new EvidenceError('Invalid analysis ID.',400);
  let backend:string;
  try{backend=evidenceBackendUrl();}catch{throw new EvidenceError('The science backend is not connected. Configure BACKEND_URL and run the Python service.',503);}
  let response:Response;
  try{response=await fetch(`${backend}/api/v1/export/${id}.json`,{cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(20000)]):AbortSignal.timeout(20000)});}
  catch{throw new EvidenceError('The science service could not be reached. Retry after it starts.',503);}
  if(response.status===404)throw new EvidenceError('This saved analysis is no longer available. Run the investigation again to attach a fresh record.',409);
  if(!response.ok)throw new EvidenceError('The selected evidence could not be loaded. Retry the science service.',503);
  let result:TrendResult;
  try{result=await response.json();}catch{throw new EvidenceError('The science service returned an unreadable record.',502);}
  if(result.analysis_id!==id)throw new EvidenceError('Evidence identity mismatch.',409);
  return result;
}
