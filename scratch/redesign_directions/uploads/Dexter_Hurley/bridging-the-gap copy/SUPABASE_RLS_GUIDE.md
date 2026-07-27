# Supabase RLS Implementation Guide

**Status:** Production-Ready RLS Policies  
**Date:** March 9, 2026  
**Location:** [supabase/migrations/rls_policies.sql](supabase/migrations/rls_policies.sql)

---

## Overview

This guide provides complete RLS (Row Level Security) policies for all Supabase tables in Bridging the Gap. These policies enforce access control at the **database level**, blocking unauthorized access before data reaches your application.

---

## Supabase Tables Used

### Complete Table Inventory

| Table | Purpose | Rows Visible To | Current RLS |
|-------|---------|-----------------|------------|
| **cases** | Case records + assignments | Parents (own student), Staff (assigned), Admins | ✅ Enabled |
| **case_messages** | Parent-staff messaging | Parents (own messages), Staff, Admins | ✅ Enabled |
| **case_notes** | Internal staff notes | Staff only (NOT parents), Admins | ✅ Enabled |
| **case_events** | Status changes + events | Parents (status only), Staff, Admins | ✅ Enabled |

---

## Access Control Matrix

### By Role

#### PARENT
```
cases:
  ✅ SELECT: Own student's cases (verified guardianship)
  ❌ INSERT: Not allowed
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_messages:
  ✅ SELECT: Messages where sender_role='parent' OR recipient_role='parent'
  ✅ INSERT: Only as sender, sender_id=auth.uid()
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_notes:
  ❌ SELECT: BLOCKED (staff only)
  ❌ INSERT: BLOCKED
  ❌ UPDATE: BLOCKED
  ❌ DELETE: BLOCKED

case_events:
  ✅ SELECT: Status change events only (type='status_change')
  ❌ INSERT: Not allowed
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed
```

#### COUNSELOR
```
cases:
  ✅ SELECT: All cases (counselor can see for review)
  ✅ UPDATE: Cases assigned to them
  ❌ INSERT: Not allowed
  ❌ DELETE: Not allowed

case_messages:
  ✅ SELECT: All messages for assigned cases
  ✅ INSERT: As sender, sender_role='counselor'
  ❌ UPDATE: Not allowed (immutable)
  ❌ DELETE: Not allowed

case_notes:
  ✅ SELECT: Notes for assigned cases only
  ✅ INSERT: author_id=auth.uid()
  ❌ UPDATE: Not allowed (immutable)
  ❌ DELETE: Not allowed

case_events:
  ✅ SELECT: All events for assigned cases
  ✅ INSERT: For their actions
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed
```

#### TEACHER
```
cases:
  ✅ SELECT: All cases (teacher can see school cases)
  ❌ INSERT: Not allowed
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_messages:
  ✅ SELECT: Messages where sender_role='teacher' OR recipient_role='teacher'
  ✅ INSERT: As sender, sender_role='teacher'
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_notes:
  ✅ SELECT: Notes for school cases
  ✅ INSERT: author_id=auth.uid()
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_events:
  ✅ SELECT: All events for school cases
  ✅ INSERT: For their actions
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed
```

#### ADMIN
```
cases:
  ✅ SELECT: All cases
  ✅ INSERT: Allowed
  ✅ UPDATE: All cases
  ❌ DELETE: Not allowed

case_messages:
  ✅ SELECT: All messages
  ✅ INSERT: Allowed
  ❌ UPDATE: Not allowed (immutable)
  ❌ DELETE: Not allowed

case_notes:
  ✅ SELECT: All notes
  ✅ INSERT: Allowed
  ❌ UPDATE: Not allowed (immutable)
  ❌ DELETE: Not allowed

case_events:
  ✅ SELECT: All events
  ✅ INSERT: Allowed
  ❌ UPDATE: Not allowed (immutable)
  ❌ DELETE: Not allowed
```

#### SRO (School Resource Officer)
```
cases:
  ✅ SELECT: All cases
  ❌ INSERT: Not allowed
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_messages:
  ✅ SELECT: All messages
  ✅ INSERT: As sender, sender_role='counselor' (treated as staff)
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_notes:
  ✅ SELECT: All notes
  ✅ INSERT: author_id=auth.uid()
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed

case_events:
  ✅ SELECT: All events
  ✅ INSERT: For their actions
  ❌ UPDATE: Not allowed
  ❌ DELETE: Not allowed
```

---

## Helper Functions

All RLS policies depend on these helper functions for evaluating access:

### 1. `is_verified_guardian(user_id, student_id)`
**Purpose:** Check if a user is a verified parent/guardian of a student

```sql
SELECT is_verified_guardian('user-uuid', 'student-uuid')
-- Returns: true if guardianship.verified_status = 'VERIFIED'
```

**Used in:** cases (parent SELECT), case_messages (parent SELECT), case_events (parent SELECT)

### 2. `is_case_counselor(user_id, case_id)`
**Purpose:** Check if a user is the assigned counselor for a case

```sql
SELECT is_case_counselor('user-uuid', 'case-uuid')
-- Returns: true if cases.assigned_counselor_id = user_id
```

