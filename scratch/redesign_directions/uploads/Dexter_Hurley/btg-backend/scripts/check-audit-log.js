require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const violations = await prisma.auditLog.findMany({
    where: { action: "FERPA_VIOLATION" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log("\n=== FERPA Violation Audit Log ===\n");
  console.log(`Total violations found: ${violations.length}\n`);
  
  violations.forEach((v, i) => {
    console.log(`${i + 1}. ${v.reasonCode}`);
    console.log(`   Entity: ${v.entityType}/${v.entityId}`);
    console.log(`   Actor: ${v.actorUserId || 'Unknown'}`);
    console.log(`   Time: ${v.createdAt.toISOString()}`);
    console.log(`   Message: ${v.message}`);
    console.log("");
  });

  if (violations.length === 0) {
    console.log("No FERPA violations recorded yet.");
    console.log("Run the tests in VERIFICATION.md to generate audit logs.\n");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
