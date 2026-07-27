# Phase 3 Verification - FERPA Isolation Tests

## Test Data
- **Parent A**: b5de3ba4-a360-4284-9770-dc21ff8de7fa (parent.a@example.com)
- **Parent B**: a22cfb39-1e65-4d6e-bd78-a6b8fa476f26 (parent.b@example.com)
- **Emma** (Parent A's student, FERPA consent: YES): 8486f3e5-acff-4ede-b231-49ec978decc7
- **Liam** (Parent A's student, FERPA consent: YES): faa5951e-c7bf-46dd-9b43-18be900333ce
- **Sophia** (Parent B's student, FERPA consent: NO): 802ada4f-dc86-45a1-8d05-5529ff9b29ef
- **Sophia's Case** (Confidential): 5c4d235e-193b-46d1-a24c-857c68edd5ba

## ✅ Verification Checklist

### 1. No Direct Prisma Reads Bypassing Assertions
```bash
grep -R "prisma\.case\.find" -n app lib
grep -R "prisma\.student\.find" -n app lib
```
**Result**: ✅ All queries are in lib/permissions.ts and lib/assertions.ts (not in routes)

### 2. Test A - Student Isolation (Parent A tries to access Parent B's student)

**Login as Parent A** (parent.a@example.com / password123)

**Test Request**:
```bash
curl http://localhost:3000/api/students/802ada4f-dc86-45a1-8d05-5529ff9b29ef \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response**: 403 Forbidden
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Expected Audit Log**:
- Action: FERPA_VIOLATION
- Reason Code: NO_GUARDIANSHIP
- Entity: Student/802ada4f-dc86-45a1-8d05-5529ff9b29ef
- Actor: b5de3ba4-a360-4284-9770-dc21ff8de7fa

### 3. Test B - Case Isolation (Parent A tries to access Parent B's case)

**Login as Parent A** (parent.a@example.com / password123)

**Test Request**:
```bash
curl http://localhost:3000/api/cases/5c4d235e-193b-46d1-a24c-857c68edd5ba \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response**: 403 Forbidden
```json
{
  "error": "Forbidden - FERPA violation prevented"
}
```

**Expected Reason Code**: Either NO_GUARDIANSHIP or CONFIDENTIAL_CASE_RESTRICTED

### 4. Test C - Confidential Case Rule (Parent B tries to access their own student's confidential case)

**Login as Parent B** (parent.b@example.com / password456)

**Test Request**:
```bash
curl http://localhost:3000/api/cases/5c4d235e-193b-46d1-a24c-857c68edd5ba \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Expected Response**: 403 Forbidden (due to NO_FERPA_CONSENT or CONFIDENTIAL_CASE_RESTRICTED)

### 5. Verify Audit Log Persistence

**Query the audit log**:
```sql
SELECT 
  action,
  "reasonCode",
  "entityType",
  "entityId",
  message,
  "createdAt"
FROM "AuditLog"
WHERE action = 'FERPA_VIOLATION'
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Expected**: Each test violation should create a permanent audit record

## Quick Browser Tests

### Test Student Isolation (Browser)
1. Login at http://localhost:3000/api/auth/signin as `parent.a@example.com`
2. Visit: http://localhost:3000/api/students/802ada4f-dc86-45a1-8d05-5529ff9b29ef
3. **Expected**: 403 error page or JSON with "Forbidden - FERPA violation prevented"

### Test Case Access (Browser)
1. Still logged in as Parent A
2. Visit: http://localhost:3000/api/cases/5c4d235e-193b-46d1-a24c-857c68edd5ba
3. **Expected**: 403 error

### Verify Positive Case (Should Work)
1. Still logged in as Parent A
2. Visit: http://localhost:3000/api/students/8486f3e5-acff-4ede-b231-49ec978decc7
3. **Expected**: 200 OK with Emma's data

## Verification Script

Run this to check audit logs after tests:

```javascript
// scripts/check-audit-log.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const violations = await prisma.auditLog.findMany({
    where: { action: "FERPA_VIOLATION" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log("\n=== Recent FERPA Violations ===\n");
  violations.forEach((v, i) => {
    console.log(`${i + 1}. ${v.reasonCode}`);
    console.log(`   Entity: ${v.entityType}/${v.entityId}`);
    console.log(`   Actor: ${v.actorUserId}`);
    console.log(`   Time: ${v.createdAt}`);
    console.log(`   Message: ${v.message}\n`);
  });
}

main().finally(() => prisma.$disconnect());
```

## Enterprise Compliance Answer

**Q: How do you enforce FERPA separation?**

**A**: "We implement defense in depth with four layers:

1. **Schema-level constraints** - Foreign keys, unique indexes, and cascade rules enforce referential integrity
2. **Query-level filtering** - Role-based data access in getVisibleStudents/Cases
3. **Explicit permission assertions** - Every sensitive endpoint calls assertion helpers that throw FERPAViolationError with specific reason codes (NO_GUARDIANSHIP, NO_FERPA_CONSENT, CONFIDENTIAL_CASE_RESTRICTED, etc.)
4. **Persistent audit trail** - All violations are logged to the AuditLog table with actor, entity, reason code, and timestamp for compliance reporting

Every FERPA violation returns HTTP 403, logs to our audit table with a deterministic reason code, and prevents data exposure. Parents need both guardianship AND FERPA consent to view cases. Confidential cases require staff assignment."

## Status: Ready for Production Verification ✅

All components are in place:
- ✅ Audit logging to database
- ✅ Deterministic reason codes
- ✅ No direct database access in routes
- ✅ Clear HTTP status codes (403 for violations)
- ✅ Centralized assertion logic
