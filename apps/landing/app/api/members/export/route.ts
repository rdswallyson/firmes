import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      role: true,
      groupId: true,
      memberSince: true,
      birthDate: true,
      isActive: true,
    },
  });

  const header = "Nome,Email,Telefone,Status,Cargo,Membro desde\n";
  const rows = members.map((m) =>
    [
      `"${m.name}"`,
      `"${m.email ?? ""}"`,
      `"${m.phone ?? ""}"`,
      m.status,
      `"${m.role ?? ""}"`,
      m.memberSince ? new Date(m.memberSince).toLocaleDateString("pt-BR") : "",
    ].join(",")
  );

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="membros-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
