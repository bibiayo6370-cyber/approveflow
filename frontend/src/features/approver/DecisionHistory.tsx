import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

type Decision = { id: string; title: string; category: string; total_cost: string; event_type: 'REQUEST_APPROVED' | 'REQUEST_REJECTED'; comment: string | null; decided_at: string };
const localDate = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };
const money = (value: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(value));

export function DecisionHistory({ token }: { token: string }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => { let active = true; setLoading(true); setError(''); api<{ decisions: Decision[] }>('/api/requests/decisions', {}, token).then(result => { if (active) setDecisions(result.decisions); }).catch(problem => { if (active) setError(problem instanceof Error ? problem.message : 'Could not load decision history.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  const invalidRange = !!from && !!to && from > to;
  const visible = decisions.filter(item => { const date = localDate(item.decided_at); return (status === 'ALL' || item.event_type === status) && (!from || date >= from) && (!to || date <= to); });
  return <section className="af-page-section decision-history"><span className="af-eyebrow">LIVE MVP</span><h1>Decision history</h1><p className="af-muted">Review decisions you made. Dates use your device’s local time.</p>
    <div className="af-surface"><div className="decision-filters"><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option value="ALL">All decisions</option><option value="REQUEST_APPROVED">Approved</option><option value="REQUEST_REJECTED">Rejected</option></select></label><label>From date<input type="date" value={from} onChange={event=>setFrom(event.target.value)}/></label><label>To date<input type="date" value={to} onChange={event=>setTo(event.target.value)}/></label><button type="button" className="af-icon-button" style={{alignSelf:'end'}} onClick={()=>{setStatus('ALL');setFrom('');setTo('');}}>Clear filters</button></div>
      {invalidRange ? <p role="alert">The end date must be on or after the start date.</p> : error ? <p role="alert" className="af-message-error">{error}</p> : loading ? <p role="status">Loading decision history…</p> : visible.length === 0 ? <p>No decisions match these filters.</p> : <div className="approved-table-wrap"><table className="approved-table"><thead><tr><th>Request</th><th>Decision</th><th>Decision date</th><th>Amount</th><th>Reason</th></tr></thead><tbody>{visible.map(item=><tr key={`${item.id}-${item.event_type}`}><td><Link to={`/requests/${item.id}`}>{item.title}</Link></td><td>{item.event_type === 'REQUEST_APPROVED' ? 'Approved' : 'Rejected'}</td><td>{new Date(item.decided_at).toLocaleString('en-NG')}</td><td>{money(item.total_cost)}</td><td>{item.comment || '—'}</td></tr>)}</tbody></table></div>}
    </div>
  </section>;
}
