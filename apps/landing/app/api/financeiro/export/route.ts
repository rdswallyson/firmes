import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "@firmes/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const finances = await prisma.finance.findMany({
    where: { tenantId: session.tenantId, isActive: true },
    orderBy: { date: "desc" },
    select: {
      id: true, type: true, category: true, amount: true, description: true,
      date: true, memberName: true, reciboNum: true, createdAt: true,
    },
  });

  const header = "Data,Tipo,Categoria,Valor,Descrição,Membro,Recibo\n";
  const rows = finances.map((f) =>
    [
      new Date(f.date).toLocaleDateString("pt-BR"),
      f.type,
      f.category,
      f.amount.toFixed(2),
      `"${(f.description ?? "").replace(/"/g, '""')}"`,
      `"${f.memberName ?? ""}"`,
      f.reciboNum ?? "",
    ].join(",")
  );

  return new NextResponse(header + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financeiro-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
