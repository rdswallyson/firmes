import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { prisma } from "@firmes/db";
import { getMaxChurches } from "../../lib/plans";
import { Plan } from "@firmes/db";

export default async function WhiteLabelPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.isWhiteLabel) {
    redirect("/dashboard");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: {
      id: true,
      name: true,
      plan: true,
      isWhiteLabel: true,
      maxChurches: true,
      resellerId: true,
    },
  });

  if (!tenant) {
    redirect("/dashboard");
  }

  const maxChurches = getMaxChurches(tenant.plan as Plan);
  const isUnlimited = maxChurches === Infinity;

  const subTenantsCount = await prisma.tenant.count({
    where: { resellerId: tenant.id },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Painel Revendedor — Plano {tenant.plan.replace("_", " ")}</h1>
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Visão Geral</h2>
        <ul>
          <li>
            <strong>White Label:</strong> {tenant.isWhiteLabel ? "Sim" : "Não"}
          </li>
          <li>
            <strong>Igrejas cadastradas:</strong> {subTenantsCount}
          </li>
          <li>
            <strong>Limite de igrejas:</strong>{" "}
            {isUnlimited ? "Ilimitado" : maxChurches}
          </li>
          {!isUnlimited && (
            <li>
              <strong>Slots disponíveis:</strong>{" "}
              {Math.max(0, maxChurches - subTenantsCount)}
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
