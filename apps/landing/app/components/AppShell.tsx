"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
// DrawerOverlay foi movido para dentro do AppShell (div.app-drawer-overlay)
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
  const pathname = usePathname();

  // Fechar drawer ao navegar
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Bloquear scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Swipe para abrir (da esquerda) e fechar (para a esquerda)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const dy = Math.abs((e.changedTouches[0]?.clientY ?? 0) - (touchStartY.current ?? 0));
    // Só processar swipes horizontais (dy < 40)
    if (dy < 40) {
      if (!drawerOpen && dx > 60 && (touchStartX.current ?? 0) < 40) {
        setDrawerOpen(true); // swipe direita da borda = abrir
      }
      if (drawerOpen && dx < -60) {
        setDrawerOpen(false); // swipe esquerda = fechar
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [drawerOpen]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <>
      <SkeletonStyles />

      <style>{`
        /* ── Layout base ─────────────────────────── */
        .app-root { display: flex; height: 100vh; overflow: hidden; }

        .app-sidebar-desktop { display: flex; flex-shrink: 0; }
        .app-mobile-header   { display: none; position: sticky; top: 0; z-index: 200; }
        .app-content-wrap    { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .app-main            { flex: 1; overflow-y: auto; overflow-x: hidden; background: #F5F0EB; }

        /* Drawer overlay */
        .app-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 399;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .app-drawer-overlay.open {
          display: block;
          opacity: 1;
          pointer-events: auto;
        }

        /* Drawer container */
        .app-mobile-drawer {
          display: none;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: 80vw;
          max-width: 300px;
          z-index: 400;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
          flex-direction: column;
          box-shadow: 4px 0 32px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .app-mobile-drawer.open {
          transform: translateX(0);
          pointer-events: auto;
        }

        /* ── Mobile (<768px) ─────────────────────── */
        @media (max-width: 767px) {
          .app-sidebar-desktop { display: none !important; }
          .app-mobile-header   { display: flex !important; }
          .app-mobile-drawer   { display: flex !important; }
          .app-main            { padding-top: 0; }
        }

        /* ── Responsive tables → cards ───────────── */
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
            padding: 5px 0;
            border: none !important;
            font-size: 14px;
            min-height: 0;
          }
          .responsive-table tbody td::before {
            content: attr(data-label);
            font-weight: 700;
            color: #6B7280;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            flex-shrink: 0;
            margin-right: 8px;
          }
        }
      `}</style>

      <div className="app-root">
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

        {/* Overlay do drawer */}
        <div
          className={`app-drawer-overlay${drawerOpen ? " open" : ""}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer mobile */}
        <div className={`app-mobile-drawer${drawerOpen ? " open" : ""}`}>
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
        <div className="app-content-wrap">
          {/* Header mobile — sticky 56px */}
          <div className="app-mobile-header">
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
