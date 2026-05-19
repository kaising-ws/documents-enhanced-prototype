import type {
  Assignment,
  AssignmentStatus,
  CompanyDocumentType,
  DocumentKind,
  DocumentLifecycleStatus,
  DocumentTemplate,
  Recipient,
  SignerGroup,
} from '../types';

// Deterministic PRNG so reloads show the same data.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260504);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const range = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const DOC_NAMES = [
  'Employee Handbook 2026',
  'Direct Deposit Authorization',
  'I-9 Employment Eligibility',
  // Upload-type compliance docs common in restaurant HR
  'Food Handler’s Permit',
  'Minor Work Permit',
  'Alcohol Server Permit',
  'Allergen Awareness Certificate',
  'Driver’s License & Auto Insurance',
  'W-4 Federal Withholding',
  'Code of Conduct Acknowledgement',
  'Workplace Safety Policy',
  'NDA — Standard Employee',
  'Remote Work Agreement',
  'Anti-Harassment Policy Acknowledgement',
  'Confidentiality Agreement',
  'PTO Policy Acknowledgement',
  'Equipment Loan Agreement',
  'IT Acceptable Use Policy',
  'Social Media Policy',
  'Background Check Authorization',
  'Drug & Alcohol Policy',
  'Emergency Contact Form',
  'Benefits Enrollment Form',
  'Tip Reporting Agreement',
  'Uniform Receipt Acknowledgement',
];

const DOC_TYPES: CompanyDocumentType[] = [
  { id: 1, name: 'Onboarding' },
  { id: 2, name: 'Compliance' },
  { id: 3, name: 'Policy' },
  { id: 4, name: 'Tax Form' },
  { id: 5, name: 'Benefits' },
  { id: 6, name: 'Agreement' },
];

const FIRST_NAMES = [
  'Aisha', 'Ben', 'Carlos', 'Diana', 'Ethan', 'Fiona', 'Grace', 'Hiro',
  'Ivy', 'Jamal', 'Kira', 'Liam', 'Maya', 'Noah', 'Olivia', 'Priya',
  'Quinn', 'Ravi', 'Sara', 'Tomás', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zane', 'Anna', 'Boris', 'Camila', 'Dmitri', 'Elena', 'Felix',
  'Gabriela', 'Henrik', 'Isla', 'Julian', 'Keiko', 'Lucia', 'Mateo', 'Nadia',
];

const LAST_NAMES = [
  'Adams', 'Brown', 'Chen', 'Diaz', 'Edwards', 'Foster', 'Garcia', 'Hughes',
  'Ito', 'Johnson', 'Kim', 'Lopez', 'Martinez', 'Nguyen', "O'Brien", 'Patel',
  'Quinn', 'Reyes', 'Singh', 'Taylor', 'Uchida', 'Vargas', 'Wong', 'Xu',
  'Yamada', 'Zhang', 'Anderson', 'Baker', 'Carter', 'Dempsey',
];

const JOB_TITLES = [
  'Cashier', 'Shift Lead', 'Store Manager', 'Cook', 'Server', 'Driver',
  'Warehouse Associate', 'Customer Service Rep', 'Assistant Manager',
  'Barista', 'Crew Member', 'Maintenance Technician', 'Sales Associate',
  'Line Cook', 'Hostess', null,
];

const LOCATIONS = [
  'Downtown', 'Westside', 'Airport', 'Northgate', 'Southpark', 'Eastpoint',
  'Riverside', 'Midtown', 'Uptown', 'Harborview',
];

const ROLES = [
  'Hourly Employee', 'Salaried Employee', 'Manager', 'Shift Lead', 'Trainee',
];

const ASSIGNERS = [
  { id: 1, name: 'HR Admin' },
  { id: 2, name: 'Jane Cooper' },
  { id: 3, name: 'Marcus Hill' },
  { id: 4, name: 'Priscilla Wong' },
];

function dateAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function dateFromNow(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString();
}

function makeRecipient(id: number): Recipient {
  return {
    id,
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    job_title: pick(JOB_TITLES),
    role: pick(ROLES),
    location: pick(LOCATIONS),
  };
}

