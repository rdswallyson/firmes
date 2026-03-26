require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

async function main() {
  const user = await p.user.findUnique({
    where: { email: "admin@firmes.com" },
    select: { password: true, isActive: true, tenant: { select: { isActive: true } } },
  });
  console.log("User found:", !!user);
  console.log("isActive:", user?.isActive);
  console.log("tenant isActive:", user?.tenant?.isActive);

  const match = await bcrypt.compare("Admin@2026", user.password);
  console.log("Password match:", match);
}

main().catch(console.error).finally(() => p.$disconnect());
