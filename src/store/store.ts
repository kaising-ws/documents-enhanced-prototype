import type {
  Assignment,
  CompanyDocumentType,
  DocumentTemplate,
  DocumentWithProgress,
  DocumentProgress,
  SignerGroup,
  UploadSlot,
} from '../types';
import { buildSeed } from '../data/seed';

type Listener = () => void;

interface State {
  documents: DocumentTemplate[];
  assignmentsByDocument: Record<number, Assignment[]>;
  documentTypes: CompanyDocumentType[];
  nextDocumentId: number;
  nextAssignmentId: number;
  nextDocumentTypeId: number;
}

function computeProgress(assignments: Assignment[]): DocumentProgress {
  const p: DocumentProgress = {
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    total: assignments.length,
  };
  for (const a of assignments) p[a.status]++;
  return p;
}

class DocumentsStore {
  private state: State;
  private listeners = new Set<Listener>();

  constructor() {
    const seed = buildSeed();
    const maxAssignmentId = Object.values(seed.assignmentsByDocument)
      .flat()
      .reduce((m, a) => Math.max(m, a.id), 0);
    this.state = {
      documents: seed.documents,
      assignmentsByDocument: seed.assignmentsByDocument,
      documentTypes: seed.documentTypes,
      nextDocumentId: seed.documents.length + 1,
      nextAssignmentId: maxAssignmentId + 1,
      nextDocumentTypeId: seed.documentTypes.length + 1,
    };
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  getSnapshot = () => this.state;

  // ---- Reads ----

  listDocuments(status: 'active' | 'archived' | 'pending_deletion'): DocumentWithProgress[] {
    return this.state.documents
      .filter((d) => d.status === status)
      .map((d) => ({
        ...d,
        progress: computeProgress(this.state.assignmentsByDocument[d.id] ?? []),
      }));
  }

  getDocument(id: number): DocumentWithProgress | undefined {
    const d = this.state.documents.find((x) => x.id === id);
    if (!d) return undefined;
    return {
      ...d,
      progress: computeProgress(this.state.assignmentsByDocument[d.id] ?? []),
    };
  }

  getAssignments(documentId: number): Assignment[] {
    return this.state.assignmentsByDocument[documentId] ?? [];
  }

  getDocumentTypes(): CompanyDocumentType[] {
    return this.state.documentTypes;
  }

  // ---- Document mutations ----

  createDocument(input: {
    name: string;
    typeId: number | null;
    fileName: string;
    employeeSigns: boolean;
    hrSigns: boolean;
    requireDrawnSignature: boolean;
    kind?: 'sign' | 'upload';
    expiresAfterDays?: number | null;
    allowMultipleUploads?: boolean;
    requireFrontAndBack?: boolean;
  }): DocumentTemplate {
    const id = this.state.nextDocumentId++;
    const kind = input.kind ?? 'sign';
    const groups: SignerGroup[] = [];
    let gid = 1;
    if (kind === 'sign' && input.employeeSigns) {
      groups.push({
        id: gid++,
        group_type: 'employee_sign_company_document',
        sequence: 1,
        signers: [{ id: 1, assignee_id: null, assignee_type: 'Employee', sequence: 1, name: 'Recipient' }],
      });
    }
    if (kind === 'sign' && input.hrSigns) {
      groups.push({
        id: gid++,
        group_type: 'hr_sign_company_document',
        sequence: groups.length + 1,
        signers: [{ id: 2, assignee_id: 1, assignee_type: 'CompanyStaff', sequence: 1, name: 'HR Admin' }],
      });
    }
    const now = new Date().toISOString();
    const doc: DocumentTemplate = {
      id,
      name: input.name,
      status: 'active',
      kind,
      expires_after_days: input.expiresAfterDays ?? null,
      required_population: 0,
      template_id: `tpl_${id.toString().padStart(6, '0')}`,
      template_file: { url: '#', name: input.fileName },
      pdf_file: { url: '#', name: input.fileName },
      company_document_type: input.typeId
        ? this.state.documentTypes.find((t) => t.id === input.typeId) ?? null
        : null,
      signer_groups: groups,
      archived_at: null,
      scheduled_deletion_at: null,
      signing_options: { require_drawn_signature: input.requireDrawnSignature },
      upload_config: {
        allow_multiple_uploads: input.allowMultipleUploads ?? false,
        require_front_and_back: input.requireFrontAndBack ?? false,
      },
      assignment_permissions_config: { allowed_location_uuids: [] },
      created_at: now,
      updated_at: now,
    };
    this.state = {
      ...this.state,
      documents: [doc, ...this.state.documents],
      assignmentsByDocument: { ...this.state.assignmentsByDocument, [id]: [] },
    };
    this.emit();
    return doc;
  }

  updateDocument(id: number, patch: {
    name?: string;
    typeId?: number | null;
    employeeSigns?: boolean;
    hrSigns?: boolean;
    requireDrawnSignature?: boolean;
    expiresAfterDays?: number | null;
    allowMultipleUploads?: boolean;
    requireFrontAndBack?: boolean;
  }): void {
    this.state = {
      ...this.state,
      documents: this.state.documents.map((d) => {
        if (d.id !== id) return d;
        const groups = patch.employeeSigns !== undefined || patch.hrSigns !== undefined
          ? buildSignerGroups(
              patch.employeeSigns ?? d.signer_groups.some((g) => g.group_type === 'employee_sign_company_document'),
              patch.hrSigns ?? d.signer_groups.some((g) => g.group_type === 'hr_sign_company_document'),
            )
          : d.signer_groups;
        return {
          ...d,
          name: patch.name ?? d.name,
          company_document_type:
            patch.typeId === undefined
              ? d.company_document_type
              : patch.typeId === null
              ? null
              : this.state.documentTypes.find((t) => t.id === patch.typeId) ?? d.company_document_type,
          signer_groups: groups,
          signing_options: {
            require_drawn_signature:
              patch.requireDrawnSignature ?? d.signing_options.require_drawn_signature,
          },
          expires_after_days:
            patch.expiresAfterDays === undefined ? d.expires_after_days : patch.expiresAfterDays,
          upload_config: {
            allow_multiple_uploads:
              patch.allowMultipleUploads ?? d.upload_config.allow_multiple_uploads,
            require_front_and_back:
              patch.requireFrontAndBack ?? d.upload_config.require_front_and_back,
          },
          updated_at: new Date().toISOString(),
        };
      }),
    };
    this.emit();
  }

  duplicateDocument(id: number): DocumentTemplate | undefined {
    const src = this.state.documents.find((d) => d.id === id);
    if (!src) return undefined;
    const newId = this.state.nextDocumentId++;
    const copy: DocumentTemplate = {
      ...src,
      id: newId,
      name: `${src.name} (Copy)`,
      template_id: `tpl_${newId.toString().padStart(6, '0')}`,
      status: 'active',
      archived_at: null,
      scheduled_deletion_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state = {
      ...this.state,
      documents: [copy, ...this.state.documents],
      assignmentsByDocument: { ...this.state.assignmentsByDocument, [newId]: [] },
    };
    this.emit();
    return copy;
  }

  archiveDocument(id: number): void {
    this.mutateDocument(id, (d) => ({
      ...d,
      status: 'archived',
      archived_at: new Date().toISOString(),
    }));
  }

  unarchiveDocument(id: number): void {
    this.mutateDocument(id, (d) => ({
      ...d,
      status: 'active',
      archived_at: null,
    }));
  }

  scheduleDeletion(id: number): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    this.mutateDocument(id, (d) => ({
      ...d,
      status: 'pending_deletion',
      archived_at: d.archived_at ?? new Date().toISOString(),
      scheduled_deletion_at: expires.toISOString(),
    }));
  }

  restoreDocument(id: number): void {
    this.mutateDocument(id, (d) => ({
      ...d,
      status: 'active',
      archived_at: null,
      scheduled_deletion_at: null,
    }));
  }

  deletePermanently(id: number): void {
    const { [id]: _removed, ...rest } = this.state.assignmentsByDocument;
    void _removed;
    this.state = {
      ...this.state,
      documents: this.state.documents.filter((d) => d.id !== id),
      assignmentsByDocument: rest,
    };
    this.emit();
  }

  moveToType(documentIds: number[], typeId: number | null): void {
    const type = typeId
      ? this.state.documentTypes.find((t) => t.id === typeId) ?? null
      : null;
    this.state = {
      ...this.state,
      documents: this.state.documents.map((d) =>
        documentIds.includes(d.id)
          ? { ...d, company_document_type: type, updated_at: new Date().toISOString() }
          : d,
      ),
    };
    this.emit();
  }

  bulkArchive(ids: number[]): void {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      documents: this.state.documents.map((d) =>
        ids.includes(d.id) ? { ...d, status: 'archived', archived_at: now } : d,
      ),
    };
    this.emit();
  }

