import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Admin1234!", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: hash, role: "ADMIN" },
    create: { email: "admin@example.com", passwordHash: hash, role: "ADMIN" },
  });

  console.log("admin-ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
