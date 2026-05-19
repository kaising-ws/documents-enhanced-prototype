import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Eye,
  FileSignature,
  FileText,
  FolderInput,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Menu, type MenuItem } from '../components/Menu';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useAssignments, useDocument, useDocumentTypes } from '../store/hooks';
import { store } from '../store/store';
import { formatDate } from '../lib/format';
import {
  buildRecipientRows,
  DOC_STATUS_LABELS,
  DOC_STATUS_PILL_CLASSES,
  rowCompleted,
  rowNeedsAttention,
  summarize,
  type RecipientRow,
} from '../lib/recipient';
import type { DocumentTemplate, UploadSlot, UploadSubmission } from '../types';

type Tab = 'attention' | 'completed';
type AttentionFilter = 'expired' | 'expiring' | 'no_document';

export function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const docId = parseInt(id ?? '', 10);
  const doc = useDocument(docId);
  const assignments = useAssignments(docId);
  const types = useDocumentTypes();
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('attention');
  const [chip, setChip] = useState<AttentionFilter | null>(null);
  const [search, setSearch] = useState('');
  const [drawerRowId, setDrawerRowId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [moveTypeOpen, setMoveTypeOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignText, setAssignText] = useState('');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [filterJobTitle, setFilterJobTitle] = useState<string | null>(null);
  const [filterAssigner, setFilterAssigner] = useState<string | null>(null);
  const [filterAssignedOn, setFilterAssignedOn] = useState<'7' | '30' | '90' | null>(null);
  const [filterExpiresWithin, setFilterExpiresWithin] = useState<'7' | '30' | '90' | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows = useMemo(
    () => (doc ? buildRecipientRows(doc, assignments) : []),
    [doc, assignments],
  );
  const summary = useMemo(() => summarize(rows), [rows]);
  const drawerRow = useMemo(
    () => (drawerRowId === null ? null : rows.find((r) => r.recipientId === drawerRowId) ?? null),
    [drawerRowId, rows],
  );

  const facetOptions = useMemo(() => {
    const locations = new Set<string>();
    const jobTitles = new Set<string>();
    const assigners = new Set<string>();
    for (const r of rows) {
      if (r.location && r.location !== '—') locations.add(r.location);
      if (r.jobTitle) jobTitles.add(r.jobTitle);
      if (r.current?.assigner.name) assigners.add(r.current.assigner.name);
    }
    return {
      locations: [...locations].sort(),
      jobTitles: [...jobTitles].sort(),
      assigners: [...assigners].sort(),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (tab === 'attention') out = out.filter(rowNeedsAttention);
    else if (tab === 'completed') out = out.filter(rowCompleted);
    if (chip === 'expired') out = out.filter((r) => r.documentStatus === 'expired');
    else if (chip === 'expiring') out = out.filter((r) => r.documentStatus === 'expiring');
    else if (chip === 'no_document') out = out.filter((r) => r.documentStatus === null);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (filterLocation) out = out.filter((r) => r.location === filterLocation);
    if (filterJobTitle) out = out.filter((r) => r.jobTitle === filterJobTitle);
    if (filterAssigner) out = out.filter((r) => r.current?.assigner.name === filterAssigner);
    if (filterAssignedOn) {
      const days = parseInt(filterAssignedOn, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      out = out.filter((r) => r.current && new Date(r.current.assigned_on).getTime() >= cutoff);
    }
    if (filterExpiresWithin) {
      const days = parseInt(filterExpiresWithin, 10);
      const horizon = Date.now() + days * 24 * 60 * 60 * 1000;
      out = out.filter(
        (r) => r.documentExpiresAt && new Date(r.documentExpiresAt).getTime() <= horizon,
      );
    }

    if (tab === 'completed') {
      // Sort by document expiry ascending (earliest first); never-expiring last.
      return [...out].sort((a, b) => {
        const at = a.documentExpiresAt ? new Date(a.documentExpiresAt).getTime() : null;
        const bt = b.documentExpiresAt ? new Date(b.documentExpiresAt).getTime() : null;
        if (at === bt) return 0;
        if (at === null) return 1;
        if (bt === null) return -1;
        return at - bt;
      });
    }

    // Attention sort: 1) expired before pending before rest, 2) earliest due
    // first (no-due last), 3) latest assigned first.
    const bucket = (r: RecipientRow): number => {
      if (r.documentStatus === 'expired') return 0;
      if (r.pending) return 1;
      return 2;
    };
    const dueTime = (r: RecipientRow): number | null =>
      r.pending?.due_date ? new Date(r.pending.due_date).getTime() : null;
    const assignedTime = (r: RecipientRow): number => {
      const a = r.pending ?? r.latestCompleted;
      return a ? new Date(a.assigned_on).getTime() : 0;
    };
    return [...out].sort((a, b) => {
      const bd = bucket(a) - bucket(b);
      if (bd !== 0) return bd;
      const ad = dueTime(a);
      const bdt = dueTime(b);
      if (ad !== bdt) {
        if (ad === null) return 1;
        if (bdt === null) return -1;
        return ad - bdt;
      }
      return assignedTime(b) - assignedTime(a);
    });
  }, [rows, tab, chip, search, filterLocation, filterJobTitle, filterAssigner, filterAssignedOn, filterExpiresWithin]);

  if (!doc) {
    return (
      <div className="text-center py-20 text-ink-600">
        <p>Document not found.</p>
        <Link to="/documents" className="text-brand-500 hover:underline text-sm">
          Back to documents
        </Link>
      </div>
    );
  }

  const isUpload = doc.kind === 'upload';
  const isExpiring = doc.expires_after_days !== null;
  const isArchived = doc.status === 'archived';
  const isTrash = doc.status === 'pending_deletion';

  // Single primary remind action targets all currently-pending + overdue rows.
  const remindablePending = rows.filter((r) => r.pending !== null);

  const headerMenu = [
    { label: 'Preview', icon: <Eye className="w-4 h-4" />, onClick: () => setPreviewOpen(true) },
    { label: 'Download', icon: <Download className="w-4 h-4" />, onClick: () => toast.push('Downloading…', 'info') },
    ...(doc.status === 'active'
      ? [
          { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => navigate(`/documents/${doc.id}/edit`) },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => {
              const copy = store.duplicateDocument(doc.id);
              if (copy) {
                toast.push(`Duplicated as "${copy.name}"`);
                navigate(`/documents/${copy.id}`);
              }
            },
          },
          { label: 'Move to type', icon: <FolderInput className="w-4 h-4" />, onClick: () => setMoveTypeOpen(true) },
          {
            label: 'Archive',
            icon: <Archive className="w-4 h-4" />,
            onClick: () => {
              store.archiveDocument(doc.id);
              toast.push(`Archived "${doc.name}"`);
            },
            divider: true,
          },
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => {
              store.scheduleDeletion(doc.id);
              toast.push(`Moved "${doc.name}" to trash`, 'info');
              navigate('/documents');
            },
            destructive: true,
          },
        ]
      : isArchived
      ? [
          {
            label: 'Unarchive',
            icon: <ArchiveRestore className="w-4 h-4" />,
            onClick: () => {
              store.unarchiveDocument(doc.id);
              toast.push(`Restored "${doc.name}"`);
            },
          },
        ]
      : []),
  ];

  const sendAllReminders = () => {
    const ids = remindablePending
      .map((r) => r.current?.id)
      .filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;
    store.sendReminder(doc.id, ids);
    toast.push(`Reminder sent to ${ids.length} ${ids.length === 1 ? 'recipient' : 'recipients'}`);
  };

  return (
    <div className="space-y-5">
      <Link to="/documents" className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="w-4 h-4" />
        All documents
      </Link>

      {isArchived && (
        <div className="rounded-[8px] bg-warning-100 border border-warning-300 px-4 py-2 text-sm text-warning-700">
          This document is archived and cannot be assigned.
        </div>
      )}
      {isTrash && (
        <div className="rounded-[8px] bg-danger-100 border border-danger-300 px-4 py-2 text-sm text-danger-700">
          This document is in trash. It will be permanently deleted on{' '}
          {formatDate(doc.scheduled_deletion_at)}.
        </div>
      )}

      {/* Document header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-[8px] bg-brand-100 flex items-center justify-center shrink-0">
            {isUpload ? (
              <Upload className="w-5 h-5 text-brand-500" />
            ) : (
              <FileSignature className="w-5 h-5 text-brand-500" />
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{doc.name}</h1>
              {doc.company_document_type?.name && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ink-200 text-ink-800">
                  {doc.company_document_type.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant="secondary" onClick={() => setAssignOpen(true)} disabled={doc.status !== 'active'}>
            <Plus className="w-4 h-4" /> Assign
          </Button>
          {remindablePending.length > 0 && (
            <Button variant="primary" onClick={sendAllReminders}>
              <Send className="w-4 h-4" /> Send reminders
            </Button>
          )}
          {headerMenu.length > 0 && <Menu items={headerMenu} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-300">
        <div className="flex">
          <TabButton active={tab === 'attention'} onClick={() => { setTab('attention'); setChip(null); }}>
            Needs attention
            <CountPill value={summary.needsAttention} active={tab === 'attention'} tone="danger" />
          </TabButton>
          <TabButton active={tab === 'completed'} onClick={() => { setTab('completed'); setChip(null); }}>
            Completed
            <CountPill value={summary.completed} active={tab === 'completed'} tone="neutral" />
          </TabButton>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            placeholder="Search recipients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 mb-1 border border-ink-300 rounded-[8px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Combined filter row: state quick-filters (on attention tab) + facet filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {tab === 'attention' && (
          <>
            {isExpiring && summary.expired > 0 && (
              <Chip
                active={chip === 'expired'}
                onClick={() => setChip(chip === 'expired' ? null : 'expired')}
                count={summary.expired}
                tone="danger"
              >
                Expired
              </Chip>
            )}
            {isExpiring && summary.expiring > 0 && (
              <Chip
                active={chip === 'expiring'}
                onClick={() => setChip(chip === 'expiring' ? null : 'expiring')}
                count={summary.expiring}
                tone="warning"
              >
                Expiring soon
              </Chip>
            )}
            {summary.noDocument > 0 && (
              <Chip
                active={chip === 'no_document'}
                onClick={() => setChip(chip === 'no_document' ? null : 'no_document')}
                count={summary.noDocument}
              >
                No document
              </Chip>
            )}
            <span className="w-px h-5 bg-ink-300 mx-1" aria-hidden />
          </>
        )}
        <FilterMenu
          label="Location"
          value={filterLocation}
          options={facetOptions.locations}
          onChange={setFilterLocation}
        />
        <FilterMenu
          label="Job title"
          value={filterJobTitle}
          options={facetOptions.jobTitles}
          onChange={setFilterJobTitle}
        />
        <FilterMenu
          label="Assigned by"
          value={filterAssigner}
          options={facetOptions.assigners}
          onChange={setFilterAssigner}
        />
        {tab === 'attention' && (
          <FilterMenu
            label="Assigned on"
            value={filterAssignedOn ? `Last ${filterAssignedOn} days` : null}
            options={['Last 7 days', 'Last 30 days', 'Last 90 days']}
            onChange={(v) => {
              if (v === null) setFilterAssignedOn(null);
              else if (v.includes('7')) setFilterAssignedOn('7');
              else if (v.includes('30')) setFilterAssignedOn('30');
              else if (v.includes('90')) setFilterAssignedOn('90');
            }}
          />
        )}
        {tab === 'completed' && (
          <FilterMenu
            label="Expires within"
            value={filterExpiresWithin ? `${filterExpiresWithin} days` : null}
            options={['7 days', '30 days', '90 days']}
            onChange={(v) => {
              if (v === null) setFilterExpiresWithin(null);
              else if (v.includes('7')) setFilterExpiresWithin('7');
              else if (v.includes('30')) setFilterExpiresWithin('30');
              else if (v.includes('90')) setFilterExpiresWithin('90');
            }}
          />
        )}
      </div>

      {/* Recipient table */}
      <div className="bg-white border border-ink-300 rounded-[12px] overflow-x-auto shadow-[0_1px_2px_rgba(35,39,47,0.06),0_1px_3px_rgba(35,39,47,0.1)]">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-ink-200 text-ink-900 border-b border-ink-300">
            <tr>
              <th className="w-8 px-2 py-3.5"></th>
              <th className="text-left font-semibold px-3 py-3.5">Recipient</th>
              <th className="text-left font-semibold px-3 py-3.5">Job title</th>
              <th className="text-left font-semibold px-3 py-3.5">Location</th>
              {isUpload && (
                <th className="text-left font-semibold px-3 py-3.5">Doc expires</th>
              )}
              {tab === 'attention' && (
                <>
                  <th className="text-left font-semibold px-3 py-3.5">Status</th>
                  <th className="text-left font-semibold px-3 py-3.5">Due</th>
                  <th className="text-left font-semibold px-3 py-3.5">Assigned on</th>
                </>
              )}
              {tab === 'completed' && (
                <th className="text-left font-semibold px-3 py-3.5">Completed on</th>
              )}
              <th className="text-left font-semibold px-3 py-3.5">Assigned by</th>
              <th className="text-right font-semibold px-3 py-3.5 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={
                    (isUpload ? 7 : 6) + (tab === 'attention' ? 3 : 1)
                  }
                  className="text-center py-12 text-ink-500 text-sm"
                >
                  Nobody matches this view. {tab === 'attention' && '🎉 Compliance is at 100%.'}
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <RecipientRows
                key={row.recipientId}
                row={row}
                tab={tab}
                isUpload={isUpload}
                expanded={expanded.has(row.recipientId)}
                onToggle={() => toggleExpand(row.recipientId)}
                onOpen={() => setDrawerRowId(row.recipientId)}
                onPrimaryAction={(action) => handlePrimaryAction(action, row, doc.id, toast)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer for per-recipient history */}
      <RecipientDrawer
        open={drawerRow !== null}
        row={drawerRow}
        isUpload={isUpload}
        document={doc}
        documentId={doc.id}
        onClose={() => setDrawerRowId(null)}
        onRenew={() => {
          if (drawerRow?.current) {
            const fresh = store.renewAssignment(doc.id, drawerRow.current);
            toast.push(`Renewed for ${drawerRow.name}`);
            // Keep drawer open with fresh data — close it for now since rows recompute.
            setDrawerRowId(null);
            void fresh;
          }
        }}
        onSendReminder={() => {
          if (drawerRow?.current) {
            store.sendReminder(doc.id, [drawerRow.current.id]);
            toast.push(`Reminder sent to ${drawerRow.name}`);
          }
        }}
        onCancel={() => {
          if (drawerRow?.current) {
            store.cancelAssignments(doc.id, [drawerRow.current.id]);
            toast.push(`Cancelled assignment for ${drawerRow.name}`, 'info');
            setDrawerRowId(null);
          }
        }}
        onUploadSubmitted={() => {
          if (drawerRow) toast.push(`Upload submitted for ${drawerRow.name}`);
        }}
        onNotesSaved={() => {
          if (drawerRow) toast.push(`Notes saved for ${drawerRow.name}`);
        }}
      />

      {/* Preview */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={doc.name} size="lg">
        <div className="bg-ink-200 rounded-[8px] aspect-[3/4] flex items-center justify-center text-ink-500 flex-col gap-3">
          <FileText className="w-16 h-16" />
          <p className="text-sm">Preview placeholder · {doc.pdf_file?.name}</p>
        </div>
      </Modal>

      {/* Move-to-type */}
      <Modal
        open={moveTypeOpen}
        onClose={() => setMoveTypeOpen(false)}
        title="Move to type"
        footer={
          <Button variant="secondary" onClick={() => setMoveTypeOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-1">
          <button
            onClick={() => {
              store.moveToType([doc.id], null);
              toast.push('Moved to untyped');
              setMoveTypeOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded hover:bg-ink-100 text-sm"
          >
            — Untyped —
          </button>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                store.moveToType([doc.id], t.id);
                toast.push(`Moved to "${t.name}"`);
                setMoveTypeOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-ink-100 text-sm"
            >
              {t.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Assign new */}
      <Modal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setAssignText('');
        }}
        title="Assign document"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setAssignOpen(false);
                setAssignText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!assignText.trim()}
              onClick={() => {
                const names = assignText
                  .split('\n')
                  .map((n) => n.trim())
                  .filter(Boolean);
                if (names.length === 0) return;
                store.createAssignments(
                  doc.id,
                  names.map((n) => ({
                    name: n,
                    role: 'Hourly Employee',
                    location: 'Downtown',
                    jobTitle: null,
                  })),
                );
                toast.push(`Assigned to ${names.length} ${names.length === 1 ? 'recipient' : 'recipients'}`);
                setAssignOpen(false);
                setAssignText('');
              }}
            >
              <Plus className="w-4 h-4" /> Assign
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700 mb-2">
          Enter recipient names, one per line.
        </p>
        <textarea
          value={assignText}
          onChange={(e) => setAssignText(e.target.value)}
          rows={6}
          placeholder={'Jane Cooper\nMarcus Hill\n…'}
          className="w-full p-3 border border-ink-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
        />
      </Modal>
    </div>
  );
}

type PrimaryAction = 'remind' | 'assign' | 'view' | 'cancel' | 'open';

function handlePrimaryAction(
  action: PrimaryAction,
  row: RecipientRow,
  documentId: number,
  toast: { push: (m: string, t?: 'success' | 'error' | 'info') => void },
) {
  if (action === 'remind' && row.pending) {
    store.sendReminder(documentId, [row.pending.id]);
    toast.push(`Reminder sent to ${row.name}`);
  } else if (action === 'assign') {
    if (row.latestCompleted) {
      store.renewAssignment(documentId, row.latestCompleted);
    } else {
      store.createAssignments(documentId, [{
        name: row.name,
        role: row.role,
        location: row.location,
        jobTitle: row.jobTitle,
      }]);
    }
    toast.push(`Assigned to ${row.name}`);
  } else if (action === 'view') {
    toast.push(`Opening signed copy for ${row.name}…`, 'info');
  } else if (action === 'cancel' && row.pending) {
    store.cancelAssignments(documentId, [row.pending.id]);
    toast.push(`Cancelled assignment for ${row.name}`, 'info');
  }
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
        active
          ? 'border-brand-500 text-brand-600'
          : 'border-transparent text-ink-700 hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  );
}

function CountPill({
  value,
  active,
  tone,
}: {
  value: number;
  active: boolean;
  tone: 'danger' | 'neutral';
}) {
  if (value === 0) return null;
  const cls =
    tone === 'danger' && active
      ? 'bg-danger-500 text-white'
      : tone === 'danger'
      ? 'bg-danger-100 text-danger-700'
      : active
      ? 'bg-brand-500 text-white'
      : 'bg-ink-200 text-ink-700';
  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full ${cls}`}>
      {value}
    </span>
  );
}

function Chip({
  children,
  count,
  active,
  onClick,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: 'neutral' | 'warning' | 'danger';
}) {
  const base = active
    ? tone === 'danger'
      ? 'bg-danger-500 text-white border-danger-500'
      : tone === 'warning'
      ? 'bg-warning-500 text-white border-warning-500'
      : 'bg-brand-500 text-white border-brand-500'
    : 'bg-white text-ink-900 border-ink-300 hover:bg-ink-100';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-medium ${base}`}
    >
      {children}
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full ${
          active ? 'bg-white/20 text-white' : 'bg-ink-200 text-ink-700'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const active = value !== null;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm font-medium ${
          active
            ? 'bg-brand-100 text-brand-700 border-brand-300 hover:bg-brand-100/70'
            : 'bg-white text-ink-700 border-ink-300 border-dashed hover:bg-ink-100'
        }`}
      >
        {active ? null : <Plus className="w-3.5 h-3.5" />}
        <span>{label}</span>
        {active && (
          <>
            <span className="text-ink-400">·</span>
            <span className="text-ink-900">{value}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="ml-0.5 -mr-1 p-0.5 rounded hover:bg-brand-300/40"
              aria-label={`Clear ${label}`}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          </>
        )}
        {!active && <ChevronDown className="w-3.5 h-3.5 text-ink-500" />}
      </button>
      {open && options.length > 0 && (
        <div className="absolute left-0 z-30 mt-1 w-56 rounded-[12px] border border-ink-300 bg-white shadow-[0_2px_2px_rgba(35,39,47,0.08),0_4px_8px_rgba(35,39,47,0.12)] py-1.5 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt === value ? null : opt);
                setOpen(false);
              }}
              className={`w-full text-left flex items-center justify-between gap-2.5 px-3 py-2 text-sm font-medium hover:bg-ink-100 ${
                opt === value ? 'text-brand-700' : 'text-ink-900'
              }`}
            >
              <span className="truncate">{opt}</span>
              {opt === value && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
      {open && options.length === 0 && (
        <div className="absolute left-0 z-30 mt-1 w-56 rounded-[12px] border border-ink-300 bg-white shadow-[0_2px_2px_rgba(35,39,47,0.08),0_4px_8px_rgba(35,39,47,0.12)] px-3 py-2.5 text-sm text-ink-500">
          No options
        </div>
      )}
    </div>
  );
}

function RecipientRows({
  row,
  tab,
  isUpload,
  expanded,
  onToggle,
  onOpen,
  onPrimaryAction,
}: {
  row: RecipientRow;
  tab: Tab;
  isUpload: boolean;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onPrimaryAction: (action: PrimaryAction) => void;
}) {
  const expandable = row.history.length > 1;
  const menuItems = pickRowMenuItems(row, tab, onPrimaryAction);
  // Parent row takes its values from the most-current assignment (pending if any, else latest completed).
  const primary = row.pending ?? row.latestCompleted;
  const expiringSoon = row.documentStatus === 'expiring';

  return (
    <>
      <tr
        className="border-b border-ink-200 hover:bg-ink-100 cursor-pointer"
        onClick={onOpen}
      >
        <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
          {expandable && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={expanded ? 'Collapse history' : 'Expand history'}
              className="p-1 rounded hover:bg-ink-200 text-ink-600"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </td>
        <td className="px-3 py-3 font-semibold text-ink-1000 whitespace-nowrap">{row.name}</td>
        <td className="px-3 py-3 text-ink-700 whitespace-nowrap">{row.jobTitle ?? '—'}</td>
        <td className="px-3 py-3 text-ink-700 whitespace-nowrap">{row.location || '—'}</td>
        {isUpload && (
          <td className="px-3 py-3 text-ink-700 whitespace-nowrap">
            {row.documentExpiresAt ? (
              <span className="inline-flex items-center gap-2">
                {tab === 'completed' && expiringSoon && (
                  <span className="w-2 h-2 rounded-full bg-warning-500" aria-label="Expiring soon" />
                )}
                {formatDate(row.documentExpiresAt)}
              </span>
            ) : '—'}
          </td>
        )}
        {tab === 'attention' && (
          <>
            <td className="px-3 py-3"><AssignmentPill row={row} /></td>
            <td className="px-3 py-3"><DueCell iso={row.pending?.due_date ?? null} /></td>
            <td className="px-3 py-3 text-ink-700 whitespace-nowrap">
              {primary?.assigned_on ? formatDate(primary.assigned_on) : '—'}
            </td>
          </>
        )}
        {tab === 'completed' && (
          <td className="px-3 py-3 text-ink-700 whitespace-nowrap">
            {row.latestCompleted?.completed_at ? formatDate(row.latestCompleted.completed_at) : '—'}
          </td>
        )}
        <td className="px-3 py-3 text-ink-700 whitespace-nowrap">
          {primary?.assigner.name ?? '—'}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Menu items={menuItems} ariaLabel={`Actions for ${row.name}`} size="sm" />
          </div>
        </td>
      </tr>
      {expanded && expandable && row.history.map((a) => (
        <SubRow key={a.id} assignment={a} tab={tab} isUpload={isUpload} />
      ))}
    </>
  );
}

function pickRowMenuItems(
  row: RecipientRow,
  tab: Tab,
  onAction: (action: PrimaryAction) => void,
): MenuItem[] {
  const items: MenuItem[] = [];
  if (tab === 'completed') {
    items.push({
      label: 'View document',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onAction('view'),
    });
    items.push({
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: () => onAction('view'),
    });
    items.push({
      label: 'Reassign',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => onAction('assign'),
    });
    return items;
  }
  if (row.pending) {
    items.push({
      label: 'Send reminder',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => onAction('remind'),
    });
    items.push({
      label: 'Cancel assignment',
      icon: <X className="w-4 h-4" />,
      onClick: () => onAction('cancel'),
      destructive: true,
    });
    return items;
  }
  items.push({
    label: 'Assign',
    icon: <Plus className="w-4 h-4" />,
    onClick: () => onAction('assign'),
  });
  return items;
}

function DocPill({ status }: { status: 'active' | 'expiring' | 'expired' | null }) {
  if (status === null) return <span className="text-ink-500">—</span>;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${DOC_STATUS_PILL_CLASSES[status]}`}
    >
      {DOC_STATUS_LABELS[status]}
    </span>
  );
}

