import type { RequestStatus, VerificationStatus } from '../types/app';

interface StatusBadgeProps {
  status: RequestStatus | VerificationStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let label = status;
  let modifier = 'status-badge--neutral';

  switch (status) {
    case 'OPEN':
      label = 'OPEN';
      modifier = 'status-badge--open';
      break;
    case 'HELPER_OFFERED':
      label = 'HELPER RESPONDED';
      modifier = 'status-badge--offered';
      break;
    case 'IN_PROGRESS':
      label = 'IN PROGRESS';
      modifier = 'status-badge--progress';
      break;
    case 'RESOLVED':
      label = 'RESOLVED';
      modifier = 'status-badge--resolved';
      break;
    case 'CANCELLED':
      label = 'CANCELLED';
      modifier = 'status-badge--cancelled';
      break;
    case 'VERIFIED':
      label = 'VERIFIED';
      modifier = 'status-badge--resolved';
      break;
    case 'PENDING':
      label = 'PENDING VERIFICATION';
      modifier = 'status-badge--offered';
      break;
    case 'REJECTED':
      label = 'REJECTED';
      modifier = 'status-badge--cancelled';
      break;
  }

  return <span className={`status-badge ${modifier}`}>{label}</span>;
}
