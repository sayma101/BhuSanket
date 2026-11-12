"""Read-only PyPI release metadata audit for the Render Linux/Python target.

Checks wheel availability and Python compatibility; does not install packages or
claim to have built a remote service. Run with packaging on PYTHONPATH.
"""
import concurrent.futures
import json
import gzip
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.python-packages'))
from packaging.specifiers import SpecifierSet
from packaging.tags import compatible_tags, cpython_tags
from packaging.utils import parse_wheel_filename
from packaging.requirements import Requirement
from packaging.markers import default_environment
from packaging.utils import canonicalize_name

PLATFORMS = ['manylinux_2_28_x86_64', 'manylinux_2_27_x86_64',
             'manylinux_2_24_x86_64', 'manylinux_2_17_x86_64', 'manylinux2014_x86_64']
TAGS = set(cpython_tags((3, 13), platforms=PLATFORMS)) | set(compatible_tags((3, 13), 'cp313', PLATFORMS))


def check(pin):
    name, version = pin.split('==')
    cache = ROOT / 'tmp' / f'pypi-release-{name}-{version}.json'
    try:
        if cache.exists():
            release = json.loads(cache.read_text(encoding='utf-8'))
        else:
            query = Request(f'https://pypi.org/pypi/{name}/{version}/json', headers={'Accept-Encoding': 'gzip'})
            with urlopen(query, timeout=60) as response:
                raw = response.read()
                release = json.loads(gzip.decompress(raw) if response.headers.get('Content-Encoding') == 'gzip' else raw)
            cache.parent.mkdir(parents=True, exist_ok=True)
            cache.write_text(json.dumps(release), encoding='utf-8')
    except Exception as error:
        return {'package': name, 'version': version, 'linux_x86_64_wheel_available': None,
                'error': str(error), 'scope': 'Network verification incomplete, not a missing-wheel verdict.'}
    candidates = []
    for asset in release['urls']:
        if asset['packagetype'] != 'bdist_wheel' or asset.get('yanked'):
            continue
        requirement = asset.get('requires_python') or release['info'].get('requires_python') or ''
        if requirement and '3.13.0' not in SpecifierSet(requirement):
            continue
        _, _, _, tags = parse_wheel_filename(asset['filename'])
        if tags & TAGS:
            candidates.append(asset['filename'])
    return {'package': name, 'version': version, 'python': '3.13.0',
            'linux_x86_64_wheel_available': bool(candidates), 'compatible_wheels': candidates,
            'requires_dist': release['info'].get('requires_dist') or [],
            'release_metadata': f'https://pypi.org/pypi/{name}/{version}/json'}


def main():
    pins = [line.strip() for line in (ROOT / 'backend/requirements-lock.txt').read_text().splitlines()
            if line.strip() and not line.startswith('#')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(check, pins))
    failures = [row['package'] for row in results if row['linux_x86_64_wheel_available'] is False]
    incomplete = [row['package'] for row in results if row['linux_x86_64_wheel_available'] is None]
    versions = {canonicalize_name(row['package']): row['version'] for row in results}
    target = {**default_environment(), 'os_name': 'posix', 'platform_system': 'Linux',
              'platform_machine': 'x86_64', 'sys_platform': 'linux',
              'python_version': '3.13', 'python_full_version': '3.13.0', 'extra': ''}
    conflicts = []
    for row in results:
        for raw in row.get('requires_dist', []):
            dependency = Requirement(raw)
            if dependency.marker and not dependency.marker.evaluate(target):
                continue
            version = versions.get(canonicalize_name(dependency.name))
            if version is None or (dependency.specifier and version not in dependency.specifier):
                conflicts.append({'package': row['package'], 'requirement': raw, 'pinned_version': version})
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'target': 'CPython 3.13.0 / Linux x86_64',
              'package_count': len(results), 'missing_compatible_wheels': failures,
              'network_verification_incomplete': incomplete, 'dependency_conflicts': conflicts, 'results': results,
              'scope': 'PyPI wheel and declared-dependency metadata checks only; not an actual Linux install or remote deployment.'}
    (ROOT / 'docs/BACKEND_WHEEL_CHECK.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'packages_checked': len(results), 'missing_compatible_wheels': failures,
                      'network_verification_incomplete': incomplete, 'dependency_conflicts': conflicts}))
    if failures or incomplete or conflicts:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
