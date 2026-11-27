import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, Clock3, CheckCircle2, CircleX, Plus, Wallet } from 'lucide-react';
import type { ApprovalRequest } from '../../types/api';
import { getDemoSummary } from '../../demo/fixtures';
import { useDemoData } from '../../demo/useDemoData';
import { demoStore } from '../../demo/store';
import { RejectionControl } from '../approver/RejectionControl';

const money = (value: string | number) => new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 }).format(Number(value));
const label = (value:string) => value.replaceAll('_', ' ');
type Props = {items:ApprovalRequest[];loading:boolean;error:string;approver:boolean;onDecision?:(id:string,action:'approve'|'reject',comment?:string)=>Promise<void>;decisionBusy?:boolean;management?:boolean};
function Metric({title,value,caption,icon:Icon}:{title:string;value:string|number;caption:string;icon:typeof ClipboardList}) {
  return <article className="approved-kpi af-surface"><div><span>{title}</span><Icon size={20}/></div><strong>{value}</strong><small>{caption}</small></article>;
}
function SampleTrend({items}:{items:{submittedAt:string;amountNGN:number}[]}) {
  const sorted=[...items].sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)); let running=0;
  const values=sorted.map(r=>running+=r.amountNGN); const max=Math.max(1,...values);
  const points=values.map((v,i)=>`${12+i*396/Math.max(1,values.length-1)},${126-v/max*105}`).join(' ');
  return <div className="sample-trend"><svg viewBox="0 0 420 150" role="img" aria-label={`Cumulative sample request value, ${money(running)}`} preserveAspectRatio="none"><path d="M12 120H408 M12 84H408 M12 48H408 M12 12H408" stroke="var(--af-border)" fill="none"/><polyline points={points} fill="none" stroke="var(--af-cyan)" strokeWidth="3"/></svg><div><span>{sorted[0]?.submittedAt.slice(0,10)}</span><span>{sorted.at(-1)?.submittedAt.slice(0,10)}</span></div></div>;
}
function SampleWorkload({items}:{items:{submittedAt:string}[]}) {
  const labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; const counts=labels.map((_,index)=>items.filter(item=>(new Date(item.submittedAt).getUTCDay()+6)%7===index).length); const max=Math.max(1,...counts);
  return <div className="sample-workload" role="img" aria-label={`Sample requests by weekday: ${labels.map((day,index)=>`${day} ${counts[index]}`).join(', ')}`}><div className="sample-bars">{counts.map((count,index)=><span key={labels[index]} style={{height:`${Math.max(2,count/max*100)}%`}}/>)}</div><div className="sample-bar-labels">{labels.map(day=><span key={day}>{day}</span>)}</div></div>;
}
function SampleReview({chosen}:{chosen:string}) {
  const data=useDemoData(); const [decisions,setDecisions]=useState<Record<string,string>>({});
  const item=data.requests.find(r=>r.id===chosen)!;
  return <section className="af-surface approved-panel"><div className="panel-heading"><h2><ClipboardList size={19}/> Request Review</h2><span className="af-source-tag af-source-demo">Sample only</span></div>
    <h3>{item.title}</h3><p className="af-muted">Requested by {item.owner} · {item.department}</p>
    <div className="approved-details"><div><small>Amount</small><b>{money(item.amountNGN)}</b></div><div><small>Category</small><b>{item.category}</b></div><div><small>Reference</small><b>{item.id}</b></div><div><small>Status</small><b>{decisions[item.id]||label(item.status)}</b></div></div>
    <small>Justification</small><p>Illustrative request for the product demonstration.</p>{item.status==='PENDING_APPROVAL'&&<div className="sample-actions"><button className="af-icon-button" onClick={()=>{if(demoStore.decideRequest(item.id,'REJECTED')) setDecisions({...decisions,[item.id]:'Rejected in preview'});}}>Reject</button><button className="button" onClick={()=>{if(demoStore.decideRequest(item.id,'APPROVED')) setDecisions({...decisions,[item.id]:'Approved in preview'});}}>✓ Approve</button></div>}
    <p role="status" className="af-muted">{decisions[item.id]?'Simulated decision only; no live request changed.':item.status==='PENDING_APPROVAL'?'Select a decision to simulate this example.':'Historical example; no live request changed.'}</p></section>;
}
function LiveTable({items,loading,error,approver,onSelect,onSampleSelect,query}:{items:ApprovalRequest[];loading:boolean;error:string;approver:boolean;onSelect?:(id:string)=>void;onSampleSelect?:(id:string)=>void;query:string}) {
  const [filter,setFilter]=useState('ALL'); const list=items.filter(x=>(filter==='ALL'||x.status===filter) && (x.title+' '+x.id+' '+x.category).toLowerCase().includes(query.toLowerCase()));
  const sample=useDemoData();
  const [sampleFilter,setSampleFilter]=useState('PENDING_APPROVAL');
  return <section id="requests" className="af-surface approved-panel"><div className="panel-heading"><h2><ClipboardList size={19}/> {approver?'Approver Inbox':'My Requests'}</h2><span className="af-source-tag af-source-live">Live MVP</span></div>
    {!approver&&<div className="approved-tabs" role="group" aria-label="Filter requests by status">{[['ALL','All'],['DRAFT','Drafts'],['PENDING_APPROVAL','In progress'],['APPROVED','Approved'],['REJECTED','Rejected'],['PROCESSED','Processed']].map(([value,name])=><button type="button" key={value} className={filter===value?'selected':''} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{name} ({value==='ALL'?items.length:items.filter(x=>x.status===value).length})</button>)}</div>}
    {error?<p role="alert" className="af-message-error">{error}</p>:loading?<p role="status">Loading requests…</p>:list.length===0?<p className="af-muted">No requests to display.</p>:<div className="approved-table-wrap"><table className="approved-table"><thead><tr><th>Request</th><th>Title</th><th>Amount</th><th>{approver?'Category':'Status'}</th></tr></thead><tbody>{list.map(r=><tr key={r.id}><td><Link to={`/requests/${r.id}`}>{r.id.slice(0,8)}</Link></td><td>{approver?<button className="approved-select-request" onClick={()=>onSelect?.(r.id)}>{r.title}</button>:<Link to={`/requests/${r.id}`}>{r.title}</Link>}</td><td>{money(r.total_cost)}</td><td><span className={`status ${r.status}`}>{approver?r.category:label(r.status)}</span></td></tr>)}</tbody></table></div>}
    {approver&&<div className="approved-sample-inbox"><div className="panel-heading"><h3>Example inbox</h3><span className="af-source-tag af-source-demo">Sample only</span></div><div className="approved-tabs">{[['PENDING_APPROVAL','Pending'],['APPROVED','Approved'],['REJECTED','Rejected']].map(([value,name])=><button key={value} className={sampleFilter===value?'selected':''} onClick={()=>setSampleFilter(value)}>{name} ({sample.requests.filter(r=>r.status===value).length})</button>)}</div>{sample.requests.filter(r=>r.status===sampleFilter).map(r=><div className="demo-row" key={r.id}><button className="approved-select-request" onClick={()=>onSampleSelect?.(r.id)}>{r.title}</button><span>{r.owner}</span><b>{money(r.amountNGN)}</b></div>)}</div>}
    {!approver&&<div className="approved-sample-inbox"><div className="panel-heading"><h3>Example requests</h3><span className="af-source-tag af-source-demo">Sample only</span></div><div className="approved-table-wrap"><table className="approved-table"><thead><tr><th>Request</th><th>Title</th><th>Amount</th><th>Status</th></tr></thead><tbody>{sample.requests.slice(0,4).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.title}</td><td>{money(r.amountNGN)}</td><td>{label(r.status)}</td></tr>)}</tbody></table></div><Link to="/preview/analytics">View sample reports →</Link></div>}
  </section>;
}
export function DashboardContent({items,loading,error,approver,onDecision,decisionBusy=false,management=false}:Props) {
  const sample=useDemoData(); const totals=getDemoSummary(sample); const [range,setRange]=useState('All sample records');
  const [query,setQuery]=useState(''); const [selected,setSelected]=useState<string>(''); const [selectedSample,setSelectedSample]=useState('demo-af-102'); const active=items.find(r=>r.id===selected);
  const values=approver?[
    {title:'Pending Approvals',value:totals.pending,caption:'Awaiting decisions · sample',icon:ClipboardList},{title:'Due Today',value:'—',caption:'Illustrative preview',icon:Clock3},
    {title:'Approved',value:totals.approved,caption:'Sample history',icon:CheckCircle2},{title:'Rejected',value:totals.rejected,caption:'Sample history',icon:CircleX}
  ]:[
    {title:'Total Requests',value:totals.requests,caption:'Sample data',icon:ClipboardList},{title:'In Progress',value:totals.pending,caption:'Pending review · sample',icon:Clock3},
    {title:'Approved',value:totals.approved,caption:'Completed · sample',icon:CheckCircle2},{title:'Rejected',value:totals.rejected,caption:'Returned · sample',icon:CircleX}
  ];
  const filtered=sample.requests.filter(r=>range==='All sample records'||r.status==='APPROVED');
  if (management) return <div className="approved-dashboard">
    <header className="approved-dashboard-head"><div><h1>{approver ? 'Approvals' : 'My Requests'}</h1><p>{approver ? 'Review requests awaiting your decision.' : 'Find and manage your live requests.'}</p></div><div className="approved-head-tools"><label><span className="sr-only">Search live requests</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search live requests or references..."/></label>{!approver && <Link className="button" to="/requests/new"><Plus size={18}/> Create Request</Link>}</div></header>
    {approver ? <>
      <div className="approved-approval-grid"><LiveTable items={items} loading={loading} error={error} approver onSelect={setSelected} onSampleSelect={id=>{setSelected('');setSelectedSample(id);}} query={query}/>{active?<section className="af-surface approved-panel"><div className="panel-heading"><h2><ClipboardList size={19}/> Request Review</h2><span className="af-source-tag af-source-live">Live MVP</span></div><h3>{active.title}</h3><div className="approved-details"><div><small>Amount</small><b>{money(active.total_cost)}</b></div><div><small>Category</small><b>{active.category}</b></div><div><small>Quantity</small><b>{active.quantity}</b></div><div><small>Status</small><b>{label(active.status)}</b></div></div><small>Justification</small><p>{active.justification}</p><RejectionControl disabled={decisionBusy} approve={()=>void onDecision?.(active.id,'approve')} reject={comment=>void onDecision?.(active.id,'reject',comment)}/>{decisionBusy&&<p role="status">Recording decision…</p>}<Link to={`/requests/${active.id}`}>View full request history →</Link></section>:<SampleReview chosen={selectedSample}/>}</div>
    </> : <div className="approved-request-list"><LiveTable items={items} loading={loading} error={error} approver={false} query={query}/></div>}
  </div>;
  return <div className="approved-dashboard">
    <header className="approved-dashboard-head"><div><h1>{approver?'Approver Dashboard':'Requester Dashboard'}</h1><p>Request insights and approval progress.</p></div></header>
    <div id="metrics" className="approved-source-line"><span>Dashboard insights</span><span className="af-source-tag af-source-demo">Illustrative sample data</span></div><div className="approved-kpis">{values.map(m=><Metric key={m.title} {...m}/>)}</div>
    {approver ? <>
      <div className="approved-charts"><section className="af-surface approved-panel"><div className="panel-heading"><h2><BarChart3 size={19}/> Workload Overview</h2><span className="af-source-tag af-source-demo">Sample data</span></div><SampleWorkload items={sample.requests}/><small className="af-muted">Distribution across the sample fixture dates.</small></section>
      <section className="af-surface approved-panel"><div className="panel-heading"><h2><Clock3 size={19}/> Turnaround Metrics</h2><span className="af-source-tag af-source-demo">Illustration</span></div><strong className="approved-big">8.4 h</strong><p className="af-muted">Illustrative example only; not calculated from live or sample requests. A future reporting service would provide actual turnaround times.</p></section></div>
    </> : <>
      <div className="approved-charts"><section className="af-surface approved-panel"><div className="panel-heading"><h2><Wallet size={19}/> Spending Trend</h2><select value={range} onChange={e=>setRange(e.target.value)} aria-label="Sample spending view"><option>All sample records</option><option>Approved sample records</option></select></div><span className="af-source-tag af-source-demo">Sample data</span><strong className="approved-big">{money(filtered.reduce((a,r)=>a+r.amountNGN,0))}</strong><small className="af-muted">Illustrative request value</small><SampleTrend items={filtered}/></section>
      <section className="af-surface approved-panel"><div className="panel-heading"><h2><Activity size={19}/> Approval Status</h2><span className="af-source-tag af-source-demo">Sample data</span></div><div className="approved-donut-row"><div className="approved-donut" style={{background:`conic-gradient(var(--af-teal) 0 ${totals.approved/totals.requests*100}%,var(--af-primary) ${totals.approved/totals.requests*100}% ${(totals.approved+totals.pending)/totals.requests*100}%,var(--af-danger) ${(totals.approved+totals.pending)/totals.requests*100}% ${(totals.approved+totals.pending+totals.rejected)/totals.requests*100}%,var(--af-border) 0)`}}><strong>{totals.requests}<small>Requests</small></strong></div><div className="approved-legend"><span>● Approved <b>{totals.approved}</b></span><span>● In Progress <b>{totals.pending}</b></span><span>● Rejected <b>{totals.rejected}</b></span><span>● Other <b>{totals.requests-totals.approved-totals.pending-totals.rejected}</b></span></div></div></section></div>
    </>}
  </div>;
}
