import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Eye,
  FileSignature,
  FileText,
  FolderInput,
  LibraryBig,
  Plus,
  Search,
  Send,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Menu } from '../components/Menu';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useDocumentList, useDocumentTypes } from '../store/hooks';
import { store } from '../store/store';
import { formatDate, daysUntil } from '../lib/format';
import type { DocumentLifecycleStatus, DocumentWithProgress } from '../types';

const TABS: { value: DocumentLifecycleStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'pending_deletion', label: 'Trash' },
];

type SortKey = 'name' | 'type' | 'progress';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [20, 50, 100];

export function DocumentListPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as DocumentLifecycleStatus) || 'active';
  const search = params.get('q') ?? '';
  const typeFilter = params.get('type');
  const sortKey = (params.get('sortKey') as SortKey) || 'name';
  const sortDir = (params.get('sortDir') as SortDir) || 'asc';
  const page = parseInt(params.get('page') ?? '1', 10);
  const pageSize = parseInt(params.get('pageSize') ?? '20', 10);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === '') next.delete(k);
    else next.set(k, v);
    if (k !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const documents = useDocumentList(tab);
  const types = useDocumentTypes();
  const toast = useToast();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [moveTypeOpen, setMoveTypeOpen] = useState<{ ids: number[] } | null>(null);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const [createTypeName, setCreateTypeName] = useState('');
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentWithProgress | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DocumentWithProgress | null>(null);

  // filter / sort / paginate
  const visible = useMemo(() => {
    let rows = documents;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.company_document_type?.name ?? '').toLowerCase().includes(q),
      );
    }
    if (typeFilter) {
      if (typeFilter === '__none') rows = rows.filter((d) => !d.company_document_type);
      else rows = rows.filter((d) => String(d.company_document_type?.id) === typeFilter);
    }
    rows = [...rows].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === 'type') {
        av = a.company_document_type?.name?.toLowerCase() ?? '';
        bv = b.company_document_type?.name?.toLowerCase() ?? '';
      } else {
        av = a.progress.total === 0 ? -1 : a.progress.completed / a.progress.total;
        bv = b.progress.total === 0 ? -1 : b.progress.completed / b.progress.total;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [documents, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = visible.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((d) => selected.has(d.id));
  const someOnPageSelected = pageRows.some((d) => selected.has(d.id));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setParam('sortDir', sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      const next = new URLSearchParams(params);
      next.set('sortKey', key);
      next.set('sortDir', 'asc');
      next.delete('page');
      setParams(next, { replace: true });
    }
  };

  const togglePageSelection = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((d) => next.delete(d.id));
      else pageRows.forEach((d) => next.add(d.id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const onCreateType = () => {
    if (!createTypeName.trim()) return;
    const t = store.createDocumentType(createTypeName.trim());
    setCreateTypeOpen(false);
    setCreateTypeName('');
    toast.push(`Created type "${t.name}"`);
  };

  const isActive = tab === 'active';
  const isArchived = tab === 'archived';
  const isTrash = tab === 'pending_deletion';

  return (
    <div className="space-y-4">
      {/* Tabs + actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex items-center gap-2">
          {isActive && (
            <Link
              to="/documents/new"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[8px] bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              Add document
            </Link>
          )}
          <Menu
            ariaLabel="More options"
            label={
              <span className="flex items-center gap-1.5">
                Manage <ChevronDown className="w-4 h-4" />
              </span>
            }
            items={[
              { label: 'Manage document types', icon: <FolderInput className="w-4 h-4" />, onClick: () => setCreateTypeOpen(true) },
              { label: 'Template library', icon: <LibraryBig className="w-4 h-4" />, onClick: () => setTemplateLibraryOpen(true) },
            ]}
          />
        </div>
      </div>

      <div className="flex gap-1 border-b border-ink-300">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              clearSelection();
              setParam('tab', t.value === 'active' ? null : t.value);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.value
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-600 hover:text-ink-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Banners */}
      {isArchived && (
        <div className="rounded-[8px] bg-warning-100 border border-warning-300 px-4 py-2 text-sm text-warning-700">
          Archived documents can no longer be assigned. Restore to make them active again.
        </div>
      )}
      {isTrash && (
        <div className="rounded-[8px] bg-danger-100 border border-danger-300 px-4 py-2 text-sm text-danger-700">
          Documents in trash will be permanently deleted after 30 days.
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setParam('q', e.target.value)}
            className="w-full pl-9 pr-3 h-10 border border-ink-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500 bg-white"
          />
        </div>
        <select
          value={typeFilter ?? ''}
          onChange={(e) => setParam('type', e.target.value || null)}
          className="h-10 border border-ink-300 rounded-[8px] text-sm px-2 bg-white"
        >
          <option value="">All types</option>
          <option value="__none">— Untyped —</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-600 ml-auto">
          {visible.length} {visible.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="rounded-[12px] bg-brand-100 border border-brand-300 px-4 py-2.5 flex items-center gap-3">
          <span className="text-sm font-medium text-brand-700">
            {selected.size} selected
          </span>
          {isActive && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMoveTypeOpen({ ids: Array.from(selected) })}
              >
                <FolderInput className="w-4 h-4" /> Move to type
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  store.bulkArchive(Array.from(selected));
                  toast.push(`Archived ${selected.size} documents`);
                  clearSelection();
                }}
              >
                <Archive className="w-4 h-4" /> Archive
              </Button>
            </>
          )}
          <button onClick={clearSelection} className="ml-auto text-sm text-ink-700 hover:text-ink-900">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-ink-300 rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(35,39,47,0.06),0_1px_3px_rgba(35,39,47,0.1)]">
        <table className="w-full text-sm">
          <thead className="bg-ink-200 text-ink-900 border-b border-ink-300">
            <tr>
              <th className="w-10 px-3 py-3.5">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allOnPageSelected && someOnPageSelected;
                  }}
                  onChange={togglePageSelection}
                />
              </th>
              <SortHeader label="Document" active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')} className="w-[35%]" />
              <SortHeader label="Type" active={sortKey === 'type'} dir={sortDir} onClick={() => toggleSort('type')} className="w-[20%]" />
              <SortHeader label="Progress" active={sortKey === 'progress'} dir={sortDir} onClick={() => toggleSort('progress')} className="w-[25%]" />
              {isArchived && <th className="text-left font-semibold px-3 py-3.5">Archived</th>}
              {isTrash && <th className="text-left font-semibold px-3 py-3.5">Deleted on</th>}
              {isTrash && <th className="text-left font-semibold px-3 py-3.5">Expires in</th>}
              <th className="w-32 px-3 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                  No documents.
                </td>
              </tr>
            )}
            {pageRows.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                tab={tab}
                selected={selected.has(doc.id)}
                onSelect={(checked) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(doc.id);
                    else next.delete(doc.id);
                    return next;
                  })
                }
                onMoveType={() => setMoveTypeOpen({ ids: [doc.id] })}
                onPreview={() => setPreviewDoc(doc)}
                onDelete={() => setConfirmDelete(doc)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {visible.length > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-700">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setParam('pageSize', e.target.value)}
              className="border border-ink-300 rounded-[8px] h-8 px-2 bg-white"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              disabled={safePage <= 1}
              onClick={() => setParam('page', String(safePage - 1))}
              className="p-1.5 border border-ink-300 rounded-[8px] hover:bg-ink-100 disabled:opacity-30 bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setParam('page', String(safePage + 1))}
              className="p-1.5 border border-ink-300 rounded-[8px] hover:bg-ink-100 disabled:opacity-30 bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Move-to-type modal */}
      <Modal
        open={moveTypeOpen !== null}
        onClose={() => setMoveTypeOpen(null)}
        title="Move to type"
        footer={
          <Button variant="secondary" onClick={() => setMoveTypeOpen(null)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-1">
          <button
            onClick={() => {
              if (!moveTypeOpen) return;
              store.moveToType(moveTypeOpen.ids, null);
              toast.push('Moved to untyped');
              setMoveTypeOpen(null);
              clearSelection();
            }}
            className="w-full text-left px-3 py-2 rounded hover:bg-ink-100 text-sm"
          >
            — Untyped —
          </button>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (!moveTypeOpen) return;
                store.moveToType(moveTypeOpen.ids, t.id);
                toast.push(`Moved to "${t.name}"`);
                setMoveTypeOpen(null);
                clearSelection();
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-ink-100 text-sm"
            >
              {t.name}
            </button>
          ))}
        </div>
      </Modal>

      <TemplateLibraryModal
        open={templateLibraryOpen}
        onClose={() => setTemplateLibraryOpen(false)}
      />

      {/* Create type modal */}
      <Modal
        open={createTypeOpen}
        onClose={() => setCreateTypeOpen(false)}
        title="Create document type"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateTypeOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onCreateType} disabled={!createTypeName.trim()}>
              Create
            </Button>
          </>
        }
      >
        <label className="text-sm font-medium text-ink-800 block mb-1">Name</label>
        <input
          autoFocus
          value={createTypeName}
          onChange={(e) => setCreateTypeName(e.target.value)}
          placeholder="e.g. Onboarding"
          className="w-full h-10 border border-ink-300 rounded-[8px] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
        />
      </Modal>

      {/* Preview modal */}
      <Modal
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name ?? ''}
        size="lg"
      >
        <div className="bg-ink-200 rounded-[8px] aspect-[3/4] flex items-center justify-center text-ink-500 flex-col gap-3">
          <FileText className="w-16 h-16" />
          <p className="text-sm">Preview placeholder · {previewDoc?.pdf_file?.name}</p>
        </div>
      </Modal>

      {/* Confirm permanent delete */}
      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete permanently?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!confirmDelete) return;
                store.deletePermanently(confirmDelete.id);
                toast.push(`Deleted "${confirmDelete.name}"`, 'info');
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-800">
          “{confirmDelete?.name}” will be permanently removed along with all its assignment history.
        </p>
      </Modal>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className = '',
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`text-left font-semibold px-3 py-3.5 ${className}`}>
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-ink-1000">
        {label}
        {active && (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
  );
}

