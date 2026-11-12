"""Exercise real cached mission APIs against a frontend proxy or deployed backend."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

BASE = os.environ.get('BHU_BASE_URL', 'http://127.0.0.1:3000').rstrip('/')


def fetch(path, body=None):
    request = Request(BASE + '/api/v1' + path,
                      data=None if body is None else json.dumps(body).encode(),
                      headers={'Content-Type': 'application/json'})
    with urlopen(request, timeout=65) as response:
        data = response.read()
        return json.loads(data) if 'json' in response.headers.get('Content-Type', '') else data


def main():
    assert fetch('/health')['status'] == 'ok'
    claims = fetch('/claims')
    assert {claim['id'] for claim in claims} == {'dhaka-summer', 'rajshahi-rain', 'khulna-monsoon', 'sylhet-rain'}
    checked = []
    for claim in claims:
        body = {key: claim[key] for key in ['location_id', 'variable', 'aggregation', 'start_year', 'end_year']}
        result = fetch('/trend', {**body, 'mode': 'cached', 'autocorrelation': 'auto'})
        assert result['provenance']['mode'] == 'CACHED'
        assert len(result['series']) == claim['end_year'] - claim['start_year'] + 1
        claim_check = fetch('/claim-check', {'claim_id': claim['id']})
        assert claim_check['result']['analysis_id'] == result['analysis_id']
        court = fetch('/court', {'claim_id': claim['id'], 'analysis_id': result['analysis_id'],
                                'verdict': claim_check['claim_verdict'], 'confidence': 50, 'tools': ['trend-test']})
        assert court['correct'] and court['expected_verdict'] == claim_check['claim_verdict']
        passport = fetch('/data-passport/' + result['analysis_id'])
        assert passport['statistics']['p_value'] == result['trend']['p_value']
        assert fetch('/export/' + result['analysis_id'] + '.pdf').startswith(b'%PDF')
        exported = fetch('/export/' + result['analysis_id'] + '.json')
        assert exported['analysis_id'] == result['analysis_id']
        checked.append({'mission': claim['id'], 'analysis_id': result['analysis_id'], 'mode': 'CACHED',
                        'periods': len(result['series']), 'backend_verdict': court['expected_verdict'],
                        'passport_pdf_json': 'passed'})
    report = {'base_url': BASE, 'mission_count': len(checked), 'missions': checked,
              'browser_qa': 'Not performed by this API script', 'remote_deployment_claimed': False}
    Path('docs/ACADEMY_DEPLOYMENT_CHECK.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
