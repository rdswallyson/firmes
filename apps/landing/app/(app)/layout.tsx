import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { prisma } from "@firmes/db";
import { AppShell } from "../components/AppShell";

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

  if (user?.tenant && user.tenant.isActive === false) {
    redirect("/plano-expirado");
  }

  return (
    <AppShell
      tenantName={user?.tenant?.name ?? "Igreja Firmes"}
      userName={user?.name ?? "Administrador"}
      userRole={user?.role ?? "ADMIN"}
      userAvatar={user?.avatar ?? undefined}
      userPlan={user?.tenant?.plan ?? "FREE"}
      isWhiteLabel={user?.tenant?.isWhiteLabel ?? false}
    >
      {children}
    </AppShell>
  );
}
