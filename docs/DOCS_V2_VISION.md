# Docs V2 - Complete Implementation Plan

## Executive Summary

Build a **unified Documents product** that handles all employee paperwork through 5 document behaviors (Sign, Upload, Complete, Generate, Collect), powered by an internal Forms Engine, with specialized dashboard views for different workflows.

**Core Value Proposition:** "Stay compliant and audit-ready with less manual work."

---

## Architecture Decision

### Unified Document Model with Specialized Views

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENTS PRODUCT                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FORMS ENGINE (Internal)                       │   │
│  │  Field types, conditional logic, calculations, validations       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐        │
│  │   SIGN    │  UPLOAD   │ COMPLETE  │ GENERATE  │  COLLECT  │        │
│  │  (PDF +   │ (Request  │  (LMS/    │  (Mail    │  (Custom  │        │
│  │ signature)│  certs)   │ External) │  merge)   │   forms)  │        │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘        │
│                              │                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              SPECIALIZED DASHBOARD VIEWS                         │   │
│  │  Templates | Members | Certifications | Training | Write-ups    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              EMPLOYEE PROFILE INTEGRATION                        │   │
│  │  All documents visible in unified employee Documents section     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5 Document Behaviors

| Behavior | Description | Examples |
|----------|-------------|----------|
| **SIGN** | Static document + signatures | Handbooks, NDAs, I-9, contracts |
| **UPLOAD** | Request external file from employee | Certifications, licenses, permits |
| **COMPLETE** | Record external system completion | LMS training, background checks |
| **GENERATE** | Create document from template + data (mail merge) | Offer letters, promotion letters |
| **COLLECT** | Structured form → stored data | Demerit points, WOTC, uniform orders, t-shirt size |

### Document Entity Model

```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  
  // Document behavior type
  type: 'sign' | 'upload' | 'complete' | 'generate' | 'collect';
  
  // Category for organization
  category: 'onboarding' | 'certification' | 'performance' | 
            'training' | 'separation' | 'operational';
  
  // Expiration settings
  expiration: {
    behavior: 'none' | 'fixed_date' | 'relative_to_hire' | 'recurring';
    duration?: number; // days
    reminder_days?: number[]; // [30, 14, 7, 1]
  };
  
  // Signature configuration
  signatures: {
    required: boolean;
    signers: Array<'employee' | 'manager' | 'witness' | 'hr'>;
    order: 'any' | 'sequential';
    allow_decline: boolean; // for write-ups
  };
  
  // Permissions
  visibility: {
    locations: string[];
    roles: string[];
    job_titles: string[];
  };
  
  // Auto-assignment rules
  auto_assign: {
    enabled: boolean;
    trigger: 'hire' | 'job_change' | 'location_change' | 'schedule' | 'expiry';
    conditions: Record<string, any>;
  };
  
  // For form-based documents
  form_schema?: FormField[];
  
  // For external integrations
  integration?: {
    source: 'lms' | 'background_check' | 'everify' | 'payroll';
    external_id: string;
  };
  
  // Output settings
  output: {
    generate_pdf: boolean;
    update_employee_attributes: boolean;
    trigger_workflow: boolean;
  };
}
```

---

## Current State Analysis

### What Exists

| Feature | Status | Location |
|---------|--------|----------|
| Templates list with filtering | Built | `DocumentsPage.tsx` |
| Members view with document progress | Built | `MembersTable.tsx` |
| Document detail with assignment tracking | Built | `DocumentDetailPage.tsx` |
| Add document type selector (4 types) | Built | `DocumentTypeSelector.tsx` |
| PDF upload and field mapping | Built | `DocumentMappingModal.tsx` |
| Write-up creation form | Built | `AddDocumentModal.tsx` |
| Collect uploads form | Built | `AddDocumentModal.tsx` |

---

## Phase 1: Core Feature Gaps

### 1.1 Template Library Quick Start
**Files:** New `TemplateLibraryModal.tsx`

