# NextAuth Credentials Authentication - Test Plan

## Test Harness Overview

This document provides step-by-step testing procedures for credentials-based authentication with FERPA isolation.

## Prerequisites

- Backend running: `npm run dev` at `http://localhost:3000`
- Test database seeded: `npx ts-node scripts/seed.ts`
- Test credentials available (see seed output)

## Test Credentials (After Seed)

```
Parent A:
  Email: parent.a@example.com
  Password: password123
  Student: John Doe (Grade 7)
  Cases: Case A (Bullying Incident)

Parent B:
  Email: parent.b@example.com
  Password: password456
  Student: Jane Smith (Grade 8)
  Cases: Case B (Social Concerns)

Counselor:
  Email: counselor@example.com
  Password: password789
  Role: COUNSELOR
```

---

## Test 1: Basic Credentials Login

**Objective:** Verify that credentials provider authenticates correctly

**Steps:**
1. POST to `/api/auth/signin` with valid credentials
2. Verify session token returned
3. Verify JWT contains user data

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.a@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- HTTP 200 OK
- Session cookie set: `next-auth.session-token`
- User data in response (id, email, name, role)

---

## Test 2: Invalid Password Rejection

**Objective:** Verify that invalid passwords are rejected

**Steps:**
1. POST to `/api/auth/signin` with wrong password
2. Verify error response

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.a@example.com",
    "password": "wrong_password"
  }'
```

**Expected Result:**
- HTTP 401 Unauthorized
- Error message: "Invalid password"
- No session token

---

## Test 3: Non-existent User

**Objective:** Verify that login fails for non-existent users

**Steps:**
1. POST to `/api/auth/signin` with non-existent email
2. Verify error response

**Command:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nobody@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- HTTP 401 Unauthorized
- Error message: "No user found with this email"

---

## Test 4: Deactivated Account

**Objective:** Verify that deactivated accounts cannot login

**Steps:**
1. Deactivate a user in database: `UPDATE "User" SET is_active = false WHERE email = 'parent.a@example.com'`
2. Attempt login
3. Verify rejection
4. Reactivate account

**Command:**
```bash
# Deactivate
psql -d btg_database << 'SQL'
UPDATE "User" SET is_active = false WHERE email = 'parent.a@example.com';
SQL

# Try login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent.a@example.com",
    "password": "password123"
  }'

# Reactivate
psql -d btg_database << 'SQL'
UPDATE "User" SET is_active = true WHERE email = 'parent.a@example.com';
SQL
```

**Expected Result:**
- HTTP 401 Unauthorized
- Error message: "Account has been deactivated by district"

---

## Test 5: FERPA - Parent Sees Own Student

**Objective:** Verify that parent can see their own student

**Steps:**
1. Login as Parent A
2. GET `/api/parent/students` with session token
3. Verify Student A returned

**Command:**
```bash
# Get session token (save from login response or extract from cookie)
TOKEN="<session_token_from_login>"

curl -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- HTTP 200 OK
- Response includes Student A (John Doe)
- Audit log created: `action: LIST_STUDENTS, status: SUCCESS`

---

## Test 6: FERPA - Parent CANNOT See Other Parent's Student

**Objective:** Verify FERPA isolation - Parent A cannot see Student B

**Steps:**
1. Login as Parent A
2. Try to GET `/api/parent/students/[studentBId]`
3. Verify 403 Forbidden response

**Command:**
```bash
TOKEN="<parentA_session>"

# First, get student B ID from database
STUDENT_B_ID=$(psql -d btg_database -t -c "SELECT id FROM \"Student\" WHERE first_name = 'Jane';")

# Try to access
curl -X GET http://localhost:3000/api/parent/students/$STUDENT_B_ID \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- HTTP 403 Forbidden
- Error message: "Access denied"
- Audit log created: `action: VIEW_STUDENT, status: DENIED, reason: FERPA_DENIED`

---

## Test 7: FERPA - Parent Sees Own Cases

**Objective:** Verify that parent can see cases involving their student

**Steps:**
1. Login as Parent A
2. GET `/api/parent/cases`
3. Verify Case A returned (Case B should NOT be included)

**Command:**
```bash
TOKEN="<parentA_session>"

