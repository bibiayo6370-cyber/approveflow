import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { ApprovalRequest, RequestEvent, Session, User } from '../types/api';
import { LoginForm } from '../features/auth/LoginForm';
import { RequestForm } from '../features/requests/RequestForm';
import { RejectionControl } from '../features/approver/RejectionControl';
import type { LoginInput, RequestInput } from '../lib/validation';
import { AppShell, PublicShell } from '../shared/layout/AppShell';
import { ThemeProvider } from '../shared/theme/ThemeProvider';

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
  const logout = () => { sessionStorage.removeItem(sessionKey); setSession(null); navigate('/login'); };

  useEffect(() => {
    if (session) api<{ user: User }>('/api/auth/me', {}, session.token)
      .then(({ user }) => user ? setSession(previous => previous ? { ...previous, user } : null) : logout())
      .catch(logout);
    // Initial session validation preserves the G3 workflow; later refresh is a separate feature gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return <PublicShell><Routes>
    <Route path="/login" element={<Login onSession={setSession} />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes></PublicShell>;

  return <AppShell role={session.user.role} userEmail={session.user.email} onLogout={logout}>
    <Routes>
      <Route path="/" element={<Dashboard session={session} />} />
      {session.user.role === 'REQUESTER' && <Route path="/requests/new" element={<Create session={session} />} />}
      <Route path="/requests/:id" element={<Detail session={session} />} />
      <Route path="*" element={<Navigate to="/" />} />
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

function Dashboard({ session }: { session: Session }) {
  const [items, setItems] = useState<ApprovalRequest[]>([]);
  const [error, setError] = useState('');
  const approver = session.user.role === 'APPROVER';

  useEffect(() => {
    api<{ requests: ApprovalRequest[] }>(approver ? '/api/requests/pending' : '/api/requests', {}, session.token)
      .then(({ requests }) => setItems(requests))
      .catch(problem => setError(problem instanceof Error ? problem.message : 'Unable to load requests.'));
  }, [approver, session.token]);

  return <section className="af-page-section">
    <div className="title">
      <div><span className="af-eyebrow">LIVE MVP WORKSPACE</span><h1>{approver ? 'Pending decisions' : 'My requests'}</h1>
      <p className="af-muted">{approver ? 'Review and respond to requests that need your approval.' : 'Create, submit and track your business requests.'}</p></div>
      {!approver && <Link className="button" to="/requests/new">Create request</Link>}
    </div>
    {error ? <p role="alert" className="af-message-error">{error}</p> : !items.length ? <p className="empty">No requests to display.</p> :
      <div className="cards">{items.map(request => <Link className="card" key={request.id} to={`/requests/${request.id}`}>
        <span className={`status ${request.status}`}>{request.status.replaceAll('_', ' ')}</span>
        <h2>{request.title}</h2><p>{money(request.total_cost)}</p>
      </Link>)}</div>}
  </section>;
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
  return <section className="af-page-section"><span className="af-eyebrow">LIVE REQUEST</span><h1>Create request</h1><RequestForm onSubmit={submit} error={error} /></section>;
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
    {session.user.role === 'REQUESTER' && request.status === 'DRAFT' && <button type="button" onClick={() => act('submit')}>Submit for approval</button>}
    {session.user.role === 'APPROVER' && request.status === 'PENDING_APPROVAL' && <RejectionControl approve={() => act('approve')} reject={comment => act('reject', comment)} />}
    <section className="af-surface af-history"><h2>Activity history</h2><ol>{events.map(event => <li key={event.id}>{event.event_type} {event.comment && `— ${event.comment}`}</li>)}</ol></section>
  </section>;
}
