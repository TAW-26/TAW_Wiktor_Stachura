import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");

  // 1. Delete all reservations
  const deletedReservations = await prisma.reservation.deleteMany();
  console.log(`Deleted ${deletedReservations.count} reservations.`);

  // 2. Delete all users except admin@example.com
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@example.com",
      },
    },
  });
  console.log(`Deleted ${deletedUsers.count} test users.`);

  // 3. Ensure admin@example.com exists and is configured
  const adminPassword = "Admin1234!";
  const hash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: hash, role: "ADMIN" },
    create: { email: "admin@example.com", passwordHash: hash, role: "ADMIN" },
  });
  console.log(`Admin account ensured: ${admin.email} (role: ${admin.role})`);

  // 4. Delete all facilities
  const deletedFacilities = await prisma.facility.deleteMany();
  console.log(`Deleted ${deletedFacilities.count} existing facilities.`);

  // 5. Seed clean sports facilities
  const facilitiesData = [
    {
      name: "Orlik (Boisko do Piłki Nożnej)",
      description: "Nowoczesne boisko ze sztuczną nawierzchnią i oświetleniem, idealne do gry w piłkę nożną 6-osobową.",
      openTime: "08:00",
      closeTime: "22:00",
    },
    {
      name: "Kort Tenisowy Miejski",
      description: "Profesjonalny kort o mączkowej nawierzchni z możliwością wypożyczenia rakiet na miejscu.",
      openTime: "07:00",
      closeTime: "21:00",
    },
    {
      name: "Hala Widowiskowo-Sportowa",
      description: "Wielofunkcyjna hala przystosowana do koszykówki, siatkówki oraz piłki ręcznej.",
      openTime: "06:00",
      closeTime: "23:00",
    },
    {
      name: "Boisko do Siatkówki Plażowej",
      description: "Piaszczyste boisko położone w parku miejskim, idealne na letnie rozgrywki.",
      openTime: "09:00",
      closeTime: "20:00",
    },
  ];

  for (const facility of facilitiesData) {
    const f = await prisma.facility.create({ data: facility });
    console.log(`Created facility: ${f.name} (${f.openTime}-${f.closeTime})`);
  }

  // 6. Clean up temporary test files and logs
  console.log("Cleaning up logs and test files...");
  const logsDir = path.join(process.cwd(), "logs");
  if (fs.existsSync(logsDir)) {
    const logFiles = fs.readdirSync(logsDir);
    for (const file of logFiles) {
      if (file.endsWith(".log")) {
        fs.unlinkSync(path.join(logsDir, file));
        console.log(`Deleted log file: logs/${file}`);
      }
    }
  }

  console.log("Database cleanup and production seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Cleanup error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