function DocumentRow({
  doc,
  tab,
  selected,
  onSelect,
  onMoveType,
  onPreview,
  onDelete,
}: {
  doc: DocumentWithProgress;
  tab: DocumentLifecycleStatus;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onMoveType: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const isActive = tab === 'active';
  const isArchived = tab === 'archived';
  const isTrash = tab === 'pending_deletion';

  const items = [];
  items.push({ label: 'Preview', icon: <Eye className="w-4 h-4" />, onClick: onPreview });
  items.push({
    label: 'Download',
    icon: <Download className="w-4 h-4" />,
    onClick: () => toast.push(`Downloading "${doc.name}"`, 'info'),
  });
  if (isActive) {
    items.push({
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => navigate(`/documents/${doc.id}/edit`),
    });
    items.push({
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => {
        const copy = store.duplicateDocument(doc.id);
        if (copy) toast.push(`Duplicated as "${copy.name}"`);
      },
    });
    items.push({
      label: 'Move to type',
      icon: <FolderInput className="w-4 h-4" />,
      onClick: onMoveType,
    });
    items.push({
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      onClick: () => {
        store.archiveDocument(doc.id);
        toast.push(`Archived "${doc.name}"`);
      },
      divider: true,
    });
    items.push({
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        store.scheduleDeletion(doc.id);
        toast.push(`Moved "${doc.name}" to trash`, 'info');
      },
      destructive: true,
    });
  } else if (isArchived) {
    items.push({
      label: 'Unarchive',
      icon: <ArchiveRestore className="w-4 h-4" />,
      onClick: () => {
        store.unarchiveDocument(doc.id);
        toast.push(`Restored "${doc.name}"`);
      },
    });
    items.push({ label: 'Move to type', icon: <FolderInput className="w-4 h-4" />, onClick: onMoveType });
    items.push({
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        store.scheduleDeletion(doc.id);
        toast.push(`Moved "${doc.name}" to trash`, 'info');
      },
      destructive: true,
      divider: true,
    });
  }

  return (
    <tr className="border-b border-ink-200 hover:bg-ink-100 group">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-3">
        <Link to={`/documents/${doc.id}`} className="flex items-center gap-2 group/cell">
          {doc.kind === 'upload' ? (
            <Upload className="w-4 h-4 text-ink-500 shrink-0" />
          ) : (
            <FileSignature className="w-4 h-4 text-ink-500 shrink-0" />
          )}
          <span className="text-brand-600 group-hover/cell:underline font-medium">
            {doc.name}
          </span>
        </Link>
      </td>
      <td className="px-3 py-3 text-ink-800">
        {doc.company_document_type?.name ?? <span className="text-ink-500">—</span>}
      </td>
      <td className="px-3 py-3">
        <ProgressBar progress={doc.progress} />
      </td>
      {isArchived && <td className="px-3 py-3 text-ink-800">{formatDate(doc.archived_at)}</td>}
      {isTrash && <td className="px-3 py-3 text-ink-800">{formatDate(doc.archived_at)}</td>}
      {isTrash && (
        <td className="px-3 py-3 text-ink-800">
          {doc.scheduled_deletion_at ? `${daysUntil(doc.scheduled_deletion_at)} days` : '–'}
        </td>
      )}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
          {isActive && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast.push(`Opening assign flow for "${doc.name}"`, 'info')}
            >
              <Send className="w-3.5 h-3.5" />
              Assign
            </Button>
          )}
          {isTrash ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  store.restoreDocument(doc.id);
                  toast.push(`Restored "${doc.name}"`);
                }}
              >
                <Undo2 className="w-3.5 h-3.5" /> Restore
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Menu items={items} />
          )}
        </div>
      </td>
    </tr>
  );
}

