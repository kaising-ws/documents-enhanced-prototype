/**
 * trackingMode controls how assignment stats are interpreted and displayed:
 *
 *  'progress'   – Pool-based completion (Payroll, Onboarding signing docs)
 *                 stats.total = assigned pool size, stats.completed = signed/done
 *                 Table shows: "18/19 completed" + progress bar + template age
 *
 *  'compliance' – Ongoing compliance (Certifications)
 *                 stats.total = required holders, stats.completed = currently valid
 *                 Table shows: "3/5 compliant" + expired/expiring badges
 *
 *  'issuance'   – Ad-hoc issuance (Write-ups)
 *                 stats.total = total ever issued, stats.completed = acknowledged
 *                 Table shows: "6 issued · 2 pending" (no progress bar)
 */
export type TrackingMode = 'progress' | 'compliance' | 'issuance'

export type TemplateCategory = 'signing' | 'write-up' | 'certification' | 'custom-form'

export interface DocumentTemplate {
  id: string
  name: string
  category: TemplateCategory
  type: string            // user-defined type e.g. "Onboarding", "Payroll", "Operations"
  trackingMode: TrackingMode

  /** Universal assignment statistics — interpretation depends on trackingMode */
  stats: {
    total: number       // pool size (progress/compliance) or total issued (issuance)
    completed: number   // signed/compliant/acknowledged
    attention: number   // pending sigs / expiring certs / pending ack
    expired?: number    // only for compliance mode
  }

  createdAt: string
  createdAtFormatted: string
  /** Whether the template has been archived. Archived templates are hidden by default. */
  archived?: boolean
}

export interface DocumentRecipient {
  id: string
  name: string
  email: string
  phone: string
  role: string
  location: string
  status: 'completed' | 'pending' | 'collecting' | 'expiring' | 'expired' | 'assigned' | 'pending_verification' | 'refused'
  statusText: string
  completedDate?: string
  lastAssignedDate: string
  dueDate?: string
  expiryDate?: string
  signaturesCollected?: number
  signaturesRequired?: number
  uploadedImageUrl?: string
  uploadedExpiryDate?: string
}

export interface AssignmentInstance {
  id: string
  assignedBy: string
  assignedDate: string
  recipientCount: number
  completedCount: number
  cancelledCount: number
  recipients: DocumentRecipient[]
}

export interface DocumentDetail {
  id: string
  name: string
  type: string
  createdAt: string
  recipients: DocumentRecipient[]
  assignmentHistory: AssignmentInstance[]
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  role: string
  location: string
  documents: {
    category: string
    documents: {
      id: string
      name: string
      status: 'completed' | 'pending' | 'expired' | 'expiring'
      dueDate?: string
      completedDate?: string
    }[]
  }[]
}

// Write-up Types
export type WriteUpType = 
  | 'verbal-warning' 
  | 'written-warning' 
  | 'final-warning' 
  | 'performance-improvement' 
  | 'recognition' 
  | 'coaching'

export type WriteUpStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sent' 
  | 'acknowledged' 
  | 'refused' 
  | 'expired'

export interface WriteUpTemplate {
  id: string
  title: string
  type: WriteUpType
  description: string
  managerSigns: boolean
  workerSigns: boolean
  allowDecline: boolean
  escalationDays: number
  permissions: {
    locations: string[]
    roles: string[]
  }
  status: 'draft' | 'active'
  createdAt: string
  createdBy: string
}

export interface WriteUp {
  id: string
  templateId: string
  employeeId: string
  employeeName: string
  employeeRole: string
  employeeLocation: string
  
  // Content
  type: WriteUpType
  title: string
  incidentDate: string
  description: string
  managerNotes: string
  employeeResponse?: string
  
  // Points (optional demerit system)
  points?: number
  
  // Workflow
  status: WriteUpStatus
  scheduledDate?: string
  sentDate?: string
  acknowledgedDate?: string
  
  // Signatures
  managerSignature: {
    signedBy: string
    signedAt: string
  }
  employeeSignature?: {
    signedBy: string
    signedAt: string
    declined: boolean
    declineReason?: string
  }
  
  // Escalation
  escalationDays: number
  remindersSent: number
  lastReminderDate?: string
  
  // Metadata
  createdBy: string
  createdAt: string
  location: string
}

