"""HTTP integration smoke check with both local servers running. No browser automation."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

BASE = os.environ.get("BHU_BASE_URL", "http://127.0.0.1:3000")
checks = []

def fetch(path, body=None):
    payload = None if body is None else json.dumps(body).encode()
    request = Request(BASE + path, data=payload, headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=30) as response:
        data = response.read()
        assert response.status == 200
        return json.loads(data) if "json" in response.headers.get("Content-Type", "") else data

def check(name, condition=True):
    assert condition, name
    checks.append({"check": name, "passed": True})

for route in ["/", "/explore", "/research", "/student-lab", "/claim-court", "/claims", "/methods"]:
    html = fetch(route).decode()
    check(f"Page {route} returns 200 with one main landmark", html.count('<main ') == 1)
check("Local NASA imagery", fetch('/images/earth-december-2004.jpg')[:2] == b'\xff\xd8')
check("Local font", len(fetch('/fonts/Manrope.ttf')) > 10000)
check("64 district boundaries", len(fetch('/maps/bangladesh-districts.geojson')['features']) == 64)
check("Health through frontend proxy", fetch('/api/v1/health')['status'] == 'ok')
request = dict(location_id='dhaka', variable='T2M', start_year=1991, end_year=2024, aggregation='summer', mode='cached')
result = fetch('/api/v1/trend', request)
check("Real cached NASA case", result['provenance']['mode'] == 'CACHED' and result['dataset']['short_name'] == 'POWER_DAILY')
check("34 annual seasonal periods", len(result['series']) == 34)
passport = fetch('/api/v1/data-passport/' + result['analysis_id'])
check("Passport statistical parity", passport['statistics']['p_value'] == result['trend']['p_value'])
window = fetch('/api/v1/trend', {**request, 'start_year': 2010})
check("Window recalculation", len(window['series']) == 15 and window['trend'] != result['trend'])
check("Full-record parity", window['full_record']['trend'] == result['trend'])
short = fetch('/api/v1/trend', {**request, 'start_year': 2019})
check("Insufficient evidence state", short['verdict'] == 'Not enough evidence')
comparison = fetch('/api/v1/compare', {'left': request, 'right': {**request, 'location_id': 'rajshahi'}})
check("Comparison with FDR", 'Benjamini' in comparison['adjustment'] and comparison['left']['trend']['p_adjusted'] is not None)
claim = fetch('/api/v1/claim-check', {'claim_id':'dhaka-summer'})
court = fetch('/api/v1/court', {'analysis_id':claim['result']['analysis_id'], 'claim_id':'dhaka-summer','tools':['trend-test'],'confidence':50,'verdict':claim['claim_verdict']})
check("Court shared result and original scoring", court['correct'] and court['score'] == 5)
fixture = fetch('/api/v1/trend', {**request, 'mode':'fixture'})
check("Explicit synthetic fixture label", fixture['provenance']['mode'] == 'FIXTURE')
hot = fetch('/api/v1/hot-days', {'location_id':'dhaka','threshold_c':35,'mode':'cached'})
check("Counter passport", fetch('/api/v1/data-passport/' + hot['analysis_id']) == hot['passport'])
output = {'base_url':BASE, 'passed':len(checks), 'checks':checks, 'browser_visual_qa':'Not performed by this HTTP script; see separately recorded browser reviews.'}
Path('docs/HTTP_SMOKE.json').write_text(json.dumps(output, indent=2), encoding='utf-8')
print(json.dumps({'passed':len(checks), 'result':result['verdict'], 'claim_verdict':claim['claim_verdict']}, indent=2))
