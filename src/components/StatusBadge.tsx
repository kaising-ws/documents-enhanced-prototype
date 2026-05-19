import type { AssignmentStatus } from '../types';

const LABELS: Record<AssignmentStatus, string> = {
  in_progress: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STYLES: Record<AssignmentStatus, string> = {
  in_progress: 'bg-warning-100 text-warning-700 ring-warning-300',
  completed: 'bg-success-100 text-success-700 ring-success-300',
  cancelled: 'bg-ink-200 text-ink-700 ring-ink-300',
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