- Add "Browse Templates" option to type selector
- Categories: Onboarding, Certifications, Performance, Policies
- Pre-built templates: Employee Handbook, NDA, Food Handler Request, Write-up forms
- One-click add with customization option

### 1.2 Reminder System
**Files:** Modify `DocumentDetailPage.tsx`, new `ReminderControls.tsx`

- "Send Reminder" button per recipient in Needs Attention table
- Bulk selection with "Remind All" action
- Reminder history (last sent date)
- Email digest settings for HR (weekly expiring docs summary)

### 1.3 Delete Template
**Files:** Modify `DocumentsTable.tsx`, new `DeleteConfirmationModal.tsx`

- Add "Delete" to overflow menu
- Confirmation dialog showing impact (X active assignments)
- Soft delete with archive option

### 1.4 Bulk Download
**Files:** Modify `MembersTable.tsx`, new `BulkDownloadModal.tsx`

- Download button per member row
- Select documents to include
- Format options (ZIP of PDFs, combined PDF)
- PII masking toggle based on user permissions

### 1.5 Counter-signer Modification
**Files:** New `ChangeSignerModal.tsx`

- Add "Change Signer" in assignment row actions
- Select new counter-signer from manager list
- Option to resend notification
- Audit trail entry

### 1.6 Certifications Dashboard
**Files:** New `CertificationsDashboard.tsx`, `ExpiryCalendar.tsx`

- New tab: "Certifications" in main nav
- Views: Calendar, List, Alerts
- Filters: Expiring Soon, Expired, Valid, All
- Auto-assign rules configuration modal
- Bulk reminder action

### 1.7 Write-up Enhancements
**Files:** Modify `AddDocumentModal.tsx`, new `ScheduleSendModal.tsx`

- Schedule send date picker
- Save as draft functionality
- Non-acknowledgement handling (escalation after X days)
- Permission controls (who can create, who can view)

### 1.8 Employee Write-up History
**Files:** New `EmployeeWriteUpHistory.tsx`

- Write-ups section in employee profile
- Timeline view with statuses
- Point balance display (for demerit systems)
- Threshold warnings

### 1.9 Permissions Panel
**Files:** New `PermissionsPanel.tsx`, `LocationRoleSelector.tsx`

- Template settings modal
- Visibility by location/role/job title
- PII masking configuration
- Audit access controls

### 1.10 Folders and Tags
**Files:** New `FoldersSidebar.tsx`, `TagManager.tsx`

- Folder tree in left sidebar
- Drag-and-drop organization
- Tag badges on documents
- Filter by folder/tag
- Naming convention suggestions

### 1.11 Employee Document Portal
**Files:** New `EmployeeDocumentsPage.tsx`

- Employee-facing view (mobile-first)
- Pending documents to complete
- Signed documents to download
- Expiring certifications to renew

---

## Phase 2: Forms Engine and Advanced Features

### 2.1 Forms Engine Core
**Files:** New `FormBuilder.tsx`, `FormRenderer.tsx`, `FormField.tsx`

Field types:
- Text (single line, multi-line)
- Number (with validation)
- Dropdown (single, multi-select)
- Checkbox / Radio
- Date / Date range
- File upload
- Signature
- Calculated field
- Section header

Features:
- Conditional logic (show/hide based on answers)
- Field validation rules
- Required field handling
- Default values
- Placeholder text

### 2.2 Form-based Document Templates
**Files:** Modify type selector, new form template flow

Use cases:
- Demerit point tracking (calculated totals, thresholds)
- WOTC questionnaire (conditional questions)
- Uniform orders (size fields, quantities)
- T-shirt size collection (simple attribute update)
- Emergency contact forms
- Availability forms

### 2.3 Employee Attribute Updates
**Files:** New `AttributeMappingConfig.tsx`

- Map form fields to employee profile attributes
- Auto-update on form submission
- Examples: t-shirt size, dietary restrictions, emergency contact