function AssignmentPill({ row }: { row: RecipientRow }) {
  if (row.pending) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-warning-100 text-warning-700 ring-warning-300">
        Pending
      </span>
    );
  }
  if (row.latestCompleted) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-success-100 text-success-700 ring-success-300">
        Completed
      </span>
    );
  }
  return <span className="text-ink-500">—</span>;
}

function formatDue(iso: string): { label: string; isPast: boolean } {
  const t = new Date(iso).getTime();
  const days = Math.round((t - Date.now()) / 86_400_000);
  if (days === 0) return { label: 'Today', isPast: false };
  if (days === -1) return { label: 'Yesterday', isPast: true };
  if (days === 1) return { label: 'Tomorrow', isPast: false };
  if (days < 0 && days >= -14) return { label: `${-days} days ago`, isPast: true };
  if (days > 0 && days <= 14) return { label: `In ${days} days`, isPast: false };
  return { label: formatDate(iso), isPast: days < 0 };
}

function DueCell({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-ink-500">—</span>;
  const { label, isPast } = formatDue(iso);
  return (
    <span className={`whitespace-nowrap ${isPast ? 'text-danger-700 font-medium' : 'text-ink-700'}`}>
      {label}
    </span>
  );
}

function SubRow({
  assignment: a,
  tab,
  isUpload,
}: {
  assignment: import('../types').Assignment;
  tab: Tab;
  isUpload: boolean;
}) {
  const isCompleted = a.status === 'completed';
  const isCancelled = a.status === 'cancelled';
  const isPending = a.status === 'in_progress';

  let assignmentPill: React.ReactNode;
  if (isPending) {
    assignmentPill = (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-warning-100 text-warning-700 ring-warning-300">
        Pending
      </span>
    );
  } else if (isCompleted) {
    assignmentPill = (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-success-100 text-success-700 ring-success-300">
        Completed
      </span>
    );
  } else if (isCancelled) {
    assignmentPill = (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-ink-200 text-ink-700 ring-ink-300">
        Cancelled
      </span>
    );
  }

  return (
    <tr className="border-b border-ink-200 bg-ink-100/40 text-ink-700">
      <td className="px-2 py-2.5"></td>
      <td className="px-3 py-2.5 text-xs text-ink-500" colSpan={3}>
        ↳ assignment
      </td>
      {isUpload && (
        <td className="px-3 py-2.5 whitespace-nowrap">
          {a.expires_at ? formatDate(a.expires_at) : '—'}
        </td>
      )}
      {tab === 'attention' && (
        <>
          <td className="px-3 py-2.5">{assignmentPill}</td>
          <td className="px-3 py-2.5"><DueCell iso={a.due_date} /></td>
          <td className="px-3 py-2.5 whitespace-nowrap">{formatDate(a.assigned_on)}</td>
        </>
      )}
      {tab === 'completed' && (
        <td className="px-3 py-2.5 whitespace-nowrap">
          {a.completed_at ? formatDate(a.completed_at) : '—'}
        </td>
      )}
      <td className="px-3 py-2.5 whitespace-nowrap">{a.assigner.name}</td>
      <td className="px-3 py-2.5"></td>
    </tr>
  );
}

function RecipientDrawer({
  open,
  row,
  isUpload,
  document: doc,
  documentId,
  onClose,
  onRenew,
  onSendReminder,
  onCancel,
  onUploadSubmitted,
  onNotesSaved,
}: {
  open: boolean;
  row: RecipientRow | null;
  isUpload: boolean;
  document: DocumentTemplate;
  documentId: number;
  onClose: () => void;
  onRenew: () => void;
  onSendReminder: () => void;
  onCancel: () => void;
  onUploadSubmitted: () => void;
  onNotesSaved: () => void;
}) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const toast = useToast();
  if (!open || !row) return null;
  const events = buildTimeline(row, isUpload);
  const submission = row.latestCompleted?.upload_submission;
  const completedSorted = [...row.history]
    .filter((a): a is import('../types').Assignment & { completed_at: string } =>
      a.status === 'completed' && !!a.completed_at,
    )
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  const pastUploads = isUpload
    ? completedSorted.filter((a) => a.id !== row.latestCompleted?.id)
    : [];
  const signedCopies = isUpload ? [] : completedSorted;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-1000/20" />
      <aside
        className="absolute top-0 right-0 h-full w-[420px] bg-white shadow-[0_4px_8px_rgba(35,39,47,0.12)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-ink-300 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-base font-bold truncate">{row.name}</div>
            <div className="text-xs text-ink-600 truncate">
              {row.jobTitle ?? '—'} · {row.role} · {row.location}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100" aria-label="Close">
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-ink-200 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {row.documentStatus ? (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${DOC_STATUS_PILL_CLASSES[row.documentStatus]}`}
              >
                {DOC_STATUS_LABELS[row.documentStatus]}
              </span>
            ) : (
              <span className="text-xs text-ink-500">No document</span>
            )}
            {row.pending && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ink-200 text-ink-800">
                {row.pendingOverdue ? 'Pending · overdue' : 'Pending'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.pending && isUpload && (
              <Button variant="primary" size="sm" onClick={() => setSubmitOpen(true)}>
                <Upload className="w-3.5 h-3.5" /> Submit upload
              </Button>
            )}
            {row.pending && !isUpload && (
              <Button variant="primary" size="sm" onClick={onSendReminder}>
                <Bell className="w-3.5 h-3.5" /> Remind
              </Button>
            )}
            {row.pending && isUpload && (
              <Button variant="secondary" size="sm" onClick={onSendReminder}>
                <Bell className="w-3.5 h-3.5" /> Remind
              </Button>
            )}
            {!row.pending && row.documentStatus !== 'active' && (
              <Button
                variant={row.documentStatus === 'expired' || row.documentStatus === null ? 'primary' : 'secondary'}
                size="sm"
                onClick={onRenew}
              >
                <Plus className="w-3.5 h-3.5" /> Assign
              </Button>
            )}
            {row.pending && (
              <Button variant="secondary" size="sm" onClick={onCancel}>
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {isUpload && submission && row.latestCompleted && (
            <SubmissionPanel
              assignmentId={row.latestCompleted.id}
              submission={submission}
              documentId={documentId}
              onSaved={onNotesSaved}
            />
          )}

          {!isUpload && signedCopies.length > 0 && (
            <SignedCopiesSection
              assignments={signedCopies}
              onDownload={() => toast.push('Downloading…', 'info')}
            />
          )}

          {isUpload && pastUploads.length > 0 && (
            <PastUploadsSection assignments={pastUploads} />
          )}

          <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-3">
            History
          </h3>
          {events.length === 0 ? (
            <p className="text-sm text-ink-500">No history — this recipient hasn't been assigned yet.</p>
          ) : (
            <ol className="relative border-l border-ink-300 ml-2 space-y-4 pl-5">
              {events.map((e, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[26px] top-0.5 w-3 h-3 rounded-full ${e.dotClass} ring-2 ring-white`} />
                  <div className="text-sm font-medium text-ink-1000">{e.label}</div>
                  <div className="text-xs text-ink-600 mt-0.5">{e.detail}</div>
                </li>
              ))}
            </ol>
          )}
          </div>
        </div>
      </aside>

      {row.pending && (
        <SubmitUploadModal
          open={submitOpen}
          recipientName={row.name}
          document={doc}
          documentId={documentId}
          assignmentId={row.pending.id}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={() => {
            setSubmitOpen(false);
            onUploadSubmitted();
          }}
        />
      )}
    </div>
  );
}

