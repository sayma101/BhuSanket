"""Check the real local assistant guide/API; never calls a paid AI provider."""
import json
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = os.environ.get('BHU_BASE_URL', 'http://127.0.0.1:3000').rstrip('/')


def request(path, body=None):
    query = Request(BASE + path, data=None if body is None else json.dumps(body).encode(),
                    headers={'Content-Type': 'application/json', 'Origin': BASE})
    try:
        with urlopen(query, timeout=60) as response:
            return response.status, json.loads(response.read())
    except HTTPError as error:
        return error.code, json.loads(error.read())


def main():
    status, configuration = request('/api/assistant')
    assert status == 200 and configuration['connection_verified'] is False
    _, record = request('/api/v1/trend', {'location_id': 'dhaka', 'variable': 'T2M',
        'start_year': 1991, 'end_year': 2024, 'aggregation': 'summer', 'mode': 'cached'})
    assert record['provenance']['mode'] == 'CACHED'
    checks = []
    for language in ['en', 'bn']:
        for topic in ['summary', 'chart', 'uncertainty', 'limits', 'confidence-interval']:
            status, reply = request('/api/assistant/guide', {'topic': topic, 'language': language,
                                                          'analysis_id': record['analysis_id']})
            assert status == 200, reply
            assert reply['generated'] is False
            assert reply['context']['analysis_id'] == record['analysis_id']
            assert reply['context']['trend'] == record['trend']
            assert reply['answer'].strip()
            if language == 'bn':
                assert any('\u0980' <= char <= '\u09ff' for char in reply['answer'])
            checks.append({'language': language, 'topic': topic, 'verified': True})
    status, term = request('/api/assistant/guide', {'topic': 'confidence-interval'})
    assert status == 200 and term['generated'] is False and term['context'] is None
    status, _ = request('/api/assistant/guide', {'topic': 'chart'})
    assert status == 409
    status, _ = request('/api/assistant/guide', {'topic': 'summary', 'analysis_id': 'bhu-missing-assistant-test'})
    assert status == 409
    if not configuration['configured']:
        status, unavailable = request('/api/assistant', {'question': 'Explain rainfall.'})
        assert status == 503 and unavailable['code'] == 'AI_NOT_CONFIGURED'
    report = {'base_url': BASE, 'ai_configured': configuration['configured'], 'live_ai_call': False,
              'analysis_id': record['analysis_id'], 'verified_guides': checks,
              'term_without_record': 'passed', 'missing_context_recovery': 'passed',
              'unavailable_ai_honesty': 'passed' if not configuration['configured'] else 'not exercised',
              'browser_visual_qa': 'Not performed by this API script'}
    Path('docs/ASSISTANT_LOCAL_CHECK.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