### 2.4 Workflow Triggers
**Files:** New `WorkflowRulesEngine.tsx`

- Threshold-based actions (10 points → auto-generate final warning)
- Approval workflows (uniform order → manager approval)
- Escalation rules (no acknowledgment after 7 days → notify HR)
- Expiry-triggered reassignment

### 2.5 LMS Integration
**Files:** New `LMSIntegrationConfig.tsx`, `TrainingDashboard.tsx`

- Connect external LMS (API integration)
- Sync course completions as documents
- Training compliance dashboard
- Auto-assign required training by role

### 2.6 Document Generation (Mail Merge)
**Files:** New `DocumentGenerator.tsx`, `TemplateVariables.tsx`

- Template with merge fields (e.g., `{{first_name}}`, `{{job_title}}`)
- Pull employee data automatically
- Generate offer letters, promotion letters, termination letters
- Signature workflow after generation

### 2.7 Audit Trail
**Files:** New `AuditTrailPanel.tsx`

- Document activity log
- Who viewed, signed, modified, downloaded
- Timestamp and IP logging
- Compliance-ready export

### 2.8 Template Library Admin
**Files:** New `TemplateLibraryAdmin.tsx`

- Corporate template upload
- HR consultant access
- Version control
- Distribution to locations

---

## Phase 3: Future Scalability

### 3.1 Performance Reviews
- Structured review forms with rating scales
- Manager and self-assessment sections
- Goal tracking integration
- Review cycle management

### 3.2 Onboarding Integration
- Documents as onboarding module
- Required vs optional documents
- Progress tracking
- Gated access (paywall consideration)

### 3.3 Advanced Compliance
- I-9 reverification tracking
- Minor work permit management
- State-specific document requirements
- Automated compliance alerts

### 3.4 Mobile-First Write-ups
- Manager mobile app for write-ups
- Photo evidence attachment
- Voice-to-text notes
- On-the-floor documentation

---

## Navigation Structure

```
Documents (Main Nav)
│
├── [Templates]         ← All templates, filterable
│   ├── Filter by: Type, Category, Folder, Tag
│   ├── Add: Type selector with 6 options
│   └── Actions: Edit, Assign, Duplicate, Delete
│
├── [Assigned]          ← All pending assignments
│   ├── Filter by: Status, Due Date, Location
│   ├── Bulk actions: Remind, Cancel, Reassign
│   └── Quick view: Needs Attention count
│
├── [Members]           ← Employee document status
│   ├── Progress per employee
│   ├── Expand to see by category
│   └── Actions: Download, View Profile
│
├── [Certifications]    ← Expiration-focused view
│   ├── Calendar view of expirations
│   ├── Filters: Expiring, Expired, Valid
│   ├── Auto-assign rules config
│   └── Bulk reminder actions
│
├── [Training]          ← LMS completions (Phase 2)
│   ├── Required training by role
│   ├── Completion status
│   └── Compliance percentage
│
└── [Write-ups]         ← Performance documentation
    ├── Recent across team
    ├── Filter by type
    ├── Quick-create action
    └── Point balance summaries
```

---

## Employee Profile Integration

```
Employee Profile → Documents Section
│
├── OVERVIEW STATS
│   ├── Documents: 18/20 complete
│   ├── Certifications: 2 expiring soon
│   └── Points Balance: 4/12
│
├── SIGNED DOCUMENTS
│   ├── [Filter by category]
│   └── [Download individual or bulk]
│
├── CERTIFICATIONS
│   ├── Status and expiry dates
│   ├── [Request new upload]
│   └── [Set reminder]
│
├── WRITE-UPS / PERFORMANCE
│   ├── Timeline view
│   ├── Point history
│   └── [Create new]
│
├── TRAINING COMPLETIONS
│   ├── Required courses status
│   └── Certificates
│
└── EMPLOYEE ATTRIBUTES (from forms)
    ├── T-shirt size, uniform info
    ├── Emergency contact
    └── Availability
```