function makeSignerGroups(): SignerGroup[] {
  const groups: SignerGroup[] = [
    {
      id: 1,
      group_type: 'employee_sign_company_document',
      sequence: 1,
      signers: [
        {
          id: 1,
          assignee_id: null,
          assignee_type: 'Employee',
          sequence: 1,
          name: 'Recipient',
        },
      ],
    },
  ];
  if (rand() > 0.5) {
    groups.push({
      id: 2,
      group_type: 'hr_sign_company_document',
      sequence: 2,
      signers: [
        {
          id: 2,
          assignee_id: 1,
          assignee_type: 'CompanyStaff',
          sequence: 1,
          name: 'HR Admin',
        },
      ],
    });
  }
  return groups;
}

// Names below get the upload kind + expiry — they're "license"-style docs the worker uploads.
const UPLOAD_DOC_NAMES = new Set([
  'I-9 Employment Eligibility',
  'Background Check Authorization',
  'Direct Deposit Authorization',
  'Food Handler’s Permit',
  'Minor Work Permit',
  'Alcohol Server Permit',
  'Allergen Awareness Certificate',
  'Driver’s License & Auto Insurance',
]);

const EXPIRING_DOCS: Record<string, number> = {
  'I-9 Employment Eligibility': 365,
  'Background Check Authorization': 365 * 2,
  'Food Handler’s Permit': 365 * 3,
  'Minor Work Permit': 365,
  'Alcohol Server Permit': 365 * 3,
  'Allergen Awareness Certificate': 365 * 5,
  'Driver’s License & Auto Insurance': 365,
};

function makeDocument(id: number, name: string): DocumentTemplate {
  // 21 active, 3 archived, 1 pending_deletion
  let status: DocumentLifecycleStatus = 'active';
  let archived_at: string | null = null;
  let scheduled_deletion_at: string | null = null;
  if (id >= 22 && id <= 24) {
    status = 'archived';
    archived_at = dateAgo(range(2, 60));
  } else if (id === 25) {
    status = 'pending_deletion';
    archived_at = dateAgo(range(40, 90));
    scheduled_deletion_at = dateFromNow(range(1, 30));
  }

  const kind: DocumentKind = UPLOAD_DOC_NAMES.has(name) ? 'upload' : 'sign';
  const expires_after_days = EXPIRING_DOCS[name] ?? null;

  const createdDaysAgo = range(30, 365);
  return {
    id,
    name,
    status,
    kind,
    expires_after_days,
    // we'll backfill required_population in buildSeed once we know the assignment count
    required_population: 0,
    template_id: `tpl_${id.toString().padStart(6, '0')}`,
    template_file: { url: '#', name: `${name}.pdf` },
    pdf_file: { url: '#', name: `${name}.pdf` },
    company_document_type: rand() > 0.1 ? pick(DOC_TYPES) : null,
    signer_groups: makeSignerGroups(),
    archived_at,
    scheduled_deletion_at,
    signing_options: { require_drawn_signature: rand() > 0.7 },
    upload_config: {
      allow_multiple_uploads: false,
      require_front_and_back: kind === 'upload' && (name.includes('License') || name.includes('I-9')),
    },
    assignment_permissions_config: { allowed_location_uuids: [] },
    created_at: dateAgo(createdDaysAgo),
    updated_at: dateAgo(range(1, createdDaysAgo)),
  };
}

type RecipientPattern =
  | 'compliant' // active doc, no pending — fully compliant
  | 'early_renewal' // active doc + pending renewal in flight
  | 'expiring_renewal' // doc expires within 7 days + pending auto-renewal
  | 'expired_renewal' // doc expired + pending renewal (some overdue)
  | 'first_pending' // no completed history, in_progress on time
  | 'first_overdue' // no completed history, in_progress past due
  | 'multi_renewal' // 3 assignments: old expired, current active, new pending
  | 'cancelled_history'; // cancelled assignment then completed (active)

