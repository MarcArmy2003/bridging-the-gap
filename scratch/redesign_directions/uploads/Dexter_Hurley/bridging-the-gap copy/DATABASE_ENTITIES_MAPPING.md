# Database Entities Mapping: Prisma vs Supabase

**Project:** Bridging the Gap: School Safety  
**Date:** March 9, 2026  
**Status:** Analysis Complete

---

## Executive Summary

This project uses a **hybrid approach**:
- **Prisma (PostgreSQL)**: Full application data model (13+ tables)
- **Supabase**: Real-time messaging and event tracking (fallback when Prisma unavailable)

**RLS Protection:** ⚠️ **Partially implemented** - RLS is *designed* in documentation but **NOT ENFORCED** in current code. Access control relies on **app-level logic only**.

---

## 1. PRISMA ENTITIES (Core Database)

The PostgreSQL database managed by Prisma. All tables defined in [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

### Core User Management

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **User** | `users` | All authenticated users (parent, teacher, counselor, admin, SRO) | None - all accessible, role field used by app logic |
| **District** | `districts` | District organization (multi-tenancy) | Not filtered by Prisma |
| **School** | `schools` | School records within districts | Not filtered by Prisma |

### Student & Parent Relationship (FERPA-Critical)

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **Student** | `students` | Student records (minimal PII) | App logic filters by guardianships |
| **Guardianship** | `guardianships` | Links parents to students (FERPA gatekeeper) | **Parent visibility depends on verified_status='VERIFIED'** - enforced by app queries |

**Critical FERPA Query:**
```sql
SELECT DISTINCT s.*
FROM students s
INNER JOIN guardianships g ON s.id = g.student_id
WHERE g.parent_user_id = $1
  AND g.verified_status = 'VERIFIED'
  AND s.is_active = true;
```

### Case Management

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **Case** | `cases` | Core incident/case record | App filters by guardianship + role |
| **CaseStatusHistory** | `case_status_history` | Immutable audit trail of status changes | App filters by case ownership |
| **CaseParticipants** | `case_participants` | Explicit access sharing (optional) | Access level: VIEW, MESSAGE, or FULL_INTERNAL |

### Messaging & Communication

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **CaseThread** | `case_threads` | Message threads (with visibility flag) | `thread_type` = PARENT_STAFF or INTERNAL_ONLY |
| **CaseMessage** | `case_messages` | Messages within threads | Filtered by thread visibility in app logic |
| **Attachment** | `attachments` | File metadata for case attachments | Filtered by case ownership |

### Notifications & Audit

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **Notification** | `notifications` | In-app notification records | Filtered by user_id |
| **AuditLog** | `audit_log` | Write-once, immutable activity log | No direct access control (read-only for compliance) |

### Escalations

| Entity | Table | Purpose | Access Control |
|--------|-------|---------|-----------------|
| **CaseEscalation** | `case_escalations` | Escalation triggers and acknowledgments | Filtered by assigned roles |

---

## 2. SUPABASE ENTITIES (Real-time & Supplementary)

Supabase tables used for real-time messaging and event tracking. **Only 3 tables actively used in current code.**

### Tables Actually Used via `supabase.from()`

| Table | Purpose | Columns | RLS Status | Code Location |
|-------|---------|---------|-----------|----------------|
| **case_messages** | Real-time parent-counselor messages | id, case_id, sender_id, sender_role, recipient_role, body, created_at | ⚠️ **Designed but NOT enforced** | [src/data/messagingApi.ts](src/data/messagingApi.ts) |
| **case_notes** | Staff-only internal notes | id, case_id, author_id, content, created_at | ⚠️ **No RLS** | [src/services/cases.ts](src/services/cases.ts) |
| **case_events** | Event audit trail | id, case_id, type, actor_name, from_status, to_status, note_preview, created_at | ⚠️ **No RLS** | [src/services/cases.ts](src/services/cases.ts) |
| **cases** | Case records (mirror/read-only) | id, public_id, title, status, created_at, updated_at, support_plan_type, support_plan_owner_name | ⚠️ **No RLS** | [src/services/cases.ts](src/services/cases.ts) |

### Supabase RLS Design (In Documentation)

From [docs/SUPABASE_MESSAGING_SCHEMA.md](docs/SUPABASE_MESSAGING_SCHEMA.md):

```sql
-- function to check whether user is guardian of the case
create function is_guardian_of_case(uid uuid, case_uuid uuid) returns boolean language sql stable as $$
  select guardian_id = uid from cases where id = case_uuid
$$;

-- policy: select by counselors
create policy select_by_counselors on case_messages for select using (
  auth.role() = 'counselor' and exists (select 1 from case_assignments where case_id = case_messages.case_id and counselor_id = auth.uid())
);

-- policy: select for guardians
create policy select_by_guardians on case_messages for select using (
  is_guardian_of_case(auth.uid(), case_messages.case_id) and (
    sender_role = 'parent' or recipient_role = 'parent'
  )
);

-- policy: insert: allow when auth.uid is the sender
create policy insert_messages on case_messages for insert with check (
  sender_id = auth.uid()
);
```

**Status:** 🔴 **Documented but not implemented in database**

---

## 3. ENTITY MAPPING: WHERE DATA LIVES

### User Data
```
users (Prisma) ←─────────────────┬── All auth-related info
                                  │
auth.uid (Supabase Auth) ─────────┴── JWT identity (if using Supabase auth)
```

### Student & Parent Links
```
students (Prisma)
    ↓
guardianships (Prisma) ← FERPA access control
    ↓
users (Prisma) ← Parent identity
```

### Cases
```
cases (Prisma) ← Primary source of truth
    ↓
case_messages (Supabase) ← Real-time messaging + fallback (case_messages also queryable as case_notes in Prisma)
case_events (Supabase) ← Event tracking
case_status_history (Prisma) ← Immutable audit trail
```

### Messaging
```
Prisma:
  case_threads (visibility: PARENT_STAFF | INTERNAL_ONLY)
        ↓
  case_messages
        ↓
  attachments

Supabase (fallback/real-time):
  case_messages (direct with sender_role, recipient_role)
```

---

## 4. RLS PROTECTION ANALYSIS

### ⚠️ CRITICAL FINDING: RLS NOT ENFORCED

| Component | RLS Enabled? | How Access is Protected | Risk Level |
|-----------|--------------|------------------------|----|
| **case_messages (Supabase)** | ❌ NOT ENFORCED | App-level filtering + verification | 🔴 HIGH if directly exposed via Supabase client |
| **case_notes (Supabase)** | ❌ NO | App-level filtering only | 🔴 HIGH |
| **case_events (Supabase)** | ❌ NO | App-level filtering only | 🔴 HIGH |
| **cases (Supabase)** | ❌ NO | App-level filtering only | 🔴 HIGH |
| **Prisma tables** | N/A | Database drivers + app logic | 🟡 MEDIUM (Prisma connections server-side only) |

### Access Control Strategy (Current Implementation)

**All access control is enforced at the APPLICATION LEVEL:**

```typescript
// From src/data/messagingApi.ts
export async function getCaseMessages(
  caseId: string,
  viewerRole?: SenderRole
): Promise<CaseMessage[]> {
  // NO RLS - relies on app logic to filter
  const { data, error } = await supabase
    .from("case_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });
  // App must verify viewer has access to this caseId
}
```

**From src/services/cases.ts:**
```typescript
const resolveCase = async (id: string): Promise<CaseRow | null> => {
  // Fetches from Supabase without explicit authorization
  const { data: byPublic, error: publicError } = await supabase
    .from("cases")
    .select("*")
    .eq("public_id", id)
    .single();
  // NO RLS CHECK - app must verify access
};
```

### Guardianship Access Control (Prisma)

Parents' access to student data is controlled by:

```sql
WHERE g.parent_user_id = $1
  AND g.verified_status = 'VERIFIED'
```

**This is application logic, NOT database RLS.**

### Messaging Access Control (Designed but Unimplemented)

The system is **designed for RLS** on case_messages:
- Counselors see all messages for assigned cases
- Parents see only messages where `sender_role = 'parent'` OR `recipient_role = 'parent'`
- Teachers see only messages where `sender_role = 'teacher'` OR `recipient_role = 'teacher'`

**But this is only in documentation, NOT in database policies.**

---

## 5. COMPLETE SUPABASE TABLE LIST

### All `supabase.from()` calls in codebase:

```typescript
// src/data/messagingApi.ts
supabase.from("case_messages").select("*").eq("case_id", caseId)
supabase.from("case_messages").insert([{...}]).select().single()

// src/services/cases.ts
supabase.from("cases").select("*").eq("public_id", id).single()
supabase.from("cases").select("*").eq("id", id).single()
supabase.from("cases").update({...}).eq("id", row.id)
supabase.from("case_events").insert({...})
supabase.from("case_notes").insert({...}).select().single()
supabase.from("case_notes").select("*").eq("case_id", row.id)
supabase.from("case_events").select("*").eq("case_id", row.id)
```

### Summary

**Supabase Tables Used:**
1. `case_messages` - Real-time messaging
2. `case_notes` - Internal staff notes
3. `case_events` - Event tracking/audit trail
4. `cases` - Case master record (fallback/read)

**Real-time Subscriptions:**
- None in current code (using polling/one-time fetches)

---

## 6. SECURITY RECOMMENDATIONS

### Immediate Actions (🔴 Critical)

1. **Enable RLS on all Supabase tables:**
   ```sql
   ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
   ```

2. **Implement the documented RLS policies** from [docs/SUPABASE_MESSAGING_SCHEMA.md](docs/SUPABASE_MESSAGING_SCHEMA.md)

3. **Verify Supabase anon key is limited-scope:**
   - Currently used via `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - This is **for client-side access only**
   - Must ensure RLS policies protect data

### Short-term (🟡 Important)

4. **Audit all app-level access control:**
   - Ensure every query checks user permissions
   - Add explicit permission middleware

5. **Implement case access verification:**
   ```typescript
   // Example middleware needed
   async function verifyCaseAccess(userId: string, caseId: string) {
     // Check: parent owns case OR is linked to student
     // Check: counselor is assigned OR has admin role
   }
   ```

6. **Use Supabase Server Client for admin operations:**
   - Current code may use anon client for admin updates
   - Use `createClient(url, serviceRoleKey)` for backend-only operations

### Long-term (🟢 Best Practice)

7. **Migrate sensitive data to Prisma (PostgreSQL):**
   - Keep only real-time messaging in Supabase
   - Move case_notes, case_events to Prisma with proper RLS policies

8. **Implement audit logging:**
   - All `case_messages.insert()` should be logged
   - All case access should be logged to `audit_log`

---

## 7. IMPLEMENTATION STATUS

### ✅ Implemented
- Prisma schema with 13+ tables
- Guardianship FERPA access logic (app-level)
- Case threading visibility (`PARENT_STAFF` vs `INTERNAL_ONLY`)
- Supabase client initialization

### ⚠️ Partially Implemented
- RLS policies designed in documentation
- Access control mostly in application layer
- No audit logging for Supabase operations

### ❌ Not Implemented
- RLS policies in Supabase database
- Real-time subscriptions
- Service role backend client for Supabase admin operations
- Complete audit trail for all case_messages access

---

## 8. TABLE SCHEMA REFERENCE

### case_messages (Supabase)
```sql
CREATE TABLE case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  sender_id uuid not null,
  sender_role text not null check (sender_role in ('counselor','parent','teacher')),
  recipient_role text not null check (recipient_role in ('counselor','parent','teacher')),
  body text not null,
  created_at timestamptz not null default now()
);
CREATE INDEX on case_messages (case_id, created_at desc);
```

### case_notes (Supabase)
```sql
CREATE TABLE case_notes (
  id uuid primary key,
  case_id uuid not null,
  author_id uuid not null,
  content text not null,
  created_at timestamptz default now()
);
```

### case_events (Supabase)
```sql
CREATE TABLE case_events (
  id uuid primary key,
  case_id uuid not null,
  type text not null check (type in ('status_change', 'note_added')),
  actor_name text,
  from_status text,
  to_status text,
  note_preview text,
  created_at timestamptz default now()
);
```

---

## 9. FALLBACK ARCHITECTURE

The application has a **fallback mechanism** when Supabase is unavailable:

```typescript
// From src/lib/supabase.ts
const hasSupabase = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!hasSupabase) {
  // Uses in-memory fakeApi instead
  return fakeApi.getCaseMessages(caseId);
}
```

**Fallback services:**
- [src/data/fakeApi.ts](src/data/fakeApi.ts) - Mock in-memory database
- [src/data/guardianMessagingApi.ts](src/data/guardianMessagingApi.ts) - In-memory mock
- [src/data/teacherMessagingApi.ts](src/data/teacherMessagingApi.ts) - In-memory mock

This allows the app to run in development without Supabase credentials.

---

## Conclusion

**Current State:** Hybrid architecture with **RLS designed but not enforced**

**Security Posture:** 🟡 **Acceptable for development, NOT production-ready**

**Next Steps:**
1. Enable RLS on Supabase tables
2. Implement RLS policies
3. Add comprehensive access control middleware
4. Implement full audit logging
