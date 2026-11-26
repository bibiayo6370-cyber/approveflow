import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardContent } from '../features/dashboard/DashboardContent';
import { demoStore } from '../demo/store';
const item={id:'live-123456',title:'Live laptop request',description:'Equipment',category:'IT',quantity:2,unit_cost:'100',total_cost:'200',required_date:'2026-12-04',justification:'Test',status:'PENDING_APPROVAL'};
afterEach(()=>demoStore.reset());
describe('approved role dashboard',()=>{
 it('shows insights without request management on the dashboard',()=>{render(<MemoryRouter><DashboardContent items={[item]} loading={false} error="" approver={false}/></MemoryRouter>);expect(screen.getByRole('heading',{name:'Requester Dashboard'})).toBeInTheDocument();expect(screen.getByRole('heading',{name:'Spending Trend'})).toBeInTheDocument();expect(screen.getByRole('heading',{name:'Approval Status'})).toBeInTheDocument();expect(screen.queryByText('Live laptop request')).not.toBeInTheDocument();expect(screen.getAllByText('Sample data').length).toBeGreaterThan(0);});
 it('shows live requests in their own management section',()=>{render(<MemoryRouter><DashboardContent items={[item]} loading={false} error="" approver={false} management/></MemoryRouter>);expect(screen.getByRole('heading',{name:'My Requests',level:1})).toBeInTheDocument();expect(screen.getByText('Live laptop request')).toBeInTheDocument();expect(screen.queryByRole('heading',{name:'Spending Trend'})).not.toBeInTheDocument();});
 it('selects a live request and sends only its authorized decision callback',async()=>{const decide=vi.fn().mockResolvedValue(undefined);render(<MemoryRouter><DashboardContent items={[item]} loading={false} error="" approver management onDecision={decide}/></MemoryRouter>);const user=userEvent.setup();await user.click(screen.getByRole('button',{name:'Live laptop request'}));expect(screen.getByText('Test')).toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Approve'}));expect(decide).toHaveBeenCalledWith('live-123456','approve');});
 it('keeps sample review decisions separate from the live callback',async()=>{const decide=vi.fn();render(<MemoryRouter><DashboardContent items={[]} loading={false} error="" approver management onDecision={decide}/></MemoryRouter>);await userEvent.click(screen.getByRole('button',{name:'✓ Approve'}));expect(screen.getByRole('status')).toHaveTextContent('Simulated decision only');expect(decide).not.toHaveBeenCalled();});
});
