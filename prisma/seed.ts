import prisma from "../src/models/db";
import { hashPassword } from "../src/utils";

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@finance.com",
      password: await hashPassword("admin123"),
      name: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: "analyst@finance.com",
      password: await hashPassword("analyst123"),
      name: "Analyst User",
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: "viewer@finance.com",
      password: await hashPassword("viewer123"),
      name: "Viewer User",
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  console.log("Users created:", {
    admin: admin.id,
    analyst: analyst.id,
    viewer: viewer.id,
  });

  // Create sample financial records for analyst
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), 1);

  // Income records
  const incomeCategories = ["Salary", "Freelance", "Investment"];
  for (let i = 0; i < 3; i++) {
    await prisma.financialRecord.create({
      data: {
        userId: analyst.id,
        amount: 3000 + i * 500,
        type: "INCOME",
        category: incomeCategories[i],
        date: new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000),
        notes: `Monthly ${incomeCategories[i].toLowerCase()}`,
      },
    });
  }

  // Expense records
  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
  ];
  const expenses = [50, 25, 150, 40, 200];

  for (let i = 0; i < 15; i++) {
    const catIndex = i % expenseCategories.length;
    await prisma.financialRecord.create({
      data: {
        userId: analyst.id,
        amount: expenses[catIndex],
        type: "EXPENSE",
        category: expenseCategories[catIndex],
        date: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000),
        notes: `Sample expense for testing`,
      },
    });
  }

  // Create records for admin
  await prisma.financialRecord.create({
    data: {
      userId: admin.id,
      amount: 5000,
      type: "INCOME",
      category: "Salary",
      date: baseDate,
      notes: "Monthly salary",
    },
  });

  await prisma.financialRecord.create({
    data: {
      userId: admin.id,
      amount: 1500,
      type: "EXPENSE",
      category: "Bills & Utilities",
      date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000),
      notes: "Monthly bills",
    },
  });

  console.log("Sample financial records created");

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: admin.id,
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