curl -X GET http://localhost:3000/api/parent/cases \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- HTTP 200 OK
- Response includes Case A (Bullying Incident)
- Response does NOT include Case B
- Both cases exist in database but FERPA check filters correctly

---

## Test 8: FERPA - Parent CANNOT See Other Parent's Cases

**Objective:** Verify FERPA isolation for cases

**Steps:**
1. Login as Parent A
2. Get Case B ID from database
3. Try to GET `/api/parent/cases/[caseBId]`
4. Verify 403 Forbidden

**Command:**
```bash
TOKEN="<parentA_session>"

# Get case B ID
CASE_B_ID=$(psql -d btg_database -t -c "SELECT id FROM \"Case\" WHERE title LIKE '%Social Concerns%';")

# Try to access
curl -X GET http://localhost:3000/api/parent/cases/$CASE_B_ID \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- HTTP 403 Forbidden
- Error message: "Access denied"
- Audit log: `action: VIEW_CASE, status: DENIED`

---

## Test 9: FERPA - Case Involves Multiple Students

**Objective:** Verify FERPA works correctly when parent has access via ANY student in case

**Setup:**
```bash
# In database, add Student A to Case B
psql -d btg_database << 'SQL'
INSERT INTO "CaseStudent" (id, case_id, student_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "Case" WHERE title LIKE '%Social%'),
  (SELECT id FROM "Student" WHERE first_name = 'John'),
  NOW()
);
SQL
```

**Steps:**
1. Login as Parent A
2. GET `/api/parent/cases` 
3. Verify Case B now appears (because Student A is in it)

**Expected Result:**
- Case B now visible to Parent A
- FERPA check passes via Student A guardianship

---

## Test 10: Audit Trail Logging

**Objective:** Verify all actions are logged for FERPA compliance

**Steps:**
1. Perform several API actions as Parent A
2. Query AuditLog table
3. Verify all actions logged

**Command:**
```bash
# After several API calls, check logs
psql -d btg_database << 'SQL'
SELECT user_id, action, resource_type, resource_id, status, reason, created_at
FROM "AuditLog"
ORDER BY created_at DESC
LIMIT 10;
SQL
```

**Expected Results:**
- Successful access: `status: SUCCESS`
- Denied access: `status: DENIED, reason: FERPA_DENIED`
- All action types logged: `LIST_STUDENTS`, `VIEW_STUDENT`, `LIST_CASES`, `VIEW_CASE`

---

## Test 11: Role-Based Access (Counselor)

**Objective:** Verify counselors have different access than parents

**Steps:**
1. Login as Counselor
2. Try to GET `/api/parent/students`
3. Verify 403 Forbidden (endpoint is parent-only)

**Command:**
```bash
TOKEN="<counselor_session>"

curl -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- HTTP 403 Forbidden
- Error message: "Only parents can list students"

---

## Test 12: Unauthenticated Request

**Objective:** Verify unauthenticated requests are rejected

**Steps:**
1. GET `/api/parent/students` WITHOUT session token
2. Verify 401 Unauthorized

**Command:**
```bash
curl -X GET http://localhost:3000/api/parent/students
```

**Expected Result:**
- HTTP 401 Unauthorized
- Error message: "Unauthorized"
- No audit log (user not authenticated)

---

## Test 13: Logout

**Objective:** Verify logout invalidates session

**Steps:**
1. Login as Parent A
2. Save session token
3. Logout: POST `/api/auth/signout`
4. Try API call with old token
5. Verify 401 Unauthorized