function buildAssignment(opts: {
  id: number;
  documentId: number;
  recipient: Recipient;
  status: AssignmentStatus;
  assignedDaysAgo: number;
  dueDaysAgo?: number | null; // positive = past, negative = future, null = no due date
  completedDaysAgo?: number | null;
  expiresDaysFromNow?: number | null;
  supersedesId?: number | null;
  remindersSent?: number;
}): Assignment {
  const dueDate =
    opts.dueDaysAgo === undefined || opts.dueDaysAgo === null
      ? null
      : opts.dueDaysAgo >= 0
      ? dateAgo(opts.dueDaysAgo)
      : dateFromNow(-opts.dueDaysAgo);
  const remindersSent = opts.remindersSent ?? 0;
  return {
    id: opts.id,
    uuid: `as_${opts.id.toString(36)}`,
    document_id: opts.documentId,
    status: opts.status,
    assigned_on: dateAgo(opts.assignedDaysAgo),
    due_date: dueDate,
    completed_at:
      opts.completedDaysAgo !== undefined && opts.completedDaysAgo !== null
        ? dateAgo(opts.completedDaysAgo)
        : null,
    expires_at:
      opts.expiresDaysFromNow !== undefined && opts.expiresDaysFromNow !== null
        ? opts.expiresDaysFromNow >= 0
          ? dateFromNow(opts.expiresDaysFromNow)
          : dateAgo(-opts.expiresDaysFromNow)
        : null,
    supersedes_id: opts.supersedesId ?? null,
    recipient: opts.recipient,
    assigner: pick(ASSIGNERS),
    signing_link: opts.status === 'in_progress' ? `https://sign.example.com/${opts.id}` : null,
    reminders_sent: remindersSent,
    last_reminder_at: remindersSent > 0 ? dateAgo(range(0, 7)) : null,
  };
}

function patternsFor(expires: boolean): RecipientPattern[] {
  // Each entry contributes one recipient. Distribution chosen so the demo shows
  // every state in roughly proportional amounts.
  if (expires) {
    return [
      ...Array(8).fill('compliant' as const),
      ...Array(3).fill('early_renewal' as const),
      ...Array(3).fill('expiring_renewal' as const),
      ...Array(4).fill('expired_renewal' as const),
      ...Array(4).fill('first_pending' as const),
      ...Array(2).fill('first_overdue' as const),
      ...Array(2).fill('multi_renewal' as const),
      ...Array(1).fill('cancelled_history' as const),
    ];
  }
  return [
    ...Array(10).fill('compliant' as const),
    ...Array(5).fill('first_pending' as const),
    ...Array(2).fill('first_overdue' as const),
    ...Array(1).fill('cancelled_history' as const),
  ];
}

