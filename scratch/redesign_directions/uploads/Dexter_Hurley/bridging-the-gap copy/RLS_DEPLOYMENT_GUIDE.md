# RLS Deployment Commands

Quick reference for applying RLS policies to Supabase.

---

## Option 1: Via Supabase CLI (Recommended)

```bash
# 1. Initialize Supabase in your project (if not already done)
supabase init

# 2. Create migration file
supabase migration new create_rls_policies

# 3. Copy the SQL from supabase/migrations/rls_policies.sql into the new migration

# 4. Deploy to development
supabase db push

# 5. Deploy to staging (if applicable)
supabase db push --remote staging

# 6. Deploy to production
supabase db push --remote production
```

---

## Option 2: Via Supabase Dashboard SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Paste the entire contents of `supabase/migrations/rls_policies.sql`
6. Click **Run**
7. Verify: Check that all tables show "RLS enabled"

---

## Option 3: Via psql (Direct Database)

```bash
# Get your database connection string
# From Supabase Dashboard → Settings → Database → Connection string

export DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"

# Apply migration
psql "$DATABASE_URL" -f supabase/migrations/rls_policies.sql

# Verify RLS is enabled
psql "$DATABASE_URL" -c \
  "SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname='public' AND tablename IN 
   ('cases', 'case_messages', 'case_notes', 'case_events');"

# Expected output:
# tablename     | rowsecurity
# --------------|-------------
# cases         | t
# case_messages | t
# case_notes    | t
# case_events   | t
```

---

## Verification Commands

After applying the migration, run these to verify:

### 1. Check all helper functions exist
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_verified_guardian',
    'is_case_counselor',
    'is_staff_for_case',
    'get_user_role',
    'get_user_email'
  )
ORDER BY routine_name;

-- Expected: 5 rows (all functions present)
```

### 2. Check all tables have RLS enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('cases', 'case_messages', 'case_notes', 'case_events')
ORDER BY tablename;

-- Expected:
-- tablename     | rowsecurity
-- --------------|-------------
-- case_events   | t
-- case_messages | t
-- case_notes    | t
-- cases         | t
```

### 3. Count policies per table
```sql
SELECT tablename, count(*) as policy_count
FROM pg_policies
WHERE tablename IN ('cases', 'case_messages', 'case_notes', 'case_events')
GROUP BY tablename
ORDER BY tablename;

-- Expected minimum:
-- tablename     | policy_count
-- --------------|-------------
-- case_events   | 5
-- case_messages | 5
-- case_notes    | 5
-- cases         | 4
```

### 4. List all policies by table
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('cases', 'case_messages', 'case_notes', 'case_events')
ORDER BY tablename, policyname;
```

### 5. Check indexes for performance
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('cases', 'case_messages', 'case_notes', 'case_events')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Testing RLS Policies

### Test 1: Parent Access Control

```bash
# Get a parent's JWT token (from auth.users)
export PARENT_JWT="your-parent-jwt-token-here"

# Try to access cases - should only see own student's cases
curl -X GET \
  "https://your-project.supabase.co/rest/v1/cases" \
  -H "Authorization: Bearer $PARENT_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Expected: Only cases where parent is verified guardian

# Try to access case_notes - should get empty or error
curl -X GET \
  "https://your-project.supabase.co/rest/v1/case_notes" \
  -H "Authorization: Bearer $PARENT_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Expected: Empty result []
```

### Test 2: Counselor Access Control

```bash
export COUNSELOR_JWT="your-counselor-jwt-token-here"

# Try to access case_notes - should see notes for assigned cases
curl -X GET \
  "https://your-project.supabase.co/rest/v1/case_notes" \
  -H "Authorization: Bearer $COUNSELOR_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Expected: Notes for cases assigned to this counselor
```

### Test 3: Impersonation Prevention

```bash
export PARENT_JWT="parent-token"

# Try to insert message as counselor (should fail)
curl -X POST \
  "https://your-project.supabase.co/rest/v1/case_messages" \
  -H "Authorization: Bearer $PARENT_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "case-uuid",
    "sender_id": "parent-uuid",
    "sender_role": "counselor",
    "recipient_role": "parent",
    "body": "Fake message"
  }'

# Expected: 403 Forbidden (RLS policy rejects - role mismatch)
```

### Test 4: Admin Bypass

```bash
export SERVICE_ROLE_KEY="your-service-role-key"

# Admin/service role can see everything
curl -X GET \
  "https://your-project.supabase.co/rest/v1/case_notes" \
  -H "apikey: $SERVICE_ROLE_KEY"

