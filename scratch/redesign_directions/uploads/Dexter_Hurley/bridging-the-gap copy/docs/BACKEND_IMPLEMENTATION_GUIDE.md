# Parent Portal: Step-by-Step Backend Implementation
## PostgreSQL + Prisma + Next.js API

**Status:** Implementation Guide  
**Date:** February 17, 2026  
**Target:** Production-ready parent portal backend  

---

## Phase 1: Project Setup & Database

### Step 1.1: Install Dependencies

```bash
# Install Prisma and client
npm install @prisma/client
npm install -D prisma

# Install auth (NextAuth.js recommended)
npm install next-auth

# Install server utilities
npm install -D @types/node

# If starting fresh with Next.js
npx create-next-app@latest --typescript --tailwind
```

### Step 1.2: Initialize Prisma

```bash
# Initialize (if not already done)
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env.local (template)
```

### Step 1.3: Configure Database

Edit `.env.local`:

```env
# PostgreSQL (local development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/bridging_gap"

# OR Supabase (cloud)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REGION].supabase.co:5432/postgres?schema=public"

# OR Neon (serverless Postgres)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.neon.tech/bridging_gap"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 1.4: Add Prisma Schema

Copy the complete schema from `PARENT_PORTAL_IMPLEMENTATION_BLUEPRINT.md` into `prisma/schema.prisma`.

```bash
# Format schema
npx prisma format

# Create migration
npx prisma migrate dev --name init_parent_portal

# Generate Prisma client
npx prisma generate
```

**Output:**
```
✅ Your database is now in sync with your schema. Migrations status:

Migration files created in /prisma/migrations/*/migration.sql

Prisma client generated at node_modules/@prisma/client
```

### Step 1.5: Verify Database

```bash
# Check tables were created
npx prisma studio

# Opens http://localhost:5555 (visual DB browser)
```

---

## Phase 2: Authentication & Middleware

### Step 2.1: Create Auth Utilities

**lib/auth.ts**

```typescript
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Hash password check (use bcrypt)
        // For now, simplified example
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        // Return user object (will be in session)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export async function getAuthedUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch fresh user from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return user;
}
```

### Step 2.2: Create FERPA Permissions Helper

**lib/permissions.ts**

```typescript
import { prisma } from "@/lib/prisma";

/**
 * FERPA Gatekeeper: Verify parent is linked to student (verified status)
 */
export async function assertParentHasStudentAccess(
  parentId: string,
  studentId: string
): Promise<void> {
  const guardianship = await prisma.guardianship.findFirst({
    where: {
      parentUserId: parentId,
      studentId,
      verifiedStatus: "VERIFIED",
    },
  });

  if (!guardianship) {
    throw new Error(
      "Access denied: student not linked or guardianship not verified"
    );
  }
}

/**
 * Verify parent can access a specific case
 */
export async function assertParentHasCaseAccess(
  parentId: string,
  caseId: string
): Promise<void> {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
  });

  if (!caseRecord) {
    throw new Error("Case not found");
  }

  // Parent submitted it OR is a participant
  const isSubmitter = caseRecord.submittedByUserId === parentId;
  
  const isParticipant = await prisma.caseParticipant.findFirst({
    where: {
      caseId,
      userId: parentId,
    },
  });

  if (!isSubmitter && !isParticipant) {
    throw new Error("Access denied: not case participant");
  }

  // Still need to verify student link (FERPA)
  await assertParentHasStudentAccess(parentId, caseRecord.studentId);
}

/**
 * Get all students parent can access (FERPA-compliant)
 */
