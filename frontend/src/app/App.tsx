import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { ApprovalRequest, RequestEvent, Session, User } from '../types/api';
import { LoginForm } from '../features/auth/LoginForm';
import { RequestForm } from '../features/requests/RequestForm';
import { RejectionControl } from '../features/approver/RejectionControl';
import type { LoginInput, RequestInput } from '../lib/validation';
import { AppShell, PublicShell } from '../shared/layout/AppShell';
import { ThemeProvider } from '../shared/theme/ThemeProvider';
import { Landing } from '../features/landing/Landing';
import { Preview, ProductTour } from '../features/preview/Preview';
import { DashboardContent } from '../features/dashboard/DashboardContent';
import { Metrics } from '../features/dashboard/Metrics';

const sessionKey = 'approveflow-session';
const money = (value: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(value));

function readSession(): Session | null {
  try { return JSON.parse(sessionStorage.getItem(sessionKey) || 'null') as Session | null; }
  catch { sessionStorage.removeItem(sessionKey); return null; }
}

export function App() {
  return <ThemeProvider><AppRoutes /></ThemeProvider>;
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(readSession);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = () => { sessionStorage.removeItem(sessionKey); setSession(null); navigate('/login'); };

  useEffect(() => {
    if (session) api<{ user: User }>('/api/auth/me', {}, session.token)
      .then(({ user }) => user ? setSession(previous => previous ? { ...previous, user } : null) : logout())
      .catch(logout);
    // Initial session validation preserves the G3 workflow; later refresh is a separate feature gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (location.pathname === '/') return <PublicShell><Landing /></PublicShell>;
  if (!session) return <PublicShell><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login onSession={setSession} />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes></PublicShell>;

  return <AppShell role={session.user.role} userEmail={session.user.email} onLogout={logout}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard session={session} />} />
      <Route path="/requests" element={<Dashboard session={session} management />} />
      <Route path="/metrics" element={<Metrics />} />
      <Route path="/preview/:id" element={<Preview />} />
      <Route path="/tour" element={<ProductTour />} />
      {session.user.role === 'REQUESTER' && <Route path="/requests/new" element={<Create session={session} />} />}
      <Route path="/requests/:id" element={<Detail session={session} />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </AppShell>;
}

function Login({ onSession }: { onSession: (value: Session) => void }) {
  const [error, setError] = useState('');
  const submit = async (values: LoginInput) => {
    try {
      const next = await api<Session>('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
      sessionStorage.setItem(sessionKey, JSON.stringify(next));
      onSession(next);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Unable to sign in.'); }
  };
  return <section className="login">
    <span className="af-eyebrow">WELCOME BACK</span>
    <h1>Sign in to ApproveFlow</h1>
    <p className="af-muted">Where requests move forward with clarity.</p>
    <LoginForm onSubmit={submit} error={error} />
  </section>;
}

function Dashboard({ session, management = false }: { session: Session; management?: boolean }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [error, setError] = useState('');
  const approver = session.user.role === 'APPROVER';
  const [loading, setLoading] = useState(true);
  const [decisionBusy, setDecisionBusy] = useState(false);
  const decisionLock = useRef(false);

  useEffect(() => {
    api<{ requests: ApprovalRequest[] }>(approver ? '/api/requests/pending' : '/api/requests', {}, session.token)
      .then(({ requests }) => setItems(requests))
      .catch(problem => setError(problem instanceof Error ? problem.message : 'Unable to load requests.'))
      .finally(() => setLoading(false));
  }, [approver, session.token]);

  const decide = async (id:string, action:'approve'|'reject', comment?:string) => {
    if (decisionLock.current) return;
    decisionLock.current = true; setDecisionBusy(true);
    try {
      await api<{request:ApprovalRequest}>(`/api/requests/${id}/${action}`, {method:'POST',body:JSON.stringify(comment ? {comment} : {})}, session.token);
      setItems(previous=>previous.filter(item=>item.id!==id)); setError('');
      navigate(`/requests/${id}`);
    } catch(problem) { setError(problem instanceof Error ? problem.message : 'Unable to record decision.'); }
    finally { decisionLock.current = false; setDecisionBusy(false); }
  };
  return <DashboardContent items={items} loading={loading} error={error} approver={approver} onDecision={decide} decisionBusy={decisionBusy} management={management}/>;
}

function Create({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const submit = async (values: RequestInput) => {
    try {
      const { request } = await api<{ request: ApprovalRequest }>('/api/requests', { method: 'POST', body: JSON.stringify(values) }, session.token);
      navigate(`/requests/${request.id}`);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Could not create draft.'); }
  };
  return <section className="af-page-section af-create-request"><span className="af-eyebrow">LIVE REQUEST</span><h1>Create request</h1><RequestForm onSubmit={submit} error={error} /></section>;
}

function Detail({ session }: { session: Session }) {
  const { id = '' } = useParams();
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [error, setError] = useState('');
  const history = () => api<{ events: RequestEvent[] }>(`/api/requests/${id}/history`, {}, session.token)
    .then(({ events }) => setEvents(events)).catch(problem => setError(problem instanceof Error ? problem.message : 'Unable to load history.'));

  useEffect(() => {
    api<{ request: ApprovalRequest }>(`/api/requests/${id}`, {}, session.token)
      .then(({ request }) => setRequest(request))
      .catch(problem => setError(problem instanceof Error ? problem.message : 'Unable to load request.'));
    history();
    // The request ID is the detail loader's identity, matching the existing workflow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session.token]);

  const act = async (action: 'submit' | 'approve' | 'reject', comment?: string) => {
    try {
      const { request: result } = await api<{ request: ApprovalRequest }>(`/api/requests/${id}/${action}`,
        { method: 'POST', body: JSON.stringify(comment ? { comment } : {}) }, session.token);
      setRequest(result);
      history();
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Action failed.'); }
  };
  if (error) return <p role="alert" className="af-message-error">{error}</p>;
  if (!request) return <p className="af-muted">Loading request…</p>;
  return <section className="af-page-section af-detail-page">
    <span className={`status ${request.status}`}>{request.status}</span><h1>{request.title}</h1>
    <p className="af-muted">{request.description}</p>
    <section className="af-surface request-details"><h2>Request details</h2><dl><div><dt>Category</dt><dd>{request.category}</dd></div><div><dt>Quantity</dt><dd>{request.quantity}</dd></div><div><dt>Unit cost</dt><dd>{money(request.unit_cost)}</dd></div><div><dt>Total</dt><dd>{money(request.total_cost)}</dd></div><div><dt>Required date</dt><dd>{request.required_date?.slice(0,10)}</dd></div><div><dt>Justification</dt><dd>{request.justification}</dd></div></dl></section>
    {session.user.role === 'REQUESTER' && request.status === 'DRAFT' && <button type="button" onClick={() => act('submit')}>Submit for approval</button>}
    {session.user.role === 'APPROVER' && request.status === 'PENDING_APPROVAL' && <RejectionControl approve={() => act('approve')} reject={comment => act('reject', comment)} />}
    <section className="af-surface af-history"><h2>Activity history</h2><ol>{events.map(event => <li key={event.id}>{event.event_type} {event.comment && `— ${event.comment}`}{event.created_at && <small className="event-meta">{new Date(event.created_at).toLocaleString('en-NG')} {event.actor_id && `· Actor ID: ${event.actor_id}`}</small>}</li>)}</ol></section>
  </section>;
}
