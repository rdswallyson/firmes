// Script de diagnóstico: confirma ADMIN, lista congregações/membros,
// cria usuários de teste PASTOR e MEMBRO. NÃO altera dados existentes.
const fs = require("fs");
const path = require("path");

// Carrega .env manualmente (DATABASE_URL etc.)
function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}
loadEnv(path.join(__dirname, "..", "packages", "db", ".env"));
loadEnv(path.join(__dirname, "..", ".env"));

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const report = {};

  // 1) ADMIN
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, name: true, tenantId: true },
    take: 5,
  });
  report.admins = admins;
  const tenantId = admins[0]?.tenantId;
  report.tenantId = tenantId;

  // 2) Congregações do tenant
  let congs = [];
  try {
    congs = await prisma.congregation.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true },
      take: 5,
    });
  } catch (e) { report.congError = e.message; }
  report.congregations = congs;
  const congId = congs[0]?.id;

  // 3) Um membro existente do tenant
  const member = await prisma.member.findFirst({
    where: { tenantId },
    select: { id: true, name: true },
  });
  report.sampleMember = member;

  // 4) Criar/atualizar PASTOR de teste
  const pastorEmail = "pastor@igrejabetesda.com";
  const pastorHash = await bcrypt.hash("Pastor@2026", 10);
  try {
    const existing = await prisma.user.findUnique({ where: { email: pastorEmail } });
    const dataP = {
      name: "Pastor Teste",
      email: pastorEmail,
      password: pastorHash,
      role: "PASTOR",
      tenantId,
      isActive: true,
    };
    if (congId) dataP.congregationId = congId;
    if (existing) {
      await prisma.user.update({ where: { email: pastorEmail }, data: dataP });
      report.pastor = { status: "atualizado", congId };
    } else {
      await prisma.user.create({ data: dataP });
      report.pastor = { status: "criado", congId };
    }
  } catch (e) { report.pastorError = e.message; }

  // 5) Criar/atualizar MEMBRO de teste (vinculado a member existente)
  const membroEmail = "membro@igrejabetesda.com";
  const membroHash = await bcrypt.hash("Membro@2026", 10);
  try {
    const existing = await prisma.user.findUnique({ where: { email: membroEmail } });
    const dataM = {
      name: member?.name || "Membro Teste",
      email: membroEmail,
      password: membroHash,
      role: "MEMBRO",
      tenantId,
      isActive: true,
    };
    if (member?.id) dataM.memberId = member.id;
    if (existing) {
      await prisma.user.update({ where: { email: membroEmail }, data: dataM });
      report.membro = { status: "atualizado", memberId: member?.id };
    } else {
      await prisma.user.create({ data: dataM });
      report.membro = { status: "criado", memberId: member?.id };
    }
  } catch (e) { report.membroError = e.message; }

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => { console.error("FATAL:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
