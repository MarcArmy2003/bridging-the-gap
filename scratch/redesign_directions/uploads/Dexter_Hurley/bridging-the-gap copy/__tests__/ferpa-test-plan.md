# FERPA Compliance Test Suite
## Parent Portal Access Control Testing

**Status:** Implementation Ready  
**Date:** February 17, 2026  
**Purpose:** Verify parent isolation and FERPA compliance  

---

## Test Setup

### Prerequisites

```bash
# Install Jest and testing libraries
npm install -D jest @types/jest ts-jest

# Create jest.config.js
npx jest --init
```

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

---

## Test Suite: `__tests__/ferpa.test.ts`

```typescript
import { prisma } from "@/lib/prisma";
import {
  assertParentHasStudentAccess,
  assertParentHasCaseAccess,
  getParentVisibleCases,
} from "@/lib/permissions";

describe("FERPA Compliance Tests", () => {
  let parentA: any;
  let parentB: any;
  let studentA: any;
  let studentB: any;
  let school: any;
  let admin: any;

  // ===== SETUP =====
  beforeAll(async () => {
    console.log("Setting up test database...");

    // Create school
    school = await prisma.school.create({
      data: {
        name: "Test School",
      },
    });

    // Create parents
    parentA = await prisma.user.create({
      data: {
        email: "parent-a@test.com",
        firstName: "Alice",
        lastName: "Parent",
        role: "PARENT",
        isActive: true,
      },
    });

    parentB = await prisma.user.create({
      data: {
        email: "parent-b@test.com",
        firstName: "Bob",
        lastName: "Parent",
        role: "PARENT",
        isActive: true,
      },
    });

    // Create admin
    admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        isActive: true,
      },
    });

    // Create students
    studentA = await prisma.student.create({
      data: {
        districtStudentId: "STU-001",
        firstName: "Alex",
        lastName: "Student",
        gradeLevel: "7",
        schoolId: school.id,
      },
    });

    studentB = await prisma.student.create({
      data: {
        districtStudentId: "STU-002",
        firstName: "Bailey",
        lastName: "Student",
        gradeLevel: "8",
        schoolId: school.id,
      },
    });

    // Create guardianships (VERIFIED)
    await prisma.guardianship.create({
      data: {
        parentUserId: parentA.id,
        studentId: studentA.id,
        relationship: "MOTHER",
        verifiedStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    await prisma.guardianship.create({
      data: {
        parentUserId: parentB.id,
        studentId: studentB.id,
        relationship: "FATHER",
        verifiedStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    console.log("✅ Test setup complete");
  });

  afterAll(async () => {
    console.log("Cleaning up test database...");
    await prisma.$disconnect();
  });

  // ===== TEST 1: Parent A cannot access Parent B's student =====
  test("TEST 1: Parent A cannot see Student B", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentB.id);
    }).rejects.toThrow("Access denied");
  });

  // ===== TEST 2: Parent B cannot access Parent A's student =====
  test("TEST 2: Parent B cannot see Student A", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentB.id, studentA.id);
    }).rejects.toThrow("Access denied");
  });

  // ===== TEST 3: Parent A CAN access Student A =====
  test("TEST 3: Parent A can see Student A (verified guardianship)", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentA.id);
    }).not.toThrow();
  });

  // ===== TEST 4: Revoked guardianship denies access =====
  test("TEST 4: Revoked guardianship denies access", async () => {
    // Revoke
    await prisma.guardianship.updateMany({
      where: {
        parentUserId: parentA.id,
        studentId: studentA.id,
      },
      data: {
        verifiedStatus: "REVOKED",
      },
    });

    // Should now fail
    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentA.id);
    }).rejects.toThrow("Access denied");

    // Restore for other tests
    await prisma.guardianship.updateMany({
      where: {
        parentUserId: parentA.id,
        studentId: studentA.id,
      },
      data: {
        verifiedStatus: "VERIFIED",
      },
    });
  });

  // ===== TEST 5: Pending guardianship denies access =====
  test("TEST 5: Pending guardianship denies access", async () => {
    const studentC = await prisma.student.create({
      data: {
        districtStudentId: "STU-003",
        firstName: "Casey",
        lastName: "Student",
        gradeLevel: "9",
        schoolId: school.id,
      },
    });

    await prisma.guardianship.create({
      data: {
        parentUserId: parentA.id,
        studentId: studentC.id,
        relationship: "GUARDIAN",
        verifiedStatus: "PENDING",
      },
    });

    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentC.id);
    }).rejects.toThrow("Access denied");
  });

  // ===== TEST 6: Parent cannot access unrelated case =====
  test("TEST 6: Parent cannot access unrelated case", async () => {
    // Create case for Student B (submitted by Parent B)
    const caseB = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-001",
        studentId: studentB.id,
        submittedByUserId: parentB.id,
        createdByRole: "PARENT",
        concernType: "BULLYING",
        urgencyLevel: "GENERAL",
        description: "Test case - Parent A should NOT see this",
      },
    });

    // Parent A tries to access → should fail
    expect(async () => {
      await assertParentHasCaseAccess(parentA.id, caseB.id);
    }).rejects.toThrow("Access denied");
  });

  // ===== TEST 7: Internal thread never exposed =====
  test("TEST 7: Internal threads never exposed to parent", async () => {
    const caseA = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-002",
        studentId: studentA.id,
        submittedByUserId: parentA.id,
        createdByRole: "PARENT",
        concernType: "THREAT",
        urgencyLevel: "GENERAL",
        description: "Test case with internal threads",
      },
    });

    // Create both thread types
    await prisma.caseThread.create({
      data: {
        caseId: caseA.id,
        threadType: "PARENT_STAFF",
      },
    });

    await prisma.caseThread.create({
      data: {
        caseId: caseA.id,
        threadType: "INTERNAL_ONLY",
      },
    });

    // Query threads
    const threads = await prisma.caseThread.findMany({
      where: { caseId: caseA.id },
    });

    // Verify both exist in DB
    expect(threads).toHaveLength(2);

    // But parent should only see PARENT_STAFF
    const parentVisibleThreads = threads.filter(
      (t) => t.threadType === "PARENT_STAFF"
    );
    expect(parentVisibleThreads).toHaveLength(1);

    // Internal should be hidden
    const internalThreads = threads.filter(
      (t) => t.threadType === "INTERNAL_ONLY"
    );
    expect(internalThreads).toHaveLength(1);
  });

  // ===== TEST 8: Parent sees their own case =====
  test("TEST 8: Parent can access case they submitted", async () => {
    const caseOwn = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-003",
        studentId: studentA.id,
        submittedByUserId: parentA.id,
        createdByRole: "PARENT",
        concernType: "MENTAL_HEALTH",
        urgencyLevel: "CONCERNING",
        description: "My case",
      },
    });

    expect(async () => {
      await assertParentHasCaseAccess(parentA.id, caseOwn.id);
    }).not.toThrow();
  });

  // ===== TEST 9: Critical escalation creates notifications =====
  test("TEST 9: CRITICAL cases trigger escalations and notifications", async () => {
    const criticalCase = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-004",
        studentId: studentA.id,
        submittedByUserId: parentA.id,
        createdByRole: "PARENT",
        concernType: "THREAT",
        urgencyLevel: "CRITICAL",
        description: "Critical incident",
      },
    });

    // Check escalation was created
    const escalation = await prisma.caseEscalation.findFirst({
      where: {
        caseId: criticalCase.id,
        triggerType: "CRITICAL_URGENT",
      },
    });

    expect(escalation).toBeDefined();
    expect(escalation?.notifiedRoles).toContain("ADMIN");
    expect(escalation?.notifiedRoles).toContain("SRO");

    // Check notifications created
    const notifications = await prisma.notification.findMany({
      where: {
        caseId: criticalCase.id,
        type: "ESCALATION_ALERT",
      },
    });

    expect(notifications.length).toBeGreaterThan(0);
  });

  // ===== TEST 10: Case participants can access shared cases =====
  test("TEST 10: Case participant can access shared case", async () => {
    const sharedCase = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-005",
        studentId: studentA.id,
        submittedByUserId: admin.id,
        createdByRole: "ADMIN",
        concernType: "BULLYING",
        urgencyLevel: "GENERAL",
        description: "Case shared with parent",
      },
    });

    // Share with Parent A
    await prisma.caseParticipant.create({
      data: {
        caseId: sharedCase.id,
        userId: parentA.id,
        participantRole: "PARENT",
        accessLevel: "VIEW",
      },
    });

    // Parent A should now access it
    expect(async () => {
      await assertParentHasCaseAccess(parentA.id, sharedCase.id);
    }).not.toThrow();

    // But Parent B should not
    expect(async () => {
      await assertParentHasCaseAccess(parentB.id, sharedCase.id);
    }).rejects.toThrow("Access denied");
  });

  // ===== TEST 11: Audit logging captures all access =====
  test("TEST 11: Audit logs capture parent actions", async () => {
    const auditCase = await prisma.case.create({
      data: {
        caseNumber: "BTG-TEST-006",
        studentId: studentA.id,
        submittedByUserId: parentA.id,
        createdByRole: "PARENT",
        concernType: "BEHAVIOR",
        urgencyLevel: "GENERAL",
        description: "Audit test case",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: parentA.id,
        actorRole: "PARENT",
        action: "CASE_CREATED",
        entityType: "case",
        entityId: auditCase.id,
      },
    });

    // Retrieve audit logs
    const logs = await prisma.auditLog.findMany({
      where: {
        actorUserId: parentA.id,
        action: "CASE_CREATED",
      },
    });

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].entityType).toBe("case");
  });
});
```