---

## Updated Type Selector

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  What would you like to create?                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│   │  📄 Upload PDF  │    │  📝 Create Form │    │  📤 Request     │    │
│   │   for Signing   │    │                 │    │    Upload       │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│   │  ⚡ Quick Start │    │  📋 Duplicate   │    │  🔗 Connect     │    │
│   │   from Library  │    │    Existing     │    │    External     │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify Summary

### Phase 1 - New Components
| Component | Purpose |
|-----------|---------|
| `TemplateLibraryModal.tsx` | Browse and add pre-built templates |
| `ReminderControls.tsx` | Send reminder actions |
| `DeleteConfirmationModal.tsx` | Template deletion with impact warning |
| `BulkDownloadModal.tsx` | Multi-document download |
| `ChangeSignerModal.tsx` | Modify counter-signer |
| `CertificationsDashboard.tsx` | Certification expiry tracking |
| `ExpiryCalendar.tsx` | Calendar view of expirations |
| `ScheduleSendModal.tsx` | Schedule write-up send date |
| `EmployeeWriteUpHistory.tsx` | Profile write-up section |
| `PermissionsPanel.tsx` | Template visibility controls |
| `FoldersSidebar.tsx` | Document organization |
| `TagManager.tsx` | Tag management |
| `EmployeeDocumentsPage.tsx` | Employee portal |

### Phase 1 - Modified Files
| File | Changes |
|------|---------|
| `DocumentsPage.tsx` | Add folder sidebar, certifications tab |
| `DocumentDetailPage.tsx` | Add reminder buttons, change signer |
| `MembersTable.tsx` | Add bulk download, write-up link |
| `DocumentTypeSelector.tsx` | Add template library option |
| `AddDocumentModal.tsx` | Add schedule send, draft mode |
| `DocumentsTable.tsx` | Add delete option |
| `mockData.ts` | Expand data models |

### Phase 2 - New Components
| Component | Purpose |
|-----------|---------|
| `FormBuilder.tsx` | Form field configuration UI |
| `FormRenderer.tsx` | Form display and submission |
| `FormField.tsx` | Individual field components |
| `WorkflowRulesEngine.tsx` | Threshold and trigger logic |
| `LMSIntegrationConfig.tsx` | External LMS connection |
| `TrainingDashboard.tsx` | Training compliance view |
| `DocumentGenerator.tsx` | Mail merge document creation |
| `AuditTrailPanel.tsx` | Activity logging |
| `TemplateLibraryAdmin.tsx` | Corporate template management |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Docs-enabled customer activation | 7% → 20% | Monthly active customers |
| Documents assigned per employee | 1+ per month | Average across active customers |
| Certification renewal before expiry | 90% | Renewed vs expired |
| Write-up completion rate | 85% | Acknowledged vs assigned |
| Time to create template | < 5 minutes | Avg from start to save |
| Employee self-service usage | 50% of downloads | Employee vs manager downloads |

---

## Appendix: Restaurant HR Document Landscape

### Document Categories

| Category | Examples | Signature? | Expires? |
|----------|----------|------------|----------|
| **Onboarding** | I-9, W-4, Direct Deposit, Handbook | Yes | Some |
| **Certifications** | Food Handler, Alcohol Server, Driver's License | No (upload) | Yes |
| **Performance** | Write-ups, PIPs, Reviews | Yes | No |
| **Training** | Sexual Harassment, Safety, POS | Acknowledgment | Annual |
| **Separation** | Termination Letter, Exit Interview | Yes | No |
| **Operational** | Cash Handling, Key Agreement | Yes | No |

### Auto-assign Triggers

| Trigger | Example Use Case |
|---------|------------------|
| `hire` | Onboarding documents, required certs by job title |
| `job_change` | New role requires additional certifications |
| `location_change` | Location-specific policies |
| `schedule` | Annual policy re-acknowledgment |
| `expiry` | Certification about to expire, request renewal |