type TemplateSection =
  | 'recommended'
  | 'tax_forms'
  | 'employment_verification'
  | 'compliance'
  | 'culvers';

interface LibraryTemplate {
  id: string;
  name: string;
  description: string;
  pill: string;
  sections: TemplateSection[];
  kind: 'sign' | 'upload';
  uploadConfig?: { allowMultiple: boolean; requireFrontAndBack: boolean };
}

const LIBRARY_TEMPLATES: LibraryTemplate[] = [
  {
    id: 'i9',
    name: 'Form I-9',
    pill: 'Employment Verification',
    description:
      'Required to verify the identity and legal employment eligibility of all staff working in the United States.',
    sections: ['recommended', 'employment_verification'],
    kind: 'upload',
    uploadConfig: { allowMultiple: true, requireFrontAndBack: true },
  },
  {
    id: 'w4',
    name: 'Form W-4',
    pill: 'Tax Forms',
    description:
      "Used to calculate accurate federal income tax withholdings based on an employee's specific tax situation.",
    sections: ['recommended', 'tax_forms'],
    kind: 'sign',
  },
  {
    id: 'ca-504',
    name: 'California-Form 504',
    pill: 'Compliance',
    description:
      'Provides essential notice regarding disability non-discrimination rights and workplace accommodation eligibility.',
    sections: ['recommended', 'compliance'],
    kind: 'sign',
  },
  {
    id: 'culvers-contribution',
    name: 'Team Member Contribution & Support',
    pill: 'Performance Review',
    description:
      "Shared performance conversation where team members reflect on goals, growth, and what they value at Culver's.",
    sections: ['culvers'],
    kind: 'sign',
  },
  {
    id: 'culvers-tm-standard',
    name: 'Team Member Standard Assessment',
    pill: 'Performance Review',
    description:
      'Rate attendance, appearance, hospitality, quality of work, safety, and teamwork against role expectations.',
    sections: ['culvers'],
    kind: 'sign',
  },
  {
    id: 'culvers-leader',
    name: 'Leader Standard Assessment',
    pill: 'Performance Review',
    description:
      'Evaluate restaurant leaders on guest service, coaching, management, training, communications, HR, and cost control.',
    sections: ['culvers'],
    kind: 'sign',
  },
  {
    id: 'culvers-operations',
    name: 'Team Member Operations Assessment',
    pill: 'Performance Review',
    description:
      "Assess order accuracy, speed of service, procedural consistency, safety, hospitality, and mission alignment.",
    sections: ['culvers'],
    kind: 'sign',
  },
];

