"""Registry integrity, actual exports and read-only checker classification tests."""
import importlib.util,io,json,threading
from pathlib import Path
from http.server import BaseHTTPRequestHandler,HTTPServer
from backend.app.data.sources import SOURCES,source_url
from backend.app.data.power import request_url
from backend.app.main import app
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('source_checker',ROOT/'scripts/verify_sources.py');checker=importlib.util.module_from_spec(spec);spec.loader.exec_module(checker)

def test_registry_covers_integrated_and_planned_sources():
 assert len(SOURCES)==len(set(SOURCES))
 for source in SOURCES.values():
  for key in ['name','programme','provider','variables','units','spatial_resolution','temporal_resolution','temporal_coverage','integration_status','documentation_url','data_access_url','citation','access_requirements','last_verified_date']:assert key in source
  assert source['documentation_url'].startswith('https://')
 assert SOURCES['power']['integration_status']=='LIVE_INTEGRATED'
 assert all(SOURCES[id]['integration_status']=='PLANNED_NOT_INTEGRATED' for id in ['imerg','mod11','mod13','viirs','smap','grace','merra2','gldas','airs','omi'])
 assert 'Daily / Monthly' not in SOURCES['power']['name']

def test_exact_request_and_numerical_passport_remain_intact():
 from urllib.parse import urlparse,parse_qs
 url=request_url(23.8103,90.4125);assert url.startswith(SOURCES['power']['api_base_url']+'?')
 q=parse_qs(urlparse(url).query);assert q['start']==['19910101'];assert q['end']==['20241231'];assert q['parameters']==['T2M,T2M_MAX,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN']
 client=TestClient(app);catalogue=client.get('/api/v1/datasets').json();assert len(catalogue)==11;assert catalogue[0]['source_url']==source_url('power')
 result=client.post('/api/v1/trend',json={'location_id':'dhaka','variable':'T2M','aggregation':'summer','start_year':1991,'end_year':2024,'mode':'cached'}).json()
 assert result['provenance']['source_url']==result['passport']['identity']['source_url']
 assert result['passport']['statistics']['p_value']==result['trend']['p_value']
 assert len(result['series'])==34

def test_pdf_source_annotations_are_real_registry_links():
 import sys
 sys.path.insert(0,str(ROOT/'.pdf-reader'))
 from pypdf import PdfReader
 client=TestClient(app);result=client.post('/api/v1/trend',json={'location_id':'dhaka','variable':'T2M','aggregation':'summer','start_year':1991,'end_year':2024,'mode':'cached'}).json()
 from backend.app.api.exports import pdf_bytes
 reader=PdfReader(io.BytesIO(pdf_bytes(result)));uris=[]
 for page in reader.pages:
  for reference in page.get('/Annots',[]):
   action=reference.get_object().get('/A',{});uri=action.get('/URI')
   if uri:uris.append(str(uri))
 assert source_url('power') in uris;assert source_url('power','data_access_url') in uris;assert result['provenance']['source_url'] in uris
 assert 'NASA Langley' in ''.join(page.extract_text() for page in reader.pages)

def test_checker_head_fallback_redirect_auth_and_missing():
 class Handler(BaseHTTPRequestHandler):
  def log_message(self,*args):pass
  def do_HEAD(self):self.send_response(405);self.end_headers()
  def do_GET(self):
   if self.path=='/redirect':self.send_response(302);self.send_header('Location','/ok');self.end_headers();return
   self.send_response({'/private':401,'/restricted':403,'/missing':404}.get(self.path,200));self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write(b'<title>Source</title>')
 server=HTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
 try:
  base=f'http://127.0.0.1:{server.server_port}'
  for path,state in [('/ok','reachable'),('/redirect','redirected'),('/private','login_required'),('/restricted','access_restricted'),('/missing','broken')]:assert checker.check(base+path)['state']==state
 finally:server.shutdown();thread.join();server.server_close()