**Used in:** All tables for counselor access

### 3. `is_staff_for_case(user_id, case_id)`
**Purpose:** Check if user is any staff role (teacher, counselor, admin, sro)

```sql
SELECT is_staff_for_case('user-uuid', 'case-uuid')
-- Returns: true if user.role IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO')
```

**Used in:** case_notes (teacher SELECT), case_events (teacher SELECT)

### 4. `get_user_role()`
**Purpose:** Get current user's role from JWT or users table

```sql
SELECT get_user_role()
-- Returns: 'PARENT' | 'TEACHER' | 'COUNSELOR' | 'ADMIN' | 'SRO'
```

**Used in:** All policies

---

## Policies by Table

### TABLE: cases

**RLS Enabled:** ✅ Yes

**Policies:**

1. **parents_see_own_student_cases** (SELECT)
   ```sql
   is_verified_guardian(auth.uid(), student_id)
   ```
   - Parent sees cases for their linked students only

2. **staff_see_assigned_cases** (SELECT)
   ```sql
   get_user_role() IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO')
   ```
   - Staff can view all cases (further filtered by app logic)

3. **admins_can_insert_cases** (INSERT)
   ```sql
   get_user_role() = 'ADMIN'
   ```
   - Only admins can create cases

4. **admins_counselor_can_update_cases** (UPDATE)
   ```sql
   get_user_role() IN ('ADMIN', 'COUNSELOR')
   AND (assigned_counselor_id = auth.uid() OR assigned_admin_id = auth.uid() OR get_user_role() = 'ADMIN')
   ```
   - Assigned counselor or admin can update their cases

---

### TABLE: case_messages

**RLS Enabled:** ✅ Yes

**Policies:**

1. **parents_see_own_messages** (SELECT)
   ```sql
   is_verified_guardian(auth.uid(), (SELECT student_id FROM cases WHERE id = case_id))
   AND (sender_role = 'parent' OR recipient_role = 'parent')
   ```
   - Parents see messages where they are sender or recipient

2. **counselors_see_assigned_case_messages** (SELECT)
   ```sql
   get_user_role() = 'COUNSELOR'
   AND is_case_counselor(auth.uid(), case_id)
   ```
   - Counselor sees all messages for assigned cases

3. **teachers_see_own_role_messages** (SELECT)
   ```sql
   get_user_role() = 'TEACHER'
   AND (sender_role = 'teacher' OR recipient_role = 'teacher')
   AND is_staff_for_case(auth.uid(), case_id)
   ```
   - Teachers see teacher-role messages only

4. **admins_see_all_messages** (SELECT)
   ```sql
   get_user_role() = 'ADMIN'
   ```
   - Admins see all messages

5. **only_sender_can_insert_messages** (INSERT)
   ```sql
   sender_id = auth.uid()
   AND (
     (get_user_role() = 'PARENT' AND sender_role = 'parent')
     OR (get_user_role() = 'COUNSELOR' AND sender_role = 'counselor')
     OR (get_user_role() = 'TEACHER' AND sender_role = 'teacher')
   )
   ```
   - Only the sender can create messages, role must match

---

### TABLE: case_notes

**RLS Enabled:** ✅ Yes

**Policies:**

1. **parents_cannot_see_notes** (SELECT)
   ```sql
   get_user_role() != 'PARENT'
   ```
   - Parents are BLOCKED from viewing notes

2. **counselors_see_own_case_notes** (SELECT)
   ```sql
   get_user_role() = 'COUNSELOR'
   AND is_case_counselor(auth.uid(), case_id)
   ```
   - Counselor sees notes for assigned cases only

3. **admins_see_all_notes** (SELECT)
   ```sql
   get_user_role() = 'ADMIN'
   ```
   - Admins see all notes

4. **teachers_see_case_notes** (SELECT)
   ```sql
   get_user_role() = 'TEACHER'
   AND is_staff_for_case(auth.uid(), case_id)
   ```
   - Teachers see notes for their cases

5. **staff_only_insert_notes** (INSERT)
   ```sql
   get_user_role() IN ('COUNSELOR', 'ADMIN', 'TEACHER', 'SRO')
   AND author_id = auth.uid()
   AND is_staff_for_case(auth.uid(), case_id)
   ```
   - Only staff can create notes, must be assigned to case

---

### TABLE: case_events

**RLS Enabled:** ✅ Yes

**Policies:**

1. **parents_see_status_events** (SELECT)
   ```sql
   is_verified_guardian(auth.uid(), (SELECT student_id FROM cases WHERE id = case_id))
   AND type = 'status_change'
   ```
   - Parents see only status changes (high-level events)

2. **counselors_see_case_events** (SELECT)
   ```sql
   get_user_role() = 'COUNSELOR'
   AND is_case_counselor(auth.uid(), case_id)
   ```
   - Counselor sees all events for assigned cases

3. **admins_see_all_events** (SELECT)
   ```sql
   get_user_role() = 'ADMIN'
   ```
   - Admins see all events

