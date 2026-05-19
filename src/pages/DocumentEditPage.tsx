import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileSignature, FileText, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useDocument, useDocumentTypes } from '../store/hooks';
import { store } from '../store/store';
import { SubmitUploadModal } from './DocumentDetailsPage';
import type { DocumentKind } from '../types';

export function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const editingId = id ? parseInt(id, 10) : null;
  const isEdit = editingId !== null;
  const existing = useDocument(editingId ?? -1);
  const types = useDocumentTypes();
  const navigate = useNavigate();
  const toast = useToast();

  const [kind, setKind] = useState<DocumentKind>('sign');
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [employeeSigns, setEmployeeSigns] = useState(true);
  const [hrSigns, setHrSigns] = useState(false);
  const [requireDrawn, setRequireDrawn] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [requireFrontAndBack, setRequireFrontAndBack] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isEdit && existing) {
      setKind(existing.kind);
      setName(existing.name);
      setTypeId(existing.company_document_type?.id ?? null);
      setFileName(existing.pdf_file?.name ?? null);
      setEmployeeSigns(
        existing.signer_groups.some((g) => g.group_type === 'employee_sign_company_document'),
      );
      setHrSigns(existing.signer_groups.some((g) => g.group_type === 'hr_sign_company_document'));
      setRequireDrawn(existing.signing_options.require_drawn_signature);
      setAllowMultiple(existing.upload_config.allow_multiple_uploads);
      setRequireFrontAndBack(existing.upload_config.require_front_and_back);
    }
  }, [isEdit, existing]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Document name is required.';
    if (kind === 'sign') {
      if (!fileName) e.file = 'Please upload a document.';
      if (!employeeSigns && !hrSigns) e.signers = 'Select at least one signer.';
    }
    return e;
  }, [name, kind, fileName, employeeSigns, hrSigns]);

  if (isEdit && existing === undefined) {
    return (
      <div className="text-center py-20 text-ink-600">
        <p>Document not found.</p>
        <Link to="/documents" className="text-brand-500 hover:underline text-sm">
          Back to documents
        </Link>
      </div>
    );
  }

  const handleSubmit = () => {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    if (isEdit && editingId !== null) {
      store.updateDocument(editingId, {
        name: name.trim(),
        typeId,
        employeeSigns: kind === 'sign' ? employeeSigns : undefined,
        hrSigns: kind === 'sign' ? hrSigns : undefined,
        requireDrawnSignature: kind === 'sign' ? requireDrawn : undefined,
        allowMultipleUploads: kind === 'upload' ? allowMultiple : undefined,
        requireFrontAndBack: kind === 'upload' ? requireFrontAndBack : undefined,
      });
      toast.push(`Saved "${name.trim()}"`);
      navigate(`/documents/${editingId}`);
    } else {
      const doc = store.createDocument({
        name: name.trim(),
        typeId,
        kind,
        fileName: kind === 'sign' ? fileName ?? `${name.trim()}.pdf` : `${name.trim()}.upload`,
        employeeSigns: kind === 'sign' ? employeeSigns : false,
        hrSigns: kind === 'sign' ? hrSigns : false,
        requireDrawnSignature: kind === 'sign' ? requireDrawn : false,
        allowMultipleUploads: kind === 'upload' ? allowMultiple : undefined,
        requireFrontAndBack: kind === 'upload' ? requireFrontAndBack : undefined,
      });
      toast.push(`Created "${doc.name}"`);
      navigate(`/documents/${doc.id}`);
    }
  };

  const showError = (key: string) => touched && errors[key];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to={isEdit ? `/documents/${editingId}` : '/documents'} className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="w-4 h-4" />
        {isEdit ? 'Back to document' : 'All documents'}
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit document' : 'Add document'}</h1>
        {kind === 'upload' && (
          <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
        )}
      </div>

      <div className="bg-white border border-ink-300 rounded-[12px] p-6 space-y-5 shadow-[0_1px_2px_rgba(35,39,47,0.06),0_1px_3px_rgba(35,39,47,0.1)]">
        {!isEdit && (
          <div>
            <h3 className="text-sm font-medium text-ink-800 mb-2">What are you collecting?</h3>
            <div className="grid grid-cols-2 gap-3">
              <KindCard
                selected={kind === 'sign'}
                onClick={() => setKind('sign')}
                icon={<FileSignature className="w-5 h-5" />}
                title="Sign"
                desc="Team member signs a company document (handbook, policy)."
              />
              <KindCard
                selected={kind === 'upload'}
                onClick={() => setKind('upload')}
                icon={<Upload className="w-5 h-5" />}
                title="Upload"
                desc="Team member uploads their own document (ID, permit, certificate)."
              />
            </div>
          </div>
        )}

        <Field label="Document name" required error={showError('name') ? errors.name : undefined}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              kind === 'upload' ? 'e.g. Food Handler’s Permit' : 'e.g. Employee Handbook 2026'
            }
            className="w-full h-10 border border-ink-300 rounded-[8px] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/40 focus:border-brand-500"
          />
        </Field>

        <Field label="Document type">
          <select
            value={typeId ?? ''}
            onChange={(e) => setTypeId(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            className="w-full h-10 border border-ink-300 rounded-[8px] px-2 text-sm bg-white"
          >
            <option value="">— Untyped —</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        {kind === 'sign' ? (
          <>
            <Field label="Document file" required error={showError('file') ? errors.file : undefined}>
              <FileDrop fileName={fileName} onPickFile={(name) => setFileName(name)} />
            </Field>

            <div>
              <h3 className="text-sm font-semibold text-ink-800 mb-2">Signers</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={employeeSigns} onChange={(e) => setEmployeeSigns(e.target.checked)} />
                  Team members (employees) sign
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={hrSigns} onChange={(e) => setHrSigns(e.target.checked)} />
                  Company (HR) signs
                </label>
                {showError('signers') && <p className="text-sm text-danger-500">{errors.signers}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink-800 mb-2">Signing options</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={requireDrawn} onChange={(e) => setRequireDrawn(e.target.checked)} />
                Require drawn signature only
              </label>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-800 mb-2">Files</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                />
                Allow team members to submit multiple documents
              </label>
              <p className="text-xs text-ink-500 mt-1 pl-6">
                {allowMultiple
                  ? 'Up to 3 files can be uploaded'
                  : 'Only one file can be submitted'}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requireFrontAndBack}
                onChange={(e) => setRequireFrontAndBack(e.target.checked)}
              />
              Require front and back for each document
            </label>

            <div className="border-t border-ink-200 pt-4">
              <h3 className="text-sm font-semibold text-ink-800 mb-2">Other fields</h3>
              <ul className="text-sm text-ink-700 space-y-1.5 list-disc pl-5">
                <li>ID / permit number</li>
                <li>Expiration date</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(isEdit ? `/documents/${editingId}` : '/documents')}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Create document'}
        </Button>
      </div>

      <SubmitUploadModal
        open={previewOpen}
        recipientName="(preview)"
        document={{
          name: name.trim() || 'Document',
          upload_config: {
            allow_multiple_uploads: allowMultiple,
            require_front_and_back: requireFrontAndBack,
          },
        }}
        documentId={0}
        assignmentId={0}
        preview
        onClose={() => setPreviewOpen(false)}
        onSubmitted={() => setPreviewOpen(false)}
      />
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-800 block mb-1">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-danger-500 mt-1">{error}</p>}
    </div>
  );
}

