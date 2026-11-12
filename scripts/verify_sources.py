"""Read-only public link audit; never sends credentials or rewrites scientific records."""
import argparse,collections,concurrent.futures,json,re,socket,ssl,time
from pathlib import Path
from datetime import datetime,timezone
from urllib.parse import urlparse
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/'src/data/nasa-sources.json'
def check(url):
 checked=datetime.now(timezone.utc).isoformat();last=None
 for method in ['HEAD','GET']:
  try:
   headers={'User-Agent':'BhuSanket-source-audit/1.0','Accept':'*/*'}
   if method=='GET':headers['Range']='bytes=0-16383'
   with urlopen(Request(url,headers=headers,method=method),timeout=15) as response:
    status=response.status;final=response.url;body=response.read(16384).decode('utf-8',errors='ignore') if method=='GET' else ''
    if method=='HEAD' and ('text/html' in response.headers.get('Content-Type','')):continue
    state='login_required' if any(h in urlparse(final).netloc for h in ['urs.earthdata.nasa.gov','auth.earthdata.nasa.gov']) else 'redirected' if final.rstrip('/')!=url.rstrip('/') else 'reachable'
    if re.search(r'<title>[^<]*(?:404|page not found)',body,re.I):state='broken'
    return dict(url=url,final_url=final,http_status=status,state=state,method=method,checked_at=checked,content_type=response.headers.get('Content-Type'))
  except HTTPError as e:
   last=dict(url=url,final_url=e.url,http_status=e.code,state='login_required' if e.code==401 else 'access_restricted' if e.code in [403,429] else 'broken' if e.code in [404,410] else 'not_verified',method=method,checked_at=checked,error=str(e))
   if method=='HEAD':continue
  except (URLError,TimeoutError,OSError,ValueError) as e:last=dict(url=url,final_url=None,http_status=None,state='not_verified',method=method,checked_at=checked,error=str(e))
 return last

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--workers',type=int,default=12);parser.add_argument('--update-dates',action='store_true');parser.add_argument('--reuse',help='Reuse already-tested URLs from the same audit run');args=parser.parse_args()
 registry=json.loads(REGISTRY.read_text(encoding='utf-8'));uses=collections.defaultdict(list)
 for source in registry['sources']:
  for field in ['documentation_url','data_access_url']:
   if source.get(field):uses[source[field]].append(f"{source['id']}.{field}")
  for u in source.get('legacy_urls',[]):uses[u].append(f"{source['id']}.legacy_urls")
 results=[]
 if args.reuse:
  prior=json.loads(Path(args.reuse).read_text(encoding='utf-8'));results=[r for r in prior['results'] if r['url'] in uses]
 tested={r['url'] for r in results}
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
  tasks={pool.submit(check,url):url for url in uses if url not in tested}
  for future in concurrent.futures.as_completed(tasks):
   results.append(future.result())
   if len(results)%25==0:print(f'Checked {len(results)}/{len(uses)}',flush=True)
 byurl={r['url']:r for r in results}
 if args.update_dates:
  for source in registry['sources']:
   checks=[byurl[source[f]] for f in ['documentation_url','data_access_url']]
   source['last_verified_date']=datetime.now(timezone.utc).date().isoformat() if all(r['state'] in ['reachable','redirected'] for r in checks) else None
  REGISTRY.write_text(json.dumps(registry,indent=2,ensure_ascii=False),encoding='utf-8')
 report=dict(checked_at=datetime.now(timezone.utc).isoformat(),total_urls=len(results),summary=dict(collections.Counter(r['state'] for r in results)),results=sorted(results,key=lambda r:r['url']),duplicate_references={u:v for u,v in uses.items() if len(v)>1},note='Shared documentation/data-access URLs are intentional for media and discovery portals. Reachability is not scientific validation or data integration. Restricted/login states are not classified as broken.')
 (ROOT/'docs/NASA_LINK_HEALTH.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report['summary']),flush=True)
if __name__=='__main__':main()
