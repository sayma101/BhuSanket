const groups = [
  ['identity', '01', 'Source identity'],
  ['measurement', '02', 'The measurement'],
  ['space_time', '03', 'Space & time'],
  ['processing', '04', 'Quality & processing'],
  ['statistics', '05', 'Statistical evidence'],
  ['reproducibility', '06', 'Reproduce the result'],
] as const;

function readable(value: unknown): string {
  if (value === null || value === undefined) return 'Not supplied / not applicable';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(readable).join(' · ');
  if (typeof value === 'object') return Object.entries(value).map(([key, entry]) => `${key.replaceAll('_', ' ')}: ${readable(entry)}`).join('; ');
  return String(value);
}

export function PassportDetails({ passport }: { passport: Record<string, unknown> }) {
  return <div className="passport-groups">{groups.map(([key, index, title]) => {
    const group = passport[key];
    if (!group || typeof group !== 'object' || Array.isArray(group)) return null;
    return <details className="passport-group" key={key}><summary><span>{index}</span>{title}<i aria-hidden="true">+</i></summary><dl>{Object.entries(group).map(([name, value]) => <div key={name}><dt>{name.replaceAll('_', ' ')}</dt><dd>{readable(value)}</dd></div>)}</dl></details>;
  })}</div>;
}
