# Usability Testing Feedback — Documents V2

**Tester:** Restaurant HR Admin (multi-location, 5 restaurants, ~120 employees)  
**Date:** February 9, 2026  
**Method:** Task-based walkthrough against [Restaurant HR Use Cases & Workflows](./RESTAURANT_HR_USE_CASES_AND_WORKFLOWS.md)  
**Product State:** Prototype (React app with mock data)

---

## Workstream Platform Context

> **Important:** This usability test evaluates the **Documents V2** module within the broader Workstream platform. The following capabilities already exist in other Workstream products and are assumed to be available for integration:
>
> | Workstream Product | Relevant Capabilities |
> |---|---|
> | **Onboarding** | Onboarding process builder with bundled tasks/documents; new hire portal; progress tracking dashboard; auto-triggered when candidate is marked "hired" in ATS |
> | **I-9 & E-Verify** | Digital Form I-9 completion; automatic E-Verify case submission; Section 2 employer review; reverification reminders; can be added as a module to any onboarding process |
> | **Payroll** | W-4/state tax form collection; direct deposit setup; handled during payroll onboarding |
> | **HRIS / Team Management** | Employee records; location & role assignments; employee status (active/terminated); the source of truth for the team member list |
> | **Hiring (ATS)** | Applicant tracking → hire decision → triggers onboarding automatically |
>
> Documents V2 templates should be **addable as tasks within Workstream Onboarding bundles**, meaning onboarding packet creation is handled at the Onboarding product level — not inside Documents V2 itself.

---

## Testing Summary

| Category | Blocker | Major | Minor | Enhancement |
|----------|---------|-------|-------|-------------|
| Onboarding | 1 | 2 | 2 | 3 |
| Certifications | 0 | 2 | 3 | 2 |
| Policy Distribution | 1 | 3 | 1 | 2 |
| Write-ups | 0 | 1 | 3 | 3 |
| Data Collection | 2 | 1 | 0 | 1 |
| Separation/Termination | 1 | 2 | 1 | 1 |
| Multi-Location Mgmt | 1 | 3 | 2 | 2 |
| Audit & Compliance | 1 | 2 | 1 | 2 |
| **Total** | **7** | **16** | **13** | **16** |

