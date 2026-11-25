import type { Metric } from '../../architecture/capabilities';
import { SourceTag } from './SourceTag';

function formatValue(metric: Metric) {
  switch (metric.unit) {
    case 'NGN': return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(metric.value);
    case 'percent': return `${metric.value.toLocaleString('en-NG')}%`;
    case 'days': return `${metric.value.toLocaleString('en-NG')} days`;
    default: return metric.value.toLocaleString('en-NG');
  }
}

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="af-metric-card">
      <div className="af-metric-top"><span className="af-metric-label">{metric.label}</span><SourceTag mode={metric.source} /></div>
      <strong className="af-metric-value">{formatValue(metric)}</strong>
      {metric.context && <p className="af-metric-context">{metric.context}</p>}
    </article>
  );
}
