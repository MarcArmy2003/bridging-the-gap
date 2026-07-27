# Supabase Tables & RLS Quick Reference

**All tables used via `supabase.from()` in this application**

---

## Table Inventory

### 1. cases
**Purpose:** Case records with student, status, and staff assignments  
**Schema:**
```typescript
cases {
  id: UUID                    // Primary key
  public_id?: string          // Human-readable ID
  student_id: UUID            // Student this case is about
  title?: string              // Case title
  status: string              // RECEIVED|UNDER_REVIEW|INFO_REQUESTED|MEETING_SCHEDULED|INTERVENTION_ACTIVE|CLOSED
  created_at: TIMESTAMPTZ
  updated_at?: TIMESTAMPTZ
  support_plan_type?: string
  support_plan_updated_at?: TIMESTAMPTZ
  support_plan_owner_name?: string
  assigned_counselor_id?: UUID
  assigned_admin_id?: UUID
}
```

**RLS Policies:**
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Parent | ✅ Own student | ❌ | ❌ | ❌ |
| Counselor | ✅ All | ❌ | ✅ Assigned | ❌ |
| Teacher | ✅ All | ❌ | ❌ | ❌ |
| Admin | ✅ All | ✅ | ✅ | ❌ |
| SRO | ✅ All | ❌ | ❌ | ❌ |

**Key Indexes:**
```sql
CREATE INDEX idx_cases_student_id ON cases(student_id);
CREATE INDEX idx_cases_assigned_counselor ON cases(assigned_counselor_id);
CREATE INDEX idx_cases_public_id ON cases(public_id);
```

**Code Usage:**
```typescript
// From src/services/cases.ts
supabase.from("cases").select("*").eq("public_id", id).single()
supabase.from("cases").select("*").eq("id", id).single()
supabase.from("cases").update({...}).eq("id", id)
```

---

### 2. case_messages
**Purpose:** Real-time parent-staff messaging  
**Schema:**
```typescript
case_messages {
  id: UUID                    // Primary key
  case_id: UUID               // Foreign key → cases(id)
  sender_id: UUID             // Who sent it
  sender_role: string         // 'parent'|'counselor'|'teacher'
  recipient_role: string      // 'parent'|'counselor'|'teacher'
  body: string                // Message content
  created_at: TIMESTAMPTZ     // Immutable
}
```

**RLS Policies:**
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Parent | ✅ Own + role match | ✅ Self | ❌ | ❌ |
| Counselor | ✅ Assigned cases | ✅ Self | ❌ | ❌ |
| Teacher | ✅ Role match | ✅ Self | ❌ | ❌ |
| Admin | ✅ All | ✅ | ❌ | ❌ |
| SRO | ✅ All | ✅ | ❌ | ❌ |

**Key Indexes:**
```sql
CREATE INDEX idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX idx_case_messages_created_at ON case_messages(created_at DESC);
CREATE INDEX idx_case_messages_sender_id ON case_messages(sender_id);
```

**Code Usage:**
```typescript
// From src/data/messagingApi.ts
supabase.from("case_messages")
  .select("*")
  .eq("case_id", caseId)
  .order("created_at", { ascending: true })

supabase.from("case_messages")
  .insert([{ case_id, sender_id, sender_role, recipient_role, body }])
  .select()
  .single()
```

---

### 3. case_notes
**Purpose:** Internal staff-only notes (NOT visible to parents)  
**Schema:**
```typescript
case_notes {
  id: UUID                    // Primary key
  case_id: UUID               // Foreign key → cases(id)
  author_id: UUID             // Staff member who wrote note
  content: string             // Note text
  created_at: TIMESTAMPTZ     // Immutable
}
```

**RLS Policies:**
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Parent | ❌ BLOCKED | ❌ BLOCKED | ❌ | ❌ |
| Counselor | ✅ Assigned | ✅ Self | ❌ | ❌ |
| Teacher | ✅ Cases | ✅ Self | ❌ | ❌ |
| Admin | ✅ All | ✅ | ❌ | ❌ |
| SRO | ✅ All | ✅ Self | ❌ | ❌ |