function makeAssignments(documentId: number, count: number, doc: DocumentTemplate): Assignment[] {
  const out: Assignment[] = [];
  const expires = doc.expires_after_days !== null;
  const expiryDays = doc.expires_after_days ?? 0;
  const patternPool = patternsFor(expires);
  let assignmentSeq = 0;
  const nextAssignmentId = () => documentId * 100000 + assignmentSeq++;

  for (let i = 0; i < count; i++) {
    const recipient = makeRecipient(documentId * 10000 + i);
    const pattern = patternPool[i % patternPool.length];

    switch (pattern) {
      case 'compliant': {
        // One completed, expires far in the future (or no expiry for sign docs).
        const assignedDaysAgo = range(60, 300);
        const completedDaysAgo = Math.max(0, assignedDaysAgo - range(0, 14));
        const expiresFromNow = expires ? Math.max(30, expiryDays - (assignedDaysAgo - completedDaysAgo)) : null;
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo,
            completedDaysAgo,
            expiresDaysFromNow: expiresFromNow,
          }),
        );
        break;
      }
      case 'early_renewal': {
        // Old completed (still active) + new pending renewal.
        const oldId = nextAssignmentId();
        const oldAssignedDaysAgo = range(180, 360);
        const oldCompletedDaysAgo = Math.max(1, oldAssignedDaysAgo - range(0, 14));
        out.push(
          buildAssignment({
            id: oldId,
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: oldAssignedDaysAgo,
            completedDaysAgo: oldCompletedDaysAgo,
            expiresDaysFromNow: range(30, 90),
          }),
        );
        const newAssignedDaysAgo = range(1, 14);
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: newAssignedDaysAgo,
            dueDaysAgo: -range(14, 60),
            supersedesId: oldId,
          }),
        );
        break;
      }
      case 'expiring_renewal': {
        // Completed doc expiring within 7 days + pending renewal.
        const oldId = nextAssignmentId();
        const oldAssignedDaysAgo = range(300, 360);
        const oldCompletedDaysAgo = Math.max(1, oldAssignedDaysAgo - range(0, 7));
        out.push(
          buildAssignment({
            id: oldId,
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: oldAssignedDaysAgo,
            completedDaysAgo: oldCompletedDaysAgo,
            expiresDaysFromNow: range(1, 7),
          }),
        );
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: range(0, 5),
            dueDaysAgo: -range(7, 30),
            supersedesId: oldId,
          }),
        );
        break;
      }
      case 'expired_renewal': {
        // Completed doc that has already expired + pending renewal (sometimes overdue).
        const oldId = nextAssignmentId();
        const oldAssignedDaysAgo = range(380, 720);
        const oldCompletedDaysAgo = Math.max(1, oldAssignedDaysAgo - range(0, 30));
        out.push(
          buildAssignment({
            id: oldId,
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: oldAssignedDaysAgo,
            completedDaysAgo: oldCompletedDaysAgo,
            expiresDaysFromNow: -range(1, 90),
          }),
        );
        const isOverdue = i % 2 === 0;
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: range(7, 60),
            dueDaysAgo: isOverdue ? range(1, 30) : -range(1, 30),
            remindersSent: isOverdue ? range(1, 4) : 0,
            supersedesId: oldId,
          }),
        );
        break;
      }
      case 'first_pending': {
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: range(1, 21),
            dueDaysAgo: -range(7, 45),
          }),
        );
        break;
      }
      case 'first_overdue': {
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: range(45, 200),
            dueDaysAgo: range(1, 90),
            remindersSent: range(1, 5),
          }),
        );
        break;
      }
      case 'multi_renewal': {
        // Three assignments: old expired → renewal (active) → new pending.
        const a1 = nextAssignmentId();
        const a1Assigned = range(540, 900);
        out.push(
          buildAssignment({
            id: a1,
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: a1Assigned,
            completedDaysAgo: a1Assigned - range(0, 14),
            expiresDaysFromNow: -range(180, 360),
          }),
        );
        const a2 = nextAssignmentId();
        const a2Assigned = range(120, 360);
        out.push(
          buildAssignment({
            id: a2,
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: a2Assigned,
            completedDaysAgo: Math.max(1, a2Assigned - range(0, 14)),
            expiresDaysFromNow: range(30, 180),
            supersedesId: a1,
          }),
        );
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'in_progress',
            assignedDaysAgo: range(1, 14),
            dueDaysAgo: -range(14, 45),
            supersedesId: a2,
          }),
        );
        break;
      }
      case 'cancelled_history': {
        // Cancelled first attempt, then a successful completion.
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'cancelled',
            assignedDaysAgo: range(120, 360),
          }),
        );
        const completedAssigned = range(30, 100);
        out.push(
          buildAssignment({
            id: nextAssignmentId(),
            documentId,
            recipient,
            status: 'completed',
            assignedDaysAgo: completedAssigned,
            completedDaysAgo: Math.max(1, completedAssigned - range(0, 14)),
            expiresDaysFromNow: expires ? range(60, 300) : null,
          }),
        );
        break;
      }
    }
  }
  return out;
}

export interface SeedData {
  documents: DocumentTemplate[];
  assignmentsByDocument: Record<number, Assignment[]>;
  documentTypes: CompanyDocumentType[];
}

export function buildSeed(): SeedData {
  const documents: DocumentTemplate[] = [];
  const assignmentsByDocument: Record<number, Assignment[]> = {};

  for (let i = 0; i < DOC_NAMES.length; i++) {
    const id = i + 1;
    const doc = makeDocument(id, DOC_NAMES[i]);
    const recipientCount = range(20, 60);
    assignmentsByDocument[id] = makeAssignments(id, recipientCount, doc);
    doc.required_population = recipientCount;
    documents.push(doc);
  }

  return {
    documents,
    assignmentsByDocument,
    documentTypes: DOC_TYPES,
  };
}
