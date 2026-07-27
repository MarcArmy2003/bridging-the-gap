# Threat Reporting Architecture & Legal Framework

**Bridging the Gap™ – School Safety**

---

## Executive Summary

This document outlines the threat reporting system for Bridging the Gap™ – a **structured intake + rule-based escalation** architecture designed to:

✅ Enable rapid reporting of credible threats  
✅ Protect students, staff, and school communities  
✅ Maintain FERPA compliance  
✅ Reduce false accusations and defamation risk  
✅ Follow best practices from Safe2Tell, Say Something, STOPit, Bark  

**Core Principle:** System classifies and escalates based on transparent rules, NOT AI detection or subjective diagnosis.

---

## 1. What This System Is (And What It Isn't)

### What It IS
- ✅ A structured intake mechanism for credible threats
- ✅ Rules-based severity classification (transparent, auditable)
- ✅ Instant escalation to School Resource Officer (SRO)
- ✅ Immutable audit trail for legal compliance
- ✅ Role-restricted access (SRO only, not public)

### What It IS NOT
- ❌ An AI or automated "weapon detector"
- ❌ A surveillance system
- ❌ A student profiling or prediction tool
- ❌ A substitute for professional threat assessment
- ❌ A substitute for law enforcement

---

## 2. Threat Intake Workflow

### Student/Staff Report Button

```
🚨 Report an Immediate Safety Concern
Use this if you are worried about a weapon, threat, or immediate danger.
```

### Structured Questions (No Free Text Diagnosis)

**Header:** Safety Concern Report

1. **What is the concern?**
   - ☐ Possible weapon on campus
   - ☐ Threat made toward others
   - ☐ Concerning statement or message
   - ☐ Suspicious behavior

2. **Where is the concern located?**
   - ☐ On school campus
   - ☐ School bus / event
   - ☐ Nearby location
   - ☐ Online only

3. **How did you become aware?**
   - ☐ Saw something directly
   - ☐ Heard a statement
   - ☐ Social media or message
   - ☐ Someone told me

4. **Is this happening now?**
   - ☐ Yes
   - ☐ Not sure
   - ☐ No

5. **Optional details: Share only what you feel safe sharing.**
   - Optional freetext field
   - For additional context (not diagnosis)

### Critical Disclaimer (Required, Always Visible)

```
This report shares safety concerns only. 
It does not determine guilt or confirm possession of a weapon.
```

### Confirmation Message (After Submission)

```
Thank you. Your concern has been sent to school safety professionals.
```

---

## 3. Severity Classification Rules

### Classification Logic (Transparent, Auditable)

| Condition | Severity | Escalation | Law Enforcement |
|-----------|----------|-----------|-----------------|
| **Weapon mentioned + Happening NOW** | 🔴 Critical | Instant SRO + Admin | Yes (optional SRO decision) |
| **Weapon mentioned + Timing unclear** | 🟠 High | Instant SRO | Not auto |
| **Threat made + Happening NOW** | 🟠 High | Instant SRO | Depends on SRO |
| **Threat made + Timing unclear** | 🟠 High | Instant SRO | Depends on SRO |
| **Suspicious behavior or statement** | 🟡 Moderate | Counselor workflow | No |

### Key Rules
- ✅ System classifies (no human guessing)
- ✅ Rules are board-presentable
- ✅ Rules are auditable (no "black box")
- ✅ Classification reason is recorded
- ✅ Rules can be updated by district safety officer

---

## 4. Escalation Routing

### 🔴 Critical Threats
**Who gets notified:** SRO + Administrator  
**When:** Immediately (within 1 minute)  
**How:** SRO Portal (role-restricted alert)  
**Law enforcement:** SRO may contact directly  
**Counselor:** NOT first responder (too late)  
**Parent:** Not notified until threat is cleared  

### 🟠 High Priority Threats
**Who gets notified:** SRO first  
**When:** Immediately (within 5 minutes)  
**How:** SRO Portal + optional SMS alert  
**Counselor:** Notified after SRO (for coordination)  
**Law enforcement:** SRO decision-based  
**Parent:** Not notified until threat is cleared  

### 🟡 Moderate Concerns
**Who gets notified:** Counselor  
**When:** Next business day (can wait)  
**How:** Counselor inbox  
**SRO:** Not auto-escalated  
**Parent:** May be contacted by counselor  
**Outcome:** Standard support workflow  