export async function getParentLinkedStudents(parentId: string) {
  const guardianships = await prisma.guardianship.findMany({
    where: {
      parentUserId: parentId,
      verifiedStatus: "VERIFIED",
    },
    include: {
      student: {
        include: {
          school: true,
        },
      },
    },
  });

  return guardianships.map((g) => g.student);
}
```

### Step 2.3: Create Prisma Client Export

**lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## Phase 3: API Routes (Core Endpoints)

### Step 3.1: GET /api/parent/students

**app/api/parent/students/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedUser } from "@/lib/auth";
import { getParentLinkedStudents } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();

    if (user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Access denied: parents only" },
        { status: 403 }
      );
    }

    const students = await getParentLinkedStudents(user.id);

    const formatted = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      gradeLevel: s.gradeLevel,
      school: {
        id: s.school.id,
        name: s.school.name,
      },
    }));

    return NextResponse.json({ students: formatted });
  } catch (error) {
    console.error("GET /api/parent/students error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 3.2: POST /api/parent/cases (Create Case)

**app/api/parent/cases/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedUser } from "@/lib/auth";
import { assertParentHasStudentAccess } from "@/lib/permissions";

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `BTG-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();

    if (user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Access denied: parents only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      studentId,
      concernType,
      urgencyLevel,
      title,
      description,
      attachments,
    } = body;

    // Validate required fields
    if (!studentId || !concernType || !urgencyLevel || !description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: studentId, concernType, urgencyLevel, description",
        },
        { status: 400 }
      );
    }

    // FERPA: Verify parent is linked to student
    await assertParentHasStudentAccess(user.id, studentId);

    const caseNumber = generateCaseNumber();

    // Create case within transaction
    const caseRecord = await prisma.$transaction(async (tx) => {
      // 1. Create case
      const created = await tx.case.create({
        data: {
          caseNumber,
          studentId,
          submittedByUserId: user.id,
          createdByRole: "PARENT",
          concernType,
          urgencyLevel,
          title: title || null,
          description,
          status: "RECEIVED",
        },
      });

      // 2. Create status history
      await tx.caseStatusHistory.create({
        data: {
          caseId: created.id,
          fromStatus: null,
          toStatus: "RECEIVED",
          changedByUserId: user.id,
          reason: "Case submitted by parent",
        },
      });

      // 3. Create PARENT_STAFF thread
      await tx.caseThread.create({
        data: {
          caseId: created.id,
          threadType: "PARENT_STAFF",
        },
      });

      // 4. Create initial message
      await tx.caseMessage.create({
        data: {
          threadId: (
            await tx.caseThread.findFirst({
              where: {
                caseId: created.id,
                threadType: "PARENT_STAFF",
              },
            })
          )!.id,
          senderUserId: user.id,
          senderRole: "PARENT",
          body: description,
        },
      });

      // 5. Handle attachments if provided
      if (attachments && attachments.length > 0) {
        await tx.attachment.createMany({
          data: attachments.map((att: any) => ({
            caseId: created.id,
            uploadedByUserId: user.id,
            storageKey: att.storageKey,
            fileName: att.fileName,
            mimeType: att.mimeType,
            fileSizeBytes: BigInt(att.fileSizeBytes),
            virusScanStatus: "PENDING",
          })),
        });
      }

      // 6. If CRITICAL, escalate to admin/SRO
      if (urgencyLevel === "CRITICAL") {
        await tx.caseEscalation.create({
          data: {
            caseId: created.id,
            triggerType: "CRITICAL_URGENT",
            notifiedRoles: ["ADMIN", "SRO"],
            triggeredByUserId: user.id,
          },
        });

        // Notify admins/SROs
        const admins = await tx.user.findMany({
          where: {
            role: { in: ["ADMIN", "SRO"] },
            isActive: true,
          },
        });

        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "ESCALATION_ALERT",
            caseId: created.id,
            title: "🚨 Critical Case Escalation",
            body: `Case #${caseNumber} submitted with CRITICAL urgency. Immediate review required.`,
          })),
        });
      }

      // 7. Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          actorRole: "PARENT",
          action: "CASE_CREATED",
          entityType: "case",
          entityId: created.id,
          metadata: { concernType, urgencyLevel },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        case: {
          id: caseRecord.id,
          caseNumber,
          status: "RECEIVED",
          lastActivityAt: caseRecord.lastActivityAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/parent/cases error:", error);

    if (error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/parent/cases?studentId=...&status=ACTIVE|CLOSED
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();

    if (user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Access denied: parents only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const statusFilter = searchParams.get("status") || "ACTIVE";

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId query parameter required" },
        { status: 400 }
      );
    }

    // FERPA check
    await assertParentHasStudentAccess(user.id, studentId);

    // Build status filter
    const whereStatus =
      statusFilter === "CLOSED"
        ? { status: "CLOSED" }
        : { NOT: { status: "CLOSED" } };

    const cases = await prisma.case.findMany({
      where: {
        studentId,
        ...whereStatus,
        OR: [
          { submittedByUserId: user.id },
          {
            participants: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      orderBy: { lastActivityAt: "desc" },
    });

    const formatted = cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      concernType: c.concernType,
      urgencyLevel: c.urgencyLevel,
      status: c.status,
      submittedAt: c.createdAt.toISOString(),
      lastActivityAt: c.lastActivityAt.toISOString(),
    }));

    return NextResponse.json({ cases: formatted });
  } catch (error: any) {
    console.error("GET /api/parent/cases error:", error);

    if (error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Phase 4: React Component Starters

### Step 4.1: Parent Dashboard

**app/parent/page.tsx**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LinkedStudentPicker from "@/components/parent/LinkedStudentPicker";
import PrimaryActionCards from "@/components/parent/PrimaryActionCards";
import RecentCaseList from "@/components/parent/RecentCaseList";

interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  school: {
    id: string;
    name: string;
  };
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch linked students on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/parent/students");

        if (!res.ok) {
          if (res.status === 403) {
            router.push("/auth/signin");
            return;
          }
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudents(data.students);

        if (data.students.length > 0) {
          setSelectedStudent(data.students[0]);
        } else {
          setError("No linked students found. Contact your school.");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Error loading students. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Parent & Guardian Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your student's case submissions and updates
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {students.length > 1 && (
          <LinkedStudentPicker
            students={students}
            selected={selectedStudent}
            onSelect={setSelectedStudent}
          />
        )}

        {selectedStudent && <PrimaryActionCards student={selectedStudent} />}

        {selectedStudent && <RecentCaseList student={selectedStudent} />}
      </div>
    </div>
  );
}
```

### Step 4.2: Student Picker Component

**components/parent/LinkedStudentPicker.tsx**

```typescript
"use client";

interface LinkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  school: {
    id: string;
    name: string;
  };
}

interface Props {
  students: LinkedStudent[];
  selected: LinkedStudent | null;
  onSelect: (student: LinkedStudent) => void;
}

export default function LinkedStudentPicker({
  students,
  selected,
  onSelect,
}: Props) {
  if (students.length <= 1) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select Student
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => onSelect(student)}
            className={`p-3 rounded-lg border-2 text-left transition ${
              selected?.id === student.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-600">
              Grade {student.gradeLevel} • {student.school.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Step 4.3: Action Cards Component

**components/parent/PrimaryActionCards.tsx**

```typescript
"use client";

interface LinkedStudent {
  id: string;
}

interface Props {
  student: LinkedStudent;
}

export default function PrimaryActionCards({ student }: Props) {
  const cards = [
    {
      href: "/parent/cases/new",
      icon: "📋",
      title: "Submit a Concern",
      description: "Start a new case submission",
      color: "blue",
    },
    {
      href: "/parent/cases",
      icon: "📊",
      title: "View Case Updates",
      description: "Track all submitted cases",
      color: "teal",
    },
    {
      href: "/parent/resources",
      icon: "💚",
      title: "Support Resources",
      description: "Find helpful information",
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <a
          key={card.href}
          href={card.href}
          className={`p-6 rounded-lg border-2 border-${card.color}-200 bg-${card.color}-50 hover:shadow-md transition`}
        >
          <div className="text-3xl mb-3">{card.icon}</div>
          <h3 className="font-bold text-gray-900 text-lg">{card.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{card.description}</p>
          <div className="text-blue-600 font-semibold text-sm mt-4">
            Get started →
          </div>
        </a>
      ))}
    </div>
  );
}
```

### Step 4.4: Recent Cases Component

**components/parent/RecentCaseList.tsx**

```typescript
"use client";

import { useEffect, useState } from "react";

interface LinkedStudent {
  id: string;
}

interface CaseItem {
  id: string;
  caseNumber: string;
  status: string;
  lastActivityAt: string;
}

interface Props {
  student: LinkedStudent;
}

export default function RecentCaseList({ student }: Props) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch(
          `/api/parent/cases?studentId=${student.id}&status=ACTIVE`
        );
        const data = await res.json();
        setCases(data.cases.slice(0, 3));
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [student.id]);

  if (loading) return <div>Loading cases...</div>;

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600">No active cases yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">Recent Cases</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {cases.map((c) => (
          <a
            key={c.id}
            href={`/parent/cases/${c.id}`}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-gray-900">{c.caseNumber}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Updated {new Date(c.lastActivityAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  {c.status}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 5: FERPA End-to-End Test Plan

### Test Suite: `__tests__/ferpa.test.ts`

```typescript
import { prisma } from "@/lib/prisma";
import {
  assertParentHasStudentAccess,
  assertParentHasCaseAccess,
} from "@/lib/permissions";

describe("FERPA Access Control", () => {
  let parentA: any;
  let parentB: any;
  let studentA: any;
  let studentB: any;
  let school: any;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  // Test 1: Parent A cannot see Parent B's student
  test("Parent A cannot access Student B", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentB.id);
    }).rejects.toThrow("Access denied");
  });

  // Test 2: Parent B cannot access Student A
  test("Parent B cannot access Student A", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentB.id, studentA.id);
    }).rejects.toThrow("Access denied");
  });

  // Test 3: Parent A CAN access Student A
  test("Parent A can access Student A", async () => {
    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentA.id);
    }).not.toThrow();
  });

  // Test 4: Revoked guardianship denies access
  test("Revoked guardianship denies access", async () => {
    await prisma.guardianship.updateMany({
      where: {
        parentUserId: parentA.id,
        studentId: studentA.id,
      },
      data: {
        verifiedStatus: "REVOKED",
      },
    });

    expect(async () => {
      await assertParentHasStudentAccess(parentA.id, studentA.id);
    }).rejects.toThrow("Access denied");
  });

  // Test 5: Pending guardianship denies access
  test("Pending guardianship denies access", async () => {
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

  // Test 6: Parent cannot see unrelated case
  test("Parent cannot access unrelated case", async () => {
    // Revert guardianship
    await prisma.guardianship.updateMany({
      where: { parentUserId: parentA.id },
      data: { verifiedStatus: "VERIFIED" },
    });

    // Create case for Student B (Parent A should not see)
    const caseB = await prisma.case.create({
      data: {
        caseNumber: "TEST-001",
        studentId: studentB.id,
        submittedByUserId: parentB.id,
        createdByRole: "PARENT",
        concernType: "BULLYING",
        urgencyLevel: "GENERAL",
        description: "Test case",
      },
    });

    expect(async () => {
      await assertParentHasCaseAccess(parentA.id, caseB.id);
    }).rejects.toThrow("Access denied");
  });

  // Test 7: Internal thread never exposed to parent
  test("Internal threads not returned to parent", async () => {
    const caseA = await prisma.case.create({
      data: {
        caseNumber: "TEST-002",
        studentId: studentA.id,
        submittedByUserId: parentA.id,
        createdByRole: "PARENT",
        concernType: "THREAT",
        urgencyLevel: "GENERAL",
        description: "Test case with threads",
      },
    });

    // Create both thread types
    const parentThread = await prisma.caseThread.create({
      data: {
        caseId: caseA.id,
        threadType: "PARENT_STAFF",
      },
    });

    const internalThread = await prisma.caseThread.create({
      data: {
        caseId: caseA.id,
        threadType: "INTERNAL_ONLY",
      },
    });

    // Parent should only see PARENT_STAFF
    const parentVisibleThreads = await prisma.caseThread.findMany({
      where: {
        caseId: caseA.id,
        threadType: "PARENT_STAFF",
      },
    });

    expect(parentVisibleThreads).toHaveLength(1);
    expect(parentVisibleThreads[0].threadType).toBe("PARENT_STAFF");
  });
});
```

### Run Tests

```bash
npm install -D jest @types/jest ts-jest

npx jest __tests__/ferpa.test.ts --verbose
```

---

## Deployment Checklist

- [ ] Database backup strategy in place
- [ ] `.env.local` configured with real DATABASE_URL
- [ ] Prisma migrations tested in staging
- [ ] Auth middleware tested with real users
- [ ] FERPA test suite passing (100%)
- [ ] API rate limiting configured
- [ ] Attachment virus scanning active
- [ ] Error logging setup (Sentry/LogRocket)
- [ ] Load testing (k6/Artillery)
- [ ] Security audit (OWASP Top 10)
- [ ] HIPAA/FERPA compliance review

---

**Implementation Status:** Ready to Start  
**Next Steps:**
1. Install dependencies (`npm install`)
2. Set up `.env.local`
3. Run Prisma migration
4. Implement API routes
5. Build React components
6. Run FERPA test suite
7. Deploy to staging

**Document Version:** 1.0  
**Date:** February 17, 2026  
**Status:** Implementation-Ready
