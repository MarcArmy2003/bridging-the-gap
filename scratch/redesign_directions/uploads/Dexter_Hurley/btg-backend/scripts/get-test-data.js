require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const parentA = await prisma.user.findUnique({ where: { email: "parent.a@example.com" } });
  const parentB = await prisma.user.findUnique({ where: { email: "parent.b@example.com" } });
  
  const students = await prisma.student.findMany({ 
    include: { 
      guardianships: true, 
      cases: true 
    } 
  });
  
  console.log("\n=== FERPA Test Data ===\n");
  console.log("Parent A:", parentA?.id);
  console.log("Parent B:", parentB?.id);
  console.log("\nStudents:");
  students.forEach(s => {
    const guardian = s.guardianships[0];
    console.log(`\n${s.firstName} ${s.lastName}:`);
    console.log(`  ID: ${s.id}`);
    console.log(`  Guardian: ${guardian?.userId === parentA?.id ? 'Parent A' : 'Parent B'}`);
    console.log(`  FERPA Consent: ${guardian?.ferpaConsent}`);
    if (s.cases.length > 0) {
      s.cases.forEach(c => {
        console.log(`  Case ${c.id}:`);
        console.log(`    Title: ${c.title}`);
        console.log(`    Confidential: ${c.isConfidential}`);
      });
    }
  });
  console.log("\n");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
