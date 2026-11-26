import { DEMO_SEED } from './fixtures';
import type { DemoSeed } from './fixtures';

export class DemoStore {
  private data: DemoSeed = structuredClone(DEMO_SEED);
  private listeners = new Set<() => void>();
  getSnapshot = (): Readonly<DemoSeed> => this.data;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  private publish(next: DemoSeed) {
    this.data = next;
    for (const listener of this.listeners) listener();
  }
  markNotificationRead(id: string) {
    if (!id.startsWith('demo-')) return false;
    const record = this.data.notifications.find(item => item.id === id);
    if (!record) return false;
    if (!record.read) this.publish({ ...this.data, notifications: this.data.notifications.map(n => n.id === id ? { ...n, read: true } : n) });
    return true;
  }
  processFinanceRequest(id: string) {
    if (!id.startsWith('demo-')) return false;
    const record = this.data.finance.find(item => item.id === id);
    if (!record || record.status !== 'AWAITING_PROCESSING') return false;
    this.publish({ ...this.data, finance: this.data.finance.map(n => n.id === id ? { ...n, status: 'PROCESSED' } : n) });
    return true;
  }
  decideRequest(id: string, status: 'APPROVED' | 'REJECTED') {
    const record = this.data.requests.find(item => item.id === id);
    if (!id.startsWith('demo-') || !record || record.status !== 'PENDING_APPROVAL') return false;
    this.publish({ ...this.data, requests: this.data.requests.map(item => item.id === id ? { ...item, status } : item) });
    return true;
  }
  reset() { this.publish(structuredClone(DEMO_SEED)); }
}

/** No fetch, no API imports, no credentials, no external writes. */
export const demoStore = new DemoStore();
