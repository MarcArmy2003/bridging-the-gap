import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "parent@example.com",
      password: hashedPassword,
      firstName: "Test",
      lastName: "Parent",
      role: "PARENT",
    },
  });

  console.log("Seed user created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
