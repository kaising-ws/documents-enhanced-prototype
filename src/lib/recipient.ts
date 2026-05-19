import type {
  Assignment,
  DocumentTemplate,
} from '../types';

const EXPIRES_SOON_DAYS = 7;

export type DocumentStatus = 'active' | 'expiring' | 'expired';

export interface RecipientRow {
  recipientId: number;
  name: string;
  jobTitle: string | null;
  role: string;
  location: string;
  /** Worker's document status, derived from their latest completed assignment.
   *  Null when no completed assignment exists (never uploaded). */
  documentStatus: DocumentStatus | null;
  documentExpiresAt: string | null;
  /** Latest completed assignment — the one that defines documentStatus. */
  latestCompleted: Assignment | null;
  /** Currently in-flight assignment (status === 'in_progress'), if any. */
  pending: Assignment | null;
  pendingOverdue: boolean;
  /** The assignment that primary actions target: pending if any, else latest completed. */
  current: Assignment | null;
  /** All assignments, newest first. Powers the drawer timeline. */
  history: Assignment[];
}

function daysUntil(iso: string): number {
  const t = new Date(iso).getTime();
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}

function deriveDocumentStatus(
  latestCompleted: Assignment | null,
  doc: DocumentTemplate,
): { status: DocumentStatus | null; expiresAt: string | null } {
  if (!latestCompleted) return { status: null, expiresAt: null };
  if (!doc.expires_after_days || !latestCompleted.expires_at) {
    return { status: 'active', expiresAt: null };
  }
  const d = daysUntil(latestCompleted.expires_at);
  if (d < 0) return { status: 'expired', expiresAt: latestCompleted.expires_at };
  if (d <= EXPIRES_SOON_DAYS) return { status: 'expiring', expiresAt: latestCompleted.expires_at };
  return { status: 'active', expiresAt: latestCompleted.expires_at };
}

export function buildRecipientRows(
  doc: DocumentTemplate,
  assignments: Assignment[],
): RecipientRow[] {
  const byRecipient = new Map<number, Assignment[]>();
  for (const a of assignments) {
    const list = byRecipient.get(a.recipient.id) ?? [];
    list.push(a);
    byRecipient.set(a.recipient.id, list);
  }

  const rows: RecipientRow[] = [];
  byRecipient.forEach((history, recipientId) => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.assigned_on).getTime() - new Date(a.assigned_on).getTime(),
    );
    const latestCompleted = sorted.find((a) => a.status === 'completed') ?? null;
    const pending = sorted.find((a) => a.status === 'in_progress') ?? null;
    const pendingOverdue = !!(
      pending && pending.due_date && daysUntil(pending.due_date) < 0
    );
    const { status: documentStatus, expiresAt } = deriveDocumentStatus(latestCompleted, doc);
    const proto = pending ?? latestCompleted ?? sorted[0];
    rows.push({
      recipientId,
      name: proto.recipient.name,
      jobTitle: proto.recipient.job_title,
      role: proto.recipient.role,
      location: proto.recipient.location,
      documentStatus,
      documentExpiresAt: expiresAt,
      latestCompleted,
      pending,
      pendingOverdue,
      current: pending ?? latestCompleted,
      history: sorted,
    });
  });

  return rows;
}

export const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  active: 'Active',
  expiring: 'Expiring soon',
  expired: 'Expired',
};

export const DOC_STATUS_PILL_CLASSES: Record<DocumentStatus, string> = {
  active: 'bg-success-100 text-success-700 ring-success-300',
  expiring: 'bg-warning-100 text-warning-700 ring-warning-300',
  expired: 'bg-danger-100 text-danger-700 ring-danger-300',
};

/** A row needs attention when a pending assignment is in flight (auto-renewal
 *  triggers when the doc expires or is within the reminder window, and a first
 *  upload also creates a pending assignment). */
export function rowNeedsAttention(r: RecipientRow): boolean {
  return r.pending !== null;
}

/** A row appears in the Completed (repository) view when the worker has a
 *  completed doc that hasn't expired. */
export function rowCompleted(r: RecipientRow): boolean {
  return r.latestCompleted !== null && r.documentStatus !== 'expired';
}

export interface ComplianceSummary {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  noDocument: number;
  pending: number;
  needsAttention: number;
  completed: number;
}

export function summarize(rows: RecipientRow[]): ComplianceSummary {
  const s: ComplianceSummary = {
    total: rows.length,
    active: 0,
    expiring: 0,
    expired: 0,
    noDocument: 0,
    pending: 0,
    needsAttention: 0,
    completed: 0,
  };
  for (const r of rows) {
    if (r.documentStatus === null) s.noDocument++;
    else if (r.documentStatus === 'active') s.active++;
    else if (r.documentStatus === 'expiring') s.expiring++;
    else if (r.documentStatus === 'expired') s.expired++;
    if (r.pending) s.pending++;
    if (rowNeedsAttention(r)) s.needsAttention++;
    if (rowCompleted(r)) s.completed++;
  }
  return s;
}