  // ---- Document type mutations ----

  createDocumentType(name: string): CompanyDocumentType {
    const t: CompanyDocumentType = { id: this.state.nextDocumentTypeId++, name };
    this.state = { ...this.state, documentTypes: [...this.state.documentTypes, t] };
    this.emit();
    return t;
  }

  // ---- Assignment mutations ----

  createAssignments(documentId: number, recipients: Array<{ name: string; role: string; location: string; jobTitle: string | null }>): Assignment[] {
    const existing = this.state.assignmentsByDocument[documentId] ?? [];
    const now = new Date().toISOString();
    const newOnes: Assignment[] = recipients.map((r, idx) => {
      const id = this.state.nextAssignmentId++;
      return {
        id,
        uuid: `as_${id.toString(36)}`,
        document_id: documentId,
        status: 'in_progress',
        assigned_on: now,
        due_date: null,
        completed_at: null,
        expires_at: null,
        supersedes_id: null,
        recipient: {
          id: id * 100 + idx,
          name: r.name,
          job_title: r.jobTitle,
          role: r.role,
          location: r.location,
        },
        assigner: { id: 1, name: 'You' },
        signing_link: `https://sign.example.com/${id}`,
        reminders_sent: 0,
        last_reminder_at: null,
      };
    });
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: [...newOnes, ...existing],
      },
    };
    this.emit();
    return newOnes;
  }

  sendReminder(documentId: number, assignmentIds: number[]): void {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: (this.state.assignmentsByDocument[documentId] ?? []).map((a) =>
          assignmentIds.includes(a.id) && a.status === 'in_progress'
            ? { ...a, reminders_sent: a.reminders_sent + 1, last_reminder_at: now }
            : a,
        ),
      },
    };
    this.emit();
  }

  cancelAssignments(documentId: number, assignmentIds: number[]): void {
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: (this.state.assignmentsByDocument[documentId] ?? []).map((a) =>
          assignmentIds.includes(a.id) && a.status === 'in_progress'
            ? { ...a, status: 'cancelled' }
            : a,
        ),
      },
    };
    this.emit();
  }

  /**
   * Create a new in-flight assignment for a recipient on a document, marking
   * the supplied prior assignment as superseded. Used when a license expires
   * or the admin wants to re-collect from a recipient who has prior history.
   */
  renewAssignment(
    documentId: number,
    priorAssignment: Assignment,
  ): Assignment {
    const id = this.state.nextAssignmentId++;
    const now = new Date().toISOString();
    const next: Assignment = {
      id,
      uuid: `as_${id.toString(36)}`,
      document_id: documentId,
      status: 'in_progress',
      assigned_on: now,
      due_date: null,
      completed_at: null,
      expires_at: null,
      supersedes_id: priorAssignment.id,
      recipient: priorAssignment.recipient,
      assigner: { id: 1, name: 'You' },
      signing_link: `https://sign.example.com/${id}`,
      reminders_sent: 0,
      last_reminder_at: null,
    };
    const existing = this.state.assignmentsByDocument[documentId] ?? [];
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: [next, ...existing],
      },
    };
    this.emit();
    return next;
  }

  submitUpload(
    documentId: number,
    assignmentId: number,
    payload: { files: UploadSlot[] },
  ): void {
    const now = new Date().toISOString();
    const expirations = payload.files
      .map((f) => f.expiration_date)
      .filter((d): d is string => !!d)
      .sort();
    const earliestExpiration = expirations[0] ?? null;
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: (this.state.assignmentsByDocument[documentId] ?? []).map((a) =>
          a.id === assignmentId && a.status === 'in_progress'
            ? {
                ...a,
                status: 'completed',
                completed_at: now,
                expires_at: earliestExpiration,
                upload_submission: {
                  files: payload.files,
                  submitted_at: now,
                  manager_notes: null,
                },
              }
            : a,
        ),
      },
    };
    this.emit();
  }

  setManagerNotes(documentId: number, assignmentId: number, notes: string): void {
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: (this.state.assignmentsByDocument[documentId] ?? []).map((a) =>
          a.id === assignmentId && a.upload_submission
            ? {
                ...a,
                upload_submission: {
                  ...a.upload_submission,
                  manager_notes: notes.trim() === '' ? null : notes,
                },
              }
            : a,
        ),
      },
    };
    this.emit();
  }

  markComplete(documentId: number, assignmentIds: number[]): void {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      assignmentsByDocument: {
        ...this.state.assignmentsByDocument,
        [documentId]: (this.state.assignmentsByDocument[documentId] ?? []).map((a) =>
          assignmentIds.includes(a.id) && a.status === 'in_progress'
            ? { ...a, status: 'completed', completed_at: now }
            : a,
        ),
      },
    };
    this.emit();
  }

  // ---- Internal ----

  private mutateDocument(id: number, fn: (d: DocumentTemplate) => DocumentTemplate) {
    this.state = {
      ...this.state,
      documents: this.state.documents.map((d) => (d.id === id ? fn(d) : d)),
    };
    this.emit();
  }
}

function buildSignerGroups(employeeSigns: boolean, hrSigns: boolean): SignerGroup[] {
  const groups: SignerGroup[] = [];
  let id = 1;
  if (employeeSigns) {
    groups.push({
      id: id++,
      group_type: 'employee_sign_company_document',
      sequence: 1,
      signers: [{ id: 1, assignee_id: null, assignee_type: 'Employee', sequence: 1, name: 'Recipient' }],
    });
  }
  if (hrSigns) {
    groups.push({
      id: id++,
      group_type: 'hr_sign_company_document',
      sequence: groups.length + 1,
      signers: [{ id: 2, assignee_id: 1, assignee_type: 'CompanyStaff', sequence: 1, name: 'HR Admin' }],
    });
  }
  return groups;
}

export const store = new DocumentsStore();
