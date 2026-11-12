import {evidenceBackendUrl} from '@/lib/backend-url';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
type Context={params:Promise<{path:string[]}>};
async function proxy(request:Request,context:Context) {
  let backend:string;
  try{backend=evidenceBackendUrl();}catch(error){return Response.json({detail:error instanceof Error?error.message:'The science backend is not configured.',code:'BACKEND_NOT_CONFIGURED'},{status:503});}
  const {path}=await context.params;
  if(path.some(segment=>segment==='.'||segment==='..'||/[\\/]/.test(segment)))return Response.json({detail:'Invalid API path.'},{status:400});
  const source=new URL(request.url);
  const destination=`${backend}/api/v1/${path.map(encodeURIComponent).join('/')}${source.search}`;
  if(new URL(backend).origin===source.origin)return Response.json({detail:'BACKEND_URL must point to the Python API, not this frontend.',code:'BACKEND_NOT_CONFIGURED'},{status:503});
  try{
    const body=request.method==='POST'?await request.text():undefined;
    if(body&&body.length>65536)return Response.json({detail:'Request is too large.'},{status:413});
    const upstream=await fetch(destination,{method:request.method,headers:{Accept:request.headers.get('accept')||'*/*',...(body?{'Content-Type':request.headers.get('content-type')||'application/json'}:{})},body,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(55000)});
    const headers=new Headers({'Cache-Control':'no-store'});
    for(const name of ['content-type','content-disposition','retry-after']){const value=upstream.headers.get(name);if(value)headers.set(name,value);}
    if(upstream.status>=300&&upstream.status<400)return Response.json({detail:'The science API redirected unexpectedly. Check the configured API URL.',code:'BACKEND_REDIRECT'},{status:502});
    return new Response(request.method==='HEAD'?null:await upstream.arrayBuffer(),{status:upstream.status,headers});
  }catch{return Response.json({detail:'The Earth-science service could not be reached. It may be starting up. Retry shortly; the project host should check the backend deployment.',code:'BACKEND_UNAVAILABLE'},{status:503,headers:{'Retry-After':'15'}});}
}
export const GET=proxy;
export const POST=proxy;
export const HEAD=proxy;
