import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * FERPA-compliant permission system
 * Enforces strict data access controls based on user roles and relationships
 */

export interface PermissionContext {
  userId: string;
  role: UserRole;
}

/**
 * Check if a user can view a specific student's information
 */
export async function canViewStudent(
  context: PermissionContext,
  studentId: string
): Promise<boolean> {
  const { userId, role } = context;

  // ADMIN can see all students
  if (role === "ADMIN") return true;

  // COUNSELOR and SRO can see all students (school staff)
  if (role === "COUNSELOR" || role === "SRO") return true;

  // PARENT can only see students they have guardianship over
  if (role === "PARENT") {
    const guardianship = await prisma.guardianship.findUnique({
      where: {
        userId_studentId: {
          userId,
          studentId,
        },
      },
    });
    return guardianship !== null;
  }

  return false;
}

/**
 * Check if a user can view a specific case
 * Cases have additional privacy controls beyond student access
 */
export async function canViewCase(
  context: PermissionContext,
  caseId: string
): Promise<boolean> {
  const { userId, role } = context;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      student: {
        include: {
          guardianships: true,
        },
      },
    },
  });

  if (!caseRecord) return false;

  // ADMIN can see all cases
  if (role === "ADMIN") return true;

  // Assigned counselor/SRO can see their cases
  if (caseRecord.assigneeId === userId) return true;

  // For confidential cases, only assignee and admin can view
  if (caseRecord.isConfidential) return false;

  // COUNSELOR and SRO can see non-confidential cases
  if (role === "COUNSELOR" || role === "SRO") return true;

  // PARENT can see non-confidential cases IF:
  // 1. They have guardianship over the student
  // 2. They have FERPA consent
  if (role === "PARENT") {
    const guardianship = caseRecord.student.guardianships.find(
      (g) => g.userId === userId
    );
    return guardianship !== undefined && guardianship.ferpaConsent === true;
  }

  return false;
}

/**
 * Check if a user can create a case for a student
 */
export async function canCreateCase(
  context: PermissionContext,
  studentId: string
): Promise<boolean> {
  const { role } = context;

  // Only school staff can create cases
  if (role === "COUNSELOR" || role === "SRO" || role === "ADMIN") {
    // Verify student exists and is active
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    return student !== null && student.isActive;
  }

  return false;
}

/**
 * Check if a user can update a case
 */
export async function canUpdateCase(
  context: PermissionContext,
  caseId: string
): Promise<boolean> {
  const { userId, role } = context;

  // ADMIN can update any case
  if (role === "ADMIN") return true;

  // Assigned counselor/SRO can update their cases
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!caseRecord) return false;

  return caseRecord.assigneeId === userId;
}

/**
 * Get all students visible to a user
 */
export async function getVisibleStudents(context: PermissionContext) {
  const { userId, role } = context;

  // ADMIN, COUNSELOR, SRO can see all students
  if (role === "ADMIN" || role === "COUNSELOR" || role === "SRO") {
    return await prisma.student.findMany({
      where: { isActive: true },
      include: {
        guardianships: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // PARENT can only see their students
  if (role === "PARENT") {
    const guardianships = await prisma.guardianship.findMany({
      where: { userId },
      include: {
        student: {
          include: {
            guardianships: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return guardianships.map((g) => g.student);
  }

  return [];
}

/**
 * Get all cases visible to a user
 */
export async function getVisibleCases(context: PermissionContext) {
  const { userId, role } = context;

  // ADMIN can see all cases
  if (role === "ADMIN") {
    return await prisma.case.findMany({
      include: {
        student: true,
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // COUNSELOR and SRO can see all non-confidential cases + their own confidential cases
  if (role === "COUNSELOR" || role === "SRO") {
    return await prisma.case.findMany({
      where: {
        OR: [
          { isConfidential: false },
          { assigneeId: userId },
        ],
      },
      include: {
        student: true,
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // PARENT can only see cases for their students with FERPA consent
  if (role === "PARENT") {
    const guardianships = await prisma.guardianship.findMany({
      where: {
        userId,
        ferpaConsent: true,
      },
    });

    const studentIds = guardianships.map((g) => g.studentId);

    return await prisma.case.findMany({
      where: {
        studentId: { in: studentIds },
        isConfidential: false, // Parents never see confidential cases
      },
      include: {
        student: true,
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  return [];
}