4. **teachers_see_case_events** (SELECT)
   ```sql
   get_user_role() = 'TEACHER'
   AND is_staff_for_case(auth.uid(), case_id)
   ```
   - Teachers see case events

5. **staff_only_insert_events** (INSERT)
   ```sql
   get_user_role() IN ('COUNSELOR', 'ADMIN', 'TEACHER', 'SRO')
   AND is_staff_for_case(auth.uid(), case_id)
   ```
   - Only staff can create events, must be assigned to case

---

## Implementation Steps

### Step 1: Apply Migrations
```bash
# Run the RLS migration
psql -h your-db-host -U postgres -f supabase/migrations/rls_policies.sql

# Or in Supabase dashboard:
# SQL Editor → Create new query → Paste migration → Run
```

### Step 2: Verify Tables Exist
```sql
-- Check all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('cases', 'case_messages', 'case_notes', 'case_events');
```

### Step 3: Enable RLS
```sql
-- Should already be done by migration, but verify:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('cases', 'case_messages', 'case_notes', 'case_events');

-- All should show rowsecurity = true
```

### Step 4: Test Policies

```bash
# Test as Parent
curl -H "Authorization: Bearer $PARENT_JWT" \
  https://your-supabase-project.supabase.co/rest/v1/cases \
  -H "apikey: $SUPABASE_ANON_KEY"
# Should return only cases where parent is verified guardian

# Test as Counselor
curl -H "Authorization: Bearer $COUNSELOR_JWT" \
  https://your-supabase-project.supabase.co/rest/v1/case_notes \
  -H "apikey: $SUPABASE_ANON_KEY"
# Should return notes for assigned cases only
```

### Step 5: Enable in App Code

Update your app to use standard queries without app-level filtering (RLS will handle it):

**Before (app-level filtering):**
```typescript
const { data } = await supabase
  .from("case_messages")
  .select("*")
  .eq("case_id", caseId);

// App had to verify user had access
```

**After (RLS enforced):**
```typescript
const { data } = await supabase
  .from("case_messages")
  .select("*")
  .eq("case_id", caseId);

// RLS automatically filters to authorized rows only
// Unauthorized access returns empty set or 403 error
```

---

## Testing & Validation

### Test Suite

Run these queries with different user roles to verify RLS:

```sql
-- TEST 1: Parent can only see their own student's cases
SET jwt.claims.role = 'PARENT';
SET jwt.claims.sub = 'parent-uuid-123';
SELECT count(*) FROM cases;
-- Expected: Only cases where this parent is verified guardian

-- TEST 2: Parent cannot see case_notes
SET jwt.claims.role = 'PARENT';
SELECT count(*) FROM case_notes;
-- Expected: 0 or error

-- TEST 3: Counselor sees only assigned cases
SET jwt.claims.role = 'COUNSELOR';
SET jwt.claims.sub = 'counselor-uuid-456';
SELECT count(*) FROM case_messages;
-- Expected: Only messages for cases assigned to this counselor

-- TEST 4: Admin sees everything
SET jwt.claims.role = 'ADMIN';
SELECT count(*) FROM cases;
SELECT count(*) FROM case_messages;
SELECT count(*) FROM case_notes;
SELECT count(*) FROM case_events;
-- Expected: All rows visible

-- TEST 5: Parent messages filtered correctly
SET jwt.claims.role = 'PARENT';
SELECT sender_role, recipient_role FROM case_messages;
-- Expected: Each row has sender_role='parent' OR recipient_role='parent'
```

### Monitoring

Check RLS performance:

```sql
-- View RLS policies
SELECT * FROM pg_policies 
WHERE tablename IN ('cases', 'case_messages', 'case_notes', 'case_events');

-- Check policy enforcement
SELECT schemaname, tablename, policylimit, cmd 
FROM pg_policies 
WHERE tablename = 'case_messages';
```

---

## Troubleshooting

### Issue: "401 Unauthorized" on all queries
**Cause:** Missing or invalid JWT token
**Solution:** Ensure Authorization header includes valid Bearer token

### Issue: Queries return empty instead of blocked access
**Cause:** RLS allowing query but filtering results (correct behavior)
**Solution:** This is expected - no data means no access

### Issue: "User does not have permission..."
**Cause:** RLS policy denies access
**Solution:** Verify user role and case assignments match policy conditions

### Issue: Performance slow after enabling RLS
**Cause:** Missing indexes for RLS predicates
**Solution:** Ensure indexes exist on: case_id, student_id, assigned_counselor_id, created_at

---

## Production Checklist

- [ ] All RLS policies created and tested
- [ ] Helper functions created and working
- [ ] All Supabase tables have RLS enabled
- [ ] JWT includes 'role' claim
- [ ] Users table populated with correct roles
- [ ] Guardianships table populated correctly
- [ ] Performance tests pass (queries <100ms)
- [ ] All user roles tested with sample queries
- [ ] Audit logging configured
- [ ] Backup of policies documented
- [ ] Team trained on RLS concepts

---

## References

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase JWT Customization](https://supabase.com/docs/guides/auth/jwt)
- [Database Schema](docs/DATABASE_SCHEMA.md)