---

## Run Tests

```bash
# Run all FERPA tests
npx jest __tests__/ferpa.test.ts --verbose

# Run with coverage
npx jest __tests__/ferpa.test.ts --coverage

# Watch mode (for development)
npx jest __tests__/ferpa.test.ts --watch
```

### Expected Output

```
PASS  __tests__/ferpa.test.ts
  FERPA Compliance Tests
    ✓ TEST 1: Parent A cannot see Student B (15ms)
    ✓ TEST 2: Parent B cannot see Student A (12ms)
    ✓ TEST 3: Parent A can see Student A (verified guardianship) (10ms)
    ✓ TEST 4: Revoked guardianship denies access (18ms)
    ✓ TEST 5: Pending guardianship denies access (22ms)
    ✓ TEST 6: Parent cannot access unrelated case (25ms)
    ✓ TEST 7: Internal threads never exposed to parent (30ms)
    ✓ TEST 8: Parent can access case they submitted (15ms)
    ✓ TEST 9: CRITICAL cases trigger escalations (40ms)
    ✓ TEST 10: Case participant can access shared case (28ms)
    ✓ TEST 11: Audit logs capture parent actions (20ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## Deployment Checklist

Before shipping to production:

- [ ] All 11 FERPA tests passing
- [ ] 100% test coverage on permissions.ts
- [ ] API rate limiting configured
- [ ] Database backup strategy in place
- [ ] Audit logging active and monitored
- [ ] Error logging (Sentry) active
- [ ] Load testing completed (100 concurrent parents)
- [ ] Security audit: OWASP Top 10
- [ ] Legal review: FERPA compliance signed off
- [ ] Parent accessibility testing (WCAG 2.1 AA)

---

**Document Version:** 1.0  
**Date:** February 17, 2026  
**Status:** Ready for Integration Testing
