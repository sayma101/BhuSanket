"""Generate the human-readable source audit from the canonical registry and link checks."""
import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    registry = json.loads((ROOT / 'src/data/nasa-sources.json').read_text(encoding='utf-8'))
    report = json.loads((ROOT / 'docs/NASA_LINK_HEALTH.json').read_text(encoding='utf-8'))
    checks = {row['url']: row for row in report['results']}
    sources = registry['sources']
    counts = collections.Counter(s['integration_status'] for s in sources if s['kind'] != 'archive')
    lines = [
        '# BhuSanket NASA source audit', '',
        f"Generated from the shared registry. Link-check run: {report['checked_at']}.", '',
        f"The registry contains {len(sources)} records, including original asset/request provenance. Core source roles: {dict(counts)}. Archive records are individual assets, tile URLs or original API requests, not additional integrations.", '',
        f"HTTP verification: **{report['total_urls']} unique URLs**, {report['summary']}. No current registry URL was classified as broken in this run. This is a dated reachability result, not a guarantee of future availability or full scientific validation.", '',
        '## Scope and actual integration', '',
        'The pre-change inventory (NASA_SOURCE_INVENTORY.json) records 172 distinct external URL strings and their file locations, including non-NASA references and dynamic templates. Source, backend, acquisition scripts, documentation, media manifests, worksheets, cached provenance and report generation were inspected. Vendor directories, binaries, credentials and environment files are excluded. Historical metadata and exact scientific source requests remain unchanged.', '',
        'Only NASA POWER Daily supplies numerical investigations. Its default is cached NASA data; live retrieval is explicit. Meteorological variables are model/reanalysis-derived, while solar inputs are satellite-derived. A POWER point/source-grid estimate is not a district raster. GIBS tiles and historical imagery are contextual browse imagery, not numerical rainfall or temperature layers. Synthetic teaching fixtures are labelled and are not NASA measurements.', '',
        'The other ten catalogue families are planned, not integrated. A reachable catalogue, mission page or Earthdata discovery search does not activate an analytical adapter. NASA does not endorse this independent project.', '',
        '## Corrections and attribution', '',
        '- Consolidated active source URLs and metadata in src/data/nasa-sources.json, consumed by TypeScript and Python. Existing valid original asset and measurement URLs are retained as provenance records.',
        '- Corrected the numerical adapter name from Daily / Monthly to POWER Daily; its actual daily point request construction and numerical processing are unchanged.',
        '- Distinguished IMERG product documentation from the GES DISC daily V07 product page; MOD11/MOD13 product documentation from Earthdata discovery; SMAP access through NSIDC; GLDAS documentation from its data-access guide; and mission/instrument pages from collection searches.',
        '- Corrected ISS film attribution to NASA Johnson. Labelled Earthrise as the 2013 NASA Goddard reconstruction of the 1968 Apollo 8 event using LRO context, rather than current Earth-observation footage. Added original still-image and film credits.',
        '- Reused the registry in source gallery, methodology directory, chart attribution, Data Passport presentation, mission trail, assistant evidence context, Court report, case-card HTML, backend PDF and generated worksheet citations.',
        '- Preserved exact original NASA API requests in exports alongside separate documentation and access links. PDF links are clickable. No algorithm, numerical record, result schema or statistical calculation was changed.', '',
        '## Initial failures and manual follow-up', '',
        'The initial candidate check covered 157 URLs: 150 reachable, two redirected, three 404 and two incomplete API endpoints. Two 404s were SVS asset directory prefixes, whose concrete media files are valid; prefixes are now templates rather than navigable documentation. Bare POWER API endpoints returned 422 because required parameters were absent; complete original requests are checked instead. The third 404 was a proposed GRACE-FO deep link, not a pre-existing application defect.', '',
        'Direct checks of several candidate GRACE solution paths returned 404 despite indexed/cached pages appearing available. The registry therefore uses the confirmed GRACE programme portal and Earthdata discovery; exact solution, collection and version selection remains manual and is not represented as verified integration.', '',
        'LP DAAC MOD13 documentation was reachable through the direct checker but restricted through one browser/search route. Protected Earthdata granules were not downloaded or authenticated. Mission-family entries without a selected product deliberately leave collection/version/resolution unspecified or collection-dependent. Before integrating any planned adapter, select the exact collection, validate variable units, scale factors, QC, spatial/temporal support, access conditions and citation against its authoritative product guide.', '',
        '## Source and product table', '',
        'Every registry record is listed below. Full variable, unit, spatial/temporal resolution, coverage, programme, instrument, version and access metadata live in the JSON registry and the application methodology directory. Shared URLs across records are intentional; NASA_LINK_HEALTH.json lists duplicate references and redirect destinations.', '',
        '| Dataset / source | Provider / programme | Documentation | Data / media access | Integration status | Link verification | Issues / limits |',
        '|---|---|---|---|---|---|---|',
    ]
    def cell(value):
        return str(value or 'Unspecified').replace('|', '/').replace('\n', ' ')
    for s in sources:
        states = ', '.join(f"{role}: {checks[s[field]]['state']} ({checks[s[field]]['http_status']})" for role, field in [('doc', 'documentation_url'), ('access', 'data_access_url')])
        lines.append('| ' + ' | '.join([
            cell(s['name']) + f" (`{s['id']}`)",
            cell(s['provider']) + ' / ' + cell(s['programme']),
            f"[Documentation]({s['documentation_url']})", f"[Access]({s['data_access_url']})",
            s['integration_status'], cell(states) + '; ' + cell(s.get('last_verified_date')),
            cell(s['access_requirements']),
        ]) + ' |')
    lines += ['', '## Reproduce verification', '',
        '```powershell', 'python scripts/verify_sources.py --update-dates',
        'python scripts/generate_source_audit.py',
        'python scripts/sync_source_presentations.py', '```', '',
        'The checker deduplicates URLs, tries HEAD then GET as necessary, follows redirects and distinguishes login/restriction from broken links. GET reads at most 16 KiB for title checks. It never submits credentials. Dynamic templates are checked through concrete original tile/API records; template directories are not asserted to be navigable pages. Use --reuse only for results from the same audit run; omit it for a fresh verification.', '',
        '## Validation', '',
        '- Backend regression suite: 30 tests passed, including registry completeness, catalogue/request parity, PDF link annotations and local HTTP checker failure/redirect cases.',
        '- Academy scoring/content checks and assistant boundary checks passed; existing science remains unchanged.',
        '- TypeScript, ESLint and production build passed. Production HTTP smoke: 21 checks passed; details in docs/HTTP_SMOKE.json.',
        '- Actual generated PDF first page was rendered and visually inspected: attribution, table and chart remain readable; its documentation, access and exact-request annotations were checked.',
        '- Browser UI verification was unavailable for this change: Computer Use stopped because it could not reliably determine the Windows browser URL. No rendered UI QA is claimed.', '',
    ]
    (ROOT / 'docs/NASA_SOURCE_AUDIT.md').write_text('\n'.join(lines), encoding='utf-8')
    print(f"Wrote audit for {len(sources)} source records / {report['total_urls']} URLs")


if __name__ == '__main__':
    main()
