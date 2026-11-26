import { useDemoData } from '../../demo/useDemoData';
import { BarChart } from '../../shared/ui/BarChart';

const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export function Metrics() {
  const { requests } = useDemoData();
  const categories = [...new Set(requests.map(request => request.category))].map(category => {
    const matching = requests.filter(request => request.category === category);
    return { category, count: matching.length, value: matching.reduce((sum, request) => sum + request.amountNGN, 0) };
  }).sort((a, b) => b.value - a.value);
  const departments = [...new Set(requests.map(request => request.department))].map(department => ({
    id: department, label: department, value: requests.filter(request => request.department === department).length,
  }));
  const total = requests.reduce((sum, request) => sum + request.amountNGN, 0);
  const approved = requests.filter(request => request.status === 'APPROVED').length;
  const rejected = requests.filter(request => request.status === 'REJECTED').length;
  const decided = approved + rejected;
  return <section className="af-page-section metrics-page">
    <span className="af-eyebrow">INTERACTIVE PREVIEW · SAMPLE DATA</span>
    <h1>Metrics</h1>
    <p className="af-muted">Explore a breakdown of fictional requests. These figures are not live application data.</p>
    <div className="demo-metrics">
      <div className="af-metric-card"><span className="af-metric-label">Sample request value</span><strong className="af-metric-value">{money(total)}</strong><small>All sample requests</small></div>
      <div className="af-metric-card"><span className="af-metric-label">Average request value</span><strong className="af-metric-value">{money(requests.length ? total / requests.length : 0)}</strong><small>Total divided by sample requests</small></div>
      <div className="af-metric-card"><span className="af-metric-label">Decision approval rate</span><strong className="af-metric-value">{decided ? `${Math.round(approved / decided * 100)}%` : '—'}</strong><small>Approved ÷ (approved + rejected)</small></div>
      <div className="af-metric-card"><span className="af-metric-label">Decided requests</span><strong className="af-metric-value">{decided}</strong><small>{approved} approved · {rejected} rejected</small></div>
    </div>
    <div className="metrics-breakdown">
      <section className="af-surface"><h2>Requests by department</h2><p className="af-muted">Number of sample requests in each department.</p><BarChart title="Sample requests by department" data={departments}/></section>
      <section className="af-surface"><h2>Request value by category</h2><p className="af-muted">All sample statuses, sorted by total request value.</p><div className="approved-table-wrap"><table className="approved-table"><thead><tr><th>Category</th><th>Requests</th><th>Total value</th></tr></thead><tbody>{categories.map(row=><tr key={row.category}><td>{row.category}</td><td>{row.count}</td><td>{money(row.value)}</td></tr>)}</tbody></table></div></section>
    </div>
  </section>;
}
