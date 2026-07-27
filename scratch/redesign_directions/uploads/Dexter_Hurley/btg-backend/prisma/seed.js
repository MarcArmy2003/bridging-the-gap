require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.case.deleteMany({});
  await prisma.guardianship.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  const p1 = await bcrypt.hash("password123", 10);
  const p2 = await bcrypt.hash("password456", 10);
  const p3 = await bcrypt.hash("password789", 10);

  // Create Users
  const parentA = await prisma.user.create({
    data: {
      email: "parent.a@example.com",
      password: p1,
      firstName: "Parent",
      lastName: "A",
      role: "PARENT",
    },
  });

  const parentB = await prisma.user.create({
    data: {
      email: "parent.b@example.com",
      password: p2,
      firstName: "Parent",
      lastName: "B",
      role: "PARENT",
    },
  });

  const counselor = await prisma.user.create({
    data: {
      email: "counselor@example.com",
      password: p3,
      firstName: "School",
      lastName: "Counselor",
      role: "COUNSELOR",
    },
  });

  const sro = await prisma.user.create({
    data: {
      email: "sro@example.com",
      password: p3,
      firstName: "Officer",
      lastName: "Smith",
      role: "SRO",
    },
  });

  // Create Students
  const student1 = await prisma.student.create({
    data: {
      firstName: "Emma",
      lastName: "Johnson",
      dateOfBirth: new Date("2010-05-15"),
      gradeLevel: 8,
      studentId: "STU001",
      isActive: true,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      firstName: "Liam",
      lastName: "Williams",
      dateOfBirth: new Date("2011-08-22"),
      gradeLevel: 7,
      studentId: "STU002",
      isActive: true,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      firstName: "Sophia",
      lastName: "Davis",
      dateOfBirth: new Date("2009-12-03"),
      gradeLevel: 9,
      studentId: "STU003",
      isActive: true,
    },
  });

  // Create Guardianships (FERPA relationships)
  await prisma.guardianship.create({
    data: {
      userId: parentA.id,
      studentId: student1.id,
      relationshipType: "parent",
      ferpaConsent: true,
      emergencyContact: true,
    },
  });

  await prisma.guardianship.create({
    data: {
      userId: parentA.id,
      studentId: student2.id,
      relationshipType: "parent",
      ferpaConsent: true,
      emergencyContact: true,
    },
  });

  await prisma.guardianship.create({
    data: {
      userId: parentB.id,
      studentId: student3.id,
      relationshipType: "guardian",
      ferpaConsent: false, // No FERPA consent yet
      emergencyContact: true,
    },
  });

  // Create Cases
  await prisma.case.create({
    data: {
      studentId: student1.id,
      assigneeId: counselor.id,
      title: "Academic Support Needed",
      description: "Student struggling with math, needs tutoring support",
      status: "IN_PROGRESS",
      severity: "MEDIUM",
      isConfidential: false,
    },
  });

  await prisma.case.create({
    data: {
      studentId: student2.id,
      assigneeId: sro.id,
      title: "Attendance Issue",
      description: "Multiple unexcused absences this semester",
      status: "OPEN",
      severity: "HIGH",
      isConfidential: false,
    },
  });

  await prisma.case.create({
    data: {
      studentId: student3.id,
      assigneeId: counselor.id,
      title: "Sensitive Family Matter",
      description: "Confidential counseling session required",
      status: "OPEN",
      severity: "CRITICAL",
      isConfidential: true, // Extra privacy protection
    },
  });

  console.log("✅ Seeded successfully.");
  console.log("📊 Created:");
  console.log("  - 4 Users (2 Parents, 1 Counselor, 1 SRO)");
  console.log("  - 3 Students");
  console.log("  - 3 Guardianships (FERPA relationships)");
  console.log("  - 3 Cases");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
