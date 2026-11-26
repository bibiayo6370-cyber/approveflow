import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Preview } from '../features/preview/Preview';
import { demoStore } from '../demo/store';

afterEach(()=>{demoStore.reset();vi.restoreAllMocks();});
describe('isolated product previews',()=>{
 it('processes and resets sample finance without network calls',async()=>{const fetch=vi.spyOn(globalThis,'fetch');render(<MemoryRouter initialEntries={['/preview/finance']}><Routes><Route path="/preview/:id" element={<Preview/>}/></Routes></MemoryRouter>);const user=userEvent.setup();await user.click(screen.getAllByRole('button',{name:'Simulate processing'})[0]);expect(screen.getByRole('status')).toHaveTextContent('No payment was made');expect(demoStore.getSnapshot().finance[0].status).toBe('PROCESSED');await user.click(screen.getByRole('button',{name:'Reset demo data'}));expect(demoStore.getSnapshot().finance[0].status).toBe('AWAITING_PROCESSING');expect(fetch).not.toHaveBeenCalled();});
 it('marks sample notifications read without network calls',async()=>{const fetch=vi.spyOn(globalThis,'fetch');render(<MemoryRouter initialEntries={['/preview/notifications']}><Routes><Route path="/preview/:id" element={<Preview/>}/></Routes></MemoryRouter>);await userEvent.click(screen.getAllByRole('button',{name:'Mark read'})[0]);expect(demoStore.getSnapshot().notifications[0].read).toBe(true);expect(fetch).not.toHaveBeenCalled();});
 it('edits and resets sample settings without network calls',async()=>{const fetch=vi.spyOn(globalThis,'fetch');render(<MemoryRouter initialEntries={['/preview/admin']}><Routes><Route path="/preview/:id" element={<Preview/>}/></Routes></MemoryRouter>);const user=userEvent.setup();const name=screen.getByRole('textbox',{name:'Organization name'});await user.clear(name);await user.type(name,'Example Ltd');expect(name).toHaveValue('Example Ltd');await user.selectOptions(screen.getByLabelText('Default currency'),'USD');expect(screen.getByLabelText('High-value review threshold (USD)')).toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Reset demo data'}));expect(name).toHaveValue('Acme Business Services');expect(screen.getByLabelText('Default currency')).toHaveValue('NGN');expect(fetch).not.toHaveBeenCalled();});
});
