import type { ReadAdapter, Metric } from '../architecture/capabilities';
import { demoStore } from '../demo/store';
import { getDemoSummary } from '../demo/fixtures';

export function createMockMetricsAdapter(): ReadAdapter<Metric[]> {
  return {
    source: 'DEMO_FIXTURE',
    label: 'Illustrative metrics (sample data)',
    async load() {
      const s = getDemoSummary(demoStore.getSnapshot());
      return [
        { id: 'all', label: 'Example requests', value: s.requests, unit: 'count', source: 'DEMO_FIXTURE' },
        { id: 'pending', label: 'Awaiting approval', value: s.pending, unit: 'count', source: 'DEMO_FIXTURE' },
        { id: 'approved', label: 'Approved examples', value: s.approved, unit: 'count', source: 'DEMO_FIXTURE' },
        { id: 'amount', label: 'Illustrative request value', value: s.totalAmountNGN, unit: 'NGN', source: 'DEMO_FIXTURE' },
      ];
    },
  };
}
