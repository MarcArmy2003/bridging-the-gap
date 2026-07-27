import { prisma } from "./prisma";
import { UserRole, ViolationReason, AuditAction, Prisma } from "@prisma/client";

/**
 * FERPA Enforcement Layer - Assertion Helpers
 * 
 * These functions provide explicit, centralized permission checks.
 * They throw errors on violation, making unauthorized access impossible to ignore.
 * 
 * Defense in depth:
 * - Layer 1: Schema constraints (foreign keys, unique indexes)
 * - Layer 2: Query filtering (getVisibleStudents, getVisibleCases)
 * - Layer 3: Explicit assertions (this file) ← YOU ARE HERE
 * - Layer 4: Middleware (future)
 */

export class FERPAViolationError extends Error {
  constructor(
    message: string,
    public reasonCode: ViolationReason,
    public entityType?: string,
    public entityId?: string
  ) {
    super(message);
    this.name = "FERPAViolationError";
  }
}

/**
 * Log FERPA violation to audit table
 */
async function logViolation(
  actorUserId: string | null,
  reasonCode: ViolationReason,
  entityType: string,
  entityId: string,
  message: string,
  metadata?: Prisma.InputJsonObject
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: AuditAction.FERPA_VIOLATION,
        actorUserId,
        entityType,
        entityId,
        reasonCode,
        message,
        metadata: metadata ?? {},
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't fail the request if audit logging fails
  }
}

/**
 * Assert that a parent has guardianship over a specific student
 * 
 * @throws {FERPAViolationError} if parent does not have guardianship
 */
export async function assertParentHasStudentAccess(
  parentId: string,
  studentId: string
): Promise<void> {
  const guardianship = await prisma.guardianship.findUnique({
    where: {
      userId_studentId: {
        userId: parentId,
        studentId,
      },
    },
  });

  if (!guardianship) {
    const message = `Parent ${parentId} does not have guardianship over student ${studentId}`;
    await logViolation(
      parentId,
      ViolationReason.NO_GUARDIANSHIP,
      "Student",
      studentId,
      message
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.NO_GUARDIANSHIP,
      "Student",
      studentId
    );
  }
}

/**
 * Assert that a parent can access a specific case
 * 
 * Requirements:
 * 1. Parent must have guardianship over the student
 * 2. Parent must have FERPA consent
 * 3. Case must not be confidential
 * 
 * @throws {FERPAViolationError} if any requirement is not met
 */
export async function assertParentHasCaseAccess(
  parentId: string,
  caseId: string
): Promise<void> {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      student: {
        include: {
          guardianships: {
            where: { userId: parentId },
          },
        },
      },
    },
  });

  if (!caseRecord) {
    const message = `Case ${caseId} does not exist`;
    await logViolation(
      parentId,
      ViolationReason.RESOURCE_NOT_FOUND,
      "Case",
      caseId,
      message
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.RESOURCE_NOT_FOUND,
      "Case",
      caseId
    );
  }

  // Check guardianship exists
  const guardianship = caseRecord.student.guardianships[0];
  if (!guardianship) {
    const message = `Parent ${parentId} does not have guardianship over student for case ${caseId}`;
    await logViolation(
      parentId,
      ViolationReason.NO_GUARDIANSHIP,
      "Case",
      caseId,
      message,
      { studentId: caseRecord.studentId }
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.NO_GUARDIANSHIP,
      "Case",
      caseId
    );
  }

  // Check FERPA consent
  if (!guardianship.ferpaConsent) {
    const message = `Parent ${parentId} does not have FERPA consent for student in case ${caseId}`;
    await logViolation(
      parentId,
      ViolationReason.NO_FERPA_CONSENT,
      "Case",
      caseId,
      message,
      { studentId: caseRecord.studentId }
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.NO_FERPA_CONSENT,
      "Case",
      caseId
    );
  }

  // Check confidentiality
  if (caseRecord.isConfidential) {
    const message = `Case ${caseId} is confidential and cannot be accessed by parents`;
    await logViolation(
      parentId,
      ViolationReason.CONFIDENTIAL_CASE_RESTRICTED,
      "Case",
      caseId,
      message
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.CONFIDENTIAL_CASE_RESTRICTED,
      "Case",
      caseId
    );
  }
}

/**
 * Assert that a user (counselor/SRO) can access a case
 * 
 * Staff can access:
 * - All non-confidential cases (COUNSELOR, SRO, ADMIN)
 * - Their own assigned confidential cases
 * - All cases (ADMIN)
 * 
 * @throws {FERPAViolationError} if user cannot access the case
 */