export const documentTemplates: DocumentTemplate[] = [
  // ─── Signing ───
  {
    id: '1',
    name: 'PIPL_consent_form.pdf',
    category: 'signing',
    type: 'Payroll',
    trackingMode: 'progress',
    stats: { total: 27, completed: 19, attention: 8 },
    createdAt: '2024-01-15',
    createdAtFormatted: 'Jan 15, 2024',
  },
  {
    id: '2',
    name: 'Contract.pdf',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    stats: { total: 24, completed: 24, attention: 0 },
    createdAt: '2024-01-10',
    createdAtFormatted: 'Jan 10, 2024',
  },
  {
    id: '3',
    name: 'VFS_consent_form.pdf',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    stats: { total: 22, completed: 9, attention: 13 },
    createdAt: '2024-01-08',
    createdAtFormatted: 'Jan 8, 2024',
  },
  {
    id: '5',
    name: 'Employee_Handbook_2024.pdf',
    category: 'signing',
    type: 'Onboarding',
    trackingMode: 'progress',
    stats: { total: 30, completed: 27, attention: 3 },
    createdAt: '2024-01-01',
    createdAtFormatted: 'Jan 1, 2024',
  },
  // ─── Certification ───
  {
    id: 'cert-1',
    name: 'Food Handler Certificate',
    category: 'certification',
    type: 'Compliance',
    trackingMode: 'compliance',
    stats: { total: 26, completed: 15, attention: 11, expired: 3 },
    createdAt: '2024-01-01',
    createdAtFormatted: 'Jan 1, 2024',
  },
  {
    id: 'cert-2',
    name: 'TIPS Alcohol Certification',
    category: 'certification',
    type: 'Compliance',
    trackingMode: 'compliance',
    stats: { total: 21, completed: 5, attention: 16, expired: 4 },
    createdAt: '2024-03-12',
    createdAtFormatted: 'Mar 12, 2024',
  },
  {
    id: 'cert-3',
    name: "Driver's License",
    category: 'certification',
    type: 'Operations',
    trackingMode: 'compliance',
    stats: { total: 23, completed: 17, attention: 6, expired: 1 },
    createdAt: '2024-02-20',
    createdAtFormatted: 'Feb 20, 2024',
  },
  {
    id: 'cert-4',
    name: 'Work Authorization',
    category: 'certification',
    type: 'Compliance',
    trackingMode: 'compliance',
    stats: { total: 25, completed: 9, attention: 16, expired: 4 },
    createdAt: '2024-01-01',
    createdAtFormatted: 'Jan 1, 2024',
  },
  {
    id: 'cert-5',
    name: 'Manager Food Safety Certification',
    category: 'certification',
    type: 'Safety',
    trackingMode: 'compliance',
    stats: { total: 20, completed: 18, attention: 2, expired: 0 },
    createdAt: '2024-06-01',
    createdAtFormatted: 'Jun 1, 2024',
  },
  // ─── Write-up ───
  {
    id: 'wu-1',
    name: 'Standard Verbal Warning',
    category: 'write-up',
    type: 'Performance',
    trackingMode: 'issuance',
    stats: { total: 28, completed: 22, attention: 6 },
    createdAt: '2024-01-01',
    createdAtFormatted: 'Jan 1, 2024',
  },
  {
    id: 'wu-2',
    name: 'Written Warning',
    category: 'write-up',
    type: 'Performance',
    trackingMode: 'issuance',
    stats: { total: 20, completed: 5, attention: 15 },
    createdAt: '2024-01-20',
    createdAtFormatted: 'Jan 20, 2024',
  },
  {
    id: 'wu-3',
    name: 'Final Warning',
    category: 'write-up',
    type: 'Performance',
    trackingMode: 'issuance',
    stats: { total: 23, completed: 16, attention: 7 },
    createdAt: '2024-01-28',
    createdAtFormatted: 'Jan 28, 2024',
  },
  {
    id: 'wu-4',
    name: 'Performance Improvement Plan',
    category: 'write-up',
    type: 'Performance',
    trackingMode: 'issuance',
    stats: { total: 25, completed: 10, attention: 15 },
    createdAt: '2024-02-01',
    createdAtFormatted: 'Feb 1, 2024',
  },
  {
    id: 'wu-5',
    name: 'Employee Recognition',
    category: 'write-up',
    type: 'Minor',
    trackingMode: 'issuance',
    stats: { total: 30, completed: 28, attention: 2 },
    createdAt: '2024-01-22',
    createdAtFormatted: 'Jan 22, 2024',
  },
  // ─── Custom Form ───
  {
    id: 'cf-1',
    name: 'New Hire Checklist',
    category: 'custom-form',
    type: 'Onboarding',
    trackingMode: 'progress',
    stats: { total: 22, completed: 18, attention: 4 },
    createdAt: '2024-04-10',
    createdAtFormatted: 'Apr 10, 2024',
  },
  {
    id: 'cf-2',
    name: 'Safety Incident Report',
    category: 'custom-form',
    type: 'Safety',
    trackingMode: 'issuance',
    stats: { total: 12, completed: 10, attention: 2 },
    createdAt: '2024-05-05',
    createdAtFormatted: 'May 5, 2024',
  },
]

// ─── Mock employee pool for generating recipients ───
const EMPLOYEES = [
  { name: 'Maria Santos', role: 'Server', location: 'Downtown', email: 'maria.santos@workstream.is', phone: '+17701234501' },
  { name: 'James Wilson', role: 'Line Cook', location: 'Midtown', email: 'james.wilson@workstream.is', phone: '+17701234502' },
  { name: 'Priya Patel', role: 'Bartender', location: 'Downtown', email: 'priya.patel@workstream.is', phone: '+17701234503' },
  { name: 'David Chen', role: 'Host', location: 'Uptown', email: 'david.chen@workstream.is', phone: '+17701234504' },
  { name: 'Aaliyah Johnson', role: 'Server', location: 'Eastside', email: 'aaliyah.johnson@workstream.is', phone: '+17701234505' },
  { name: 'Marcus Rodriguez', role: 'Shift Manager', location: 'Midtown', email: 'marcus.rodriguez@workstream.is', phone: '+17701234506' },
  { name: 'Emily Tanaka', role: 'Sous Chef', location: 'Downtown', email: 'emily.tanaka@workstream.is', phone: '+17701234507' },
  { name: 'Omar Hassan', role: 'Prep Cook', location: 'Westside', email: 'omar.hassan@workstream.is', phone: '+17701234508' },
  { name: 'Sarah Kim', role: 'Server', location: 'Uptown', email: 'sarah.kim@workstream.is', phone: '+17701234509' },
  { name: 'Tyler Brooks', role: 'Dishwasher', location: 'Eastside', email: 'tyler.brooks@workstream.is', phone: '+17701234510' },
  { name: 'Fatima Al-Rashid', role: 'Barista', location: 'Midtown', email: 'fatima.alrashid@workstream.is', phone: '+17701234511' },
  { name: 'Ryan O\'Brien', role: 'Bartender', location: 'Downtown', email: 'ryan.obrien@workstream.is', phone: '+17701234512' },
  { name: 'Jessica Nguyen', role: 'Cashier', location: 'Westside', email: 'jessica.nguyen@workstream.is', phone: '+17701234513' },
  { name: 'Andre Washington', role: 'Line Cook', location: 'Uptown', email: 'andre.washington@workstream.is', phone: '+17701234514' },
  { name: 'Mei Lin', role: 'Host', location: 'Midtown', email: 'mei.lin@workstream.is', phone: '+17701234515' },
  { name: 'Carlos Gutierrez', role: 'Server', location: 'Eastside', email: 'carlos.gutierrez@workstream.is', phone: '+17701234516' },
  { name: 'Rachel Green', role: 'Shift Manager', location: 'Downtown', email: 'rachel.green@workstream.is', phone: '+17701234517' },
  { name: 'Kwame Asante', role: 'Prep Cook', location: 'Westside', email: 'kwame.asante@workstream.is', phone: '+17701234518' },
  { name: 'Sophia Rossi', role: 'Server', location: 'Uptown', email: 'sophia.rossi@workstream.is', phone: '+17701234519' },
  { name: 'Brandon Taylor', role: 'Bartender', location: 'Midtown', email: 'brandon.taylor@workstream.is', phone: '+17701234520' },
  { name: 'Hannah Park', role: 'Line Cook', location: 'Downtown', email: 'hannah.park@workstream.is', phone: '+17701234521' },
  { name: 'Damien Lee', role: 'Busser', location: 'Eastside', email: 'damien.lee@workstream.is', phone: '+17701234522' },
  { name: 'Nicole Thompson', role: 'Food Runner', location: 'Midtown', email: 'nicole.thompson@workstream.is', phone: '+17701234523' },
  { name: 'Luis Morales', role: 'Sous Chef', location: 'Westside', email: 'luis.morales@workstream.is', phone: '+17701234524' },
  { name: 'Aisha Williams', role: 'Server', location: 'Uptown', email: 'aisha.williams@workstream.is', phone: '+17701234525' },
  { name: 'Kevin Murphy', role: 'General Manager', location: 'Downtown', email: 'kevin.murphy@workstream.is', phone: '+17701234526' },
  { name: 'Diana Cruz', role: 'Cashier', location: 'Eastside', email: 'diana.cruz@workstream.is', phone: '+17701234527' },
  { name: 'Jamal Carter', role: 'Line Cook', location: 'Midtown', email: 'jamal.carter@workstream.is', phone: '+17701234528' },
  { name: 'Emma Mitchell', role: 'Host', location: 'Westside', email: 'emma.mitchell@workstream.is', phone: '+17701234529' },
  { name: 'Raj Sharma', role: 'Asst. Manager', location: 'Uptown', email: 'raj.sharma@workstream.is', phone: '+17701234530' },
]

