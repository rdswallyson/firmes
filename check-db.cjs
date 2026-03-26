const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ select: { email: true, name: true, isActive: true } });
  console.log("Users:", JSON.stringify(users, null, 2));
  if (users.length === 0) {
    console.log("\nNenhum usuario encontrado! Rode o seed.");
  }
}

main().catch(console.error).finally(() => p.$disconnect());
