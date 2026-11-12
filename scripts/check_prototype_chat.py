"""Check the real prototype endpoint with browser Origin headers; no AI provider."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

BASE = os.environ.get('BHU_BASE_URL', 'http://127.0.0.1:3000').rstrip('/')


def post(path, body):
    request = Request(BASE + path, data=json.dumps(body).encode(),
                      headers={'Content-Type': 'application/json', 'Origin': BASE})
    with urlopen(request, timeout=40) as response:
        assert response.status == 200
        return json.loads(response.read())


def main():
    examples = []
    for question, topic in [('Hello', 'greeting'), ('What is rainfall?', 'rainfall'),
                            ('Which NASA data do you use?', 'nasa'), ('What is a p-value?', 'pvalue'),
                            ('বৃষ্টিপাত কী?', 'rainfall'), ('তুমি কে?', 'about'),
                            ('Tell me a pizza recipe', 'unknown')]:
        reply = post('/api/assistant/prototype', {'question': question})
        assert reply['generated'] is False and reply['prototype'] is True
        assert reply['topic'] == topic and reply['answer']
        assert reply['context'] is None
        examples.append({'question': question, 'topic': topic, 'answer': reply['answer']})
    record = post('/api/v1/trend', {'location_id': 'dhaka', 'variable': 'PRECTOTCORR',
        'aggregation': 'annual', 'start_year': 1991, 'end_year': 2024, 'mode': 'cached'})
    finding = post('/api/assistant/prototype', {'question': 'Has rainfall in Dhaka increased?',
                                             'analysis_id': record['analysis_id']})
    assert finding['usesRecord'] is True
    assert finding['context']['trend'] == record['trend']
    assert record['interpretation']['en'] in finding['answer']
    report = {'base_url': BASE, 'prototype': True, 'ai_api_required': False, 'examples': examples,
              'actual_evidence_parity': 'passed', 'analysis_id': record['analysis_id'],
              'browser_qa': 'Not performed by this HTTP script'}
    Path('docs/PROTOTYPE_CHAT_CHECK.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'typed_questions_passed': len(examples), 'actual_evidence_parity': 'passed', 'ai_api_required': False}))


if __name__ == '__main__':
    main()