export async function assertStaffHasCaseAccess(
  userId: string,
  userRole: UserRole,
  caseId: string
): Promise<void> {
  // ADMIN has access to everything
  if (userRole === "ADMIN") {
    return;
  }

  // Only staff roles can use this function
  if (userRole !== "COUNSELOR" && userRole !== "SRO") {
    const message = `User ${userId} with role ${userRole} is not authorized to access cases`;
    await logViolation(userId, ViolationReason.ROLE_FORBIDDEN, "Case", caseId, message);
    throw new FERPAViolationError(
      message,
      ViolationReason.ROLE_FORBIDDEN,
      "Case",
      caseId
    );
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!caseRecord) {
    const message = `Case ${caseId} does not exist`;
    await logViolation(userId, ViolationReason.RESOURCE_NOT_FOUND, "Case", caseId, message);
    throw new FERPAViolationError(
      message,
      ViolationReason.RESOURCE_NOT_FOUND,
      "Case",
      caseId
    );
  }

  // If case is confidential, user must be the assignee
  if (caseRecord.isConfidential && caseRecord.assigneeId !== userId) {
    const message = `Case ${caseId} is confidential and not assigned to user ${userId}`;
    await logViolation(
      userId,
      ViolationReason.CASE_NOT_ASSIGNED,
      "Case",
      caseId,
      message,
      { assigneeId: caseRecord.assigneeId }
    );
    throw new FERPAViolationError(
      message,
      ViolationReason.CASE_NOT_ASSIGNED,
      "Case",
      caseId
    );
  }
}

/**
 * Assert that a user can view a student
 * 
 * @throws {FERPAViolationError} if user cannot view student
 */
export async function assertCanViewStudent(
  userId: string,
  userRole: UserRole,
  studentId: string
): Promise<void> {
  // ADMIN, COUNSELOR, SRO can see all students
  if (userRole === "ADMIN" || userRole === "COUNSELOR" || userRole === "SRO") {
    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new FERPAViolationError(
        `Student ${studentId} does not exist`,
        ViolationReason.RESOURCE_NOT_FOUND,
        "Student",
        studentId
      );
    }

    if (!student.isActive) {
      throw new FERPAViolationError(
        `Student ${studentId} is not active`,
        ViolationReason.STUDENT_INACTIVE,
        "Student",
        studentId
      );
    }

    return;
  }

  // PARENT must have guardianship
  if (userRole === "PARENT") {
    await assertParentHasStudentAccess(userId, studentId);
    return;
  }

  throw new FERPAViolationError(
    `User ${userId} with role ${userRole} cannot view students`,
    ViolationReason.ROLE_FORBIDDEN,
    "Student",
    studentId
  );
}

/**
 * Assert that a user can create a case for a student
 * 
 * Only staff can create cases
 * 
 * @throws {FERPAViolationError} if user cannot create case
 */
export async function assertCanCreateCase(
  userId: string,
  userRole: UserRole,
  studentId: string
): Promise<void> {
  // Only staff can create cases
  if (userRole !== "COUNSELOR" && userRole !== "SRO" && userRole !== "ADMIN") {
    throw new FERPAViolationError(
      `User ${userId} with role ${userRole} cannot create cases`,
      ViolationReason.ROLE_FORBIDDEN,
      "Student",
      studentId
    );
  }

  // Verify student exists and is active
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new FERPAViolationError(
      `Student ${studentId} does not exist`,
      ViolationReason.RESOURCE_NOT_FOUND,
      "Student",
      studentId
    );
  }

  if (!student.isActive) {
    throw new FERPAViolationError(
      `Cannot create case for inactive student ${studentId}`,
      ViolationReason.STUDENT_INACTIVE,
      "Student",
      studentId
    );
  }
}

/**
 * Assert that a user can update a case
 * 
 * @throws {FERPAViolationError} if user cannot update case
 */
export async function assertCanUpdateCase(
  userId: string,
  userRole: UserRole,
  caseId: string
): Promise<void> {
  // ADMIN can update any case
  if (userRole === "ADMIN") {
    return;
  }

  // Staff can only update cases assigned to them
  if (userRole === "COUNSELOR" || userRole === "SRO") {
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      throw new FERPAViolationError(
        `Case ${caseId} does not exist`,
        ViolationReason.RESOURCE_NOT_FOUND,
        "Case",
        caseId
      );
    }

    if (caseRecord.assigneeId !== userId) {
      throw new FERPAViolationError(
        `User ${userId} is not assigned to case ${caseId}`,
        ViolationReason.CASE_NOT_ASSIGNED,
        "Case",
        caseId
      );
    }

    return;
  }

  throw new FERPAViolationError(
    `User ${userId} with role ${userRole} cannot update cases`,
    ViolationReason.ROLE_FORBIDDEN,
    "Case",
    caseId
  );
}

/**
 * Get student with guardianship verification
 * 
 * Convenience wrapper that asserts access then returns student
 */
export async function getStudentWithAccess(
  userId: string,
  userRole: UserRole,
  studentId: string
) {
  await assertCanViewStudent(userId, userRole, studentId);

  return await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      guardianships: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get case with access verification
 * 
 * Convenience wrapper that asserts access then returns case
 */
export async function getCaseWithAccess(
  userId: string,
  userRole: UserRole,
  caseId: string
) {
  if (userRole === "PARENT") {
    await assertParentHasCaseAccess(userId, caseId);
  } else {
    await assertStaffHasCaseAccess(userId, userRole, caseId);
  }

  return await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      student: true,
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