---

## 5. SRO Portal (Role-Restricted Access)

### Who Can Access
- ✅ School Resource Officer (SRO)
- ✅ District Safety Administrator
- ❌ Counselors (view only, if at all)
- ❌ Teachers
- ❌ Students
- ❌ Parents

### What SRO Sees
- Threat details (concern, location, timing)
- Detailed note (if provided)
- Escalation history (immutable)
- Action buttons: Resolve, Clear, Escalate to LEO
- Contact info for district safety hotline

### What SRO Does NOT See
- Student names (unless already known via timing/location)
- Identifying details about reporter
- Counselor notes or medical info
- Parent contact info

### Actions Available to SRO
- **Assess & Resolve:** Threat confirmed false; case closed
- **Clear Duplicate:** Another report already filed
- **Contact Law Enforcement:** Escalate to police/sheriff
- **Coordinate with Counselor:** Request additional context
- **Document Resolution:** Immutable reason recorded

---

## 6. How Law Enforcement Is Notified (Safely)

### ❌ What We DO NOT Do
- ❌ Auto-call 911 (no emergency override)
- ❌ Send raw student data to police systems
- ❌ Email reports directly to law enforcement
- ❌ Share full threat intake details publicly

### ✅ What We DO Do (Choose One or More)

**Option A: SRO Portal**
- SRO has dedicated role
- SRO reviews threat in system
- SRO decides whether to contact police
- SRO calls from their secure phone
- Full audit of SRO action

**Option B: District Safety Hotline Integration**
- API call to district safety hotline (human-answered)
- Hotline operator triages threat
- Operator contacts law enforcement if needed
- District maintains call record
- No raw student data sent

