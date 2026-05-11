"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader, DrawerOverlay } from "./MobileHeader";
import { usePathname } from "next/navigation";
import { SkeletonStyles } from "./Skeleton";

interface AppShellProps {
  tenantName?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  userPlan?: string;
  isWhiteLabel?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  tenantName,
  userName,
  userRole,
  userAvatar,
  userPlan,
  isWhiteLabel,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detectar breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fechar drawer ao navegar
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Swipe para fechar
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - (e.changedTouches[0]?.clientX ?? 0);
    if (dx > 60) setDrawerOpen(false); // swipe esquerda = fechar
    touchStartX.current = null;
  }, []);

  return (
    <>
      <SkeletonStyles />

      {/* CSS responsivo via style tag */}
      <style>{`
        .app-main {
          flex: 1;
          overflow-y: auto;
          background: #F5F0EB;
          min-height: 100vh;
        }
        @media (max-width: 767px) {
          .app-main {
            padding-top: 0;
          }
          .app-sidebar-desktop { display: none !important; }
          .app-mobile-header   { display: flex !important; }
          .app-mobile-drawer   { display: flex !important; }
        }
        @media (min-width: 768px) {
          .app-mobile-header { display: none !important; }
          .app-mobile-drawer { display: none !important; }
          .app-sidebar-desktop { display: flex !important; }
        }
        /* Tables → cards no mobile */
        @media (max-width: 767px) {
          .responsive-table thead { display: none; }
          .responsive-table tbody tr {
            display: block;
            margin-bottom: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 12px 16px;
            background: #fff;
          }
          .responsive-table tbody td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border: none;
            font-size: 13px;
          }
          .responsive-table tbody td::before {
            content: attr(data-label);
            font-weight: 700;
            color: #6B7280;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
        }
        /* Grid responsivo */
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 1023px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 767px)  { .grid-4 { grid-template-columns: 1fr; } }

        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 767px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar desktop */}
        <div className="app-sidebar-desktop">
          <Sidebar
            tenantName={tenantName}
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
            userPlan={userPlan}
            isWhiteLabel={isWhiteLabel}
          />
        </div>

        {/* Overlay quando drawer aberto */}
        {drawerOpen && isMobile && <DrawerOverlay onClose={() => setDrawerOpen(false)} />}

        {/* Drawer mobile */}
        <div
          className="app-mobile-drawer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 300,
            transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
            flexDirection: "column",
            pointerEvents: drawerOpen ? "auto" : "none",
          }}
        >
          <Sidebar
            tenantName={tenantName}
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
            userPlan={userPlan}
            isWhiteLabel={isWhiteLabel}
            forceExpanded
            onNavigate={() => setDrawerOpen(false)}
          />
        </div>

        {/* Conteúdo principal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Header mobile */}
          <div className="app-mobile-header" style={{ display: "none" }}>
            <MobileHeader
              tenantName={tenantName}
              onMenuOpen={() => setDrawerOpen(true)}
            />
          </div>

          <main className="app-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
