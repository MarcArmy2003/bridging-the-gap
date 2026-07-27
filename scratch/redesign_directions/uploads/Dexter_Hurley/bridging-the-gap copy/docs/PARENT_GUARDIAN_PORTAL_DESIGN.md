# Parent & Guardian Portal Design
## Bridging the Gap: School Safety

**Purpose:** Create a calm, clear, reassuring parent experience that separates from counselor workflows while maintaining trust and FERPA compliance.

**Design Philosophy:**
- Calm, not clinical
- Clear, not complex
- Reassuring, not dismissive
- Structured, not rigid
- Action-guided, not prescriptive
- Supportive, not investigative
- Transparent, not overwhelming

---

## 🎯 Purpose Definition

### What Parents CAN Do
✅ Submit a concern about their child  
✅ Track status of submitted concerns  
✅ Receive communication from school counselor  
✅ Access school-approved support resources  
✅ Understand escalation levels  
✅ Know what to do in emergencies  
✅ Request meetings with staff  
✅ Provide follow-up information  

### What Parents CANNOT See (FERPA-Protected)
❌ Internal counselor notes  
❌ Disciplinary actions or recommendations  
❌ Other students' data  
❌ Law enforcement communications  
❌ Staff opinions or assessments  
❌ Case file details beyond their submission  
❌ System audit logs  

**Why This Matters:**
Separation = Trust + Compliance + Safety. Parents feel heard without feeling surveilled. School maintains confidentiality and professional judgment space.

---

## 🏠 Parent Dashboard (Landing View)

### Layout: Three Distinct Sections

```
┌─────────────────────────────────────────┐
│  BRIDGING THE GAP                       │
│  Parent & Guardian Portal               │
│                                         │
│  Supporting your child through          │
│  structured communication and           │
│  guided intervention.                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SECTION 1: PRIMARY ACTIONS             │
│                                         │
│  [🔵 Report a Concern]                 │
│  If you have a concern involving your   │
│  child, we're here to listen.           │
│  [Button: Submit a Concern]             │
│                                         │
│  [🟢 View Active Cases]                │
│  Track the status of submissions.       │
│  [Button: View My Submissions]          │
│                                         │
│  [🟡 Support Resources]                │
│  Crisis numbers, guidance, community   │
│  [Button: View Resources]               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SECTION 2: QUICK FACTS                 │
│                                         │
│  You have 1 active submission           │
│  Last updated: Feb 15, 2026             │
│  Assigned counselor: [Role only]        │
│  Next update: [If known]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SECTION 3: EMERGENCY RESOURCES         │
│                                         │
│  In immediate danger? Call 911          │
│  Crisis support: 988 (call or text)     │
│  School main line: [Number]             │
└─────────────────────────────────────────┘
```

### Visual Design