function SubmissionPanel({
  assignmentId,
  submission,
  documentId,
  onSaved,
}: {
  assignmentId: number;
  submission: UploadSubmission;
  documentId: number;
  onSaved: () => void;
}) {
  const sub = submission;
  const [notes, setNotes] = useState(sub.manager_notes ?? '');
  const dirty = (sub.manager_notes ?? '') !== notes;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-3">
        Submission
      </h3>
      <div className="rounded-[8px] border border-ink-300 p-3 space-y-3 bg-ink-100/40">
        {sub.files.map((slot, i) => (
          <div
            key={i}
            className={
              i > 0
                ? 'pt-3 border-t border-ink-200 space-y-1.5'
                : 'space-y-1.5'
            }
          >
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="truncate font-medium">{slot.name}</span>
            </div>
            <div className="text-xs text-ink-600 ml-6">
              {slot.back ? (
                <>
                  <span className="truncate">Front: {slot.front.name}</span>
                  <span className="mx-1">·</span>
                  <span className="truncate">Back: {slot.back.name}</span>
                </>
              ) : (
                <span className="truncate">{slot.front.name}</span>
              )}
            </div>
            <SubmissionField label="Document number" value={slot.document_number} />
            <SubmissionField
              label="Expiration date"
              value={slot.expiration_date ? formatDate(slot.expiration_date) : '—'}
            />
          </div>
        ))}
        <div className="border-t border-ink-200 pt-2">
          <SubmissionField label="Submitted" value={formatDate(sub.submitted_at)} />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-600 block mb-1.5">
          Manager notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note (e.g. minor schedule restrictions, conditions)…"
          rows={3}
          className="w-full border border-ink-300 rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500 resize-y"
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              store.setManagerNotes(documentId, assignmentId, notes);
              onSaved();
            }}
            disabled={!dirty}
          >
            Save notes
          </Button>
        </div>
      </div>
    </div>
  );
}