# Expected: All notes visible
```

---

## Rollback Procedure

If something goes wrong, rollback the policies:

```bash
# Option 1: Via CLI (if using migrations)
supabase migration list
supabase migration rollback

# Option 2: Manual SQL - drop all policies
DROP POLICY IF EXISTS "parents_see_own_student_cases" ON cases;
DROP POLICY IF EXISTS "staff_see_assigned_cases" ON cases;
DROP POLICY IF EXISTS "admins_can_insert_cases" ON cases;
DROP POLICY IF EXISTS "admins_counselor_can_update_cases" ON cases;

DROP POLICY IF EXISTS "parents_see_own_messages" ON case_messages;
DROP POLICY IF EXISTS "counselors_see_assigned_case_messages" ON case_messages;
DROP POLICY IF EXISTS "teachers_see_own_role_messages" ON case_messages;
DROP POLICY IF EXISTS "admins_see_all_messages" ON case_messages;
DROP POLICY IF EXISTS "only_sender_can_insert_messages" ON case_messages;

DROP POLICY IF EXISTS "parents_cannot_see_notes" ON case_notes;
DROP POLICY IF EXISTS "counselors_see_own_case_notes" ON case_notes;
DROP POLICY IF EXISTS "admins_see_all_notes" ON case_notes;
DROP POLICY IF EXISTS "teachers_see_case_notes" ON case_notes;
DROP POLICY IF EXISTS "staff_only_insert_notes" ON case_notes;

DROP POLICY IF EXISTS "parents_see_status_events" ON case_events;
DROP POLICY IF EXISTS "counselors_see_case_events" ON case_events;
DROP POLICY IF EXISTS "admins_see_all_events" ON case_events;
DROP POLICY IF EXISTS "teachers_see_case_events" ON case_events;
DROP POLICY IF EXISTS "staff_only_insert_events" ON case_events;

-- Then disable RLS if needed
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_events DISABLE ROW LEVEL SECURITY;
```

---

## Troubleshooting

### Issue: "permission denied for schema public"
**Cause:** User doesn't have sufficient privileges
**Solution:** Use Supabase dashboard SQL editor or ensure psql user has schema privileges

### Issue: "relation does not exist"
**Cause:** Tables don't exist yet
**Solution:** Create tables first before applying RLS policies

### Issue: "function does not exist"
**Cause:** Helper functions weren't created
**Solution:** Ensure the function creation statements ran successfully

### Issue: "RLS policy rejects" on legitimate queries
**Cause:** Policy logic error
**Solution:** Check:
1. User's JWT claims contain correct role
2. User table has correct role value
3. Guardianships table populated correctly
4. Case assignments correct

### Issue: Queries slow after enabling RLS
**Cause:** Missing indexes on RLS predicates
**Solution:** Run the index creation statements from the migration

---

## Production Deployment Steps

```bash
# 1. Test in staging first
supabase db push --remote staging

# 2. Run smoke tests
npm test -- --grep "RLS"

# 3. Schedule maintenance window (if needed)
# RLS shouldn't cause downtime, but best to verify

# 4. Deploy to production
supabase db push --remote production

# 5. Monitor application logs
# Check for any access denied errors

# 6. Run verification queries
psql "$PROD_DATABASE_URL" < verification_queries.sql

# 7. Update documentation
# Ensure team knows RLS is now enforced

# 8. Plan app code changes
# Remove app-level filtering once RLS is stable
```

---

## Performance Tuning

After deployment, optimize performance:

```sql
-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM case_messages
WHERE case_id = '...'
ORDER BY created_at DESC;

-- Rebuild statistics if needed
ANALYZE cases;
ANALYZE case_messages;
ANALYZE case_notes;
ANALYZE case_events;

-- Check for slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%case_%'
ORDER BY mean_exec_time DESC;
```

---

## Monitoring & Alerts

Set up monitoring for RLS:

```sql
-- Query to monitor policy rejections
-- (Note: Not directly exposed by PostgreSQL, must monitor via app logs)

-- Instead, monitor these metrics:
-- 1. Query response times (should be <100ms)
-- 2. Authorization errors (401/403) in app logs
-- 3. Policy execution in pg logs (if configured)

-- View slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%case%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## References

- **RLS Migration SQL:** [supabase/migrations/rls_policies.sql](supabase/migrations/rls_policies.sql)
- **Implementation Guide:** [SUPABASE_RLS_GUIDE.md](SUPABASE_RLS_GUIDE.md)
- **Tables Reference:** [SUPABASE_TABLES_REFERENCE.md](SUPABASE_TABLES_REFERENCE.md)
- **Official Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS Docs:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