const COMPLETED_DATES = [
  'Jan 16, 2024', 'Jan 18, 2024', 'Jan 20, 2024', 'Jan 22, 2024',
  'Jan 25, 2024', 'Jan 28, 2024', 'Feb 1, 2024', 'Feb 5, 2024',
  'Feb 8, 2024', 'Feb 12, 2024', 'Feb 15, 2024', 'Feb 18, 2024',
  'Feb 20, 2024', 'Feb 24, 2024', 'Mar 1, 2024', 'Mar 5, 2024',
  'Mar 8, 2024', 'Mar 12, 2024', 'Mar 15, 2024', 'Mar 20, 2024',
  'Mar 25, 2024', 'Apr 1, 2024', 'Apr 5, 2024', 'Apr 10, 2024',
  'Apr 15, 2024', 'Apr 20, 2024', 'May 1, 2024', 'May 5, 2024',
  'May 10, 2024', 'May 15, 2024',
]

const EXPIRY_DATES = [
  'Dec 1, 2024',  // expired
  'Dec 15, 2024', // expired
  'Jan 5, 2025',  // expired
  'Feb 10, 2026', // expiring soon
  'Feb 20, 2026', // expiring soon
  'Mar 1, 2026',  // expiring soon
  'Mar 15, 2026', // expiring soon
  'Jun 15, 2026', // valid
  'Jul 1, 2026',  // valid
  'Aug 10, 2026', // valid
  'Sep 15, 2026', // valid
  'Oct 1, 2026',  // valid
  'Nov 15, 2026', // valid
  'Dec 31, 2026', // valid
  'Jan 15, 2027', // valid
  'Mar 1, 2027',  // valid
  'Apr 15, 2027', // valid
  'Jun 1, 2027',  // valid
  'Jul 15, 2027', // valid
  'Sep 1, 2027',  // valid
  'Oct 15, 2027', // valid
  'Dec 1, 2027',  // valid
  'Jan 15, 2028', // valid
  'Mar 1, 2028',  // valid
  'Jun 1, 2028',  // valid
  'Sep 1, 2028',  // valid
  'Dec 1, 2028',  // valid
  'Mar 1, 2029',  // valid
  'Jun 1, 2029',  // valid
  'Sep 1, 2029',  // valid
]

type RecipientStatusType = DocumentRecipient['status']

/** Build recipients from the employee pool */
function makeRecipients(
  prefix: string,
  count: number,
  statuses: RecipientStatusType[],
): DocumentRecipient[] {
  return EMPLOYEES.slice(0, count).map((emp, i) => {
    const status = statuses[i % statuses.length]
    const isCompleted = status === 'completed'
    const isRefused = status === 'refused'
    const isExpired = status === 'expired'
    const isExpiring = status === 'expiring'

    const isPendingVerification = status === 'pending_verification'

    // Mock uploaded images for pending_verification
    const MOCK_CERT_IMAGES = [
      '/mock/food-handler-cert-1.jpg',
      '/mock/food-handler-cert-2.jpg',
      '/mock/tips-cert-1.jpg',
      '/mock/drivers-license-1.jpg',
    ]
    const MOCK_EXPIRY_DATES = [
      'Aug 15, 2026', 'Sep 20, 2026', 'Nov 1, 2026', 'Dec 10, 2026',
      'Jan 15, 2027', 'Mar 1, 2027', 'Jun 30, 2027',
    ]

    return {
      id: `${prefix}-r${i + 1}`,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      location: emp.location,
      status,
      statusText:
        isCompleted ? 'Completed' :
        isRefused ? 'Refused to sign' :
        isExpired ? 'Expired' :
        isExpiring ? 'Expiring soon' :
        isPendingVerification ? 'Pending verification' :
        status === 'collecting' ? 'Collecting signatures' :
        status === 'assigned' ? 'Assigned' :
        'Pending',
      completedDate: (isCompleted || isRefused) ? COMPLETED_DATES[i % COMPLETED_DATES.length] : undefined,
      lastAssignedDate: COMPLETED_DATES[Math.max(0, (i % COMPLETED_DATES.length) - 2)],
      dueDate: !isCompleted && !isPendingVerification ? 'Mar 15, 2026' : undefined,
      expiryDate: (isExpired || isExpiring) ? EXPIRY_DATES[i % EXPIRY_DATES.length] : undefined,
      uploadedImageUrl: isPendingVerification ? MOCK_CERT_IMAGES[i % MOCK_CERT_IMAGES.length] : undefined,
      uploadedExpiryDate: isPendingVerification ? MOCK_EXPIRY_DATES[i % MOCK_EXPIRY_DATES.length] : undefined,
    }
  })
}

/** Build a single assignment history entry */
function makeHistory(prefix: string, total: number, completed: number): AssignmentInstance[] {
  return [{
    id: `${prefix}-h1`,
    assignedBy: 'HR Admin',
    assignedDate: 'Jan 15, 2024',
    recipientCount: total,
    completedCount: completed,
    cancelledCount: 0,
    recipients: [],
  }]
}

// ── Progress-mode status distributions ──
// completed first, then pending/collecting for attention items
function progressStatuses(completed: number, attention: number): RecipientStatusType[] {
  const arr: RecipientStatusType[] = []
  for (let i = 0; i < completed; i++) arr.push('completed')
  for (let i = 0; i < attention; i++) arr.push('pending')
  return arr
}

// ── Compliance-mode status distributions ──
function complianceStatuses(completed: number, attention: number, expired: number, pendingVerification: number = 0): RecipientStatusType[] {
  const arr: RecipientStatusType[] = []
  for (let i = 0; i < completed; i++) arr.push('completed')
  for (let i = 0; i < pendingVerification; i++) arr.push('pending_verification')
  for (let i = 0; i < attention; i++) arr.push('expiring')
  for (let i = 0; i < expired; i++) arr.push('expired')
  return arr
}

// ── Issuance-mode status distributions ──
function issuanceStatuses(completed: number, attention: number, refused: number = 0): RecipientStatusType[] {
  const arr: RecipientStatusType[] = []
  for (let i = 0; i < completed; i++) arr.push('completed')
  for (let i = 0; i < refused; i++) arr.push('refused')
  for (let i = 0; i < attention; i++) arr.push('pending')
  return arr
}

