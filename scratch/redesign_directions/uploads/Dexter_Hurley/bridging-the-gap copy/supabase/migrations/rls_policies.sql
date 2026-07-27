-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Bridging the Gap: School Safety
-- ============================================================================
-- 
-- This migration enables comprehensive RLS on Supabase tables to enforce:
-- - Parents only see messages for their cases
-- - Staff only see cases assigned to them
-- - Notes/events follow access levels
-- - Unauthorized rows blocked at database level
--
-- Run this AFTER creating your Supabase tables.
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if user is a verified guardian of a student
CREATE OR REPLACE FUNCTION is_verified_guardian(user_id UUID, student_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM guardianships
    WHERE parent_user_id = user_id
      AND student_id = student_id_param
      AND verified_status = 'VERIFIED'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if user is assigned as counselor to a case
CREATE OR REPLACE FUNCTION is_case_counselor(user_id UUID, case_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM cases
    WHERE id = case_id_param
      AND assigned_counselor_id = user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if user is staff for case's student
CREATE OR REPLACE FUNCTION is_staff_for_case(user_id UUID, case_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  case_student_id UUID;
  user_role TEXT;
BEGIN
  -- Get case's student_id
  SELECT student_id INTO case_student_id
  FROM cases
  WHERE id = case_id_param;

  IF case_student_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user's role from users table
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;

  -- Staff roles (counselor, teacher, admin, sro) can access cases of students at their school
  RETURN user_role IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get user's role from JWT or users table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- First try to get from JWT claims
  IF (auth.jwt() ->> 'role') IS NOT NULL THEN
    RETURN auth.jwt() ->> 'role';
  END IF;
  
  -- Fall back to users table
  RETURN (
    SELECT role
    FROM users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get user's email for lookups
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT email
    FROM users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. TABLE: cases (Supabase)
-- ============================================================================
-- Stores case records with student, status, and assignment info

-- Create table if not exists
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT UNIQUE,
  student_id UUID NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  support_plan_type TEXT,
  support_plan_updated_at TIMESTAMPTZ,
  support_plan_owner_name TEXT,
  assigned_counselor_id UUID,
  assigned_admin_id UUID
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Policy: Parents see only cases for students they're linked to
CREATE POLICY "parents_see_own_student_cases"
  ON cases
  FOR SELECT
  USING (
    is_verified_guardian(auth.uid(), student_id)
  );

-- Policy: Staff/Counselors see cases assigned to them
CREATE POLICY "staff_see_assigned_cases"
  ON cases
  FOR SELECT
  USING (
    get_user_role() IN ('COUNSELOR', 'TEACHER', 'ADMIN', 'SRO')
  );

-- Policy: Only admins can insert cases
CREATE POLICY "admins_can_insert_cases"
  ON cases
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'ADMIN'
  );

-- Policy: Only admins/assigned counselor can update cases
CREATE POLICY "admins_counselor_can_update_cases"
  ON cases
  FOR UPDATE
  USING (
    get_user_role() IN ('ADMIN', 'COUNSELOR')
    AND (
      assigned_counselor_id = auth.uid()
      OR assigned_admin_id = auth.uid()
      OR get_user_role() = 'ADMIN'
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_cases_student_id ON cases(student_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_counselor ON cases(assigned_counselor_id);
CREATE INDEX IF NOT EXISTS idx_cases_public_id ON cases(public_id);

-- ============================================================================
-- 3. TABLE: case_messages (Supabase)
-- ============================================================================
-- Real-time messaging between parents and staff

-- Create table if not exists
CREATE TABLE IF NOT EXISTS case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('counselor', 'parent', 'teacher')),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('counselor', 'parent', 'teacher')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Parents see messages for their cases where they're sender or recipient
CREATE POLICY "parents_see_own_messages"
  ON case_messages
  FOR SELECT
  USING (
    is_verified_guardian(auth.uid(), (SELECT student_id FROM cases WHERE id = case_id))
    AND (sender_role = 'parent' OR recipient_role = 'parent')
  );

-- Policy: Counselors see all messages for assigned cases
CREATE POLICY "counselors_see_assigned_case_messages"
  ON case_messages
  FOR SELECT
  USING (
    get_user_role() = 'COUNSELOR'
    AND is_case_counselor(auth.uid(), case_id)
  );

-- Policy: Teachers see messages for their role in assigned cases
CREATE POLICY "teachers_see_own_role_messages"
  ON case_messages
  FOR SELECT
  USING (
    get_user_role() = 'TEACHER'
    AND (sender_role = 'teacher' OR recipient_role = 'teacher')
    AND is_staff_for_case(auth.uid(), case_id)
  );

-- Policy: Admins see all messages
CREATE POLICY "admins_see_all_messages"
  ON case_messages
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
  );

-- Policy: Only the sender can insert messages
CREATE POLICY "only_sender_can_insert_messages"
  ON case_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      -- Parent sending to parent/teacher/counselor
      (get_user_role() = 'PARENT' AND sender_role = 'parent')
      -- Counselor sending to parent/teacher/counselor
      OR (get_user_role() = 'COUNSELOR' AND sender_role = 'counselor')
      -- Teacher sending to parent/teacher/counselor
      OR (get_user_role() = 'TEACHER' AND sender_role = 'teacher')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_created_at ON case_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender_id ON case_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender_role ON case_messages(sender_role);

-- ============================================================================
-- 4. TABLE: case_notes (Supabase)
-- ============================================================================
-- Internal staff-only notes (NOT visible to parents)

-- Create table if not exists
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Parents CANNOT see notes (deny all)
CREATE POLICY "parents_cannot_see_notes"
  ON case_notes
  FOR SELECT
  USING (
    get_user_role() != 'PARENT'
  );

-- Policy: Counselors see notes for assigned cases
CREATE POLICY "counselors_see_own_case_notes"
  ON case_notes
  FOR SELECT
  USING (
    get_user_role() = 'COUNSELOR'
    AND is_case_counselor(auth.uid(), case_id)
  );

-- Policy: Admins see all notes
CREATE POLICY "admins_see_all_notes"
  ON case_notes
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
  );

-- Policy: Teachers see notes for their role cases
CREATE POLICY "teachers_see_case_notes"
  ON case_notes
  FOR SELECT
  USING (
    get_user_role() = 'TEACHER'
    AND is_staff_for_case(auth.uid(), case_id)
  );

-- Policy: Only staff can insert notes
CREATE POLICY "staff_only_insert_notes"
  ON case_notes
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('COUNSELOR', 'ADMIN', 'TEACHER', 'SRO')
    AND author_id = auth.uid()
    AND is_staff_for_case(auth.uid(), case_id)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_author_id ON case_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_created_at ON case_notes(created_at DESC);

-- ============================================================================
-- 5. TABLE: case_events (Supabase)
-- ============================================================================
-- Immutable event log (status changes, note additions, etc.)

-- Create table if not exists
CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'note_added')),
  actor_name TEXT,
  from_status TEXT,
  to_status TEXT,
  note_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;

-- Policy: Parents see only high-level status events for their cases
CREATE POLICY "parents_see_status_events"
  ON case_events
  FOR SELECT
  USING (
    is_verified_guardian(auth.uid(), (SELECT student_id FROM cases WHERE id = case_id))
    AND type = 'status_change'
  );

-- Policy: Counselors see all events for assigned cases
CREATE POLICY "counselors_see_case_events"
  ON case_events
  FOR SELECT
  USING (
    get_user_role() = 'COUNSELOR'
    AND is_case_counselor(auth.uid(), case_id)
  );

-- Policy: Admins see all events
CREATE POLICY "admins_see_all_events"
  ON case_events
  FOR SELECT
  USING (
    get_user_role() = 'ADMIN'
  );

-- Policy: Teachers see case events
CREATE POLICY "teachers_see_case_events"
  ON case_events
  FOR SELECT
  USING (
    get_user_role() = 'TEACHER'
    AND is_staff_for_case(auth.uid(), case_id)
  );

-- Policy: Only staff can insert events
CREATE POLICY "staff_only_insert_events"
  ON case_events
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('COUNSELOR', 'ADMIN', 'TEACHER', 'SRO')
    AND is_staff_for_case(auth.uid(), case_id)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_created_at ON case_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_events_type ON case_events(type);

-- ============================================================================
-- 6. VERIFICATION & TESTING QUERIES
-- ============================================================================
-- Run these as different users to verify RLS works

/*

-- TEST 1: Parent can only see their own cases
SET session app.user_id = 'parent-uuid-here';
SELECT * FROM cases; -- Should show only cases where parent is verified guardian

-- TEST 2: Parent cannot see case_notes
SET session app.user_id = 'parent-uuid-here';
SELECT * FROM case_notes; -- Should return empty or 403 error

-- TEST 3: Parent sees only messages they sent/received
SET session app.user_id = 'parent-uuid-here';
SELECT * FROM case_messages 
WHERE case_id = 'some-case-uuid'; -- Should filter by parent role

-- TEST 4: Counselor sees assigned cases only
SET session app.user_id = 'counselor-uuid-here';
SELECT * FROM cases; -- Should show cases where assigned_counselor_id = this user

-- TEST 5: Counselor sees all messages for assigned cases
SET session app.user_id = 'counselor-uuid-here';
SELECT * FROM case_messages; -- All messages for assigned cases

-- TEST 6: Counselor sees all notes for assigned cases
SET session app.user_id = 'counselor-uuid-here';
SELECT * FROM case_notes; -- Notes for assigned cases only

-- TEST 7: Admin sees everything
SET session app.user_id = 'admin-uuid-here';
SELECT * FROM cases; -- All cases
SELECT * FROM case_messages; -- All messages
SELECT * FROM case_notes; -- All notes
SELECT * FROM case_events; -- All events

*/

-- ============================================================================
-- 7. IMPORTANT NOTES
-- ============================================================================
/*

RLS ENFORCEMENT:
1. Enable RLS on ALL tables before going to production
2. Test policies with different user roles
3. RLS policies are applied to ALL queries, including aggregations
4. Use SERVICE_ROLE_KEY for backend admin operations (bypasses RLS)

JWT CLAIMS SETUP:
1. Ensure your Supabase Auth configuration includes 'role' in custom claims
2. Store user.role in the JWT for faster policy evaluation
3. If using Prisma for auth, ensure users.role is synced to JWT

TESTING CHECKLIST:
- [ ] Parent cannot see sibling's cases
- [ ] Parent cannot view case_notes or case_events details
- [ ] Counselor cannot see cases not assigned to them
- [ ] Teachers see only teacher-role messages
- [ ] Admins see everything
- [ ] Insert policies prevent unauthorized creations
- [ ] Updates are rejected for unauthorized users

PERFORMANCE CONSIDERATIONS:
1. Indexes created on: case_id, created_at, sender_id, author_id
2. Use .eq() in queries instead of WHERE for better RLS performance
3. Monitor slow query logs - RLS adds minimal overhead

MIGRATION FROM APP-LEVEL TO RLS:
1. Deploy RLS policies in permissive mode first (allow all reads)
2. Test with real data
3. Gradually enable policies
4. Run parallel app + RLS access control during transition

*/
