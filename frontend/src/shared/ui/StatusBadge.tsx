export type RequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

const labels: Record<RequestStatus, string> = {
  DRAFT: 'Draft', PENDING_APPROVAL: 'Pending approval', APPROVED: 'Approved', REJECTED: 'Rejected', PROCESSED: 'Processed',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`af-status af-status-${status.toLowerCase().replaceAll('_', '-')}`}>{labels[status]}</span>;
}
