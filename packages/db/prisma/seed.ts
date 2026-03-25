import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── 1. Revendedor de teste (RUBI_STARTER) ──────────────────────────────
  const revendedor = await prisma.tenant.upsert({
    where: { slug: "revendedor-demo" },
    update: {},
    create: {
      name: "Revendedor Demo",
      slug: "revendedor-demo",
      plan: "RUBI_STARTER",
      isWhiteLabel: true,
      maxChurches: 5,
      primaryColor: "#1A3C6E",
      secondaryColor: "#C8922A",
    },
  });

  await prisma.user.upsert({
    where: { email: "revendedor@demo.com" },
    update: {},
    create: {
      name: "Revendedor Demo",
      email: "revendedor@demo.com",
      password: await bcrypt.hash("Revendedor@123", 10),
      role: "RESELLER",
      tenantId: revendedor.id,
    },
  });

  console.log("✅ Revendedor criado:", revendedor.slug);

  // ── 2. Igreja Betesda (FREE) ───────────────────────────────────────────
  const betesda = await prisma.tenant.upsert({
    where: { slug: "betesda" },
    update: {},
    create: {
      name: "Igreja Betesda",
      slug: "betesda",
      plan: "FREE",
      isWhiteLabel: false,
      maxChurches: 1,
      primaryColor: "#1A3C6E",
      secondaryColor: "#C8922A",
      resellerId: revendedor.id,
    },
  });

  console.log("✅ Tenant criado:", betesda.slug);

  // ── 3. Admin da Betesda ────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@betesda.com" },
    update: {},
    create: {
      name: "Admin Betesda",
      email: "admin@betesda.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
      tenantId: betesda.id,
    },
  });

  console.log("✅ Admin criado: admin@betesda.com / Admin@123");

  // ── 4. Grupos de células ───────────────────────────────────────────────
  const grupos = await Promise.all([
    prisma.group.upsert({
      where: { id: "grupo-alfa-betesda" },
      update: {},
      create: {
        id: "grupo-alfa-betesda",
        tenantId: betesda.id,
        name: "Célula Alfa",
        description: "Grupo de jovens adultos",
        meetingDay: "Quarta-feira",
        meetingTime: "19:30",
        isActive: true,
      },
    }),
    prisma.group.upsert({
      where: { id: "grupo-beta-betesda" },
      update: {},
      create: {
        id: "grupo-beta-betesda",
        tenantId: betesda.id,
        name: "Célula Esperança",
        description: "Grupo familiar",
        meetingDay: "Sexta-feira",
        meetingTime: "20:00",
        isActive: true,
      },
    }),
    prisma.group.upsert({
      where: { id: "grupo-gama-betesda" },
      update: {},
      create: {
        id: "grupo-gama-betesda",
        tenantId: betesda.id,
        name: "Célula Restauração",
        description: "Grupo de casais",
        meetingDay: "Sábado",
        meetingTime: "18:00",
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${grupos.length} grupos criados`);

  // ── 5. 10 membros fictícios ────────────────────────────────────────────
  const membros = [
    { name: "João Silva",        email: "joao@betesda.com",    phone: "(11) 98001-0001", groupId: grupos[0]!.id, role: "Líder",    status: "ACTIVE"   },
    { name: "Maria Souza",       email: "maria@betesda.com",   phone: "(11) 98001-0002", groupId: grupos[0]!.id, role: "Membro",   status: "ACTIVE"   },
    { name: "Pedro Oliveira",    email: "pedro@betesda.com",   phone: "(11) 98001-0003", groupId: grupos[1]!.id, role: "Diácono",  status: "ACTIVE"   },
    { name: "Ana Lima",          email: "ana@betesda.com",     phone: "(11) 98001-0004", groupId: grupos[1]!.id, role: "Membro",   status: "ACTIVE"   },
    { name: "Carlos Pereira",    email: "carlos@betesda.com",  phone: "(11) 98001-0005", groupId: grupos[2]!.id, role: "Líder",    status: "ACTIVE"   },
    { name: "Fernanda Costa",    email: "fernanda@betesda.com",phone: "(11) 98001-0006", groupId: grupos[2]!.id, role: "Membro",   status: "ACTIVE"   },
    { name: "Lucas Mendes",      email: null,                  phone: "(11) 98001-0007", groupId: grupos[0]!.id, role: "Membro",   status: "INACTIVE" },
    { name: "Juliana Rocha",     email: "juliana@betesda.com", phone: "(11) 98001-0008", groupId: null,          role: "Visitante",status: "ACTIVE"   },
    { name: "Rafael Alves",      email: "rafael@betesda.com",  phone: "(11) 98001-0009", groupId: grupos[1]!.id, role: "Presbítero",status: "ACTIVE"  },
    { name: "Tatiane Ferreira",  email: "tatiane@betesda.com", phone: "(11) 98001-0010", groupId: grupos[2]!.id, role: "Membro",   status: "ACTIVE"   },
  ];

  for (const m of membros) {
    await prisma.member.create({
      data: {
        tenantId: betesda.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        groupId: m.groupId,
        role: m.role,
        status: m.status,
        birthDate: new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        memberSince: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
      },
    });
  }

  console.log(`✅ ${membros.length} membros criados`);

  // ── 6. Lançamentos financeiros ─────────────────────────────────────────
  const financas = [
    { type: "RECEITA",  category: "Dízimos",    amount: 4500.00, description: "Dízimos do mês de Janeiro" },
    { type: "RECEITA",  category: "Ofertas",    amount: 1200.50, description: "Oferta culto domingo" },
    { type: "RECEITA",  category: "Doações",    amount: 800.00,  description: "Doação especial campanha" },
    { type: "DESPESA",  category: "Aluguel",    amount: 2000.00, description: "Aluguel do templo - Janeiro" },
    { type: "DESPESA",  category: "Utilities",  amount: 350.75,  description: "Conta de luz e água" },
  ];

  for (const f of financas) {
    await prisma.finance.create({
      data: {
        tenantId: betesda.id,
        type: f.type,
        category: f.category,
        amount: f.amount,
        description: f.description,
        date: new Date(2026, 0, Math.floor(Math.random() * 28) + 1),
      },
    });
  }

  console.log(`✅ ${financas.length} lançamentos financeiros criados`);

  // ── 7. Evento de teste ─────────────────────────────────────────────────
  await prisma.event.create({
    data: {
      tenantId: betesda.id,
      title: "Culto de Celebração",
      description: "Culto especial de aniversário da igreja",
      date: new Date(2026, 3, 19, 19, 0),
      location: "Templo Principal",
      isPublic: true,
    },
  });

  console.log("✅ Evento criado");
  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("─────────────────────────────────────");
  console.log("Login admin: admin@betesda.com / Admin@123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