**Command:**
```bash
TOKEN="<parentA_session>"

# Logout
curl -X POST http://localhost:3000/api/auth/signout \
  -H "Cookie: next-auth.session-token=$TOKEN"

# Try API call
curl -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected Result:**
- Logout: HTTP 302 redirect
- API call after logout: HTTP 401 Unauthorized
- Session invalidated

---

## Test 14: Password Hashing Verification

**Objective:** Verify passwords are properly hashed in database

**Steps:**
1. Query User table
2. Verify password field contains bcrypt hash (not plaintext)
3. Verify hash starts with `$2a$` or `$2b$` (bcrypt prefix)

**Command:**
```bash
psql -d btg_database << 'SQL'
SELECT email, password 
FROM "User" 
LIMIT 3;
SQL
```

**Expected Result:**
- Passwords like: `$2b$10$abc123...` (bcrypt hash)
- NOT like: `password123` (plaintext)

---

## Test 15: Multi-District Isolation

**Objective:** Verify district_id prevents cross-district access

**Setup:**
```bash
# Create parent in different district
psql -d btg_database << 'SQL'
INSERT INTO "User" (id, email, password, name, role, district_id, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'parent.other@example.com',
  (SELECT password FROM "User" WHERE email = 'parent.a@example.com'),
  'Parent Other District',
  'PARENT',
  'district-other-001',
  true,
  NOW(),
  NOW()
);
SQL
```

**Steps:**
1. Query Student in District A: should be visible to Parent A
2. Verify district_id field on Student table filters queries

**Expected Result:**
- District A parents see only District A students
- District B parents see only District B students
- Database index on `district_id` for performance

---

## Integration Test: Complete Flow

**Objective:** Full end-to-end test of auth → access → audit

**Steps:**
1. Seed database
2. Login as Parent A → Get session token
3. List students → Verify Student A
4. View Student A details → Check audit log
5. Try to view Student B → DENIED, check audit log
6. Logout
7. Try API call → 401 Unauthorized
8. Query AuditLog → Verify trail

**Command:**
```bash
# Run complete test script (pseudocode)
#!/bin/bash

echo "1. Seeding..."
npx ts-node scripts/seed.ts

echo "2. Login as Parent A..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"parent.a@example.com","password":"password123"}' \
  | jq -r '.session_token')

echo "3. List students..."
curl -s -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN" | jq '.'

echo "4. Audit log check..."
psql -d btg_database -c "SELECT COUNT(*) FROM \"AuditLog\" WHERE status='SUCCESS';"

echo "5. FERPA denial test..."
curl -s -X GET http://localhost:3000/api/parent/students/[otherStudentId] \
  -H "Cookie: next-auth.session-token=$TOKEN" | jq '.'

echo "6. Audit log - denied..."
psql -d btg_database -c "SELECT COUNT(*) FROM \"AuditLog\" WHERE status='DENIED';"
```

**Expected Result:**
- All steps succeed
- Audit trail shows mix of SUCCESS and DENIED
- FERPA isolation working
- District school safety maintained

---

## Performance Tests

### Test P1: Bulk Student Listing
```bash
# Create 100 students for Parent A
for i in {1..100}; do
  psql -d btg_database << SQL
INSERT INTO "Student" (id, first_name, last_name, grade, district_id, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Student$i', 'Test', 5, 'district-test-001', true, NOW(), NOW());
INSERT INTO "Guardianship" (id, parent_id, student_id, status, verified_at, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM "User" WHERE email='parent.a@example.com'), (SELECT id FROM "Student" WHERE first_name='Student$i'), 'VERIFIED', NOW(), NOW(), NOW());
SQL
done

# Time the request
time curl -X GET http://localhost:3000/api/parent/students \
  -H "Cookie: next-auth.session-token=$TOKEN"
```

**Expected:** Response time < 500ms with proper database indexing

---

## Cleanup After Testing

```bash
# Drop test database
dropdb btg_database

# Or reset to fresh seed
npx prisma migrate reset

# Re-seed
npx ts-node scripts/seed.ts
```

---

## Summary

This test plan covers:
✅ Authentication (valid/invalid/deactivated)
✅ FERPA isolation (student and case access)
✅ Role-based access control
✅ Audit logging
✅ Multi-district isolation
✅ Session management
✅ Password security
✅ Performance

All tests should pass before deployment to production.
