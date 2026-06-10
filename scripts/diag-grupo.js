const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({ log: ["query"] });

async function main() {
  const tenantId = process.argv[2];
  if (!tenantId) {
    console.log("Uso: node scripts/diag-grupo.js <tenantId>");
    process.exit(1);
  }

  console.log("Tentando criar grupo com tenantId:", tenantId);

  try {
    const grupo = await prisma.group.create({
      data: {
        tenantId,
        name: "Grupo Teste Script",
      },
    });
    console.log("✅ Grupo criado:", grupo);
  } catch (error) {
    console.error("❌ ERRO ao criar grupo:");
    console.error(error.message);
    console.error("\nCódigo:", error.code);
    console.error("Meta:", error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

main();
