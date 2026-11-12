"""Generate source reference snippets from the shared registry; retain worksheet content."""
import html,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
registry=json.loads((root/'src/data/nasa-sources.json').read_text(encoding='utf-8'))
power=next(r for r in registry['sources'] if r['id']=='power')
fragment='<!-- SOURCE_REGISTRY_BEGIN --><section class="note"><strong>Data reference for NASA-based investigations: '+html.escape(power['name'])+'</strong><p>'+html.escape(power['provider'])+'. '+html.escape(power['citation'])+'</p><p>Integrated daily adapter; cached NASA records or explicit live retrieval. A fixture is synthetic, not NASA data.</p><p><a href="'+html.escape(power['documentation_url'],quote=True)+'" target="_blank" rel="noreferrer">Official documentation ↗</a> · <a href="'+html.escape(power['data_access_url'],quote=True)+'" target="_blank" rel="noreferrer">NASA data access ↗</a></p></section><!-- SOURCE_REGISTRY_END -->'
for path in (root/'public/worksheets').glob('*.html'):
 text=path.read_text(encoding='utf-8-sig');text=re.sub(r'<!-- SOURCE_REGISTRY_BEGIN -->.*?<!-- SOURCE_REGISTRY_END -->','',text,flags=re.S);text=text.replace('</footer>',fragment+'</footer>');path.write_text(text,encoding='utf-8')
print('Synced source references in five worksheets.')
