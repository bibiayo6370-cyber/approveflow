/** Data-only chart primitive: P1/P2 can substitute a richer library without changing callers. */
export interface BarDatum { id: string; label: string; value: number }

export function BarChart({ data, title }: { data: readonly BarDatum[]; title: string }) {
  const max = Math.max(1, ...data.map(item => item.value));
  return (
    <div className="af-bar-chart" role="img" aria-label={`${title}. ${data.map(d => `${d.label}: ${d.value}`).join('; ')}`}>
      {data.map(({ id, label, value }) => <div key={id} className="af-bar-row" aria-hidden="true">
        <span className="af-bar-label">{label}</span>
        <div className="af-bar-track"><div className="af-bar-fill" style={{ width: `${Math.max(0, (value / max) * 100)}%` }} /></div>
        <strong className="af-bar-value">{value.toLocaleString('en-NG')}</strong>
      </div>)}
    </div>
  );
}