**Key Indexes:**
```sql
CREATE INDEX idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX idx_case_notes_author_id ON case_notes(author_id);
CREATE INDEX idx_case_notes_created_at ON case_notes(created_at DESC);
```

**Code Usage:**
```typescript
// From src/services/cases.ts
supabase.from("case_notes")
  .insert({ case_id, author_id, content })
  .select()
  .single()

supabase.from("case_notes")
  .select("*")
  .eq("case_id", caseId)
  .order("created_at", { ascending: false })
```

---

### 4. case_events
**Purpose:** Immutable event log (status changes, note additions)  
**Schema:**
```typescript
case_events {
  id: UUID                    // Primary key
  case_id: UUID               // Foreign key → cases(id)
  type: string                // 'status_change'|'note_added'
  actor_name: string          // Who triggered event
  from_status?: string        // Previous status (if status_change)
  to_status?: string          // New status (if status_change)
  note_preview?: string       // First 80 chars (if note_added)
  created_at: TIMESTAMPTZ     // Immutable
}
```

**RLS Policies:**
| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Parent | ✅ Status only | ❌ | ❌ | ❌ |
| Counselor | ✅ Assigned | ✅ | ❌ | ❌ |
| Teacher | ✅ Cases | ✅ | ❌ | ❌ |
| Admin | ✅ All | ✅ | ❌ | ❌ |
| SRO | ✅ All | ✅ | ❌ | ❌ |

**Key Indexes:**
```sql
CREATE INDEX idx_case_events_case_id ON case_events(case_id);
CREATE INDEX idx_case_events_created_at ON case_events(created_at DESC);
CREATE INDEX idx_case_events_type ON case_events(type);
```

**Code Usage:**
```typescript
// From src/services/cases.ts
supabase.from("case_events")
  .insert({
    case_id,
    type: "status_change",
    actor_name,
    from_status,
    to_status
  })

supabase.from("case_events")
  .select("*")
  .eq("case_id", caseId)
  .order("created_at", { ascending: false })
```

---

## RLS Helper Functions

All policies use these functions:

```sql
-- Check if user is verified guardian of student
is_verified_guardian(user_id UUID, student_id_param UUID) → BOOLEAN
├─ Looks up guardianships table
├─ Requires verified_status = 'VERIFIED'
└─ Used by: cases (parent), case_messages (parent), case_events (parent)

-- Check if user is assigned counselor to case
is_case_counselor(user_id UUID, case_id_param UUID) → BOOLEAN
├─ Looks up cases.assigned_counselor_id
└─ Used by: case_messages (counselor), case_notes (counselor), case_events (counselor)

-- Check if user is staff (any non-parent role)
is_staff_for_case(user_id UUID, case_id_param UUID) → BOOLEAN
├─ Checks user.role IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO')
└─ Used by: case_notes (teacher), case_events (teacher)

-- Get current user's role
get_user_role() → TEXT
├─ First tries JWT claims
├─ Falls back to users table
└─ Used by: All policies
```

---

## Access Control Examples

### Scenario 1: Parent Views Their Child's Case
```typescript
// User: parent-123, Student: student-456

const cases = await supabase
  .from("cases")
  .select("*");

// RLS filters to: WHERE is_verified_guardian(auth.uid(), student_id)
// Result: Only cases where parent-123 is verified guardian of student_id
```

### Scenario 2: Parent Views Messages
```typescript
// User: parent-123, Case: case-789

const messages = await supabase
  .from("case_messages")
  .select("*")
  .eq("case_id", "case-789");

// RLS filters to: WHERE
//   is_verified_guardian(auth.uid(), (SELECT student_id FROM cases WHERE id = case_id))
//   AND (sender_role = 'parent' OR recipient_role = 'parent')
// Result: Messages where parent is sender or recipient ONLY
```

