- **Table of contents**

<aside>
💡

Looking for requirements? Jump straight [here](https://www.notion.so/PRD-Docs-V2-1e5a1747bfd180a59eedc24b160af374?pvs=21).

</aside>

 https://www.figma.com/design/KEdYHUcKWVYRnRq3KutXHo/Documents-V2?node-id=0-1&t=XC7zU0iEmhvBF9su-1

# **Brief**

---

## 💭 Problem

### ⚠️ Docs as a product is a data moat, but has a very low usage

- Docs is a strong data moat to prevent churn. Customers rely on us to store up-to-date employee data and docs.
- Outside of onboarding, ad-hoc docs are not being assigned actively. Only 3% of documents-enabled customers are active (sent at least 1 doc every month in the last 6 months)

### 🔍 Problem with Workstream Documents

The current Documents product makes it hard for managers and employees to stay organized, stay compliant, and save time. Key issues include:

1. **No reminders for expiring licenses**
    
    Managers can upload licenses (like food safety or driver's licenses), but the system doesn't track when they expire. This puts the business at risk and adds manual work.
    
2. **It's hard to track who has completed what**
    
    There's no simple way to see which documents are still pending or to automatically remind workers. Also, there's no conditional logic to identify if a person, based on their age and job, needs to complete a document. Managers spend too much time identifying gaps and following up. 
    
3. **Documents are messy and unorganized**
    
    Uploaded documents are often poorly named or not sorted into folders, making audits and AI compliance analysis difficult. 
    
4. **Employees can't access their signed documents**
    
    Workers can't view or update their signed documents (like offer letters), so managers have to send them again if needed. This creates confusion and extra work.
    
5. **No control over who can see templates**
    
    Businesses with multiple locations can't limit which managers have access to certain document templates, leading to confusion or potential misuse.
    

### 🔭 Strategic Considerations

We initially built Forms as part of Task Management to support operational checklists. However, customers consistently view Workstream as an **employee management platform**, not an operational tool.

Based on this insight, we're pivoting to **employee-focused forms** within the documents package—helping customers capture and store more employee information directly in their workflows.

![image.png](attachment:ed79a8fc-3012-4ccb-80a1-f2c2169a9900:image.png)

## ☁️ **High-Level Approach**

1. Track and remind employees with missing signatures, certs, and write ups
2. Support certification and licenses and expirations
    1. Auto assign certifications based on job titles and expiration
3. Support write ups
    1. Write up template available for edit or quick start
    2. Managers can assign write ups on mobile
    3. Write ups can be scheduled to be sent to worker on date, or save as draft until manager is ready
    4. Permission controls 
4. Support quick start options - create default templates ready to be used immediately
5. Improve UX
    1. Easier to find bulk download options for employees - but remind them that they can export whenever they need without needing to store it in another drive
    2. Ability to modify counter-signer after docs is assigned and resend
6. Granular access control 
    1. Assign, view docs by location / hierarchy
    2. Tie docs to location

## Conviction

[Biz cases](https://www.notion.so/Biz-cases-2cba1747bfd1805b9bf7ffe245d38d99?pvs=21) 

# **Requirements and Implementation**

---

| Features | Employee | Manager |
| --- | --- | --- |
| Document template management | N/A | Desktop |
| Assigning Docs | N/A | Desktop, Mobile |
| Signing / Uploading | Mobile | Desktop, Mobile |

## **Product Requirements**

✅ **Phase 1 in scope**

1. **Support quick start options** 
    1. Create default templates ready to be used immediately
2. **Track and remind employees with missing signatures, certs, and write ups**
    1. For each active team member, which document was not completed
    2. For each document, view which worker did not complete
    3. Filter by overdue or expired / expiring
    4. Automatically / manually resend reminder to workers with incomplete documents
    5. Digest email to HR on expiring documents (Add to expiring I-9 reminder)
3. **Improve UX**
    1. ***Able to delete document templates with permission
    2. Easier to find bulk download options for employees
        1. but also encourage storage in Workstream as primary source of truth
    3. Ability to modify counter-signer after docs is assigned and resend
4. **Document template management**
    1. New policy workflow - can assign new version to a group of employees and track completion
    2. Support multiple signers and configurable sequencing (who signs first)
5. **Certifications and licenses**
    1. Manager can request employee to upload, or employee self-serve
    2. Expiration date
    3. Set auto-reminders (configurable)
    4. Auto-assign based on job titles 
6. **Support write ups**
    1. Write up template available for edit or quick start
    2. Assess employee's completed / canceled write ups in employee profile
    3. Handle non-acknowledgement for write ups 
    4. Managers can assign write ups on mobile
    5. Write ups can be scheduled to be sent to worker on date, or save as draft until manager is ready
    6. Permission controls 
7. **Employee document access**
    1. Employees can view/download signed documents in app
8. **Permissions**
    1. Control template visibility/assignment by location or role
    2. PII in downloaded documents should be masked if the user has no "Full PII" permission
        1. SSN, Document IDs (For licenses), Direct Deposit
9. **Audit-friendly document organization**
    1. Folders, naming conventions, tagging
    2. Sort by date, type, or location

🛑 **Phase 2 / Out of scope**

1. **Adding Ad-hoc docs into Onboarding**
2. **Formalize forms**
    1. Signature for forms
    2. Export completed forms as PDF
    3. Audit trail
3. **Documents Template Library** 
    1. HR consultants or customers can upload standardized forms without engineering help
4. **Gated onboarding company documents**
    1. Customers have to buy Documents in order to add it into Onboarding - e.g. create a new onboarding module that is paywalled

---

# **UI Specifications & User Flows**

Based on the Figma designs, the following UI specifications and user flows are defined:

## **1. Navigation & Layout**

### Global Navigation (Left Sidebar)
- **Width:** 240px
- **Background:** Dark theme (#1F2937)
- **Sections:**
  - Home
  - Messages
  - Scheduling
  - Reporting
  - **HIRING:** Applicants, Job Postings, Sourcing Tools, Talent Network
  - **TEAM MANAGEMENT:** Onboarding (expandable), Team, **Documents** (active/highlighted), Surveys
  - **PAYROLL:** Payroll
  - Switch to admin view (footer)

### Top Bar
- **Height:** 62px
- **Content:** Page title "Documents" on left, notification bell + help icon + user avatar on right

### Main Content Area
- **Width:** 1200px (1440px total with sidebar)
- **Padding:** 40px horizontal, 40px top

---

## **2. Documents List View (Templates Tab)**

### Segmented Control
- **Options:** "Templates" | "Members"
- **Width:** 400px
- **Height:** 40px
- **Active state:** Solid background with text
- **Default selection:** Templates

### Primary Action Button
- **Label:** "Add Document Template"
- **Position:** Top right of content area
- **Style:** Primary blue button (#3B82F6)
- **Height:** 40px

### Filter & Search Row
- **Dropdown Button:** "All Locations" with chevron (240px width)
- **Search Box:** Positioned right side (240px width), placeholder "Search"
- **Overflow Menu:** Three-dot icon button for additional actions

### Document Templates Table

| Column | Description |
|--------|-------------|
| Document Name | Template name with PDF icon and validity period subtitle |
| Document Type | Category (e.g., "Employee Handbook", "Certification") |
| Assigned To | Number of employees assigned |
| Created Date | Date template was created |
| Actions | Three-dot overflow menu |

**Table Styling:**
- Header background: #F3F5F9 (gray-200)
- Row height: 48px
- Border: 1px solid #E4E4E7
- Border radius: 8px
- Font: Plus Jakarta Sans, 14px regular for body, 14px semi-bold for headers

---

## **3. Members View**

### Segmented Control
- Same as Templates tab, with "Members" selected

### Table Structure

| Column | Description |
|--------|-------------|
| Member | Employee name with role subtitle (e.g., "Bin Wang" / "Cook") |
| Location | Work location (e.g., "Mission Bay", "Whispering Woods") |
| Progress | Document completion status (e.g., "18/19 documents completed") |
| Validity | Compliance status with color coding |
| Actions | Three-dot overflow menu |

**Validity Status Colors:**
- "All good" - Default text color (#2F333E)
- "X documents need renewal" - Red (#EE4052)

---

## **4. Document Detail View**

### Object Header
- **Document Icon:** PDF file icon
- **Title:** Document name (e.g., "PIPL_consent_form.pdf")
- **Subtitle:** Validity Period information (e.g., "Validity Period: 180 days")
- **Actions:**
  - Primary: "Assign" button (blue)
  - Secondary: "Preview" button (outlined)
  - Overflow: Three-dot menu

### Tab Navigation (Below Header)
- **Options:** "Assignment" | "Validity"
- **Height:** 40px
- **Search box:** Right-aligned (240px)

### Assignment Tab Content
**Collapsible Table Sections:**
- Title format: "Assigned to X recipients" with completion count
- Subtitle: "X/Y completed · Z cancelled"
- Assigned by: Manager name + date
- Overflow menu per section

**Table Columns:**

| Column | Description |
|--------|-------------|
| Member | Name + role |
| Location | Work location |
| Status | "Completed" or "X/Y signatures collected" |
| Completed Date | Date or "-" if pending |
| Expiration Date | Date or "-" if N/A |
| Actions | Row-level overflow menu |

### Validity Tab Content
**Collapsible Sections by Status:**
- **Expired · X** - Documents past expiration
- **Valid · X** - Active documents
- **In Progress · X** - Documents awaiting signatures
- **Archived · X** - Historical records

Same table columns as Assignment tab.

---

## **5. Add Document Sign Template Dialog**

### Modal Properties
- **Width:** ~560px
- **Title:** "Add Document Sign Template"
- **Close:** X button top right

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Upload Document | File dropzone | Yes | Accepts PDF, supports drag-and-drop |
| Document Name | Text input | Yes | Auto-populated from filename |
| Validity Period | Dropdown | No | Options: 30, 60, 90, 180 days, 1 year, or custom |
| Document Type | Dropdown | Yes | Categories: Handbook, Policy, Certification, etc. |
| Signers Section | - | Yes | Configure signing workflow |

### Signers Configuration
- **Add Signer Button:** Text button to add additional signers
- **Signer Row:**
  - Role dropdown (Employee, Manager, Counter-signer)
  - Signing order number
  - Remove button (X)
- **Checkbox:** "Require all signers to sign in order"

### Footer Actions
- **Cancel:** Secondary button (left)
- **Save Template:** Primary button (right)

---

## **6. Assign Document Sign Dialog**

### Modal Properties
- **Width:** ~560px
- **Title:** "Assign Document Sign"

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Select Document | Dropdown | Yes | Choose from existing templates |
| Recipients | Multi-select | Yes | Employee selection with search |
| Description | Text area | No | Optional message to recipients |
| Send Notification | Checkbox | No | "Notify recipients via email/app" |

### Recipient Selection
- **Format:** Chips/tags showing selected employees
- **Search:** Type-ahead search functionality
- **Bulk Select:** Option to select by location or role

### Footer Actions
- **Cancel:** Secondary button
- **Assign:** Primary button

---

## **7. Design Tokens & Styling**

### Typography
| Style | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Body - Semi | Plus Jakarta Sans | 14px | 600 | 20px |
| Body - Regular | Plus Jakarta Sans | 14px | 400 | 20px |
| Caption - Regular | Plus Jakarta Sans | 12px | 400 | 17px |

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| text-primary | #2F333E | Primary text |
| text-secondary | #68728A | Secondary/subtitle text |
| base-gray-100 | #161A24 | Headings |
| gray-200 | #F3F5F9 | Table headers, backgrounds |
| border-light | #E4E4E7 | Table borders, dividers |
| surface-container | #FFFFFF | Cards, table rows |
| accent-red-400 | #EE4052 | Error/warning states |
| primary-blue | #3B82F6 | Primary buttons, links |

### Spacing
| Token | Value |
|-------|-------|
| spacing-02 | 8px |
| spacing-03 | 12px |
| space-medium-l | 16px |
| space-small-xl | 8px (border-radius) |

### Components
- **Buttons:** 40px height, 8px border-radius
- **Tables:** 8px border-radius, 48px row height
- **Icon Buttons:** 32px × 32px for compact areas
- **Search Box:** 240px width, 40px height
- **Dropdown Button:** 240px width, 40px height

---

## **8. User Flows**

### Flow 1: Create Document Template
1. User navigates to Documents → Templates tab
2. Clicks "Add Document Template" button
3. Dialog opens with form fields
4. User uploads PDF document
5. Fills in document name, validity period, document type
6. Configures signers (who needs to sign, in what order)
7. Clicks "Save Template"
8. Template appears in list

### Flow 2: Assign Document to Employees
1. User clicks on a document template row or selects from dropdown
2. Document detail view opens
3. Clicks "Assign" button
4. Assign dialog opens
5. Selects recipients (individual or bulk by location/role)
6. Optionally adds description
7. Chooses notification preference
8. Clicks "Assign"
9. Document assignments created, notifications sent

### Flow 3: Track Document Completion
1. User navigates to Documents → either Templates or Members tab
2. **By Document:** Clicks document → sees Assignment tab with recipient status
3. **By Member:** Clicks member → sees all documents and their completion status
4. Can filter by status (Expired, Valid, In Progress, Archived)
5. Can use search to find specific documents/members

### Flow 4: Monitor Document Validity
1. User clicks on document → Validity tab
2. Views documents grouped by expiration status
3. Expired section shows documents needing renewal (red indicator)
4. Can take action on expired documents (reassign, remind)

### Flow 5: Member Document Overview
1. User navigates to Members tab
2. Views all team members with document progress
3. Progress column shows "X/Y documents completed"
4. Validity column shows compliance status
5. Red text "X documents need renewal" alerts to expiring docs
6. Click member row to drill into details

---

## **Success Metrics**

| Metric | Description | Target |
| --- | --- | --- |
| % usage of docs-enabled customers | Churn reduction | 3% → 50% |
| # docs assigned per active employee per month | Measures adoption & usage | 1+ |
| % of docs with expiry date | Proxy for feature engagement | At least 1 per new hire / Active EE |
| % cert updates before expiry date | Proxy for compliance  | 90% |
| ARR generated from new and upsell customers | Revenue impact | +120K in 6mo 
(500 cust.) |

## 💡 Core Value Proposition

> "Stay compliant and audit-ready with less manual work."
> 
- Automated reminders ensures workers are always ready to work.
- Documents are always organized, accessible, and up-to-date
- Provide employees signed docs to reduce manual work from GMs to share them

## 🔒 Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Confusion between Forms vs. Documents | Clear onboarding guidance + marketing education |
| Reminder spam or mis-timed alerts | User settings |
| Feature complexity slows adoption | Phase 1 stays focused on high-value, low-friction features |
| No clear monetization path | Define strategy in partnership with Sales |

## Rapid Fire Questions

<aside>
💡 Answer these questions to cover our bases.

</aside>

| **Product Principles**
*How will you uphold our [product principles](https://www.notion.so/927e3441ee07430198553db5aad372cf?pvs=21) with this project?*  | Workers, GM, Owners are accounted for with smooth experience. Think horizontally: To consider all types of documents — payroll documents, forms, tax documents, hiring documents. |
| --- | --- |
| **User Research**
… | Plan Sprig survey to validate problem statement and size opportunity |
| **Platform**
*Have you considered which platforms (mobile and/or desktop) are necessary for success?* | Desktop for document template set up, Mobile for signing and ideally assigning docs as well. |
| **Security, Privacy, Compliance**
*If new data set is introduced, who can access it, who can configure and change the security and permissions?  For private data (government IDs, birthdate and etc), list data privacy protection needs (data mask, reporting and download requirements).  List any legal and compliance requirements* | To mask PII in documents if downloaded by users with only partial or no PII access.  |
| **Design System**
*Do you need to build new front-end components and/or modify existing ones?* |  |
| **Performance and Load**
*How many users are we expecting to use this Product 1) On Launch 2) in 3 Months 3) in 6 months? How often will a user will expect to use this product? Do we expect this feature to add/introduce significant load to our infrastructure?  E.g. x% of hourly transactions* |  |
| **Scale**
*Have you considered scale? What if a very large customer uses it?* |  |
| **AI**
*Have you considered LLM processing been considered as part of the solution?* |  |

## Collaboration Plans

### Research Plan

[Docs and Forms Examples](https://www.notion.so/Docs-and-Forms-Examples-1eaa1747bfd1803fa9e8dc854b1ad465?pvs=21)

[Data collection and research](https://www.notion.so/Data-collection-and-research-217a1747bfd180caae4df429496910fd?pvs=21)

### **Design Plan**

Link

### **Technical Plan (System Design Doc)**

Link

### **Data Measurement Plan** (Data Science Team)

<aside>
💡  ‼️ Please submit an [Event Instrumentation Request](https://workstreamhq.atlassian.net/servicedesk/customer/portal/1/group/20) before implementing.

Read: [Event Naming Best Practices](https://docs.google.com/document/d/1z25wzMwRQFuXxV_XTH2_CFztnPnAHnGHiwuVm5__jkk/edit)

</aside>

Event instrumentation

- Measure usability with drop off funnel:
    - Click create or edit document
    - Save document
    - Assign document
- Measure WAU:
    - Active = Create / Edit / Assign documents

### **QA Plan**

Link

## 📈 Post-Launch Plan

### **Adoption**

- **Candu In-Product Guidance:** Implement interactive tutorials to guide users through new features and functionalities, ensuring a smooth transition and increased engagement.
- **Sales / CSM Enablement:** Prepare product demos and FAQs to effectively upsell and implement (if any migration is necessary)

### **Feedback**

- **Sprig Survey:** Deploy targeted surveys to gather user feedback on the new features, focusing on usability, satisfaction, and areas for improvement.
- **Support Tracking:** Monitor support tickets and customer inquiries to identify common issues and areas where additional guidance may be needed. Keep RJ updated and monitor bugs channel

### **Iteration**

- **Regular Improvements:** Schedule updates and enhancements every four weeks post-launch, based on user feedback and performance metrics.

### **Marketing**

- **Email Drip Campaign:** Develop a series of automated emails to educate users about new features, best practices, and tips for maximizing the product's benefits.
- **Launch Campaign:** Execute a comprehensive marketing campaign to announce the launch, leveraging social media, press releases, and partnerships to maximize reach.

### **GTM Launch Considerations**

- **Document Import:** Ensure customers can easily import existing documents and templates into the new system, minimizing disruption and facilitating a seamless transition.
- **User Training:** Provide resources and support for setting up document expiry notifications, tailored to both payroll and non-payroll customers.

### FAQs

- Will customers be able to import existing documents/templates easily?
- How do we train or support users on setting up document expiry for current documents?
- What does it take to get implemented for payroll vs non-payroll customers?

## **Additional Items**

<aside>
💡 Concepts, Whiteboard Sessions, Whimsical, Recordings

</aside>

# **Release Plan**

---

| **Date** | **Capabilities / Functionality** | **Audience** |
| --- | --- | --- |
|  |  |  |
|  |  |  |

## **Product Marketing Plan**

<aside>
💡 Internal and external communication/collateral

</aside>

## **Support / Help Documentation**

## **Pricing and Packaging**

# **Additional Insights**

---

## **Data Insights**

<aside>
💡 Product Data, Customer Data, Business Data

</aside>

**Other information**

- **Types of docs required to work**
    
    > "For every worker on today's schedule, do we possess valid, unexpired, and verified documentation that proves they are legally allowed to work this job at this location today?"
    > 
    
    | Category | Example docs | When is it collected? | When to renew? |
    | --- | --- | --- | --- |
    | **State-mandated / Payroll documents** | Form I-9, Tax forms, Direct deposit | Onboarding, Ad-hoc | Ongoing; when there are data changes |
    | **License and certificates** | Food-handler, alcohol-server, forklift, Food safety, Driver license | Onboarding, When expired | When license expires |
    | **Company-mandated docs** | Signed handbook,  Uniform policy, Tip pooling acknowledgement, etc. | Onboarding, When policy renews | When policy updates |
    | **Performance** | Write ups, tasks, performance reviews | Ad-hoc, can be recurring | None, keep for historical records |
- **Compliance Shield as a catalyst**
    
    Main issue from compliance shield is inputs. Since we're not able to classify the type of documents that customers collect, such as write ups / food safety licenses, we can't tell them how much more they should be doing.
    
    Examples -
    
    1. Minor work permit - hours available
        1. Why do it: Big pain, Harri also focuses this
        2. Idea: Check states requirements → auto-populate "ready to work" field in a minor work permit document template for a minor's onboarding
    2. Based on the JD, identify certificates required
        1. Why do it: There's no known SaaS products right now to do this
        2. Idea: Based on JD → auto-populate "ready to work" field in a certificate for a worker's onboarding
        3. Idea: For Hiring-only customers, analyze their job postings → Identify customers with big volume of applicants that require certs → Upsell AIO with certificates and docs
    3. (OOS) Missing or unsigned handbook/policies
        1. Idea: Identify missing handbooks → AI handbook generator (Pre-requisite: Using forms for handbooks that is mobile-readable)
        2. Conviction: Majority (X%) of Onboarding customers do not have company handbooks
    
    **TZ's Pre-work**
    
    - For Hiring-only customers, analyze their job postings → Identify customers with big volume of applicants that require certs → Upsell AIO with certificates and docs
    - Identify customers with minors and whether they are potentially missing a Minor Work Permit
    - Research states that require clear disciplinary documentation for unlawful termination / unemployment claims - customers in these states will be recommended to create processes to document these.
        - Termination - which states are stricter on unemployment claims and unlawful termination
    
    **KS**
    
    - Draw concept flow on how the Compliance Shield analysis and the Docs/Certs Product works together
    
    **After project completion, be able to identify employees who needs and does not have minor work permit / certain certificates and permits.**
    

## **Customer Feedback**

<aside>
💡 Productboard, Recorded Conversations, Notes

</aside>

## **GTM Feedback (Sales / CS)**

<aside>
💡 Productboard, Recorded Conversations, Notes

</aside>

## **Outstanding Questions / Parking Lot**
