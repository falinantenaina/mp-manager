import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("03082022", 10);
  const employeePassword = await bcrypt.hash("Peddy123", 10);

  await prisma.user.upsert({
    where: { email: "mitsiky@michic.mg" },
    update: {},
    create: {
      name: "Mitsiky",
      email: "mitsiky@michic.mg",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "peddy@michic.mg" },
    update: {},
    create: {
      name: "Peddy",
      email: "peddy@michic.mg",
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  });

  console.log("✅ Seed terminé");
  console.log("Admin     → mitsiky@michic.mg     / 03082022");
  console.log("Employé   → peddy@michic.mg   / Peddy123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
