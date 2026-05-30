"use client";

import Link from "next/link";

export default function ConfiguracoesPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", marginBottom: 24 }}>Configurações</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "Usuários e Permissões", href: "/configuracoes/usuarios", desc: "Gerencie quem tem acesso ao sistema" },
          { label: "Dados da Igreja", href: "/configuracoes/igreja", desc: "Nome, logo, endereço e contato" },
          { label: "Planos e Assinatura", href: "/white-label/planos", desc: "Veja seu plano atual e faça upgrade" },
          { label: "Integrações", href: "/configuracoes/integracoes", desc: "Stripe, WhatsApp, e-mail" },
          { label: "Backup e Exportação", href: "/configuracoes/backup", desc: "Exporte seus dados em CSV/PDF" },
          { label: "Notificações", href: "/configuracoes/notificacoes", desc: "Configure alertas e lembretes" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{item.label}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>{item.desc}</p>
            </div>
            <span style={{ fontSize: 20, color: "#9CA3AF" }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