**Banner:**
- Background: Light Gray (#F4F6F8)
- Text: Deep Navy (#0E2A47)
- Font: Bold, 24px
- Subtext: Regular, 16px, Safe Teal (#2CA6A4)
- Clear spacing (32px padding)

**Primary Action Cards:**
- Background: White (#FFFFFF)
- Border: 2px, Safe Teal (#2CA6A4)
- Border-radius: 12px
- Padding: 24px
- Icon: 32px, colored
- Title: Bold, 18px, Deep Navy
- Description: Regular, 14px, Dark Text (#1A1A1A)
- Button: Primary style, Bridge Blue (#1F5FAF)

**Quick Facts Section:**
- Background: Very light gray (#F9FAFB)
- Border-left: 4px, Bridge Blue (#1F5FAF)
- Padding: 16px
- Font: 14px
- Subtle, not prominent

**Emergency Section:**
- Background: Light teal (#E8F5F4)
- Border: 1px, Safe Teal (#2CA6A4)
- Icon: Warning symbol (not red, teal)
- Font: 14px, clear and readable
- Phone numbers: Bold, clickable

---

## 📝 Submit a Concern Flow (5-Step Guided Form)

### Design Principles for Multi-Step Form

✅ Progress indicator at top (Step 1 of 5)  
✅ One question per screen (no cognitive overload)  
✅ Clear "Next" and "Back" buttons  
✅ Auto-save between steps  
✅ Preview before final submission  
✅ Reassuring tone throughout  

---

### Step 1: Select Concern Type

**Screen Title:**
"What brings you to us today?"

**Subtitle (Calm):**
"We're here to listen and help. Tell us what's on your mind."

**Input Type:** Dropdown or Card Selection

**Options:**

```
○ Bullying or Peer Conflict
  [Icon: people with barrier]
  "My child is being excluded, teased, or hurt by peers."

○ Threat or Safety Concern
  [Icon: shield]
  "I'm worried about a safety issue or threat."

○ Emotional Distress
  [Icon: heart]
  "My child seems anxious, sad, or struggling emotionally."

○ Behavioral Change
  [Icon: trending down]
  "I've noticed a sudden change in my child's behavior."

○ Weapon or Serious Safety Risk
  [Icon: alert triangle]
  "I'm aware of a weapon or immediate safety risk."

○ Other
  [Icon: question mark]
  "Something else I want to report."
```

**Design:**
- Each option is a card or button
- Icon: 24px, Safe Teal (#2CA6A4)
- Text: Left-aligned, descriptive
- On selection: Option highlights with Bridge Blue border
- Button: "Continue" (not "Next" — more reassuring)

**Auto-Save:**
- Save selection to localStorage
- Display subtle "Saved" message (2 second fade)

---

### Step 2: Urgency Level (Critical Step)

**Screen Title:**
"How urgent is this concern?"

**Subtitle (Clear Expectations):**
"Help us understand the timing. This determines how quickly we respond."

**Options:**

```
🟢 General Concern
   "This is important but not immediate."
   Example: Ongoing conflict, gradual change in behavior
   
   Response time: School day or next business day

○ Concerning Behavior
   "I'm noticing patterns that worry me."
   Example: Sudden mood changes, withdrawal, concerning comments
   
   Response time: Within 24 hours

○ 🔴 Immediate Safety Risk
   "Someone could get hurt right now."
   Example: Threat of harm, weapon present, child in danger
```

**Critical: Safety Intercept**

If user selects 🔴:
```
┌──────────────────────────────────────┐
│  ⚠️  IMMEDIATE SAFETY RISK           │
│                                      │
│  If someone is in immediate danger,  │
│  please:                             │
│                                      │
│  1️⃣  Call 911 now                   │
│  2️⃣  Contact your school office:    │
│      [School Phone Number]           │
│  3️⃣  Then submit this form for      │
│      documentation                   │
│                                      │
│  [Button: I've Called for Help]     │
│  [Button: Back - This isn't urgent]  │
└──────────────────────────────────────┘
```

**Design:**
- Cards arranged vertically
- Color ring around selected option (Bridge Blue)
- Description text: 14px, left-aligned
- "Response time" subtitle: 12px, muted, Safe Teal
- Emoji used (not threatening)

---

### Step 3: Describe the Situation

**Screen Title:**
"Tell us what happened."

**Subtitle (Guided):**
"Include details like when, where, and who was involved. Be as specific as you're comfortable with."

**Required Field:**
```
Text Area (500 character max):
"What happened? When did you first notice this? 
Who is involved?"

[Input field with character counter]
Characters used: 0/500
```

**Optional Fields:**

```
[ ] Who was involved?
    [Student name: Dropdown or type]
    [Other students: Dropdown or type]
    [Staff member: Dropdown or type]

[ ] When did this happen?
    [Date picker]
    [Time: Optional]

[ ] Where did this happen?
    [Location dropdown]
    Example: Classroom, hallway, online, bus, home

[ ] Has this happened before?
    ○ First time
    ○ Happens sometimes
    ○ Happens regularly

[ ] Attach supporting documents
    [Upload area: Screenshots, photos, documents]
    (Max 3 files, 5MB each)
    Allowed: JPG, PNG, PDF
```

**Design:**
- Text area: 300px height, soft border, rounded
- Labels: Bold, 14px
- Helper text: 12px, muted
- Optional note in gray: "(Optional)"
- Upload area: Dotted border, drag-and-drop enabled
- Character counter: Real-time, gray text

---

### Step 4: Preferred Contact Method

**Screen Title:**
"How should we reach you?"

**Subtitle:**
"We'll use your preferred method to share updates."

**Options:**

```
○ Phone Call
  "School counselor will call you"
  [Phone number pre-filled]
  [Checkbox: Texts are okay too]

○ Email
  "We'll send updates via email"
  [Email pre-filled]
  [Checkbox: Include web portal access]

○ School Meeting
  "Schedule an in-person meeting"
  [Available dates/times dropdown]
  [Preference for morning/afternoon]

○ Multiple Methods
  "Use what works best at the time"
  [Checkbox all that apply]
```

**Design:**
- Radio buttons or cards
- Phone icon: 24px
- Email icon: 24px
- Calendar icon: 24px
- Pre-filled data from account
- Clear next steps for each method

---

### Step 5: Review & Confirmation

**Screen Title:**
"Please review before submitting."

**Preview Section:**

```
┌────────────────────────────────────┐
│  CONCERN SUMMARY                   │
├────────────────────────────────────┤
│  Concern Type:                     │
│  🔴 Threat/Safety Concern          │
│                                    │
│  Urgency:                          │
│  🟠 Concerning Behavior            │
│                                    │
│  Submitted by:                     │
│  [Parent Name]                     │
│  [Student Name] (Grade X)          │
│                                    │
│  Details:                          │
│  [First 100 characters...]         │
│  [Link: Full Details]              │
│                                    │
│  Contact Method:                   │
│  ✓ Phone & Email                   │
│                                    │
│  [Edit: Concern Type]              │
│  [Edit: Details]                   │
│  [Edit: Contact Method]            │
└────────────────────────────────────┘
```

**Legal Disclaimer (Required):**

```
┌────────────────────────────────────┐
│  IMPORTANT: PLEASE READ            │
│                                    │
│  By submitting this concern, you   │
│  confirm that information is       │
│  accurate to the best of your      │
│  knowledge. The school will        │
│  investigate according to its      │
│  policies and procedures.          │
│                                    │
│  Bridging the Gap documents your   │
│  submission. Final decisions       │
│  regarding investigation,          │
│  discipline, or law enforcement    │
│  remain under school authority.    │
│                                    │
│  You will be contacted about       │
│  next steps and timeline.          │
│                                    │
│  ☑ I have read and understand     │
└────────────────────────────────────┘
```

**Action Buttons:**

```
[Back to Edit]  [Submit Concern]
```

**Design:**
- Summary cards: Light gray background, soft border
- Edit links: Blue text, underlined
- Disclaimer: Light gray background, 12px text, readable
- Buttons: Primary (Bridge Blue) and secondary (gray)
- Button layout: Left-aligned for accessibility

---

### Confirmation Screen

**After Submit:**

```
┌────────────────────────────────────┐
│  ✅ THANK YOU                      │
│                                    │
│  Your concern has been securely    │
│  submitted to the school.          │
│                                    │
│  Case ID: BG-20260217-0482         │
│  Date Submitted: Feb 17, 2026      │
│                                    │
│  📧 Check your email for          │
│     confirmation & next steps      │
│                                    │
│  ⏱️  Expected Response:            │
│     24–48 hours                    │
│                                    │
│  Questions? Contact:               │
│  [School Counselor or Admin]       │
│  [Email]                           │
│  [Phone]                           │
│                                    │
│  [Back to Dashboard]  [View Case]  │
└────────────────────────────────────┘
```

**Design:**
- Large checkmark: 64px, Safe Teal
- Case ID: Monospace font, easy to reference
- Email prompt: Subtle, reassuring
- Timeline: Realistic (24–48 hours)
- Links: Clear next actions

---

## 📊 Active Cases / My Submissions View

### Purpose
Parents see status of their submissions without overwhelming detail.

### Layout

```
┌──────────────────────────────────────┐
│  MY SUBMISSIONS                      │
│  You have 1 active case              │
│                                      │
│  [View Closed Cases]                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Case #BG-20260215-0391              │
│  🔵 Emotional Distress               │
│                                      │
│  Submitted:  Feb 15, 2026            │
│  Status:     Under Review            │
│  Last Update: Feb 16, 2:30 PM        │
│                                      │
│  Assigned to: School Counselor       │
│  (not specific name)                 │
│                                      │
│  Next:   Waiting for counselor       │
│          to schedule meeting         │
│                                      │
│  [View Details] [Add Information]    │
│  [Request Update]                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Case #BG-20260210-0124              │
│  🟢 Bullying Concern                 │
│                                      │
│  Submitted:  Feb 10, 2026            │
│  Status:     Closed                  │
│  Resolved:   Feb 14, 2026            │
│                                      │
│  Summary:    Issue addressed with    │
│              structured support plan │
│                                      │
│  [View Summary] [Provide Feedback]   │
└──────────────────────────────────────┘
```

### Status Indicators

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| **Received** | 📬 | Bridge Blue | Submitted, queued for review |
| **Under Review** | 👁️ | Bridge Blue | Counselor is reviewing |
| **Action Scheduled** | 📅 | Safe Teal | Meeting or intervention planned |
| **In Progress** | ⏳ | Safe Teal | Support plan underway |
| **Awaiting Parent** | ❓ | Gold | Need more info from you |
| **Closed** | ✅ | Safe Teal | Case resolved |

**Design:**
- Status color: Subtle, not bold
- Card layout: 100% width on mobile, constrained on desktop
- Metadata: Light gray text, 12px
- Action buttons: Secondary style (gray border, not filled)
- "Not specific name" for counselor: Shows respect/privacy

### Case Details View

When parent clicks "View Details":

```
┌──────────────────────────────────────┐
│  Case Details                        │
│  BG-20260215-0391                    │
│                                      │
│  WHAT YOU REPORTED:                  │
│  Emotional Distress                  │
│                                      │
│  YOUR DESCRIPTION:                   │
│  "My child has been withdrawn and    │
│   anxious for the past week..."      │
│  [Full text visible]                 │
│                                      │
│  SCHOOL RESPONSE:                    │
│  "We've reviewed your concern and    │
│   will schedule a meeting to..."     │
│  [Communication from counselor]      │
│                                      │
│  WHAT HAPPENS NEXT:                  │
│  [Specific timeline & next steps]    │
│                                      │
│  [Back] [Add Information]            │
└──────────────────────────────────────┘
```

**Important Design Note:**
- School response: Templated, professional
- Internal notes: NOT shown
- Next steps: Specific, timely
- Communication: From counselor role, not system

---

## 🧠 Support Resources Page

### Navigation
From dashboard: [🟡 Support Resources] → [View Resources]

### Layout

```
┌──────────────────────────────────────┐
│  SUPPORT & RESOURCES                 │
│                                      │
│  We're here to help during          │
│  challenging times.                  │
└──────────────────────────────────────┘

CATEGORIES:

[🔴 Crisis Support]
[🟠 Bullying Support]
[🟡 Mental Health]
[🟢 School Resources]
[🔵 Community Partners]
```

### Crisis Support Section

```
┌──────────────────────────────────────┐
│  🚨 IN CRISIS?                       │
│                                      │
│  If someone is in immediate danger:  │
│  📞 Call 911                         │
│                                      │
│  FOR EMOTIONAL CRISIS:               │
│  📞 988 Suicide & Crisis Lifeline    │
│     Call or text anytime             │
│                                      │
│  TEXT HOME:                          │
│  📱 Text "HELLO" to 741741          │
│     Crisis counselor responds        │
│                                      │
│  SCHOOL CRISIS:                      │
│  📞 [School Emergency Number]        │
│     24/7 availability                │
│                                      │
│  Non-English support available.      │
│  [Cambiar a Español]                 │
└──────────────────────────────────────┘
```

### Bullying Support Section

```
[Icon] Understanding Bullying
"What counts as bullying? How can we help?"

[Link] → [Article with examples & parent guidance]

[Icon] Responding to Bullying
"Your step-by-step action plan"

[Link] → [Guide for parents]

[Icon] School Bullying Policy
"Your school's specific policies"

[Link] → [PDF or policy page]

[Icon] Community Resources
"Local support organizations"

[Link] → [List with contact info]
```

### Mental Health Section

```
[Icon] Understanding Child Anxiety
"Common signs and parent strategies"

[Link] → [Resource]

[Icon] Depression & Mood Changes
"When to seek professional help"

[Link] → [Resource]

[Icon] Finding a Therapist
"Insurance, cost, school referrals"

[Link] → [Resource]

[Icon] School Counselor
"Free support at school"

[Link] → [How to request]
```

### School Resources Section

```
[Icon] School Counselor
"Meet your school's mental health team"
[Link]

[Icon] School Nurse
"Health & wellness support"
[Link]

[Icon] Special Services
"If your child needs additional support"
[Link]

[Icon] School Handbook
"Policies, contact info, procedures"
[Link]
```

### Community Partners Section

```
[Icon] Local Mental Health Agencies
[List with hours, insurance info]

[Icon] Youth Programs
[After-school, sports, clubs]

[Icon] Crisis Shelters & Safe Spaces
[Emergency/overnight support]

[Icon] Support Groups for Parents
[Connection & peer support]
```

### Design

**Crisis Section:**
- Red/orange background: NO. Use Alert Red for text only sparingly.
- Instead: Light teal background (#E8F5F4)
- Red icon for crisis: Single icon, not overused
- Large phone numbers: 18pt, monospace, clickable
- Clear instructions: Step-by-step

**Other Sections:**
- Card layout: 100% width on mobile
- Icon: 32px, Safe Teal
- Title: Bold, 16px
- Description: Regular, 14px
- Link: Blue underline
- Category header: Slightly larger, muted color

---

## ⚖️ Trust & Legal Language

### Footer on All Parent Pages

```
┌──────────────────────────────────────┐
│  ABOUT THIS PORTAL                   │
│                                      │
│  Bridging the Gap provides a secure  │
│  way to submit concerns, track       │
│  status, and access resources.       │
│                                      │
│  Final decisions regarding           │
│  investigation, support services,    │
│  discipline, or law enforcement      │
│  involvement remain under district   │
│  authority.                          │
│                                      │
│  Your information is protected by    │
│  FERPA and school privacy policies.  │
│                                      │
│  Questions? Contact your school.     │
│                                      │
│  [School Contact]                    │
│  [Superintendent Email]              │
│  [District Privacy Officer]          │
└──────────────────────────────────────┘
```

### Privacy & FERPA Notice (In Help/Settings)

```
YOUR PRIVACY IS PROTECTED

This portal stores your submitted concerns
in a secure, encrypted system.

✓ Only authorized school staff see your
  submission
✓ Reports are confidential per FERPA
✓ You control what information you share
✓ No data is sold or shared externally

WHAT WE DON'T SHOW YOU:

We intentionally do not display:
- Counselor internal notes or assessments
- Other students' data
- Law enforcement communications
- Disciplinary recommendations
- Staff opinions

This protects your child's privacy and
allows school staff to do their work
confidentially.

If you have questions, contact:
[School Privacy Officer]
```

---

## 🎨 UI Tone Guidance

### Color Usage

| Color | Use | Don't Use | Feeling |
|-------|-----|-----------|---------|
| **Safe Teal** | Primary sections, icons, accents | N/A | Calm, helpful |
| **Bridge Blue** | Buttons, links, selected states | Overuse | Trusted, professional |
| **Deep Navy** | Headers, text, authority | Background | Stable, authoritative |
| **Gold** | Non-urgent timeline info | Alarms | Gentle emphasis |
| **Alert Red** | ONLY crisis/911 sections | Non-emergency | Urgent, get help NOW |
| **Light Gray** | Backgrounds, cards | Text | Clean, spacious |

**Rule:** One alert per section maximum. Red sparingly.

### Language Tone

| Say This | Not This | Why |
|----------|----------|-----|
| "Submit a concern" | "File a complaint" | Less accusatory |
| "We're here to listen" | "Report violations" | Supportive vs. punitive |
| "Next steps" | "Investigation details" | Clearer, less legal |
| "Assigned staff role" | "Case detective" | Professional, not police-like |
| "Support plan" | "Intervention" | Collaborative, not imposed |
| "Check back soon" | "Awaiting resolution" | Warm, not cold |

### Visual Tone

✅ Rounded corners (12–16px)  
✅ Soft shadows (2–4px blur)  
✅ Light colors (grays, teals, off-white)  
✅ Readable fonts (16px minimum)  
✅ Plenty of white space (32px margins)  
✅ Emoji for emotion (🟢🟠🔴 for status)  
✅ Icons that are friendly (not intimidating)  

❌ Sharp corners  
❌ Dark colors (too heavy)  
❌ Small text (hard to read)  
❌ Dense layouts  
❌ Official/bureaucratic icons  
❌ Aggressive language  

### Icons (32px, Safe Teal #2CA6A4)

- 🔵 Report concern (lightbulb or hand)
- 🟢 View cases (document)
- 🟡 Resources (book or question mark)
- 💬 Message (chat bubble)
- 📱 Contact (phone)
- 📧 Email (envelope)
- ✅ Resolved (checkmark)
- ⏳ In progress (hourglass)
- ❓ Needs info (question mark)
- 🆘 Crisis (no angry face)

---

## 🔒 FERPA Compliance Checklist

- [ ] No internal notes displayed
- [ ] No staff names (role only, if needed)
- [ ] No other students' data visible
- [ ] No law enforcement references
- [ ] No disciplinary actions shown
- [ ] No assessments or diagnoses displayed
- [ ] Data encrypted in transit & at rest
- [ ] Access logged & auditable
- [ ] Parents can request/amend submissions
- [ ] Data deleted per policy after 7 years
- [ ] Privacy notice displayed at entry
- [ ] Disclaimer on submission form
- [ ] No unsecured messaging (HIPAA-safe comms)
- [ ] 2FA optional (security + usability)

---

## 📱 Responsive Design Notes

### Mobile (< 600px)
- Single column layout
- Full-width cards
- Dropdown menus for selection
- Larger touch targets (44px minimum)
- Stacked buttons (full width)

### Tablet (600–1000px)
- Two-column layout where appropriate
- Card width: 90% max
- Buttons: Side-by-side if space

### Desktop (> 1000px)
- Two-column layout
- Cards: 400px max width
- Buttons: Horizontal layout
- Sidebar navigation option

---

## 🎬 User Flows (Wireframe)

### Flow 1: Parent Submitting Concern

```
Dashboard
  ↓ [Submit a Concern]
Step 1: Concern Type
  ↓ [Continue]
Step 2: Urgency Level
  ↓ [Continue]
Step 3: Describe Situation
  ↓ [Continue]
Step 4: Contact Method
  ↓ [Continue]
Step 5: Review & Confirm
  ↓ [Submit Concern]
Confirmation Screen
  ↓ [View Case] or [Back to Dashboard]
Active Cases View
```

### Flow 2: Parent Checking Status

```
Dashboard
  ↓ [View My Submissions]
Active Cases View
  ↓ [View Details] on specific case
Case Details
  ↓ Options: [Add Information] [Request Update] [Back]
Updated details or back to list
```

### Flow 3: Parent Accessing Resources

```
Dashboard
  ↓ [Support Resources]
Resources Home
  ↓ Select category (Crisis, Mental Health, etc.)
Category Detail
  ↓ [Link] or [Contact Info]
External resource or back
```

---

## 🚀 Implementation Priorities

### Phase 1 (MVP)
- [ ] Dashboard landing page
- [ ] Submit concern form (5-step flow)
- [ ] Active cases view
- [ ] Confirmation screen
- [ ] Basic support resources

### Phase 2 (Enhanced)
- [ ] Case details with school responses
- [ ] Request update feature
- [ ] Add information to case
- [ ] Closed cases view
- [ ] Feedback on resolved cases

### Phase 3 (Advanced)
- [ ] Mobile app notifications
- [ ] SMS updates option
- [ ] Document upload & preview
- [ ] Translation (Spanish, other languages)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## ✅ Success Metrics

**User Experience:**
- Parent satisfaction > 4.5/5 stars
- Time to submit concern < 5 minutes
- Zero complaints about tone or clarity
- NPS score > 50

**Operational:**
- School staff report easier case management
- Parent follow-up questions decrease 30%
- FERPA compliance: 100%
- Mobile usage > 60%

**Business:**
- Parent adoption rate > 70% (of guardians)
- Case submission rate increases 50%
- Support resource clicks > 1000/month
- Reduced phone inquiries to counselors

---

## 📋 Messaging Templates

### Submission Confirmation Email

```
Subject: Concern Submitted - Case #BG-XXXXXXXXX

Hi [Parent Name],

Thank you for submitting your concern about [Child Name].
We take your message seriously and will review it carefully.

📋 Case ID: BG-XXXXXXXXX
📅 Submitted: [Date & Time]
🎯 Priority Level: [General/Concerning/Immediate]

NEXT STEPS:
- A school counselor will review your submission 
  within 24-48 hours
- You'll receive an update via [Email/Phone/Portal]
- If urgent, we may contact you sooner

You can track your case anytime in the Parent Portal:
[Portal Link]

Questions? Reply to this email or call us at [Number].

We're here to help.

Bridging the Gap - School Safety
[School Name]
```

### Case Update Message

```
Subject: Update on Your Concern - Case #BG-XXXXXXXXX

Hi [Parent Name],

We wanted to let you know we've reviewed your concern about 
[Child Name]. Here's what we're planning:

[Specific next steps in clear language]

WHAT TO EXPECT:
[Timeline and realistic expectations]

YOUR ROLE:
[How parent can help/participate]

You can view more details anytime in your portal:
[Portal Link]

Questions? Reach out to [Staff Role] at [Contact].

We appreciate your partnership.

Bridging the Gap - School Safety
```

---

**Document Version:** 1.0 (Design Specification)  
**Date:** February 17, 2026  
**Status:** Ready for Implementation  
**Audience:** Product, Design, Engineering, Compliance