function SignedCopiesSection({
  assignments,
  onDownload,
}: {
  assignments: Array<import('../types').Assignment & { completed_at: string }>;
  onDownload: () => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-3">
        Signed copies
      </h3>
      <ul className="space-y-2">
        {assignments.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between gap-3 border border-ink-300 rounded-[8px] px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Signed {formatDate(a.completed_at)}</div>
              <div className="text-xs text-ink-600 truncate">by {a.recipient.name}</div>
            </div>
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PastUploadsSection({
  assignments,
}: {
  assignments: Array<import('../types').Assignment & { completed_at: string }>;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-3">
        Past submissions
      </h3>
      <ul className="space-y-2">
        {assignments.map((a) => {
          const sub = a.upload_submission;
          return (
            <li key={a.id} className="border border-ink-300 rounded-[8px] px-3 py-2 space-y-1.5">
              <div className="text-sm font-medium">Uploaded {formatDate(a.completed_at)}</div>
              {sub ? (
                sub.files.map((slot, i) => (
                  <div key={i} className="text-xs text-ink-700">
                    <div className="font-medium text-ink-900">{slot.name}</div>
                    <div className="flex flex-wrap gap-x-2 ml-1">
                      <a
                        href={slot.front.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> {slot.front.name}
                      </a>
                      {slot.back && (
                        <a
                          href={slot.back.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> {slot.back.name}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-ink-500">No files attached.</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SubmissionField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-ink-600">{label}</span>
      <span className="text-ink-1000 font-medium text-right truncate">{value}</span>
    </div>
  );
}

interface DraftFile {
  name: string;
  url: string;
}

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|heic|heif)$/i;
const isImageName = (n: string) => IMAGE_EXT_RE.test(n);

function FileSlot({
  label,
  hint,
  file,
  onPick,
  error,
}: {
  label?: string;
  hint?: string;
  file: DraftFile | null;
  onPick: (file: DraftFile | null) => void;
  error?: string;
}) {
  return (
    <div>
      {label && (
        <div className="text-xs font-medium text-ink-700 mb-1">
          {label}
          {hint && <span className="text-ink-500 font-normal"> · {hint}</span>}
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-3 border border-ink-300 rounded-[8px] px-3 py-2">
          {isImageName(file.name) ? (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="block w-12 h-12 rounded-[4px] overflow-hidden bg-ink-200 shrink-0"
              title="Open preview"
            >
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="w-12 h-12 rounded-[4px] bg-ink-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-brand-500" />
            </div>
          )}
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <button onClick={() => onPick(null)} className="text-xs text-ink-600 hover:text-ink-900">
            Replace
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-ink-300 rounded-[8px] text-sm text-ink-600 cursor-pointer hover:border-brand-300 hover:bg-brand-100/40">
          <Upload className="w-4 h-4" />
          <span>Click to upload (mock)</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.heic"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick({ name: f.name, url: URL.createObjectURL(f) });
            }}
          />
        </label>
      )}
      {error && <p className="text-sm text-danger-500 mt-1">{error}</p>}
    </div>
  );
}

interface DraftSlot {
  name: string;
  front: DraftFile | null;
  back: DraftFile | null;
  documentNumber: string;
  expirationDate: string;
  showBack: boolean;
}

const MAX_UPLOADS = 3;

function defaultSlotName(docName: string, index: number, multi: boolean): string {
  return multi ? `${docName} (${index + 1})` : docName;
}

function newSlot(docName: string, index: number, multi: boolean): DraftSlot {
  return {
    name: defaultSlotName(docName, index, multi),
    front: null,
    back: null,
    documentNumber: '',
    expirationDate: '',
    showBack: false,
  };
}

export interface UploadDocSpec {
  name: string;
  upload_config: {
    allow_multiple_uploads: boolean;
    require_front_and_back: boolean;
  };
}

export function SubmitUploadModal({
  open,
  recipientName,
  document: doc,
  documentId,
  assignmentId,
  preview = false,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  recipientName: string;
  document: UploadDocSpec;
  documentId: number;
  assignmentId: number;
  preview?: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { allow_multiple_uploads: allowMultiple, require_front_and_back: needBack } =
    doc.upload_config;
  const max = allowMultiple ? MAX_UPLOADS : 1;
  const [slots, setSlots] = useState<DraftSlot[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setSlots([newSlot(doc.name, 0, allowMultiple)]);
      setTouched(false);
    }
  }, [open, doc.name, allowMultiple]);

  const updateSlot = (i: number, patch: Partial<DraftSlot>) =>
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)));

  const addSlot = () => setSlots((s) => [...s, newSlot(doc.name, s.length, true)]);

  const removeSlot = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i));

  const errors: Record<string, string> = {};
  slots.forEach((slot, i) => {
    if (!slot.front) errors[`slot-${i}-front`] = 'File required.';
    if (needBack && !slot.back) errors[`slot-${i}-back`] = 'Back required.';
    if (!slot.documentNumber.trim()) errors[`slot-${i}-num`] = 'Document number is required.';
  });

  const showError = (k: string) => touched && errors[k];

  const handleSubmit = () => {
    if (preview) {
      onClose();
      return;
    }
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    const files: UploadSlot[] = slots.map((slot) => ({
      name: slot.name.trim() || doc.name,
      front: { url: slot.front!.url, name: slot.front!.name },
      back: slot.back ? { url: slot.back.url, name: slot.back.name } : null,
      document_number: slot.documentNumber.trim(),
      expiration_date: slot.expirationDate || null,
    }));
    store.submitUpload(documentId, assignmentId, { files });
    onSubmitted();
  };

  const showRename = allowMultiple;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={preview ? 'Preview · what the team member sees' : `Submit upload for ${recipientName}`}
      footer={
        preview ? (
          <Button variant="secondary" onClick={onClose}>
            Close preview
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {slots.map((slot, i) => (
          <div key={i} className="border border-ink-300 rounded-[8px] p-3 space-y-3">
            {showRename ? (
              <div className="flex items-center gap-2">
                <input
                  value={slot.name}
                  onChange={(e) => updateSlot(i, { name: e.target.value })}
                  className="flex-1 h-9 border border-ink-300 rounded-[8px] px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
                />
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(i)}
                    className="p-1.5 rounded hover:bg-ink-100 text-ink-600"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm font-medium text-ink-800">{slot.name}</div>
            )}

            <FileSlot
              label="Front"
              file={slot.front}
              onPick={(file) => updateSlot(i, { front: file })}
              error={showError(`slot-${i}-front`) ? errors[`slot-${i}-front`] : undefined}
            />
            {needBack || slot.showBack || slot.back ? (
              <FileSlot
                label="Back"
                hint={needBack ? undefined : 'optional'}
                file={slot.back}
                onPick={(file) => updateSlot(i, { back: file })}
                error={showError(`slot-${i}-back`) ? errors[`slot-${i}-back`] : undefined}
              />
            ) : (
              <button
                onClick={() => updateSlot(i, { showBack: true })}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Upload back (optional)
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-ink-700 block mb-1">
                  Document number <span className="text-danger-500">*</span>
                </label>
                <input
                  value={slot.documentNumber}
                  onChange={(e) => updateSlot(i, { documentNumber: e.target.value })}
                  placeholder="e.g. FH-12345678"
                  className="w-full h-9 border border-ink-300 rounded-[8px] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
                />
                {showError(`slot-${i}-num`) && (
                  <p className="text-xs text-danger-500 mt-1">{errors[`slot-${i}-num`]}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700 block mb-1">
                  Expiration date
                </label>
                <input
                  type="date"
                  value={slot.expirationDate}
                  onChange={(e) => updateSlot(i, { expirationDate: e.target.value })}
                  className="w-full h-9 border border-ink-300 rounded-[8px] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        ))}

        {slots.length < max && (
          <button
            onClick={addSlot}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add another document
          </button>
        )}
      </div>
    </Modal>
  );
}

interface TimelineEvent {
  label: string;
  detail: string;
  dotClass: string;
  at: number;
}

function buildTimeline(row: RecipientRow, isUpload: boolean): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  // Walk from oldest to newest assignment, emit events.
  const sorted = [...row.history].sort(
    (a, b) => new Date(a.assigned_on).getTime() - new Date(b.assigned_on).getTime(),
  );
  sorted.forEach((a) => {
    events.push({
      label: 'Assigned',
      detail: `${formatDate(a.assigned_on)} by ${a.assigner.name}`,
      dotClass: 'bg-brand-500',
      at: new Date(a.assigned_on).getTime(),
    });
    if (a.last_reminder_at && a.reminders_sent > 0) {
      events.push({
        label: `${a.reminders_sent} reminder${a.reminders_sent === 1 ? '' : 's'} sent`,
        detail: `Last on ${formatDate(a.last_reminder_at)}`,
        dotClass: 'bg-warning-500',
        at: new Date(a.last_reminder_at).getTime(),
      });
    }
    if (a.completed_at) {
      events.push({
        label: isUpload ? 'Uploaded' : 'Signed',
        detail: formatDate(a.completed_at),
        dotClass: 'bg-success-500',
        at: new Date(a.completed_at).getTime(),
      });
    }
    if (a.expires_at) {
      const expired = new Date(a.expires_at).getTime() < Date.now();
      events.push({
        label: expired ? 'Expired' : 'Expires',
        detail: formatDate(a.expires_at),
        dotClass: expired ? 'bg-danger-500' : 'bg-ink-400',
        at: new Date(a.expires_at).getTime(),
      });
    }
    if (a.status === 'cancelled') {
      events.push({
        label: 'Cancelled',
        detail: '—',
        dotClass: 'bg-ink-400',
        at: new Date(a.assigned_on).getTime() + 1,
      });
    }
  });
  return events.sort((a, b) => a.at - b.at);
}
