/** Fully fictional records, isolated from live request IDs and credentials. */
export type DemoRequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
export type DemoRequest = {
  id: `demo-${string}`;
  title: string;
  category: string;
  owner: string;
  department: string;
  amountNGN: number;
  status: DemoRequestStatus;
  submittedAt: string;
};
export type DemoNotification = {
  id: `demo-${string}`;
  requestId: DemoRequest['id'];
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};
export type DemoFinanceRecord = {
  id: `demo-${string}`;
  requestId: DemoRequest['id'];
  amountNGN: number;
  status: 'AWAITING_PROCESSING' | 'PROCESSED';
};
export interface DemoSeed {
  requests: DemoRequest[];
  notifications: DemoNotification[];
  finance: DemoFinanceRecord[];
}

/** Deterministic, dated and internally reconcilable, never from real customers. */
export const DEMO_SEED: Readonly<DemoSeed> = {
  requests: [
    { id: 'demo-af-101', title: 'Five high-performance laptops', category: 'IT equipment', owner: 'Sarah', department: 'Projects', amountNGN: 4500000, status: 'APPROVED', submittedAt: '2026-11-17T09:00:00Z' },
    { id: 'demo-af-102', title: 'Network infrastructure upgrade', category: 'IT equipment', owner: 'Ife', department: 'Technology', amountNGN: 2880000, status: 'PENDING_APPROVAL', submittedAt: '2026-11-18T10:00:00Z' },
    { id: 'demo-af-103', title: 'Warehouse safety equipment', category: 'Operations', owner: 'Tomi', department: 'Operations', amountNGN: 1275000, status: 'APPROVED', submittedAt: '2026-11-15T11:30:00Z' },
    { id: 'demo-af-104', title: 'Onboarding training', category: 'Learning', owner: 'Amara', department: 'People', amountNGN: 560000, status: 'REJECTED', submittedAt: '2026-11-14T14:00:00Z' },
    { id: 'demo-af-105', title: 'Client-site mobility', category: 'Travel', owner: 'Sarah', department: 'Projects', amountNGN: 730000, status: 'PENDING_APPROVAL', submittedAt: '2026-11-19T08:45:00Z' },
    { id: 'demo-af-106', title: 'Office maintenance', category: 'Operations', owner: 'Mark', department: 'Facilities', amountNGN: 340000, status: 'PROCESSED', submittedAt: '2026-11-08T09:10:00Z' },
    { id: 'demo-af-107', title: 'Research software licenses', category: 'IT equipment', owner: 'Tomi', department: 'Technology', amountNGN: 420000, status: 'DRAFT', submittedAt: '2026-11-20T15:00:00Z' },
    { id: 'demo-af-108', title: 'Site inspection service', category: 'Operations', owner: 'Amara', department: 'Operations', amountNGN: 910000, status: 'APPROVED', submittedAt: '2026-11-16T07:00:00Z' },
  ],
  notifications: [
    { id: 'demo-n-1', requestId: 'demo-af-102', title: 'Review requested', message: 'Network infrastructure upgrade is awaiting a decision.', read: false, createdAt: '2026-11-18T10:01:00Z' },
    { id: 'demo-n-2', requestId: 'demo-af-101', title: 'Approved', message: 'The laptop procurement example was approved.', read: false, createdAt: '2026-11-17T12:15:00Z' },
    { id: 'demo-n-3', requestId: 'demo-af-105', title: 'New request', message: 'Client-site mobility is now awaiting approval.', read: true, createdAt: '2026-11-19T08:46:00Z' },
  ],
  finance: [
    { id: 'demo-f-1', requestId: 'demo-af-101', amountNGN: 4500000, status: 'AWAITING_PROCESSING' },
    { id: 'demo-f-2', requestId: 'demo-af-103', amountNGN: 1275000, status: 'AWAITING_PROCESSING' },
    { id: 'demo-f-3', requestId: 'demo-af-108', amountNGN: 910000, status: 'AWAITING_PROCESSING' },
    { id: 'demo-f-4', requestId: 'demo-af-106', amountNGN: 340000, status: 'PROCESSED' },
  ],
};

export function getDemoSummary(seed: Readonly<DemoSeed>) {
  const byStatus = (status: DemoRequestStatus) => seed.requests.filter(item => item.status === status);
  const amount = seed.requests.reduce((sum, row) => sum + row.amountNGN, 0);
  const categoryTotals = Array.from(new Set(seed.requests.map(row => row.category)))
    .map(category => ({ category, count: seed.requests.filter(row => row.category === category).length }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  return {
    requests: seed.requests.length,
    pending: byStatus('PENDING_APPROVAL').length,
    approved: byStatus('APPROVED').length,
    rejected: byStatus('REJECTED').length,
    totalAmountNGN: amount,
    unreadNotifications: seed.notifications.filter(item => !item.read).length,
    awaitingFinance: seed.finance.filter(row => row.status === 'AWAITING_PROCESSING').length,
    categoryTotals,
  };
}