export const documentDetails: Record<string, DocumentDetail> = {
  '1': {
    id: '1',
    name: 'PIPL_consent_form.pdf',
    type: 'Payroll',
    createdAt: 'Jan 15, 2024',
    recipients: makeRecipients('1', 27, progressStatuses(19, 8)),
    assignmentHistory: makeHistory('1', 27, 19),
  },
  '2': {
    id: '2',
    name: 'Contract.pdf',
    type: 'Onboarding',
    createdAt: 'Jan 10, 2024',
    recipients: makeRecipients('2', 24, progressStatuses(24, 0)),
    assignmentHistory: makeHistory('2', 24, 24),
  },
  '3': {
    id: '3',
    name: 'VFS_consent_form.pdf',
    type: 'Onboarding',
    createdAt: 'Jan 8, 2024',
    recipients: makeRecipients('3', 22, progressStatuses(9, 13)),
    assignmentHistory: makeHistory('3', 22, 9),
  },
  '5': {
    id: '5',
    name: 'Employee_Handbook_2024.pdf',
    type: 'Onboarding',
    createdAt: 'Jan 1, 2024',
    recipients: makeRecipients('5', 30, progressStatuses(27, 3)),
    assignmentHistory: makeHistory('5', 30, 27),
  },
  'cert-1': {
    id: 'cert-1',
    name: 'Food Handler Certificate',
    type: 'Compliance',
    createdAt: 'Jan 1, 2024',
    recipients: makeRecipients('cert1', 26, complianceStatuses(15, 4, 3, 4)),
    assignmentHistory: makeHistory('cert1', 26, 15),
  },
  'cert-2': {
    id: 'cert-2',
    name: 'TIPS Alcohol Certification',
    type: 'Compliance',
    createdAt: 'Mar 12, 2024',
    recipients: makeRecipients('cert2', 21, complianceStatuses(5, 6, 4, 6)),
    assignmentHistory: makeHistory('cert2', 21, 5),
  },
  'cert-3': {
    id: 'cert-3',
    name: "Driver's License",
    type: 'Operations',
    createdAt: 'Feb 20, 2024',
    recipients: makeRecipients('cert3', 23, complianceStatuses(17, 2, 1, 3)),
    assignmentHistory: makeHistory('cert3', 23, 17),
  },
  'cert-4': {
    id: 'cert-4',
    name: 'Work Authorization',
    type: 'Compliance',
    createdAt: 'Jan 1, 2024',
    recipients: makeRecipients('cert4', 25, complianceStatuses(9, 7, 4, 5)),
    assignmentHistory: makeHistory('cert4', 25, 9),
  },
  'cert-5': {
    id: 'cert-5',
    name: 'Manager Food Safety Certification',
    type: 'Safety',
    createdAt: 'Jun 1, 2024',
    recipients: makeRecipients('cert5', 20, complianceStatuses(18, 0, 0, 2)),
    assignmentHistory: makeHistory('cert5', 20, 18),
  },
  'wu-1': {
    id: 'wu-1',
    name: 'Standard Verbal Warning',
    type: 'Performance',
    createdAt: 'Jan 1, 2024',
    recipients: makeRecipients('wu1', 28, issuanceStatuses(19, 6, 3)),
    assignmentHistory: makeHistory('wu1', 28, 22),
  },
  'wu-2': {
    id: 'wu-2',
    name: 'Written Warning',
    type: 'Performance',
    createdAt: 'Jan 20, 2024',
    recipients: makeRecipients('wu2', 20, issuanceStatuses(3, 15, 2)),
    assignmentHistory: makeHistory('wu2', 20, 5),
  },
  'wu-3': {
    id: 'wu-3',
    name: 'Final Warning',
    type: 'Performance',
    createdAt: 'Jan 28, 2024',
    recipients: makeRecipients('wu3', 23, issuanceStatuses(14, 7, 2)),
    assignmentHistory: makeHistory('wu3', 23, 16),
  },
  'wu-4': {
    id: 'wu-4',
    name: 'Performance Improvement Plan',
    type: 'Performance',
    createdAt: 'Feb 1, 2024',
    recipients: makeRecipients('wu4', 25, issuanceStatuses(8, 15, 2)),
    assignmentHistory: makeHistory('wu4', 25, 10),
  },
  'wu-5': {
    id: 'wu-5',
    name: 'Employee Recognition',
    type: 'Minor',
    createdAt: 'Jan 22, 2024',
    recipients: makeRecipients('wu5', 30, issuanceStatuses(27, 2, 1)),
    assignmentHistory: makeHistory('wu5', 30, 28),
  },
  'cf-1': {
    id: 'cf-1',
    name: 'New Hire Checklist',
    type: 'Onboarding',
    createdAt: 'Apr 10, 2024',
    recipients: makeRecipients('cf1', 22, progressStatuses(18, 4)),
    assignmentHistory: makeHistory('cf1', 22, 18),
  },
  'cf-2': {
    id: 'cf-2',
    name: 'Safety Incident Report',
    type: 'Safety',
    createdAt: 'May 5, 2024',
    recipients: makeRecipients('cf2', 12, issuanceStatuses(10, 2)),
    assignmentHistory: makeHistory('cf2', 12, 10),
  },
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    initials: 'JS',
    role: 'Server',
    location: 'Downtown',
    documents: [
      {
        category: 'Payroll',
        documents: [
          { id: '1', name: 'W-4 Form', status: 'completed', completedDate: '2024-01-15' },
          { id: '2', name: 'Direct Deposit Form', status: 'completed', completedDate: '2024-01-15' },
        ],
      },
      {
        category: 'Onboarding',
        documents: [
          { id: '3', name: 'Employee Handbook', status: 'completed', completedDate: '2024-01-14' },
          { id: '4', name: 'NDA Agreement', status: 'pending', dueDate: '2024-02-01' },
        ],
      },
      {
        category: 'Certifications',
        documents: [
          { id: '5', name: 'Food Handler Certificate', status: 'expiring', dueDate: '2024-02-15' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    initials: 'SJ',
    role: 'Manager',
    location: 'Uptown',
    documents: [
      {
        category: 'Payroll',
        documents: [
          { id: '6', name: 'W-4 Form', status: 'completed', completedDate: '2024-01-10' },
          { id: '7', name: 'Direct Deposit Form', status: 'completed', completedDate: '2024-01-10' },
        ],
      },
      {
        category: 'Onboarding',
        documents: [
          { id: '8', name: 'Employee Handbook', status: 'completed', completedDate: '2024-01-09' },
          { id: '9', name: 'Management Agreement', status: 'completed', completedDate: '2024-01-09' },
        ],
      },
      {
        category: 'Certifications',
        documents: [
          { id: '10', name: 'ServSafe Manager', status: 'completed', completedDate: '2024-01-05' },
          { id: '11', name: 'Alcohol Server Permit', status: 'expired', dueDate: '2024-01-01' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Mike Williams',
    email: 'mike.williams@example.com',
    initials: 'MW',
    role: 'Cook',
    location: 'Downtown',
    documents: [
      {
        category: 'Payroll',
        documents: [
          { id: '12', name: 'W-4 Form', status: 'completed', completedDate: '2024-01-20' },
          { id: '13', name: 'Direct Deposit Form', status: 'pending', dueDate: '2024-02-05' },
        ],
      },
      {
        category: 'Onboarding',
        documents: [
          { id: '14', name: 'Employee Handbook', status: 'pending', dueDate: '2024-02-01' },
        ],
      },
      {
        category: 'Certifications',
        documents: [
          { id: '15', name: 'Food Handler Certificate', status: 'completed', completedDate: '2024-01-18' },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    initials: 'ED',
    role: 'Bartender',
    location: 'Midtown',
    documents: [
      {
        category: 'Payroll',
        documents: [
          { id: '16', name: 'W-4 Form', status: 'completed', completedDate: '2024-01-12' },
          { id: '17', name: 'Direct Deposit Form', status: 'completed', completedDate: '2024-01-12' },
        ],
      },
      {
        category: 'Onboarding',
        documents: [
          { id: '18', name: 'Employee Handbook', status: 'completed', completedDate: '2024-01-11' },
          { id: '19', name: 'Tip Pooling Agreement', status: 'completed', completedDate: '2024-01-11' },
        ],
      },
      {
        category: 'Certifications',
        documents: [
          { id: '20', name: 'Alcohol Server Permit', status: 'completed', completedDate: '2024-01-10' },
          { id: '21', name: 'TIPS Certification', status: 'completed', completedDate: '2024-01-10' },
        ],
      },
    ],
  },
  {
    id: '5',
    name: 'Chris Brown',
    email: 'chris.brown@example.com',
    initials: 'CB',
    role: 'Host',
    location: 'Downtown',
    documents: [
      {
        category: 'Payroll',
        documents: [
          { id: '22', name: 'W-4 Form', status: 'pending', dueDate: '2024-02-10' },
          { id: '23', name: 'Direct Deposit Form', status: 'pending', dueDate: '2024-02-10' },
        ],
      },
      {
        category: 'Onboarding',
        documents: [
          { id: '24', name: 'Employee Handbook', status: 'pending', dueDate: '2024-02-08' },
        ],
      },
    ],
  },
]

export const documentTypes = [
  'Payroll',
  'Onboarding',
  'Operations',
  'Compliance',
  'Performance',
  'Safety',
  'Minor',
  'Company Policy',
]

export const validityPeriods = [
  'No expiration',
  '30 days',
  '60 days',
  '90 days',
  '6 months',
  '1 year',
  '2 years',
  'Custom',
]

export const locations = [
  { id: 'downtown', name: 'Downtown' },
  { id: 'uptown', name: 'Uptown' },
  { id: 'midtown', name: 'Midtown' },
  { id: 'mission-bay', name: 'Mission Bay' },
  { id: 'whispering-woods', name: 'Whispering Woods' },
]

export const roles = [
  { id: 'manager', name: 'Manager' },
  { id: 'assistant-manager', name: 'Assistant Manager' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'hr', name: 'HR' },
  { id: 'admin', name: 'Admin' },
]

// Write-up Templates — two templates
export const writeUpTemplates: WriteUpTemplate[] = [
  {
    id: 'wt-mgmt',
    title: 'Management Write-up',
    type: 'written-warning',
    description: 'Write-up template used by management for performance and conduct issues',
    managerSigns: true,
    workerSigns: true,
    allowDecline: false,
    escalationDays: 7,
    permissions: { locations: [], roles: ['manager', 'hr'] },
    status: 'active',
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'wt-worker',
    title: 'Worker Write-up',
    type: 'verbal-warning',
    description: 'Standard write-up for frontline team member incidents',
    managerSigns: true,
    workerSigns: true,
    allowDecline: false,
    escalationDays: 7,
    permissions: { locations: [], roles: [] },
    status: 'active',
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
]

// Sample Write-ups (instances) — referencing the two templates
export const writeUps: WriteUp[] = [
  {
    id: 'wu1',
    templateId: 'wt-worker',
    employeeId: '3',
    employeeName: 'Mike Williams',
    employeeRole: 'Cook',
    employeeLocation: 'Downtown',
    type: 'verbal-warning',
    title: 'Verbal Warning - Tardiness',
    incidentDate: '2024-01-15',
    description: 'Employee arrived 30 minutes late for scheduled shift without prior notice. This is the second occurrence this month.',
    managerNotes: 'Discussed importance of punctuality. Employee acknowledged and committed to improvement.',
    points: 1,
    status: 'acknowledged',
    sentDate: '2024-01-15',
    acknowledgedDate: '2024-01-16',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-01-15T10:30:00' },
    employeeSignature: { signedBy: 'Mike Williams', signedAt: '2024-01-16T09:15:00', declined: false },
    escalationDays: 7,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-15',
    location: 'Downtown',
  },
  {
    id: 'wu2',
    templateId: 'wt-mgmt',
    employeeId: '1',
    employeeName: 'John Smith',
    employeeRole: 'Server',
    employeeLocation: 'Downtown',
    type: 'written-warning',
    title: 'Written Warning - Cash Handling',
    incidentDate: '2024-01-20',
    description: 'Cash drawer was $50 short at end of shift. Employee was unable to account for the discrepancy.',
    managerNotes: 'Reviewed cash handling procedures. Additional training scheduled for next week.',
    points: 2,
    status: 'sent',
    sentDate: '2024-01-20',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-01-20T18:00:00' },
    escalationDays: 7,
    remindersSent: 1,
    lastReminderDate: '2024-01-25',
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-20',
    location: 'Downtown',
  },
  {
    id: 'wu3',
    templateId: 'wt-worker',
    employeeId: '4',
    employeeName: 'Emily Davis',
    employeeRole: 'Bartender',
    employeeLocation: 'Midtown',
    type: 'verbal-warning',
    title: 'Verbal Warning - Uniform Policy',
    incidentDate: '2024-01-18',
    description: 'Employee reported to work without proper uniform (missing name badge and non-approved shoes).',
    managerNotes: 'First occurrence. Employee was sent home to change and docked pay accordingly.',
    points: 1,
    status: 'refused',
    sentDate: '2024-01-18',
    managerSignature: { signedBy: 'Manager Alex', signedAt: '2024-01-18T11:00:00' },
    employeeSignature: { signedBy: 'Emily Davis', signedAt: '2024-01-25T14:30:00', declined: true, declineReason: 'I was not informed about the shoe policy change.' },
    escalationDays: 7,
    remindersSent: 2,
    lastReminderDate: '2024-01-24',
    createdBy: 'Manager Alex',
    createdAt: '2024-01-18',
    location: 'Midtown',
  },
  {
    id: 'wu4',
    templateId: 'wt-mgmt',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    employeeRole: 'Manager',
    employeeLocation: 'Uptown',
    type: 'recognition',
    title: 'Recognition - Outstanding Customer Service',
    incidentDate: '2024-01-22',
    description: 'Sarah received exceptional feedback from a customer who praised her handling of a difficult situation. She went above and beyond to resolve the issue and the customer has become a regular.',
    managerNotes: 'Great example of customer service excellence. Recommended for Employee of the Month.',
    status: 'acknowledged',
    sentDate: '2024-01-22',
    acknowledgedDate: '2024-01-22',
    managerSignature: { signedBy: 'Regional Manager', signedAt: '2024-01-22T16:00:00' },
    escalationDays: 30,
    remindersSent: 0,
    createdBy: 'Regional Manager',
    createdAt: '2024-01-22',
    location: 'Uptown',
  },
  {
    id: 'wu5',
    templateId: 'wt-mgmt',
    employeeId: '5',
    employeeName: 'Chris Brown',
    employeeRole: 'Host',
    employeeLocation: 'Downtown',
    type: 'final-warning',
    title: 'Final Warning - No-Show',
    incidentDate: '2024-01-28',
    description: 'Employee failed to report for scheduled shift without calling in. This is the third no-call no-show in the past 60 days.',
    managerNotes: 'Employee has been informed this is their final warning. Any further attendance issues will result in termination.',
    points: 3,
    status: 'draft',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-01-28T09:00:00' },
    escalationDays: 5,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-28',
    location: 'Downtown',
  },
  {
    id: 'wu6',
    templateId: 'wt-mgmt',
    employeeId: '3',
    employeeName: 'Mike Williams',
    employeeRole: 'Cook',
    employeeLocation: 'Downtown',
    type: 'performance-improvement',
    title: 'Performance Improvement Plan - Quality Standards',
    incidentDate: '2024-02-01',
    description: 'Multiple customer complaints about food quality and presentation over the past month. PIP to address cooking standards and attention to detail.',
    managerNotes: '30-day improvement plan. Weekly check-ins scheduled. Training refresher on plating standards.',
    status: 'scheduled',
    scheduledDate: '2024-02-05T09:00:00',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-02-01T14:00:00' },
    escalationDays: 14,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-01',
    location: 'Downtown',
  },
  {
    id: 'wu7',
    templateId: 'wt-worker',
    employeeId: '6',
    employeeName: 'Maria Santos',
    employeeRole: 'Server',
    employeeLocation: 'Downtown',
    type: 'verbal-warning',
    title: 'Verbal Warning - Cell Phone Usage',
    incidentDate: '2024-02-05',
    description: 'Employee was observed using personal cell phone during service hours multiple times despite previous verbal reminders.',
    managerNotes: 'Reiterated cell phone policy. Employee agreed to keep phone in locker during shifts.',
    points: 1,
    status: 'acknowledged',
    sentDate: '2024-02-05',
    acknowledgedDate: '2024-02-06',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-02-05T15:00:00' },
    employeeSignature: { signedBy: 'Maria Santos', signedAt: '2024-02-06T10:00:00', declined: false },
    escalationDays: 7,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-05',
    location: 'Downtown',
  },
  {
    id: 'wu8',
    templateId: 'wt-worker',
    employeeId: '7',
    employeeName: 'James Wilson',
    employeeRole: 'Line Cook',
    employeeLocation: 'Midtown',
    type: 'written-warning',
    title: 'Written Warning - Food Safety Violation',
    incidentDate: '2024-02-10',
    description: 'Employee failed to properly label and date prep items, violating food safety protocols. Found unlabeled items during health inspection prep.',
    managerNotes: 'Mandatory food safety refresher course assigned. Follow-up inspection in 2 weeks.',
    points: 2,
    status: 'sent',
    sentDate: '2024-02-10',
    managerSignature: { signedBy: 'Manager Alex', signedAt: '2024-02-10T16:00:00' },
    escalationDays: 7,
    remindersSent: 0,
    createdBy: 'Manager Alex',
    createdAt: '2024-02-10',
    location: 'Midtown',
  },
  {
    id: 'wu9',
    templateId: 'wt-mgmt',
    employeeId: '8',
    employeeName: 'Priya Patel',
    employeeRole: 'Bartender',
    employeeLocation: 'Downtown',
    type: 'verbal-warning',
    title: 'Verbal Warning - Over-pouring',
    incidentDate: '2024-02-12',
    description: 'Inventory audit revealed consistent over-pouring on spirits. Cost variance of 8% above acceptable threshold.',
    managerNotes: 'Re-trained on pour counts and jigger usage. Will monitor pour costs for next 30 days.',
    points: 1,
    status: 'acknowledged',
    sentDate: '2024-02-12',
    acknowledgedDate: '2024-02-13',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-02-12T11:00:00' },
    employeeSignature: { signedBy: 'Priya Patel', signedAt: '2024-02-13T09:30:00', declined: false },
    escalationDays: 7,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-12',
    location: 'Downtown',
  },
  {
    id: 'wu10',
    templateId: 'wt-worker',
    employeeId: '9',
    employeeName: 'David Kim',
    employeeRole: 'Server',
    employeeLocation: 'Uptown',
    type: 'verbal-warning',
    title: 'Verbal Warning - Guest Complaint',
    incidentDate: '2024-02-14',
    description: 'Received formal guest complaint about rude interaction. Guest reported dismissive attitude when asking about allergen information.',
    managerNotes: 'Discussed service standards and allergen awareness. Scheduled refresher training.',
    points: 1,
    status: 'sent',
    sentDate: '2024-02-14',
    managerSignature: { signedBy: 'Manager Taylor', signedAt: '2024-02-14T17:00:00' },
    escalationDays: 7,
    remindersSent: 1,
    lastReminderDate: '2024-02-20',
    createdBy: 'Manager Taylor',
    createdAt: '2024-02-14',
    location: 'Uptown',
  },
  {
    id: 'wu11',
    templateId: 'wt-mgmt',
    employeeId: '10',
    employeeName: 'Lisa Chen',
    employeeRole: 'Shift Lead',
    employeeLocation: 'Midtown',
    type: 'written-warning',
    title: 'Written Warning - Failure to Complete Closing Duties',
    incidentDate: '2024-02-18',
    description: 'As shift lead, failed to ensure closing checklist was completed. Health-critical items (temperature logs, sanitizer levels) were not verified.',
    managerNotes: 'As a shift lead, accountability for closing duties is paramount. Second occurrence will result in demotion consideration.',
    points: 2,
    status: 'refused',
    sentDate: '2024-02-18',
    managerSignature: { signedBy: 'Regional Manager', signedAt: '2024-02-18T10:00:00' },
    employeeSignature: { signedBy: 'Lisa Chen', signedAt: '2024-02-25T11:00:00', declined: true, declineReason: 'I completed the checklist but the system did not save it.' },
    escalationDays: 7,
    remindersSent: 2,
    lastReminderDate: '2024-02-24',
    createdBy: 'Regional Manager',
    createdAt: '2024-02-18',
    location: 'Midtown',
  },
  {
    id: 'wu12',
    templateId: 'wt-worker',
    employeeId: '11',
    employeeName: 'Tom Rivera',
    employeeRole: 'Dishwasher',
    employeeLocation: 'Downtown',
    type: 'coaching',
    title: 'Coaching - Workplace Communication',
    incidentDate: '2024-02-20',
    description: 'Observed conflict with coworker regarding task delegation. Both parties raised voices on the floor during service.',
    managerNotes: 'Mediated conversation between both parties. Reviewed communication expectations. No further action at this time.',
    status: 'acknowledged',
    sentDate: '2024-02-20',
    acknowledgedDate: '2024-02-21',
    managerSignature: { signedBy: 'Sarah Johnson', signedAt: '2024-02-20T14:00:00' },
    employeeSignature: { signedBy: 'Tom Rivera', signedAt: '2024-02-21T09:00:00', declined: false },
    escalationDays: 7,
    remindersSent: 0,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-02-20',
    location: 'Downtown',
  },
]

// Helper function to get employee's write-up history
export const getEmployeeWriteUps = (employeeId: string): WriteUp[] => {
  return writeUps.filter(wu => wu.employeeId === employeeId)
}

/** Look up write-up template title by id */
export const getWriteUpTemplateName = (templateId: string): string => {
  return writeUpTemplates.find(t => t.id === templateId)?.title ?? 'Unknown Template'
}

// Helper function to get employee's point balance
export const getEmployeePointBalance = (employeeId: string): number => {
  return writeUps
    .filter(wu => wu.employeeId === employeeId && wu.status !== 'draft' && wu.points)
    .reduce((total, wu) => total + (wu.points || 0), 0)
}

// Helper function to get write-ups by status
export const getWriteUpsByStatus = (status: WriteUpStatus): WriteUp[] => {
  return writeUps.filter(wu => wu.status === status)
}

// Write-up statistics
export const getWriteUpStats = () => {
  return {
    total: writeUps.length,
    draft: writeUps.filter(wu => wu.status === 'draft').length,
    scheduled: writeUps.filter(wu => wu.status === 'scheduled').length,
    sent: writeUps.filter(wu => wu.status === 'sent').length,
    acknowledged: writeUps.filter(wu => wu.status === 'acknowledged').length,
    refused: writeUps.filter(wu => wu.status === 'refused').length,
    pendingAcknowledgement: writeUps.filter(wu => wu.status === 'sent').length,
  }
}

// ==========================================
// CERTIFICATIONS
// ==========================================

export type CertificationCategory = 
  | 'food-safety' 
  | 'alcohol' 
  | 'drivers-license' 
  | 'work-permit' 
  | 'professional' 
  | 'health'
  | 'other'

export type CertificationStatus = 
  | 'requested' 
  | 'pending-upload' 
  | 'pending-verification' 
  | 'active' 
  | 'expiring-soon' 
  | 'expired' 
  | 'rejected'

export interface CertificationTemplate {
  id: string
  name: string
  category: CertificationCategory
  description?: string
  instructions?: string
  
  // Expiration settings
  expirationRequired: boolean
  defaultValidityDays?: number
  
  // Reminder settings
  reminderDays: number[]
  
  // Verification
  requireVerification: boolean
  
  // Auto-assign rules
  autoAssignRules: {
    enabled: boolean
    trigger: 'hire' | 'job_change' | 'manual'
    conditions: {
      jobTitles?: string[]
      locations?: string[]
      roles?: string[]
    }
  }
  
  createdAt: string
  createdBy: string
}

export interface EmployeeCertification {
  id: string
  templateId: string
  templateName: string
  category: CertificationCategory
  employeeId: string
  employeeName: string
  employeeRole: string
  employeeLocation: string
  
  // Status
  status: CertificationStatus
  
  // Document
  documentUrl?: string
  documentName?: string
  uploadedAt?: string
  
  // Expiration
  expirationDate?: string
  certificateNumber?: string
  
  // Verification
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
  
  // Reminders
  lastReminderSent?: string
  reminderCount: number
  
  // Metadata
  requestedBy: string
  requestedAt: string
}

// Certification Templates
export const certificationTemplates: CertificationTemplate[] = [
  {
    id: 'ct1',
    name: 'Food Handler Certificate',
    category: 'food-safety',
    description: 'Required for all food handling positions',
    instructions: 'Upload your current food handler certificate. Must show expiration date clearly.',
    expirationRequired: true,
    defaultValidityDays: 730, // 2 years
    reminderDays: [60, 30, 14, 7],
    requireVerification: true,
    autoAssignRules: {
      enabled: true,
      trigger: 'hire',
      conditions: {
        jobTitles: ['Server', 'Cook', 'Prep Cook', 'Bartender', 'Busser'],
      },
    },
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'ct2',
    name: 'TIPS Alcohol Certification',
    category: 'alcohol',
    description: 'Required for all positions serving alcohol',
    instructions: 'Upload your TIPS or equivalent alcohol service certification.',
    expirationRequired: true,
    defaultValidityDays: 1095, // 3 years
    reminderDays: [90, 30, 14, 7],
    requireVerification: true,
    autoAssignRules: {
      enabled: true,
      trigger: 'hire',
      conditions: {
        jobTitles: ['Bartender', 'Server'],
      },
    },
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'ct3',
    name: 'Driver\'s License',
    category: 'drivers-license',
    description: 'Required for delivery and driver positions',
    instructions: 'Upload front and back of your valid driver\'s license.',
    expirationRequired: true,
    defaultValidityDays: 1460, // 4 years
    reminderDays: [60, 30, 14, 7],
    requireVerification: true,
    autoAssignRules: {
      enabled: true,
      trigger: 'hire',
      conditions: {
        jobTitles: ['Delivery Driver'],
      },
    },
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'ct4',
    name: 'Work Authorization',
    category: 'work-permit',
    description: 'Work permit or visa documentation',
    instructions: 'Upload your current work authorization document.',
    expirationRequired: true,
    reminderDays: [90, 60, 30, 14, 7],
    requireVerification: true,
    autoAssignRules: {
      enabled: false,
      trigger: 'manual',
      conditions: {},
    },
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
  {
    id: 'ct5',
    name: 'Manager Food Safety Certification',
    category: 'food-safety',
    description: 'ServSafe Manager or equivalent certification',
    instructions: 'Upload your manager-level food safety certification.',
    expirationRequired: true,
    defaultValidityDays: 1825, // 5 years
    reminderDays: [90, 60, 30, 14, 7],
    requireVerification: true,
    autoAssignRules: {
      enabled: true,
      trigger: 'job_change',
      conditions: {
        jobTitles: ['Manager', 'Assistant Manager', 'Shift Lead'],
      },
    },
    createdAt: '2024-01-01',
    createdBy: 'Admin',
  },
]

// Employee Certifications (instances)
export const employeeCertifications: EmployeeCertification[] = [
  {
    id: 'ec1',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '1',
    employeeName: 'John Smith',
    employeeRole: 'Server',
    employeeLocation: 'Downtown',
    status: 'active',
    documentUrl: '/uploads/cert-001.pdf',
    documentName: 'food_handler_john.pdf',
    uploadedAt: '2024-01-10',
    expirationDate: '2026-01-10',
    certificateNumber: 'FH-2024-12345',
    verifiedBy: 'Sarah Johnson',
    verifiedAt: '2024-01-11',
    reminderCount: 0,
    requestedBy: 'System',
    requestedAt: '2024-01-05',
  },
  {
    id: 'ec2',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '3',
    employeeName: 'Mike Williams',
    employeeRole: 'Cook',
    employeeLocation: 'Downtown',
    status: 'expiring-soon',
    documentUrl: '/uploads/cert-002.pdf',
    documentName: 'food_handler_mike.pdf',
    uploadedAt: '2022-02-15',
    expirationDate: '2024-02-15',
    certificateNumber: 'FH-2022-67890',
    verifiedBy: 'Sarah Johnson',
    verifiedAt: '2022-02-16',
    lastReminderSent: '2024-01-15',
    reminderCount: 1,
    requestedBy: 'System',
    requestedAt: '2022-02-10',
  },
  {
    id: 'ec3',
    templateId: 'ct2',
    templateName: 'TIPS Alcohol Certification',
    category: 'alcohol',
    employeeId: '4',
    employeeName: 'Emily Davis',
    employeeRole: 'Bartender',
    employeeLocation: 'Midtown',
    status: 'expired',
    documentUrl: '/uploads/cert-003.pdf',
    documentName: 'tips_emily.pdf',
    uploadedAt: '2021-06-20',
    expirationDate: '2023-06-20',
    certificateNumber: 'TIPS-2021-11111',
    verifiedBy: 'Manager Alex',
    verifiedAt: '2021-06-21',
    lastReminderSent: '2023-06-15',
    reminderCount: 3,
    requestedBy: 'System',
    requestedAt: '2021-06-15',
  },
  {
    id: 'ec4',
    templateId: 'ct1',
    templateName: 'Food Handler Certificate',
    category: 'food-safety',
    employeeId: '5',
    employeeName: 'Chris Brown',
    employeeRole: 'Host',
    employeeLocation: 'Downtown',
    status: 'pending-upload',
    lastReminderSent: '2024-01-20',
    reminderCount: 2,
    requestedBy: 'Sarah Johnson',
    requestedAt: '2024-01-10',
  },
  {
    id: 'ec5',
    templateId: 'ct3',
    templateName: 'Driver\'s License',
    category: 'drivers-license',
    employeeId: '6',
    employeeName: 'Alex Martinez',
    employeeRole: 'Delivery Driver',
    employeeLocation: 'Uptown',
    status: 'pending-verification',
    documentUrl: '/uploads/cert-005.pdf',
    documentName: 'drivers_license_alex.pdf',
    uploadedAt: '2024-01-25',
    expirationDate: '2027-05-15',
    reminderCount: 0,
    requestedBy: 'System',
    requestedAt: '2024-01-20',
  },
  {
    id: 'ec6',
    templateId: 'ct2',
    templateName: 'TIPS Alcohol Certification',
    category: 'alcohol',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    employeeRole: 'Manager',
    employeeLocation: 'Uptown',
    status: 'active',
    documentUrl: '/uploads/cert-006.pdf',
    documentName: 'tips_sarah.pdf',
    uploadedAt: '2023-08-10',
    expirationDate: '2025-08-10',
    certificateNumber: 'TIPS-2023-22222',
    verifiedBy: 'Regional Manager',
    verifiedAt: '2023-08-11',
    reminderCount: 0,
    requestedBy: 'System',
    requestedAt: '2023-08-05',
  },
  {
    id: 'ec7',
    templateId: 'ct5',
    templateName: 'Manager Food Safety Certification',
    category: 'food-safety',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    employeeRole: 'Manager',
    employeeLocation: 'Uptown',
    status: 'active',
    documentUrl: '/uploads/cert-007.pdf',
    documentName: 'servsafe_sarah.pdf',
    uploadedAt: '2022-03-15',
    expirationDate: '2027-03-15',
    certificateNumber: 'SS-2022-33333',
    verifiedBy: 'Regional Manager',
    verifiedAt: '2022-03-16',
    reminderCount: 0,
    requestedBy: 'System',
    requestedAt: '2022-03-10',
  },
]

// Helper function to get employee's certifications
export const getEmployeeCertifications = (employeeId: string): EmployeeCertification[] => {
  return employeeCertifications.filter(cert => cert.employeeId === employeeId)
}

// Helper function to get certifications by status
export const getCertificationsByStatus = (status: CertificationStatus): EmployeeCertification[] => {
  return employeeCertifications.filter(cert => cert.status === status)
}

// Helper function to get expiring certifications (within X days)
export const getExpiringCertifications = (withinDays: number): EmployeeCertification[] => {
  const now = new Date()
  const futureDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
  
  return employeeCertifications.filter(cert => {
    if (!cert.expirationDate || cert.status !== 'active') return false
    const expiryDate = new Date(cert.expirationDate)
    return expiryDate <= futureDate && expiryDate >= now
  })
}

// Certification statistics
export const getCertificationStats = () => {
  return {
    total: employeeCertifications.length,
    active: employeeCertifications.filter(c => c.status === 'active').length,
    expiringSoon: employeeCertifications.filter(c => c.status === 'expiring-soon').length,
    expired: employeeCertifications.filter(c => c.status === 'expired').length,
    pendingUpload: employeeCertifications.filter(c => c.status === 'pending-upload').length,
    pendingVerification: employeeCertifications.filter(c => c.status === 'pending-verification').length,
    rejected: employeeCertifications.filter(c => c.status === 'rejected').length,
  }
}
