# Demo Environment & Live Environment Policy

**Bridging the Gap: School Safety Student Support System**

---

## 1. Demo Environment Policy

### Definition
The Demo Environment is a training and demonstration mode containing simulated data only. No real student, parent, or staff information is collected, stored, or transmitted.

### Purpose
- Staff onboarding and workflow training
- Board and stakeholder presentations
- Product demonstrations for prospective districts
- Safe exploration of system features without live data

### Data Characteristics
- All demo cases are fictional
- Demo student names are generic (e.g., "Student (Grade 7)")
- Demo narratives are realistic but not tied to real incidents
- All demo data is loaded from local, read-only configuration files
- Demo cases are reset on exit; no data is persisted to production systems

### Access & Restrictions
- Available to all authorized users who activate it
- Clearly labeled with banner: **"🟡 Demo Environment — This is a training and demonstration view. No real student data is shown or stored."**
- Demo cases are visually distinct: **"DEMO CASE — Training Scenario"** badge
- All demo messages are marked: **"✉️ Demo Message — This message is for training purposes only and will not be delivered."**

### Exit Protocol
- Users can exit at any time
- Exit confirmation required: **"Exit Demo Mode? You will return to live data access. Demo cases will reset."**
- Returning to demo mode loads fresh demo data
- No demo data persists across sessions

---

## 2. Live Environment Policy

### Definition
The Live Environment is used for active student support and incident response. Access is role-restricted, logged, and governed by district policy, FERPA, and applicable state laws.

### Purpose
- Real student case management
- Parent and guardian communication
- Staff coordination and support planning
- Incident documentation and escalation

### Data Characteristics
- All case data represents real students and incidents
- Access is strictly role-based and logged
- Data is encrypted in transit and at rest
- Retention follows district and state legal requirements
- FERPA compliance is enforced at all levels

### Access Controls
- **Counselors**: Full access to assigned cases and support workflows
- **Teachers**: Limited view of student incidents they've reported
- **Parents/Guardians**: Limited, role-specific information only
- **Administrators**: Full system access with audit logging
- **Law Enforcement**: Restricted access per district protocol

### Logging & Accountability
- All access to live data is logged with user ID, timestamp, and action
- Access logs are retained per district retention policy
- Unauthorized access attempts are flagged and reported
- Case modifications are tracked with change history

---

## 3. Mode Toggle & Data Isolation

### Frontend-Only Toggle
- Demo mode toggle is localStorage-based on the client device
- Toggle persists across page refresh (device-specific)
- Clear visual indicators distinguish demo from live data
- No backend changes or database queries when toggling

### Data Flow
```
Demo Mode: User.isDemo = true  →  Load demoData locally  →  Read-only display
Live Mode: User.isDemo = false →  Query production API    →  Full read/write
```

### No Data Mixing
- Live and demo data are never combined in the same view
- Switching between modes requires explicit user action
- Demo cases do not affect live case counts or metrics
- No demo activity is logged in production audit trails

---

## 4. Presentation Mode (Board & Stakeholder Demos)

### Definition
Presentation Mode is a read-only, guided demonstration view for board members, funders, and community stakeholders.

### Features
- Full-screen, immersive walkthrough
- No interactive buttons that change data
- Auto-guided narration with manual override
- Pre-configured presentation steps
- Automatic step progression with pause/resume control

### Steps Example
1. "Here's how a student safely checks in."
2. "Here's what a counselor sees first."
3. "Here's how severity is handled."
4. "Here's how accountability is documented."

### Access
- Initiated by authorized staff (counselor/admin)
- Can be triggered on dedicated demo devices
- Time-limited presentations
- No student or staff data visible unless explicitly approved by district

---

## 5. FERPA & Legal Compliance

### Demo Environment
- Exempt from FERPA since no real student data is used
- No special privacy handling required
- Can be demonstrated in public settings (board meetings, conferences)
- Can be recorded for training purposes

### Live Environment
- Fully subject to FERPA regulations
- Requires prior student/parent consent for any sharing
- May not be recorded or shared without explicit authorization
- Audit logs are maintained per legal requirements

---

## 6. Policy Implementation

### For District Contracts
**Include in Service Level Agreement:**

> *"The Bridging the Gap: School Safety system provides a Demo Environment for training purposes, completely separate from the Live Environment used for real student cases. Demo data contains no real student information. Access to live student data is restricted by role and logged for accountability. All data is handled in compliance with FERPA and state law."*

### For Board Packets
**Include in Security & Privacy Statement:**

> *"The system separates demonstration data from real student information. New staff can safely explore the full workflow in Demo Mode before access to live cases. All live data access is logged and role-restricted."*

### For Privacy Notices
**Include in Privacy Acknowledgment:**

> *"When using Live Mode, you are accessing real student records. Demo Mode contains only fictional demonstration data. Both modes are clearly labeled."*

---

## 7. Data Retention & Cleanup

### Demo Data
- Not retained after session exit
- Reset automatically when re-entering demo mode
- No backup or archival
- No export capability

### Live Data
- Retained per district policy and legal requirements
- Backed up according to district disaster recovery plan
- Subject to FERPA-compliant retention schedules
- Deleted per district records management policy

---

## 8. Version & Audit Trail

**Policy Version:** 1.0  
**Effective Date:** February 10, 2026  
**Next Review:** August 10, 2026

**Change Log:**
- 2026-02-10: Initial policy document

---

## Questions & Support

For questions about demo vs. live modes, contact:
- **Technical Support**: support@saving-grace.edu
- **Compliance & Legal**: legal@saving-grace.edu
- **Training & Onboarding**: training@saving-grace.edu
