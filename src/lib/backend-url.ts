/** Server-only configuration. Never expose this as a NEXT_PUBLIC credential. */
export function evidenceBackendUrl(env:Record<string,string|undefined>=process.env) {
  const configured=env.BACKEND_URL?.trim();
  if(!configured&&env.VERCEL)throw Error('The Earth-science backend is not connected to this deployment. Set BACKEND_URL to the deployed Python API origin and redeploy.');
  const url=new URL(configured||'http://127.0.0.1:8000');
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw Error('BACKEND_URL must be an HTTP(S) API origin without credentials, query or fragment.');
  if(env.VERCEL&&['localhost','127.0.0.1','[::1]','0.0.0.0'].includes(url.hostname))throw Error('BACKEND_URL points to localhost. A hosted frontend needs the deployed Python API URL.');
  return url.toString().replace(/\/$/,'');
}
