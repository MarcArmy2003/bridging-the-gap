# Backend Release Checklist

## ✅ Automated Verification Complete

- [x] Build passes (`npm run build`)
- [x] Lint passes (`npm run lint`)
- [x] All FERPA constructor calls include `ViolationReason`
- [x] NextAuth session typing complete (`session.user.id`, `session.user.role`)
- [x] Prisma types enforced (no `any` types in assertions/audit logic)
- [x] Migration status: database schema up to date
- [x] Required env vars present locally:
  - `DATABASE_URL` ✓
  - `NEXTAUTH_SECRET` ✓
  - `MOBILE_JWT_SECRET` ✓
- [x] Debug logging removed from production routes
- [x] ESLint configured for CommonJS utility scripts

## 🔄 Manual Verification Required

### 1. Run Compliance Scenarios

Follow test scenarios in [VERIFICATION.md](VERIFICATION.md) and [FERPA_TESTING.md](FERPA_TESTING.md):

```bash
# Start dev server
npm run dev

# In another terminal, run integration tests
node scripts/test-ferpa-isolation.js
```

**Test Coverage:**
- [ ] Parent A cannot access Parent B's student → `NO_GUARDIANSHIP`
- [ ] Parent without FERPA consent blocked → `NO_FERPA_CONSENT`
- [ ] Confidential case blocked from parents → `CONFIDENTIAL_CASE_RESTRICTED`
- [ ] Unassigned counselor blocked from confidential case → `CASE_NOT_ASSIGNED`
- [ ] Valid access succeeds (positive test)

### 2. Protected Route Smoke Tests

Test each protected endpoint:

#### Valid Session ✓
```bash
# Login and capture session token
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d 'email=parent.a@example.com&password=password123'

# Use token for protected routes
GET /api/students
GET /api/cases
GET /api/students/:id
GET /api/cases/:id
```
**Expected:** 200 OK with filtered data

#### Invalid/Missing Session ✓
```bash
GET /api/students (no auth header)
```
**Expected:** 401 Unauthorized

#### Forbidden Role ✓
```bash
# Login as PARENT, try to create case
POST /api/cases
```
**Expected:** 403 Forbidden + `ROLE_FORBIDDEN`

#### Resource Not Found ✓
```bash
GET /api/students/nonexistent-uuid
```
**Expected:** 403 Forbidden + `RESOURCE_NOT_FOUND`

#### Student Inactive ✓
```bash
# Set a student isActive=false, then try access
GET /api/students/:inactive-id
```
**Expected:** 403 Forbidden + `STUDENT_INACTIVE`

#### Case Not Assigned ✓
```bash
# Login as Counselor A, access Counselor B's confidential case
GET /api/cases/:unassigned-confidential-id
```
**Expected:** 403 Forbidden + `CASE_NOT_ASSIGNED`

### 3. Verify Audit Log Persistence

After running tests:
```bash
node scripts/check-audit-log.js
```

**Confirm:**
- [ ] All violations recorded
- [ ] `reasonCode` populated correctly
- [ ] `actorUserId` matches request user
- [ ] `entityType` and `entityId` present
- [ ] Timestamps accurate

### 4. Production Environment Setup

Before deployment, ensure these secrets exist in production:

```bash
DATABASE_URL=<production-postgres-url>
NEXTAUTH_SECRET=<secure-random-32byte>
MOBILE_JWT_SECRET=<secure-random-32byte>
NEXTAUTH_URL=<production-domain>
```

**Platform-specific:**
- **Vercel:** Project Settings → Environment Variables
- **Railway/Render:** Dashboard → Environment
- **Docker:** `.env` file or container secrets
- **AWS/GCP:** Parameter Store / Secret Manager

### 5. Production Migration Deployment

Run migrations in production before app deployment:

```bash
npx prisma migrate deploy
```

**Verify:**
- [ ] All 3 migrations applied
- [ ] No pending migrations
- [ ] Schema version matches local

### 6. Final Pre-Release Checks

- [ ] All TypeScript errors resolved
- [ ] No ESLint errors (warnings acceptable)
- [ ] No direct `prisma.*` queries in route handlers
- [ ] All `FERPAViolationError` throws include reason codes
- [ ] Audit logging functional end-to-end
- [ ] Session typing works across all routes
- [ ] Build artifacts cleaned (`.next` rebuilt)

## 📦 Release Process

### Tag Release Candidate
```bash
git add .
git commit -m "chore: finalize FERPA compliance verification and auth typing"
git tag v1.0.0-rc1
git push origin main --tags
```

### Deploy to Production
```bash
# Platform-specific deploy command
# Vercel: vercel --prod
# Other: Follow platform deployment docs
```

### Post-Deploy Validation
- [ ] Health check endpoint responds
- [ ] Auth flow works
- [ ] Sample protected route returns expected data
- [ ] Attempt FERPA violation → 403 + audit log entry created

### Tag Stable Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🛡️ Security Review Complete

### FERPA Compliance
- ✅ Defense in depth (4 layers)
- ✅ Deterministic violation reason codes
- ✅ Immutable audit trail
- ✅ Role-based access control
- ✅ Guardianship validation
- ✅ FERPA consent gating
- ✅ Confidential case restrictions

### Type Safety
- ✅ No `any` types in permission logic
- ✅ Prisma-typed queries
- ✅ NextAuth session augmentation
- ✅ ViolationReason enum enforced

### Code Quality
- ✅ ESLint clean
- ✅ TypeScript strict mode
- ✅ No unused imports
- ✅ Centralized permission logic

## 📊 Interview-Ready Explanation

**Q: How do you enforce FERPA separation?**

**A:** "We implement defense in depth with four layers:

1. **Schema-level constraints** - Foreign keys, unique indexes, and cascade rules enforce referential integrity at the database level
2. **Query-level filtering** - Role-based data access functions (`getVisibleStudents`, `getVisibleCases`) ensure queries only return authorized records
3. **Explicit permission assertions** - Every sensitive endpoint calls assertion helpers that throw `FERPAViolationError` with specific reason codes (NO_GUARDIANSHIP, NO_FERPA_CONSENT, CONFIDENTIAL_CASE_RESTRICTED, etc.)
4. **Persistent audit trail** - All violations are logged to the `AuditLog` table with actor, entity, reason code, and timestamp for compliance reporting

Every FERPA violation returns HTTP 403, logs to our immutable audit table with a deterministic reason code, and prevents data exposure. Parents need both guardianship AND FERPA consent to view cases. Confidential cases require staff assignment. All permission logic is centralized in `lib/assertions.ts` and `lib/permissions.ts`, not scattered across route handlers."

## 🚀 Status: Ready for Manual Testing

**What's automated:** Build, lint, type checking, env validation, migration status
**What's next:** Run the manual test scenarios above to verify runtime behavior
**Release gate:** All manual tests pass → commit → tag → deploy → post-deploy validation