**Option C: Manual Escalation Button**
- SRO clicks "Contact Law Enforcement"
- Provides pre-filled template for SRO to call/text
- Button logs action with timestamp
- SRO makes actual call (system doesn't)

---

## 7. Audit Logging (Immutable, Non-Negotiable)

Every action creates an immutable record:

```
Event: Threat reported
- Report ID: TH-20260210-001
- Reported by: [anonymized if applicable]
- Concern: Possible weapon
- Location: On campus
- Timing: Happening now
- Timestamp: 2026-02-10 14:32:15 UTC

Event: Classified
- Severity: Critical
- Reason: "Weapon + happening now = Critical"
- Classifier: [system rule engine]
- Timestamp: 2026-02-10 14:32:16 UTC

Event: Escalated to SRO
- SRO: Officer Jones
- Method: SRO Portal
- Timestamp: 2026-02-10 14:32:17 UTC

Event: SRO Response
- Action: Assessed & resolved
- Resolution: "Student clarified statement; no credible threat"
- By: Officer Jones
- Timestamp: 2026-02-10 14:45:22 UTC
```

---

## 8. False Report & Duplicate Handling

### False Reports
- ✅ Allowed (students learning to use system)
- ✅ SRO marks "Resolved - False Alarm"
- ✅ Immutable record kept
- ✅ **No student consequences** (first offense)
- ⚠️ Pattern of false reports = counselor discussion
- 🚨 Intentionally false + malicious = school discipline per policy

### Duplicates
- ✅ SRO marks "Resolved - Duplicate"
- ✅ System links reports together
- ✅ No double-escalation
- ✅ Immutable record shows linkage

### Clearing vs. Resolving
- **Resolve** = Threat assessed, found to be false or addressed
- **Clear** = Duplicate or testing; no independent assessment

---

## 9. Parent & Student Visibility

### What Parents Can See
- ❌ Threat report details
- ❌ Weapon language
- ❌ Who reported it
- ✅ Post-incident notification (if cleared/resolved)
- ✅ "Your student is safe" message (optional, district choice)

### What Students Can See
- ✅ Confirmation that report was received
- ✅ "We take this seriously" message
- ✅ Next steps (in general terms)
- ❌ Escalation details
- ❌ Other reporters' information

### When Parents Are Notified
- 🟢 After threat is resolved/cleared
- 🟢 District-approved message only
- 🟢 No details unless student was directly involved
- ⚠️ NEVER notify parent if student is the threat subject

---

## 10. Legal & Compliance Guarantees

### FERPA
✅ **Compliant**
- Threat reports are safety records, not educational records
- Can be shared with law enforcement without parent consent
- Do not appear on student transcripts

### Civil Liability
✅ **Protected**
- Immutable audit trail proves good-faith assessment
- Rules-based classification defensible
- SRO decision-making documented
- Anonymous reporting option available

### Defamation
✅ **Protected**
- Reports are treated as safety concerns, not accusations
- No student names in system unless SRO determines necessary
- Reporter identity protected
- No public sharing of reports

### State Threat Assessment Laws
✅ **Compliant**
- System supports (not replaces) professional threat assessment
- SRO and counselors can use intake data for assessment
- All data available to law enforcement
- Chain of custody maintained in audit log

---

## 11. Board & District Communication

### For District Handbook / Policy

**Threat Reporting Policy (Draft)**

> The Bridging the Gap: School Safety system provides a dedicated channel for reporting credible safety threats (weapons, harm plans). All reports are immediately reviewed by the School Resource Officer or district safety officer. The system does not determine guilt; it enables rapid intake of safety concerns. Professional assessment by trained school officials is required for all reports.

### For Board Presentation

> **Key Points to Emphasize:**
> - ✅ Separate from bullying/wellness (faster response)
> - ✅ SRO is first responder (not counselor)
> - ✅ Immutable audit trail (legal protection)
> - ✅ Rules-based, not AI detection
> - ✅ Follows Safe2Tell, Say Something best practices
> - ✅ Builds trust: "We take threats seriously"

---

## 12. Board Presentation Mode

For district board meetings and community stakeholder presentations, Bridging the Gap: School Safety includes an **automated presentation walkthrough** that explains the threat reporting system's design and safeguards.

### Presentation Steps ("How Safety Alerts Work")

**Step 1: Student & Staff Reporting**
```
Students and staff can report safety concerns safely and securely.
The structured form ensures clarity and prevents false accusations.
No student names or diagnoses — just the facts we need to act.
```

**Step 2: Automated Severity Assessment**
```
The system assesses urgency — not guilt.
Transparent rules (weapon + timing, threat + timing, behavior) 
determine if a concern goes to SRO, counselor, or both.
This is NOT AI detection. This is rule-based routing.
```

**Step 3: Immediate Escalation to Trained Responders**
```
Critical threats go directly to your School Resource Officer.
Law enforcement is contacted per SRO judgment, not automatic.
The SRO makes all final decisions. The system just routes quickly.
```

**Step 4: Complete Accountability**
```
Every action is logged: who reported, what was reported, when, 
to whom, and what action was taken.
This creates a transparent, defensible audit trail.
This protects students, staff, and district.
```

### Using Presentation Mode

Districts can activate **Presentation Mode** during board meetings to:
1. Walk through a sample threat report scenario (with demo data)
2. Show how the system routes concerns to SRO
3. Demonstrate the immutable audit log
4. Answer board questions in real-time

**Presentation Mode Key Points for Board:**
- ✅ Transparent, rule-based (not AI or algorithm)
- ✅ FERPA-compliant (no personal health diagnoses)
- ✅ Legal safeguard (immutable audit trail)
- ✅ Fast escalation (trained responders, not staff)
- ✅ Empowers reporting (students feel safe)
- ✅ Accountable (every action logged)

---

## 13. District Implementation Checklist

### Pre-Launch
- [ ] Train SROs on portal + escalation rules
- [ ] Define "district safety officer" role
- [ ] Set up SRO notification integration (email/SMS/portal)
- [ ] Configure law enforcement contact methods
- [ ] Write parent/student messages
- [ ] Plan board communication
- [ ] Audit logging infrastructure ready

### Launch
- [ ] Enable threat report button for students/staff
- [ ] Distribute training materials
- [ ] Monitor first 2 weeks for test reports
- [ ] Refine classification rules based on feedback
- [ ] Publish policy in student/staff handbooks

### Ongoing
- [ ] Monthly review of threat reports (not public)
- [ ] Quarterly audit of SRO escalations
- [ ] Annual review of classification rules
- [ ] Board update on system usage (aggregate, no names)

---

## Conclusion

This threat reporting system protects students, staff, and school communities through **structured intake, rule-based escalation, and immutable audit trails**. It is FERPA-compliant, legally defensible, and transparent.

**Most importantly:** It empowers students and staff to report concerns rapidly, knowing those concerns reach trained professionals immediately.

---

**Document Version:** 1.0  
**Effective:** February 10, 2026  
**Questions:** Contact [District Safety Officer] or support@saving-grace.edu
