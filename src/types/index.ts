export type DocumentLifecycleStatus = 'active' | 'archived' | 'pending_deletion';

export type AssignmentStatus = 'in_progress' | 'completed' | 'cancelled';

export type DocumentKind = 'sign' | 'upload';

export type RecipientState =
  | 'never_assigned'
  | 'pending'
  | 'overdue'
  | 'compliant'
  | 'expires_soon'
  | 'expired'
  | 'cancelled';

export type SignerGroupType =
  | 'employee_sign_company_document'
  | 'hr_sign_company_document';

export type AssigneeType = 'Employee' | 'CompanyRole' | 'CompanyStaff';

export interface CompanyDocumentType {
  id: number;
  name: string;
}

export interface Signer {
  id: number;
  assignee_id: number | null;
  assignee_type: AssigneeType;
  sequence: number;
  name: string;
}

export interface SignerGroup {
  id: number;
  group_type: SignerGroupType;
  sequence: number;
  signers: Signer[];
}

export interface FileMeta {
  url: string;
  name: string;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  status: DocumentLifecycleStatus;
  kind: DocumentKind;
  expires_after_days: number | null;
  required_population: number;
  template_id: string;
  template_file: FileMeta | null;
  pdf_file: FileMeta | null;
  company_document_type: CompanyDocumentType | null;
  signer_groups: SignerGroup[];
  archived_at: string | null;
  scheduled_deletion_at: string | null;
  signing_options: { require_drawn_signature: boolean };
  upload_config: {
    allow_multiple_uploads: boolean;
    require_front_and_back: boolean;
  };
  assignment_permissions_config: { allowed_location_uuids: string[] };
  created_at: string;
  updated_at: string;
}

export interface Recipient {
  id: number;
  name: string;
  job_title: string | null;
  role: string;
  location: string;
}

export interface Assigner {
  id: number;
  name: string;
}

export interface UploadSlot {
  name: string;
  front: FileMeta;
  back: FileMeta | null;
  document_number: string;
  expiration_date: string | null;
}

export interface UploadSubmission {
  files: UploadSlot[];
  submitted_at: string;
  manager_notes: string | null;
}

export interface Assignment {
  id: number;
  uuid: string;
  document_id: number;
  status: AssignmentStatus;
  assigned_on: string;
  due_date: string | null;
  completed_at: string | null;
  expires_at: string | null;
  supersedes_id: number | null;
  recipient: Recipient;
  assigner: Assigner;
  signing_link: string | null;
  reminders_sent: number;
  last_reminder_at: string | null;
  upload_submission?: UploadSubmission;
}

export interface DocumentProgress {
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DocumentWithProgress extends DocumentTemplate {
  progress: DocumentProgress;
}
