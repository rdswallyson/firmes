"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAVY = "#1A3C6E";

const MENU = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/superadmin/clientes", icon: Building2 },
  { label: "Metricas", href: "/superadmin/metricas", icon: TrendingUp },
];

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const logout = async () => {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin");
  };

  return (
    <div className="sa-root">
      <style>{`
        .sa-root { display: flex; height: 100vh; overflow: hidden; }
        .sa-sidebar { width: 260px; background: ${NAVY}; color: #fff; display: flex; flex-direction: column; flex-shrink: 0; }
        .sa-logo { padding: 20px 24px; font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .sa-menu { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4; }
        .sa-item { display: flex; align-items: center; gap: 10; padding: 10px 14px; border-radius: 10; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); text-decoration: none; transition: all .15s; cursor: pointer; border: none; background: none; width: 100%; }
        .sa-item:hover, .sa-item.active { background: rgba(255,255,255,0.1); color: #fff; }
        .sa-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
        .sa-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .sa-header { display: none; height: 56px; background: ${NAVY}; color: #fff; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
        .sa-main { flex: 1; overflow-y: auto; overflow-x: hidden; background: #F5F0EB; }

        @media (max-width: 1023px) {
          .sa-sidebar { display: none; }
          .sa-header { display: flex; }
        }

        .sa-drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 399; }
        .sa-drawer-overlay.open { display: block; }
        .sa-drawer { display: none; position: fixed; top: 0; left: 0; height: 100vh; width: 80vw; max-width: 300px; z-index: 400; background: ${NAVY}; flex-direction: column; transform: translateX(-100%); transition: transform .28s ease; }
        .sa-drawer.open { transform: translateX(0); }
        @media (max-width: 1023px) {
          .sa-drawer { display: flex; }
        }
      `}</style>

      {/* Overlay */}
      <div className={`sa-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />

      {/* Drawer mobile */}
      <div className={`sa-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="sa-logo">
          <Shield size={22} strokeWidth={1.5} />
          <span>Super Admin</span>
          <button onClick={() => setDrawerOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <nav className="sa-menu">
          {MENU.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}
              className={`sa-item ${isActive(item.href) ? "active" : ""}`}>
              <item.icon size={18} strokeWidth={1.5} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="sa-footer">
          <button onClick={logout} className="sa-item"><LogOut size={18} strokeWidth={1.5} /> Sair</button>
        </div>
      </div>

      {/* Sidebar desktop */}
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <Shield size={22} strokeWidth={1.5} />
          <span>Super Admin</span>
        </div>
        <nav className="sa-menu">
          {MENU.map(item => (
            <Link key={item.href} href={item.href}
              className={`sa-item ${isActive(item.href) ? "active" : ""}`}>
              <item.icon size={18} strokeWidth={1.5} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="sa-footer">
          <button onClick={logout} className="sa-item"><LogOut size={18} strokeWidth={1.5} /> Sair</button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="sa-content">
        <header className="sa-header">
          <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><Menu size={22} /></button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Super Admin</span>
          <div />
        </header>
        <main className="sa-main">{children}</main>
      </div>
    </div>
  );
}