### Scenario 3: Parent Tries to View Notes
```typescript
// User: parent-123

const notes = await supabase
  .from("case_notes")
  .select("*");

// RLS filters to: WHERE get_user_role() != 'PARENT'
// Result: Empty set (parent role = 'PARENT', so excluded)
// No error thrown - just zero rows
```

### Scenario 4: Counselor Views Assigned Cases
```typescript
// User: counselor-456, Assigned to: case-789

const cases = await supabase
  .from("cases")
  .select("*");

// RLS filters to: WHERE get_user_role() IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO')
// Result: All cases visible at this level (further app logic may filter by assignment)
```

### Scenario 5: Counselor Inserts Message
```typescript
// User: counselor-456, sender_role: 'counselor'

const message = await supabase
  .from("case_messages")
  .insert({
    case_id: "case-789",
    sender_id: "counselor-456",
    sender_role: "counselor",
    recipient_role: "parent",
    body: "Status update..."
  })
  .select()
  .single();

// RLS checks: WHERE
//   sender_id = auth.uid()
//   AND (get_user_role() = 'COUNSELOR' AND sender_role = 'counselor')
// Result: INSERT allowed ✅
```

### Scenario 6: Impersonation Attempt (Fails)
```typescript
// User: parent-123, Trying to insert as counselor

const message = await supabase
  .from("case_messages")
  .insert({
    case_id: "case-789",
    sender_id: "parent-123",      // Their actual ID
    sender_role: "counselor",     // Claim to be counselor
    recipient_role: "parent",
    body: "Fake staff message"
  })
  .select()
  .single();

// RLS checks: WHERE
//   sender_id = auth.uid() ✅ (matches 'parent-123')
//   AND (get_user_role() = 'COUNSELOR' AND sender_role = 'counselor') ❌ FAILS
//   (user role is 'PARENT', not 'COUNSELOR')
// Result: INSERT BLOCKED 🔒
```

---

## Security Properties

### Database-Level Enforcement
- ✅ Access control happens at PostgreSQL level
- ✅ Cannot bypass with SQL queries
- ✅ Anonymous key can only access allowed rows
- ✅ Service role key bypasses RLS (backend admin only)

### Defense in Depth
- ✅ RLS at database
- ✅ Application-level validation
- ✅ JWT authentication
- ✅ Audit logging

### Performance
- ✅ Indexes created for RLS predicates
- ✅ Minimal overhead (~1-5ms per query)
- ✅ Queries cache policy execution

---

## Implementation Timeline

1. **Phase 1 (This Sprint):** Deploy RLS policies
2. **Phase 2 (Next Sprint):** Test with real data
3. **Phase 3 (Following Sprint):** Remove app-level filtering
4. **Phase 4 (Ongoing):** Monitor and optimize

---

## Deployment Checklist

```bash
# 1. Review migration
cat supabase/migrations/rls_policies.sql

# 2. Deploy to staging
supabase db push --remote staging

# 3. Test with sample data
psql -h staging-db-host -U postgres -c "SELECT * FROM cases LIMIT 5;"

# 4. Run test suite
npm test -- --grep "RLS"

# 5. Deploy to production
supabase db push --remote production

# 6. Monitor logs
tail -f /var/log/postgresql/postgresql.log | grep "policy"

# 7. Verify all tables have RLS enabled
psql -h prod-db-host -U postgres -c \
  "SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname='public' AND tablename IN 
   ('cases', 'case_messages', 'case_notes', 'case_events');"
```

---

## References

- **Complete RLS Policies:** [supabase/migrations/rls_policies.sql](supabase/migrations/rls_policies.sql)
- **Implementation Guide:** [SUPABASE_RLS_GUIDE.md](SUPABASE_RLS_GUIDE.md)
- **Database Schema:** [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- **Entities Mapping:** [DATABASE_ENTITIES_MAPPING.md](DATABASE_ENTITIES_MAPPING.md)
- **Message Schema:** [docs/SUPABASE_MESSAGING_SCHEMA.md](docs/SUPABASE_MESSAGING_SCHEMA.md)
