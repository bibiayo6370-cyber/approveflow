import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../shared/theme/ThemeProvider';
import { ThemeToggle } from '../shared/theme/ThemeToggle';
import { getStoredTheme, THEME_STORAGE_KEY } from '../shared/theme/theme';
import { CAPABILITIES } from '../architecture/capabilities';
import { DEMO_SEED, getDemoSummary } from '../demo/fixtures';
import { DemoStore } from '../demo/store';
import { createMockMetricsAdapter } from '../adapters/mockInsights';

// Local-only tests: no database, credentials, login fixtures or hosted writes.
describe('P0 foundations', () => {
  it('chooses light mode until a user explicitly requests dark mode', () => {
    expect(getStoredTheme(null)).toBe('light');
    expect(getStoredTheme(undefined)).toBe('light');
    expect(getStoredTheme('anything else')).toBe('light');
    expect(getStoredTheme('dark')).toBe('dark');
  });

  it('toggles and persists the explicit theme choice', async () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe('light');
    await userEvent.setup().click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    await userEvent.setup().click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('uses distinct, correctly sourced capability declarations', () => {
    const ids = CAPABILITIES.map(feature => feature.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CAPABILITIES.filter(feature => feature.capability === 'LIVE_MVP').every(feature => feature.source === 'LIVE_API')).toBe(true);
    expect(CAPABILITIES.filter(feature => feature.source === 'DEMO_FIXTURE').every(feature => !feature.route)).toBe(true);
  });

  it('reconciles illustrative dashboard totals to its deterministic request list', () => {
    const summary = getDemoSummary(DEMO_SEED);
    expect(summary.requests).toBe(DEMO_SEED.requests.length);
    expect(summary.categoryTotals.reduce((total, category) => total + category.count, 0)).toBe(summary.requests);
    expect(summary.totalAmountNGN).toBe(DEMO_SEED.requests.reduce((total, request) => total + request.amountNGN, 0));
    expect(DEMO_SEED.requests.every(request => request.id.startsWith('demo-'))).toBe(true);
    expect(DEMO_SEED.notifications.every(item => DEMO_SEED.requests.some(request => request.id === item.requestId))).toBe(true);
    expect(DEMO_SEED.finance.every(item => DEMO_SEED.requests.some(request => request.id === item.requestId && request.amountNGN === item.amountNGN))).toBe(true);
  });

  it('keeps mock notifications and finance state entirely away from fetch/API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => { throw new Error('Mock data must not call fetch.'); });
    try {
      const store = new DemoStore();
      expect(store.markNotificationRead('demo-n-1')).toBe(true);
      expect(store.getSnapshot().notifications.find(item => item.id === 'demo-n-1')?.read).toBe(true);
      expect(store.processFinanceRequest('demo-f-1')).toBe(true);
      expect(store.getSnapshot().finance.find(item => item.id === 'demo-f-1')?.status).toBe('PROCESSED');
      expect(store.processFinanceRequest('live-request-id')).toBe(false);
      const metrics = await createMockMetricsAdapter().load();
      expect(metrics.every(m => m.source === 'DEMO_FIXTURE')).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
      store.reset();
      expect(store.getSnapshot().notifications.find(item => item.id === 'demo-n-1')?.read).toBe(false);
      expect(store.getSnapshot().finance.find(item => item.id === 'demo-f-1')?.status).toBe('AWAITING_PROCESSING');
    } finally { fetchSpy.mockRestore(); }
  });
});