**Overall Verdict:** The product has strong bones — write-ups, certifications, and PDF signing are surprisingly well-built. With Workstream's existing Onboarding (bundles), I-9/E-Verify, and Payroll products already handling the hire-day paperwork pipeline, Documents V2 doesn't need to solve onboarding bundling or government forms on its own. The remaining gaps are around **data collection forms** (the FormFieldBuilder exists but is locked inside write-ups), **multi-location visibility** (no location-level compliance breakdown), **export/reporting** (data goes in but can't come out for audits), and **policy version control**. An HR admin managing 5 restaurants would adopt this for write-ups and certifications today and plug it into their existing Workstream onboarding flow — but would still need workarounds for ad-hoc data collection and compliance audits.

---

## Test Session 1: New Employee Onboarding

> **Platform Context:** Workstream Onboarding already handles bundling documents into onboarding processes, I-9 is a separate module that plugs into onboarding, and W-4/tax forms are handled by Workstream Payroll. This test focuses on how Documents V2 templates integrate into that existing onboarding flow and what gaps remain.

### Scenario
*"It's Monday morning. I just hired a new line cook at our Downtown location. I need to get them through the full onboarding paperwork: employee handbook, food safety policy, sexual harassment policy, tip reporting agreement, emergency contacts, uniform agreement, and food handler's certification request. (I-9 and W-4 are already handled via Workstream's I-9/E-Verify module and Payroll onboarding.)"*

### Walkthrough

**Step 1: I open the Documents page and click "+ Add Document".**

> "Okay, I see four options: Upload PDF for Signing, Create a Write Up, Collect Uploads, and Duplicate. Where's the option to create a form? I need to collect emergency contact info — that's not a PDF signing, it's not an 'upload' from the employee, and it's definitely not a write-up. I need them to *fill out* a form. The only 'form builder' I can find is buried inside the Write-Up creation flow, but I can't use a disciplinary tool to ask for emergency contacts."

🔴 **BLOCKER — UX-ONB-001:** No "Collect Data / Create Form" document type. The FormFieldBuilder component exists but is locked inside the Write-Up creation flow. There is no way to create a standalone form to collect employee data (emergency contacts, t-shirt sizes, dietary restrictions, etc.). This is one of the most common onboarding use cases — and while I-9, W-4, and direct deposit are handled by other Workstream products, restaurant-specific data collection (emergency contacts, uniform sizes, availability, dietary needs) has no home.

**Step 2: I decide to upload our employee handbook PDF for signing.**

> "Okay I'll start with the handbook. Upload PDF, drag and drop — nice, that works well. Next step asks for document name and type. The type dropdown shows... let me look... what are the type options? I don't see an 'Onboarding' category. How do I mark this as an onboarding document so it automatically appears in our Workstream onboarding bundle?"

🟡 **MINOR — UX-ONB-002:** Document type categories don't include restaurant-specific categories like "Onboarding", "Safety & Compliance", "Employment Agreements", etc. The types come from `documentTypes` in mock data but aren't tailored to restaurant workflows. More importantly, there's no visible connection between a Documents V2 template and the Workstream Onboarding process — I can't tell which templates are "in my onboarding bundle" vs. standalone.

**Step 3: I click "Continue to Mapping" and get to the document mapping screen.**

> "Oh nice, this is like DocuSign. I can add signature fields, date fields, text fields, checkboxes. This works for the handbook — I just need a signature and date at the bottom. Now, since onboarding bundles exist in Workstream, I assume this template will just show up as a task in the new hire's onboarding flow. But... I don't see any option here to 'Add to Onboarding Process' or link this template to an onboarding bundle. How does this template get into the onboarding flow?"

✅ ~~BLOCKER~~ **RESOLVED (Platform) — UX-ONB-003:** ~~No onboarding packet/bundle concept.~~ Workstream Onboarding already handles bundling — Documents V2 templates can be added as tasks within onboarding processes. However, see UX-ONB-005 below for the remaining integration gap.

**Step 4: I try to assign the handbook to my new employee (outside of onboarding).**

> "For the onboarding flow, the new hire would get this through their Workstream onboarding bundle — that makes sense. But what if I need to assign this handbook to an *existing* employee who somehow missed it? I go to Documents table, find Employee Handbook, click 'Assign.' The modal shows my team members from HRIS. Good — they're here because Workstream HRIS is the source of truth. I can search, filter by location, filter by role. This works."

✅ ~~BLOCKER~~ **RESOLVED (Platform) — UX-ONB-004:** ~~No way to add a new employee.~~ New hires enter the system through the Workstream Hiring → Onboarding pipeline and are created in HRIS before documents are assigned. The team member list in the assign modal pulls from HRIS, so the chicken-and-egg problem is solved.

**Step 5: I look for auto-assignment rules on non-certification documents.**

> "I remember seeing auto-assign in the certification creation flow. But when I create a PDF signing document, there's no auto-assign step. For onboarding, this is handled by the Onboarding bundle — fine. But what about *ongoing* documents? If I update our food safety policy next month, I want it to auto-assign to all current employees. That's not an onboarding event. And the auto-assign rules only exist for 'Collect Uploads' (certifications)."

🟠 **MAJOR — UX-ONB-005:** Auto-assign rules only exist for the "Collect Uploads" (certification) document type. PDF signing documents have no auto-assign capability. While onboarding handles new-hire assignment, there's no way to auto-assign ongoing documents (updated policies, annual re-acknowledgements, role-change documents) to existing employees.

**Step 6: I look for the employee's unified document view.**

> "From the new hire's perspective, they'll complete I-9 and W-4 in their Workstream onboarding portal, and the handbook/policies will show up there too as onboarding tasks. That's good. But once onboarding is done — say, after week 2 — where does the employee go to see their ongoing documents? Certifications expiring, new policies to sign, write-ups? There's no 'My Documents' hub that shows everything in one place. The CertificationUploadPage and WriteUpAcknowledgement are standalone views but there's no unified employee document center."

🟠 **MAJOR — UX-ONB-006:** No unified employee-facing "My Documents" view. Workstream Onboarding handles the Day 1 task list, but once onboarding is complete, there's no single place for an employee to see all their document obligations (pending policy signatures, expiring certifications, assigned write-ups). Each document type has its own standalone employee view.

**Step 7: I try to track document progress for this employee.**

> "I click on the member in the Members table and a slide-over panel opens. I can see their documents grouped by category — 'Onboarding', 'Compliance', etc. Nice. But there's no progress bar showing 'Onboarding 3/7 completed.' And I can't see which documents they haven't even been assigned yet. The slide-over only shows what they've been assigned, not what they're *missing*."

🟡 **MINOR — UX-ONB-007:** Member slide-over shows existing documents but doesn't show gaps — documents that *should* be assigned based on their role/location but haven't been yet.

**Step 8: I look for document generation capabilities.**

> "I-9 and W-4 are handled by Workstream's dedicated modules — great. But I still need to generate an offer letter with the employee's name, position, start date, and pay rate pre-filled. And a uniform agreement with their location and manager name. Can I create a template that auto-fills employee data? Looking at the PDF mapping tool... no. It only places signature/date/checkbox fields. There's no 'merge field' or 'variable' concept."

🟠 ~~MAJOR~~ **DOWNGRADED TO ENHANCEMENT — UX-ONB-008:** ~~No GENERATE document behavior for tax forms.~~ I-9 and W-4 are now handled by dedicated Workstream products. The remaining gap is generating *custom* documents with auto-filled employee data (offer letters, uniform agreements, separation agreements). This is a nice-to-have, not a blocker — admins can fill these manually or use PDF signing with text fields.

✅ ~~MAJOR~~ **RESOLVED (by reframing) — UX-ONB-009:** ~~Document mapping fields are placement-only.~~ With I-9 and W-4 handled by dedicated products that have proper fillable forms, the PDF mapping tool only needs to handle signatures/dates on static documents (handbooks, policies, agreements) — which it does well.

**Step 9: I look for a way to set the order documents should be completed.**

> "In the Workstream Onboarding bundle, I assume I can order the tasks. But within Documents V2 itself, if I assign multiple documents to someone outside of onboarding, there's no way to set priority or sequence. They all just show up in whatever order."

🟢 **ENHANCEMENT — UX-ONB-010:** No document priority/sequencing within a direct assignment (outside of onboarding). All documents are treated equally — there's no way to say "complete these first" or "these are legally time-sensitive." (Note: Onboarding task ordering is handled at the Onboarding product level.)

🟢 **ENHANCEMENT — UX-ONB-011:** No "required by" vs. "nice to have" distinction. All assigned documents appear equal in urgency.

🟢 **ENHANCEMENT — UX-ONB-012:** No onboarding progress visibility within Documents V2. The compliance dashboard shows overall metrics but doesn't surface "new hires this week" or "onboarding in progress." (Note: This may be visible in the Workstream Onboarding dashboard, but not in the Documents V2 compliance view.)

---

## Test Session 2: Food Handler's Permit & Certifications

### Scenario
*"I need to make sure every cook and server at all 5 locations has a valid food handler's certificate. I need to request it from employees who don't have one, track expiration dates, and get notified before they expire."*

### Walkthrough

**Step 1: I create a Food Handler Certificate template.**

> "I go to Add Document → Collect Uploads. Perfect. I enter the name, select 'Food Safety' category. Step 2 lets me set expiration tracking — nice, I can toggle it on and set reminders at 60, 30, 14, 7, and 1 days. I can even require manager verification. Step 3 has auto-assign rules — I can set 'when employee is hired' as Cook or Server. This is exactly what I need. Great."

✅ **This flow works well.** The certification creation wizard is thoughtful and restaurant-friendly.

**Step 2: I check the Certifications dashboard.**

> "Good, I see a table with all employee certifications. Status filter chips at the top — All, Expired, Expiring, Needs Review, Pending Upload, Valid. This is clear. I can see Mike Williams has an expiring food handler cert, Emily Davis has an expired TIPS cert, Chris Brown is pending upload. I can click 'Review' on Alex Martinez's pending verification."

✅ **The certifications dashboard is solid.** The status chips, sorting, and inline actions are well-designed.

**Step 3: I open the verification modal.**

> "Nice! I can see a document preview area (placeholder for now), the employee info, certification details, expiration date. There's a verification checklist — 'Document is authentic and readable' and 'Expiration date is correct.' I have to check both before I can approve. I can also reject with quick reasons like 'Document not readable' or 'Expiration date mismatch.' This is really well thought out."

✅ **Verification flow is excellent.** The checklist prevents rubber-stamping and the quick rejection reasons save time.

**Step 4: I look at the expiry calendar.**

> "There's a calendar view! I can see which dates have certifications expiring. Color-coded dots — red for expired, orange for this month, yellow for 60 days, green for valid. I can click a date and see the details on the right. I can send reminders from here. This is genuinely useful for planning. Only issue — I can't filter by location. I manage 5 restaurants and I want to see 'what's expiring at Downtown this month' specifically."

🟠 **MAJOR — UX-CERT-001:** Expiry calendar has no location filter. For a multi-location admin, seeing all locations mixed together makes it harder to action items. I need to be able to say "show me Downtown only."

🟠 **MAJOR — UX-CERT-002:** No way to bulk-request a certification from all employees missing it. If I create a new "Food Handler Certificate" template, I can auto-assign it to future hires. But for the 50 existing employees who need it? I'd have to individually assign/request it from each one. There should be a "Request from all eligible employees" button on the template.

**Step 5: Employee uploads their certificate.**

> "The CertificationUploadPage looks great from the employee side. Three-step flow: Upload → Details (expiration date, certificate number) → Review. They can drag-and-drop or take a photo. The review step warns them to check readability and expiration dates. Minor thing — there's no option to enter the issuing authority or state. Some states have different validity periods."

🟡 **MINOR — UX-CERT-003:** No custom metadata fields on certification upload. Can't capture issuing authority, state, or training provider — useful for audit trails.

🟡 **MINOR — UX-CERT-004:** The certification upload page accepts PDF, JPG, PNG but not HEIC (iPhone default photo format). Many employees will try to upload photos taken on their iPhone.

🟡 **MINOR — UX-CERT-005:** No OCR or smart date detection. Employee manually enters expiration date — it would be helpful if the system could suggest a date by reading the uploaded document.

🟢 **ENHANCEMENT — UX-CERT-006:** No integration with state certification databases. Some states (e.g., California's CFMB) allow looking up food handler certificates by certificate number.

🟢 **ENHANCEMENT — UX-CERT-007:** No batch import for existing certifications. When first setting up the system, I need to import 100+ existing certifications with dates. There's no CSV upload or bulk entry.

---

## Test Session 3: Policy Distribution & Handbook Acknowledgement

### Scenario
*"Our company just updated the sexual harassment policy. I need to send the new version to all 120 employees across all 5 locations and track who has signed it. Also, it's January — time for annual employee handbook re-acknowledgement."*

### Walkthrough

**Step 1: I upload the new harassment policy PDF.**

> "Upload PDF → Document Details → Continue to Mapping. I add a signature and date field at the bottom. Create Template. Good. Now I need to assign it to everyone."

**Step 2: I click Assign on the new policy.**

> "The assign modal shows 'Select by Location' with location pills, and 'Select by Role' with role pills. I click each of my 5 locations to select everyone. Then I set a due date and add a message: 'Our sexual harassment policy has been updated. Please review and sign by Feb 28.' Send notification is toggled on. Nice."

✅ **Assignment flow is solid for bulk distribution.** Select by location/role is exactly what's needed.

**Step 3: But wait — I already had an older version of this policy.**

> "Hmm, the old policy template is still there in my Documents list. Now I have two: 'Sexual Harassment Policy v2.3' and 'Sexual Harassment Policy v2.4'. There's no version control. No way to mark the old one as superseded. No way to link them. If an auditor asks 'which version did John Smith sign?' I have to dig through two separate document templates."

🔴 **BLOCKER — UX-POL-001:** No document version control. When a policy is updated, there's no way to:
- Mark the old version as superseded/archived
- Link the new version to the old one
- See version history ("v2.3 → v2.4")
- Automatically void old unsigned assignments and reassign the new version
- Know which version each employee signed

This is a compliance risk. During audits, you need to prove exactly which version was acknowledged.

**Step 4: I want to trigger annual re-acknowledgement.**

> "It's January, time for annual handbook sign-off. But the handbook was already sent last January. I'd have to re-assign it to everyone again manually. There's no 'recurring assignment' or 'annual re-sign' feature. Every year, I'll have to manually reassign to 120 people."

🟠 **MAJOR — UX-POL-002:** No recurring/scheduled re-assignment. Annual policy acknowledgements are standard in restaurants (and legally required for some policies). The admin has to manually reassign every year.

🟠 **MAJOR — UX-POL-003:** No "acknowledgement only" option. Some policies just need a "I have read and acknowledge" checkbox — no wet signature required. But the PDF signing flow always requires a placed signature field. For a policy acknowledgement, a simple "I acknowledge" button with a timestamp would be sufficient and faster.

🟠 **MAJOR — UX-POL-004:** When I re-assign an existing template to the same employees, what happens? The UI doesn't tell me if an employee already has a completed assignment for this document. I might accidentally send the same document twice. There should be a warning: "12 of these 120 employees already have a completed assignment."

**Step 5: I check the Document Detail page to track completion.**

> "I click on the policy in the documents table. The detail page shows a nice summary — total sent, completed count, pending count. I can see who's completed it and who hasn't in separate 'Needs Attention' and 'Completed' sections. Good. I can 'Remind All Pending' with one click. But I can't see this broken down by location. 'How many of my Downtown staff have signed vs. Midtown?' — I'd have to eyeball it."

🟡 **MINOR — UX-POL-005:** Document detail page doesn't show completion breakdown by location. For multi-location policy rollouts, this is essential.

🟢 **ENHANCEMENT — UX-POL-006:** No way to set escalation/reminders on regular documents. The escalation timeline (Day 3: reminder, Day 5: notify manager, Day 7: notify HR) only exists for write-ups. Policy documents should have similar automated reminder chains.

🟢 **ENHANCEMENT — UX-POL-007:** No "Download signed copies" per location for audit binders. Many restaurants keep physical binders of signed policies. Being able to download all signed PDFs for a specific location as a ZIP would be very useful.

---

## Test Session 4: Employee Write-ups

### Scenario
*"One of my servers, Maria, was 30 minutes late for the third time this month. I need to issue a written warning. Last month she got a verbal warning (also in the system). I need to document the incident, have her sign it, and have it on file."*

### Walkthrough

**Step 1: I navigate to the Write-ups tab.**

> "I see all write-ups in a table with status chips — All, Pending, Refused, Acknowledged, Draft, Scheduled. I can search and sort. Good. The dashboard clearly shows which write-ups need attention. I see Juan has a refused write-up — that's highlighted in red. This is well-organized."

✅ **Write-ups dashboard is excellent.** The status-based view with filter chips is exactly what a manager needs.

**Step 2: I click the '+ Assign' button (labeled 'Issue Write-Up' in the header area).**

> "Okay, the assign write-up modal opens. Step 1: Search and select employee — I find Maria. Step 2: Select write-up type — I choose 'Written Warning.' Step 3: Incident details — date, description, what happened. Step 4: Manager notes — I can add my notes and observations. Step 5: Optional demerit points. Step 6: Send option — now, scheduled, or draft. Step 7: Manager signature. Step 8: Preview. This is thorough."

✅ **Write-up assignment flow is comprehensive and well-structured.** The step-by-step wizard prevents mistakes.

**Step 3: I want to see Maria's write-up history before issuing this one.**

> "Wait — in the assign modal, when I select Maria, I'd love to see her history right there. Like 'Maria has 1 previous write-up: Verbal Warning on Jan 15.' That way I can reference it. I have to close this modal, go find Maria in the Members table, open her slide-over, and look at her write-up history section. Then go back and start the assign flow again."

🟠 **MAJOR — UX-WU-001:** No employee write-up history preview within the assignment flow. When selecting an employee to issue a write-up, the admin should see their previous write-ups inline so they can:
- Reference prior incidents
- Ensure proper progressive discipline escalation (verbal → written → final)
- Avoid issuing a verbal when a written is warranted

**Step 4: I check the write-up history section for Maria.**

> "The WriteUpHistorySection component is really good. Timeline view, color-coded by severity, shows signatures, points balance. I can expand/collapse it. The point system is visible — '+2 pts' for the verbal warning. This gives me good context."

✅ **Write-up history section is well-designed.**

**Step 5: Employee acknowledgement flow.**

> "From Maria's perspective, the WriteUpAcknowledgement component is well-done. She sees the write-up details, checks 'I have read and understand,' can choose to Acknowledge & Sign or Decline to Sign. If she acknowledges, she can add a response and sign electronically. If she declines, she has to give a reason and confirm she understands it still goes on file. The info box explaining 'signing doesn't mean agreement' is a nice touch."

✅ **Employee-facing write-up flow is excellent.** The legal language is clear and protective.

**Step 6: I want to add a witness.**

> "Hmm, for a written warning, I usually have a witness present. Where do I add a witness signature? I see manager signs and worker signs, but there's no option for a third party — like my assistant manager who was in the room."

🟡 **MINOR — UX-WU-002:** No witness/third-party signature option on write-ups. Progressive discipline best practices often require a witness for written and final warnings.

🟡 **MINOR — UX-WU-003:** No way to attach evidence to a write-up. If Maria's tardiness was captured by the time clock system, I'd want to attach that screenshot. There's no file attachment option in the write-up flow.

🟡 **MINOR — UX-WU-004:** No follow-up/check-in scheduling. After issuing a written warning, I typically set a 30-day follow-up to review improvement. There's no way to schedule this in the write-up flow.

🟢 **ENHANCEMENT — UX-WU-005:** Write-up templates could include pre-filled sections. A "Tardiness" template could auto-include fields like "Date(s) of tardiness," "Scheduled time vs. arrival time," "Previous warnings for tardiness." This would standardize documentation.

🟢 **ENHANCEMENT — UX-WU-006:** No progressive discipline tracking/automation. The system could automatically suggest the next severity level: "Maria has 1 verbal warning for tardiness. System recommends: Written Warning." This would help managers follow proper discipline protocols.

🟢 **ENHANCEMENT — UX-WU-007:** No integration with scheduling/time clock data. Write-ups for tardiness could auto-pull time clock data to show scheduled vs. actual arrival times.

---

## Test Session 5: Data Collection (T-shirt Sizes, Emergency Contacts, Dietary Needs)

### Scenario
*"I need to collect t-shirt sizes from all employees for our new uniforms, update emergency contacts quarterly, and collect dietary restrictions for our annual holiday party."*

### Walkthrough

**Step 1: I try to create a data collection form.**

> "Okay, I click + Add Document and... there's no option for this. 'Upload PDF for signing' — nope, I don't have a PDF. 'Create a write up' — that's for discipline. 'Collect uploads' — that's for certifications/files. 'Duplicate' — nothing to duplicate. Where do I create a form that just asks 'What's your t-shirt size? S/M/L/XL/XXL'?"

🔴 **BLOCKER — UX-DC-001:** No standalone form/data collection document type. The FormFieldBuilder component supports open text, single select, multiple choice, and rating — exactly what's needed for data collection. But it's trapped inside the write-up creation flow. There needs to be a "Create a Form" or "Collect Information" option in the document type selector.

**Step 2: I try a workaround — using the Write-Up flow.**

> "Okay maybe I'll abuse the write-up system. I create a 'write-up' titled 'T-Shirt Size Collection' with type... 'Coaching'? 'Other'? None of these types make sense. And when employees receive it, they'll see a write-up notification. That's going to cause panic. 'You received a write-up' is NOT the same as 'Please confirm your t-shirt size.' This is a terrible user experience for the employee."

🔴 **BLOCKER — UX-DC-002:** Using write-ups as a workaround for data collection would confuse and alarm employees. The notification system, status labels ("acknowledged/refused"), and the entire framing of write-ups is designed for disciplinary contexts. Sending an employee a "write-up" to ask their t-shirt size would undermine trust.

🟠 **MAJOR — UX-DC-003:** No structured data export. Even if I could collect this data via forms, there's no way to export the results as a spreadsheet. When ordering uniforms, I need a CSV: Employee Name | Location | T-Shirt Size. The system doesn't appear to have any reporting/export functionality.

🟢 **ENHANCEMENT — UX-DC-004:** No "form templates" library. Common restaurant data collection needs (emergency contacts, uniform sizes, availability, dietary restrictions) could be pre-built templates. This would save setup time.

---

## Test Session 6: Separation & Termination

> **Platform Context:** Workstream HRIS tracks employee status (active/terminated). When an employee is terminated in the system, that status change is available as a trigger. However, there is no "Offboarding" product equivalent to the Onboarding product — no offboarding process builder or termination document bundle exists yet.

### Scenario
*"An employee at our Midtown location has been terminated for cause. I need to issue final paperwork: separation agreement, final paycheck acknowledgement, COBRA notification, property return checklist, and exit interview form."*

### Walkthrough

**Step 1: I look for a termination workflow.**

> "I'm on the Dashboard. I don't see any termination-related section. No 'Offboarding' category. No 'Separation' documents. I go to the Documents tab — all the templates here are ongoing documents. Workstream has an Onboarding product that bundles hire-day documents — but there's no equivalent 'Offboarding' product that bundles separation documents. And Documents V2 has no termination trigger either."

🔴 **BLOCKER — UX-SEP-001:** No offboarding/termination workflow. While Workstream HRIS knows when an employee is terminated, there's no:
- Termination trigger in Documents V2 that auto-assigns exit documents
- Offboarding bundle equivalent to the Onboarding process builder
- Property return checklist/tracker

Note: Unlike onboarding (which has a dedicated Workstream product), offboarding has no platform-level solution. This is a gap at both the Documents V2 level *and* the Workstream platform level.

**Step 2: I try to manually create and assign separation documents.**

> "I can upload a separation agreement PDF and assign it to the terminated employee. But there's no urgency indicator. This person is leaving TODAY — I need them to sign before they walk out the door. There's no 'immediate/urgent' priority level. The document just goes into the regular queue."

🟠 ~~BLOCKER~~ **DOWNGRADED TO MAJOR — UX-SEP-002:** No urgency/priority levels on document assignments. Termination paperwork is time-critical (legally, some documents must be provided at time of separation). There's no way to distinguish "sign this before end of today" from "sign this within 30 days." Downgraded from blocker because admins can work around this by calling/texting the employee directly — but the system provides no affordance for urgency.

🟠 **MAJOR — UX-SEP-003:** No ability to revoke/cancel pending assignments when an employee is terminated. If an employee had pending onboarding documents or unsigned policies, those should be automatically canceled when HRIS status changes to "terminated." Currently they'd just stay as "pending" forever, skewing compliance metrics.

🟠 **MAJOR — UX-SEP-004:** No separation of "active" vs. "terminated" employees in the Documents V2 member list. The Members table shows all team members with no status filter. While Workstream HRIS tracks status, Documents V2 doesn't consume it — a terminated employee's incomplete documents still count toward compliance percentages.

🟡 **MINOR — UX-SEP-005:** No confidentiality/NDA handling. Separation agreements often include confidentiality clauses that need to be tracked separately with different retention periods.

🟢 **ENHANCEMENT — UX-SEP-006:** No integration with HRIS termination event. When an employee is terminated in Workstream HRIS, Documents V2 should automatically trigger exit paperwork — or at minimum surface a "This employee has been terminated — assign exit documents?" prompt.

---

## Test Session 7: Multi-Location Management

### Scenario
*"I oversee HR for 5 restaurants: Downtown, Midtown, Uptown, Westside, and Airport. I need to see which locations are falling behind on compliance, manage location-specific documents (Midtown has a liquor license requirement the others don't), and ensure each location's GM has access to only their location's documents."*

### Walkthrough

**Step 1: I check the Compliance Dashboard.**

> "The dashboard shows a single compliance score: 53%. Okay, but is that an average? Is Downtown at 90% and Airport dragging us down at 20%? I can't tell. The 'Members Needing Attention' panel shows individual employees with their location listed, but there's no way to see location-level compliance. I need a view that says: Downtown 85%, Midtown 72%, Uptown 91%, Westside 65%, Airport 45%."

🔴 **BLOCKER — UX-ML-001:** No location-level compliance breakdown. The entire dashboard aggregates across all locations. For a multi-location admin, this makes the compliance score nearly meaningless because it hides which locations are the problem.

**Step 2: I try to filter the Documents table by location.**

> "I go to the Documents tab → By Template view. I see all document templates with their completion progress. But this is template-level, not location-level. I can see 'Employee Handbook 2024' is 6/8 completed, but I can't see '4/4 at Downtown, 1/2 at Midtown, 1/2 at Uptown.' The search bar lets me search by name but there's no location filter dropdown."

🟠 **MAJOR — UX-ML-002:** No location filter on the Documents table. Both the "By Template" and "By Member" views lack the ability to filter by location. This is table stakes for multi-location management.

**Step 3: I try to assign a location-specific document.**

> "Midtown has a liquor license, so only Midtown staff need TIPS certification. When I create the certification template with auto-assign, I can set location conditions in the auto-assign rules. That's good for future hires. But the main assignment modal shows all employees across all locations — I have to manually find and select Midtown employees. At least there's the 'Select by Location' pills in the assign modal, that helps."

✅ **The assign modal's "Select by Location" feature is a strong multi-location affordance.** This is one of the better-designed features for multi-location management.

**Step 4: I want my GMs to only see their own location.**

> "I'm looking for permission settings or admin roles. When I create a write-up template, I see 'Permissions' at the end — I can restrict which locations and roles can use the template. But this is template-level permissions, not user-level. I can't say 'Sarah (GM of Downtown) can only see and manage Downtown employees and documents.' There's no admin role/permission management."

🟠 **MAJOR — UX-ML-003:** No user-level access control by location. The permission system only exists at the template level (which locations can use a template), not at the user level (which locations a manager can see). In a multi-location setup, GMs should only see their own location.

🟠 **MAJOR — UX-ML-004:** No location-level dashboard view. I should be able to click into a location and see that location's compliance score, action items, team members, and documents — like a mini-dashboard per restaurant.

🟡 **MINOR — UX-ML-005:** Location names are hardcoded in mock data (Downtown, Midtown, Uptown). There's no UI to add/remove/rename locations. In practice, restaurants open and close, and the list needs to be dynamic.

🟡 **MINOR — UX-ML-006:** No cross-location comparison report. Something like a leaderboard: "Uptown 92% compliance ▲, Downtown 85% ▬, Midtown 72% ▼" would motivate GMs.

🟢 **ENHANCEMENT — UX-ML-007:** No location hierarchy support. Some restaurant groups have regions → districts → locations. The system is flat (one level of locations).

🟢 **ENHANCEMENT — UX-ML-008:** No location-specific document templates. Currently a template is either "all locations" or restricted to specific ones via permissions. It would be useful to have location-level templates — e.g., "Downtown Employee Parking Policy" that only exists for Downtown.

---

## Test Session 8: Audit Preparation & Compliance Reporting

### Scenario
*"The health department is coming for an inspection next week. I need to pull all food handler certificates for Downtown, show they're all valid, and have everything ready. Also, our corporate office wants a quarterly compliance report."*

### Walkthrough

**Step 1: I try to generate a compliance report.**

> "The Dashboard shows 53% compliance and lists action items. But there's no 'Export Report' or 'Generate Audit Report' button. I can see the data on screen but can't get it out of the system. If the health inspector asks for proof of food handler certification for all Downtown cooks, I'd have to screenshot the certifications table? That's not professional."

🔴 **BLOCKER — UX-AUD-001:** No export/report generation capability. This is a critical gap for any compliance tool. Users need to be able to:
- Export a PDF compliance report by location
- Download all signed documents for a specific employee
- Generate a certification status report for health department audits
- Export data as CSV for corporate reporting

**Step 2: I try to pull all food handler certs for Downtown.**

> "I go to the Certifications tab. I can filter by status (Valid, Expired, etc.) but NOT by location or certification type simultaneously. I can search by employee name or certification name. If I search 'Food Handler' I get all Food Handler certs across all locations. I can't narrow to just Downtown."

🟠 **MAJOR — UX-AUD-002:** No multi-dimensional filtering on certifications. An audit view needs to filter by: Location + Certification Type + Status simultaneously. Currently only one dimension (status) is filterable via chips, and free-text search handles the rest.

🟠 **MAJOR — UX-AUD-003:** No "Download All" for a filtered set of documents. Even if I could filter to Downtown Food Handler certs, there's no way to download all the uploaded certificates as a ZIP file for the inspector.

**Step 3: I look for historical compliance data.**

> "The dashboard shows current compliance. But corporate wants to know: 'Were you compliant in Q4?' There are no historical snapshots, no trend lines, no 'compliance over time' chart. The data only reflects the current moment."

🟡 **MINOR — UX-AUD-004:** No historical compliance tracking/trending. Compliance is a point-in-time snapshot only.

🟢 **ENHANCEMENT — UX-AUD-005:** No pre-built audit checklists. Health department inspections have standard requirements. A "Health Department Audit Prep" template that checks all required certifications against current status would be invaluable.

🟢 **ENHANCEMENT — UX-AUD-006:** No audit log. There's no visible system audit trail showing who changed what, when a document was created, modified, assigned, signed, or expired. This is important for both internal audits and legal compliance.

---

## Test Session 9: Template Creation & Management

### Scenario
*"I'm setting up the system from scratch. I need to create all our document templates and configure them properly."*

### Walkthrough

**Step 1: I start creating templates.**

> "The Document Type Selector is clean — four big cards with icons and descriptions. That's a nice entry point. But four types isn't enough for all my use cases. Where are:
> - **Create a Form** (for data collection — emergency contacts, direct deposit, equipment checkout)
> - **Generate from Template** (for offer letters, separation agreements with auto-filled employee data)  
> - **Create a Checklist** (for onboarding checklists, property return checklists)
> - **Acknowledgement Only** (for policies that just need a 'I read it' click, no signature placement)
> 
> I feel like the four types cover maybe 40% of my document needs."

*Note: This is a consolidation of feedback captured in earlier sessions. The four document creation types (PDF Signing, Write-Up, Collect Uploads, Duplicate) leave significant gaps.*

**Step 2: I try to organize my templates.**

> "I now have 15 templates in my Documents table. They're all in one flat list. I can sort by name, type, progress, or created date. But I can't organize them into folders or categories. There's no way to group 'Onboarding Documents' separately from 'Safety Policies' from 'HR Forms.' The 'Document Type' column shows things like 'Policies', 'Certifications', 'Write-ups' but these are broad categories, not custom groupings."

🟠 **MAJOR — UX-TM-001:** No folder/category system for organizing templates. As the template library grows (restaurants typically have 50-100 document types), a flat list becomes unmanageable.

**Step 3: I look for template drafts and archiving.**

> "I created a write-up template and saved it as a draft — good, that option exists. But for PDF signing templates, there's no draft state. It's created immediately when I click 'Continue to Mapping.' If I want to set up a template today but not make it assignable until next month, I can't. There's also no archive/inactive status for old templates I don't use anymore but want to keep for records."

🟡 **MINOR — UX-TM-002:** Inconsistent draft/archive states across document types. Write-ups have draft support; other types don't.

🟡 **MINOR — UX-TM-003:** No template preview. When I'm in the Documents table looking at my templates, I can click into the detail page to see assignment status, but I can't quickly preview what the document/form actually looks like.

🟢 **ENHANCEMENT — UX-TM-004:** No template duplication with modifications. The "Duplicate" option in the type selector lets me copy a template, but I can't choose to duplicate *and then modify* — it creates an exact copy and I'd have to find and edit it after.

---

## Test Session 10: Day-to-Day Operations

### Scenario
*"It's a normal Tuesday. I want to quickly check what needs my attention across all locations and take action."*

### Walkthrough

**Step 1: I open the Compliance Dashboard.**

> "The dashboard is a good starting point. The compliance circle (53%), the counter chips (Templates, Certifications, Write-ups, Team Members), and the 'Action Required' section are all well-designed. The action items are clearly prioritized — critical (red) and warning (amber). Each item has the names of affected employees and a quick action button. I'd rate this a solid B+."

✅ **Dashboard is well-designed for daily triage.** The consolidated action items list is effective.

**Step 2: I click through each action item.**

> "I click '3 expired documents' and it takes me to the Documents tab... but there's no 'expired' filter applied. It just goes to the default Documents view. I expected it to filter to show me only the expired items. Same with 'pending signatures' — it navigates to the documents tab but doesn't apply the pending filter."

🟠 **MAJOR — UX-DAY-001:** Dashboard action items navigate to the correct tab but don't apply the relevant filter. The `onNavigateToTab('documents', 'expired')` function accepts a filter parameter, but the Documents page doesn't seem to consume it to pre-filter the table. The user has to manually find the relevant items after clicking.

**Step 3: I look at the 'Incomplete Templates' panel.**

> "This shows the top 5 templates that aren't fully assigned. Each shows a progress bar and 'X remaining.' I can click to open the template detail. This is useful but the panel only shows 5 — with 'View All' going to the full Documents tab. That works."

✅ **Incomplete Templates panel is useful.**

**Step 4: I want to send a quick reminder to everyone with pending items.**

> "I see pending signatures in the action items. I want to send a reminder to all of them at once. But clicking the action item just navigates me away. There's no 'Remind All' button directly on the action item in the dashboard. I have to navigate to the documents view, find each document, go into the detail page, and click 'Remind All Pending' there."

🟡 **MINOR — UX-DAY-002:** No "Remind All" action directly from the dashboard action items. The action items show "View" which navigates away. A "Remind" action alongside "View" would save clicks.

**Step 5: I check notifications/activity feed.**

> "Is there an activity feed? Something like 'Sarah signed Employee Handbook — 2 hours ago' or 'Mike's Food Handler cert expired — yesterday'? I don't see one. The dashboard shows counts but not recent activity. I'd love a running log of what's happening."

🟡 **MINOR — UX-DAY-003:** No activity feed or recent events log. The dashboard is snapshot-based (current state) rather than event-based (what happened recently).

🟢 **ENHANCEMENT — UX-DAY-004:** No email digest option. A daily email summary ("3 documents signed yesterday, 2 new expirations, 1 write-up refused") would help admins stay on top of things without logging in every morning.

🟢 **ENHANCEMENT — UX-DAY-005:** No mobile-responsive consideration. The layout uses `grid-cols-2` for dashboard panels, tables with 6+ columns, and slide-overs at 420px width. Restaurant managers often check this on their phones between shifts.

---

## Overall UX Observations

### What Works Well 👍

1. **Write-ups flow end-to-end** — Template creation (with form builder), assignment (with employee selection and manager signature), employee acknowledgement (with decline option), history tracking, escalation settings. This is the most complete workflow in the product.

2. **Certification management** — Creation with auto-assign, employee upload with photo support, manager verification with checklist, expiry calendar, reminder system. Well thought out.

3. **Assignment modal** — "Select by Location" and "Select by Role" chips for bulk selection, plus individual search. The two-step (select → review) flow prevents mistakes.

4. **Compliance Dashboard** — Consolidated action items with severity indicators. Clean metric chips. Good visual hierarchy.

5. **Consistent UI** — The product uses a consistent design system (buttons, modals, tables, status colors, toasts). The red/amber/green traffic-light pattern for status is intuitive.

6. **Bulk selection** — The floating action bar when rows are selected in tables is well-designed. "Remind All" and "Download" bulk actions are accessible.

7. **Fits into the Workstream ecosystem** — The product's team member list, locations, and roles can be sourced from Workstream HRIS. Templates can be plugged into Workstream Onboarding bundles. I-9 and W-4 are handled by dedicated products, so Documents V2 doesn't need to reinvent government forms.

### What Needs Work 👎

1. **Only 3 of 5 document behaviors are implemented.** SIGN (PDF + signatures) ✓, UPLOAD (collect files) ✓, and a specialized SIGN variant for write-ups ✓. But COLLECT (structured forms) is completely missing — and it's the one behavior that no other Workstream product covers for restaurant-specific data (emergency contacts, uniform sizes, availability, dietary needs). GENERATE (templates + data merge) is a nice-to-have now that I-9/W-4 are handled elsewhere.

2. **No location-level visibility.** The product aggregates everything across all locations. Multi-location admins can't answer basic questions like "How's Downtown doing on compliance?" without manually scanning through every member. This is the biggest operational gap.

3. **No export or reporting.** Data goes in but doesn't come out. No PDF reports, no CSV exports, no audit packages. This is a blocker for any compliance-regulated industry. Workstream's Onboarding dashboard provides some tracking, but Documents V2 needs its own reporting for certifications, policies, and write-ups.

4. **No version control.** Policies change. The system treats each version as a completely separate document with no linking, history, or automatic re-assignment. This is a compliance risk during audits.

5. **No offboarding/termination integration.** Workstream Onboarding solves the "hire" side of the employee lifecycle, but there's no equivalent "termination" trigger. When HRIS status changes to "terminated," Documents V2 doesn't react — pending documents stay pending, compliance percentages are skewed, and exit paperwork must be manually assigned.

6. **Auto-assign is limited to certifications.** While onboarding handles new-hire document bundling, ongoing document assignment (updated policies, annual re-acknowledgements, role-change documents) still requires manual intervention for non-certification document types.

### What's Resolved by Workstream Platform ✅

| Original Blocker | Resolution |
|--|--|
| No onboarding packet/bundle (UX-ONB-003) | Workstream Onboarding bundles documents into onboarding processes |
| No way to add new employee (UX-ONB-004) | New hires enter system through Hiring → Onboarding pipeline; HRIS is source of truth for team member list |
| No I-9/W-4 generation (UX-ONB-008/009) | I-9 & E-Verify is a dedicated Workstream product; W-4 and tax forms are handled by Workstream Payroll |

### Recommendations (Prioritized)

| Priority | Item | Impact | Notes |
|----------|------|--------|-------|
| P0 | Add COLLECT (form) document type using existing FormFieldBuilder | Unblocks data collection, emergency contacts, uniform sizing | No other Workstream product covers this for custom restaurant-specific data |
| P0 | Add location filter to all list views + location compliance dashboard | Unblocks multi-location management | Table stakes for any multi-location restaurant group |
| P0 | Add basic export (CSV + PDF report) | Unblocks audit compliance | Critical for health dept inspections, corporate reporting |
| P0 | Add document version control (supersede + link versions) | Unblocks policy update workflows | Compliance risk without it — auditors need version proof |
| P1 | Extend auto-assign rules to all document types | Enables automated ongoing document workflows | Onboarding handles new-hire, but policy updates and role changes need auto-assign |
| P1 | Consume HRIS employee status in Documents V2 | Enables active/terminated filtering, compliance accuracy | Terminated employees skew compliance %; pending docs should auto-cancel |
| P1 | Add offboarding/termination trigger | Enables separation document workflows | Mirror of what Onboarding does for hires — but for exits |
| P1 | Make dashboard action items apply filters when navigating | Fixes broken navigation flow | Currently navigates to tab but doesn't pre-filter |
| P2 | Add recurring/scheduled assignments | Enables annual policy re-acknowledgement | Standard in restaurants for handbooks and safety policies |
| P2 | Add acknowledgement-only document type (no PDF/signature) | Simplifies policy acknowledgements | Many policies just need "I read it" — not a wet signature |
| P2 | Add user-level permissions by location | Enables GM-level access control | GMs should only see their own location |
| P2 | Build unified employee "My Documents" view | Gives employees a post-onboarding document hub | Onboarding portal covers Day 1; this covers ongoing |
| P3 | Add GENERATE document type (template + data merge) | Enables offer letters, separation agreements | Nice-to-have now that I-9/W-4 are handled by dedicated products |
| P3 | Add activity feed / event log | Improves day-to-day visibility | Snapshot dashboard misses "what happened today" |
| P3 | Add progressive discipline automation | Differentiates write-up feature | System could suggest escalation level based on history |
| P3 | Add mobile-responsive layouts | Enables field manager usage | Restaurant managers check this on phones between shifts |

---

*End of usability testing session. Total testing time: ~3 hours. Total issues found: 52 (7 blockers, 16 major, 13 minor, 16 enhancements). Three original blockers resolved by existing Workstream platform capabilities (Onboarding bundles, I-9/E-Verify, HRIS).*

