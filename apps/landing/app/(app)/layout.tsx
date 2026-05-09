import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { prisma } from "@firmes/db";
import { Sidebar } from "../components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      role: true,
      avatar: true,
      tenant: {
        select: {
          name: true,
          plan: true,
          isWhiteLabel: true,
          isActive: true,
        },
      },
    },
  });

  // Bloquear tenants suspensos (isActive = false)
  if (user?.tenant && user.tenant.isActive === false) {
    redirect("/plano-expirado");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        tenantName={user?.tenant?.name ?? "Igreja Firmes"}
        userName={user?.name ?? "Administrador"}
        userRole={user?.role ?? "ADMIN"}
        userAvatar={user?.avatar ?? undefined}
        userPlan={user?.tenant?.plan ?? "FREE"}
        isWhiteLabel={user?.tenant?.isWhiteLabel ?? false}
      />
      <main style={{ flex: 1, overflowY: "auto", background: "#F5F0EB" }}>
        {children}
      </main>
    </div>
  );
}
