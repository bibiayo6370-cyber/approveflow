import { api } from '../lib/api';
import type { ApprovalRequest } from '../types/api';
import type { ReadAdapter } from '../architecture/capabilities';

/** API-backed only. Failures are allowed to surface; NEVER masquerade as demo success. */
export function createLiveRequestAdapter(token: string, scope: 'requester' | 'approver'): ReadAdapter<ApprovalRequest[]> {
  return {
    source: 'LIVE_API',
    label: scope === 'requester' ? 'My live requests' : 'Live pending approvals',
    async load() {
      const path = scope === 'requester' ? '/api/requests' : '/api/requests/pending';
      const data = await api<{ requests: ApprovalRequest[] }>(path, {}, token);
      return data.requests;
    },
  };
}