const SECTION_ORDER: TemplateSection[] = [
  'recommended',
  'tax_forms',
  'employment_verification',
  'compliance',
  'culvers',
];

const SECTION_TITLES: Record<TemplateSection, string> = {
  recommended: 'Recommended for you',
  tax_forms: 'Tax Forms',
  employment_verification: 'Employment Verification',
  compliance: 'Compliance',
  culvers: "Culver's",
};

function TemplateLibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const allDocs = useDocumentList('active');
  const toast = useToast();
  const isAdded = (name: string) => allDocs.some((d) => d.name === name);

  const handleAdd = (t: LibraryTemplate) => {
    store.createDocument({
      name: t.name,
      typeId: null,
      kind: t.kind,
      fileName: t.kind === 'sign' ? `${t.name}.pdf` : `${t.name}.upload`,
      employeeSigns: t.kind === 'sign',
      hrSigns: false,
      requireDrawnSignature: false,
      allowMultipleUploads: t.uploadConfig?.allowMultiple ?? false,
      requireFrontAndBack: t.uploadConfig?.requireFrontAndBack ?? false,
    });
    toast.push(`Added "${t.name}" from library`);
  };

  const q = query.trim().toLowerCase();
  const matches = (t: LibraryTemplate) =>
    !q ||
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.pill.toLowerCase().includes(q);
  const sectionsWithItems = SECTION_ORDER.map((s) => ({
    section: s,
    items: LIBRARY_TEMPLATES.filter((t) => t.sections.includes(s) && matches(t)),
  })).filter((g) => g.items.length > 0);

  return (
    <Modal open={open} onClose={onClose} title="Templates" size="lg">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-10 pl-9 pr-3 border border-ink-300 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
          />
        </div>

        {sectionsWithItems.length === 0 && (
          <p className="text-sm text-ink-500 text-center py-6">No templates match "{query}".</p>
        )}

        {sectionsWithItems.map(({ section, items }) => (
          <div key={section}>
            <h3 className="text-sm font-semibold text-ink-700 mb-3 inline-flex items-center gap-1">
              {SECTION_TITLES[section]}
              {section === 'recommended' && <Info className="w-3.5 h-3.5 text-ink-500" />}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((t) => (
                <TemplateCard
                  key={`${t.id}-${section}`}
                  template={t}
                  added={isAdded(t.name)}
                  onAdd={() => handleAdd(t)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function TemplateCard({
  template,
  added,
  onAdd,
}: {
  template: LibraryTemplate;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white border border-ink-300 rounded-[12px] p-4 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(35,39,47,0.06)]">
      <div className="flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-brand-500 shrink-0" />
        <span className="text-sm font-semibold text-brand-600 truncate">{template.name}</span>
      </div>
      <span className="self-start inline-flex items-center px-2 py-0.5 rounded-[4px] bg-brand-100 text-brand-700 text-xs font-medium">
        {template.pill}
      </span>
      <p className="text-sm text-ink-700 flex-1 line-clamp-3">{template.description}</p>
      <Button variant="secondary" onClick={onAdd} disabled={added}>
        {added ? (
          <>
            <Check className="w-4 h-4" /> Added
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> Add
          </>
        )}
      </Button>
    </div>
  );
}