function KindCard({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'text-left rounded-[8px] border p-3 transition-colors ' +
        (selected
          ? 'border-brand-500 bg-brand-100/40 ring-2 ring-brand-300/40'
          : 'border-ink-300 hover:border-ink-500')
      }
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={selected ? 'text-brand-500' : 'text-ink-700'}>{icon}</span>
        <span className="text-sm font-semibold text-ink-900">{title}</span>
      </div>
      <p className="text-xs text-ink-600">{desc}</p>
    </button>
  );
}

function FileDrop({ fileName, onPickFile }: { fileName: string | null; onPickFile: (n: string) => void }) {
  if (fileName) {
    return (
      <div className="flex items-center gap-3 border border-ink-300 rounded-[8px] px-3 py-2">
        <FileText className="w-4 h-4 text-brand-500" />
        <span className="text-sm flex-1 truncate">{fileName}</span>
        <button onClick={() => onPickFile('')} className="text-xs text-ink-600 hover:text-ink-900">
          Replace
        </button>
      </div>
    );
  }
  return (
    <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-ink-300 rounded-[8px] text-sm text-ink-600 cursor-pointer hover:border-brand-300 hover:bg-brand-100/40">
      <Upload className="w-5 h-5" />
      <span>Click to upload (mock)</span>
      <input
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickFile(f.name);
        }}
      />
    </label>
  );
}
