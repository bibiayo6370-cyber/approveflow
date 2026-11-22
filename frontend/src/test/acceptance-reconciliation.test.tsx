import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';

const requester={id:'u1',email:'sarah@example.test',role:'REQUESTER'} as const;
const reply=(body:unknown,status=200)=>Promise.resolve(new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}}));
function session(){sessionStorage.setItem('approveflow-session',JSON.stringify({token:'token',user:requester}));}
function renderApp(path='/'){history.replaceState({},'',path);return render(<BrowserRouter><App/></BrowserRouter>);}
function fetchRoutes(routes:Record<string,[unknown,number?]>){vi.stubGlobal('fetch',vi.fn((input:RequestInfo|URL)=>{const [body,status]=routes[new URL(String(input)).pathname]||[{error:{message:'Not found'}},404];return reply(body,status);}));}

describe('G3 acceptance reconciliation',()=>{
 it('restores a valid session through me and renders the empty requester workspace',async()=>{session();fetchRoutes({'/api/auth/me':[{user:requester}],'/api/requests':[{requests:[]}]});renderApp();expect(await screen.findByRole('heading',{name:'My requests'})).toBeTruthy();expect(await screen.findByText('No requests to display.')).toBeTruthy();expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/me'),expect.any(Object));});
 it('clears the session on logout',async()=>{session();fetchRoutes({'/api/auth/me':[{user:requester}],'/api/requests':[{requests:[]}]});renderApp();const user=userEvent.setup();await user.click(await screen.findByRole('button',{name:/log out/i}));await waitFor(()=>expect(sessionStorage.getItem('approveflow-session')).toBeNull());});
 it('redirects unauthenticated protected navigation to login',async()=>{renderApp('/requests/new');expect(await screen.findByRole('button',{name:/sign in/i})).toBeTruthy();});
 it('shows loading and network failure feedback for request details',async()=>{session();fetchRoutes({'/api/auth/me':[{user:requester}],'/api/requests/r1':[{error:{message:'Network unavailable.'}},503],'/api/requests/r1/history':[{events:[]}]});renderApp('/requests/r1');expect(screen.getByText('Loading request…')).toBeTruthy();expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable.');});
});
