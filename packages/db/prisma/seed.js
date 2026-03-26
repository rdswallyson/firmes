const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@2026", 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "igreja-firmes" },
    update: {},
    create: {
      name: "Igreja Firmes",
      slug: "igreja-firmes",
      plan: "FREE",
      isWhiteLabel: false,
      maxChurches: 1,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@firmes.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@firmes.com",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: tenant.id,
    },
  });

  console.log("Tenant criado:", tenant.id);
  console.log("Usuario criado:", user.id);
  console.log("");
  console.log("=================================");
  console.log("  CREDENCIAIS DE ACESSO");
  console.log("=================================");
  console.log("  Email: admin@firmes.com");
  console.log("  Senha: Admin@2026");
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
