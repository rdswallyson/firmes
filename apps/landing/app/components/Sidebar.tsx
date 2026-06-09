"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Cake,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  UserX,
  Users2,
  PlusCircle,
  ClipboardList,
  BarChart2,
  AlertCircle,
  Trophy,
  DollarSign,
  ArrowLeftRight,
  Landmark,
  HandCoins,
  Target,
  Smartphone,
  Receipt,
  FileBarChart,
  Package,
  Boxes,
  Tag,
  MapPin,
  Wrench,
  Calendar,
  CalendarPlus,
  Ticket,
  UserCheck,
  Banknote,
  PieChart,
  CheckSquare,
  CalendarCheck,
  Church,
  SquarePlus,
  ScanLine,
  ScrollText,
  UserRoundCheck,
  TrendingUp,
  Music,
  Volume2,
  DoorOpen,
  Baby,
  Clock,
  History,
  Activity,
  Megaphone,
  PlusSquare,
  Image,
  Video,
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  School,
  MessageSquare,
  Mail,
  MessageCircle,
  Heart,
  Send,
  Palette,
  Globe,
  Wallet,
  ShoppingBag,
  Settings,
  Shield,
  Bell,
  Key,
  Plug,
  Crown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  X,
} from "lucide-react";

interface SubItem {
  label: string;
  href: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  isGold?: boolean;
  children?: SubItem[];
}

interface SectionGroup {
  section?: string;
  items: MenuItem[];
}

const MENU: SectionGroup[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
        href: "/dashboard",
      },
    ],
  },
  {
    section: "MEMBROS",
    items: [
      {
        id: "pessoas",
        label: "Pessoas",
        icon: <Users size={18} strokeWidth={1.5} />,
        children: [
          { label: "Todos os membros", href: "/pessoas" },
          { label: "Novo cadastro", href: "/pessoas/novo" },
          { label: "Aniversariantes", href: "/pessoas/aniversariantes" },
          { label: "Cartão digital", href: "/pessoas" },
          { label: "Auto-cadastro público", href: "/cadastro/membro" },
          { label: "Importar via Excel", href: "/pessoas/importar" },
          { label: "Inativos / Ausentes", href: "/pessoas/inativos" },
        ],
      },
      {
        id: "grupos",
        label: "Grupos & Células",
        icon: <Users2 size={18} strokeWidth={1.5} />,
        children: [
          { label: "Todos os grupos", href: "/grupos" },
          { label: "Novo grupo", href: "/grupos/novo" },
          { label: "Registrar frequência", href: "/grupos/frequencia" },
          { label: "Relatório de presença", href: "/grupos/relatorio" },
          { label: "Grupos sem líder", href: "/grupos/sem-lider" },
          { label: "Ranking de células", href: "/grupos/ranking" },
        ],
      },
      {
        id: "congregacoes",
        label: "Congregações",
        icon: <Church size={18} strokeWidth={1.5} />,
        children: [
          { label: "Todas as congregações", href: "/congregacoes" },
          { label: "Nova congregação", href: "/congregacoes/novo" },
        ],
      },
    ],
  },
  {
    section: "GESTÃO",
    items: [
      {
        id: "financeiro",
        label: "Financeiro",
        icon: <DollarSign size={18} strokeWidth={1.5} />,
        children: [
          { label: "Visão geral", href: "/financeiro" },
          { label: "Lançamentos", href: "/financeiro/lancamentos" },
          { label: "Contas bancárias", href: "/financeiro/contas" },
          { label: "Dizimistas", href: "/financeiro/dizimistas" },
          { label: "Metas financeiras", href: "/financeiro/metas" },
          { label: "Dízimo online — PIX", href: "/financeiro/dizimos" },
          { label: "Recibos emitidos", href: "/financeiro/recibos" },
          { label: "Relatórios PDF/CSV", href: "/financeiro/relatorios" },
        ],
      },
      {
        id: "patrimonio",
        label: "Patrimônio",
        icon: <Package size={18} strokeWidth={1.5} />,
        children: [
          { label: "Inventário de bens", href: "/patrimonio" },
          { label: "Cadastrar bem", href: "/patrimonio/novo" },
          { label: "Categorias", href: "/patrimonio/categorias" },
          { label: "Localização física", href: "/patrimonio/localizacao" },
          { label: "Histórico de manutenção", href: "/patrimonio/manutencao" },
        ],
      },
      {
        id: "vendas",
        label: "Vendas",
        icon: <ShoppingBag size={18} strokeWidth={1.5} />,
        children: [
          { label: "PDV", href: "/vendas/pdv" },
          { label: "Produtos", href: "/vendas/produtos" },
          { label: "Pedidos", href: "/vendas/pedidos" },
          { label: "Cupons", href: "/vendas/cupons" },
        ],
      },
    ],
  },
  {
    section: "PROGRAMAÇÃO",
    items: [
      {
        id: "eventos",
        label: "Eventos",
        icon: <Calendar size={18} strokeWidth={1.5} />,
        children: [
          { label: "Calendário", href: "/eventos" },
          { label: "Novo evento", href: "/eventos/novo" },
          { label: "Inscrições abertas", href: "/eventos/inscricoes" },
          { label: "Lista de espera", href: "/eventos/espera" },
          { label: "Check-in do evento", href: "/eventos/checkin" },
          { label: "Eventos pagos", href: "/eventos/pagos" },
          { label: "Relatório pós-evento", href: "/eventos/relatorio" },
        ],
      },
      {
        id: "cultos",
        label: "Cultos & Check-in",
        icon: <CalendarCheck size={18} strokeWidth={1.5} />,
        children: [
          { label: "Culto de hoje", href: "/cultos" },
          { label: "Novo culto", href: "/cultos/novo" },
          { label: "QR Code de entrada", href: "/cultos/qrcode" },
          { label: "Lista de presença", href: "/cultos/presenca" },
          { label: "Membros × Visitantes", href: "/cultos/visitantes" },
          { label: "Relatório de faltas", href: "/cultos/faltas" },
          { label: "Histórico de frequência", href: "/cultos/historico" },
          { label: "Análise de assiduidade", href: "/cultos/analise" },
        ],
      },
      {
        id: "escalas",
        label: "Escalas de Ministério",
        icon: <Music size={18} strokeWidth={1.5} />,
        children: [
          { label: "Todas as escalas", href: "/escalas" },
          { label: "Nova escala", href: "/escalas/novo" },
          { label: "Confirmações pendentes", href: "/escalas/confirmacoes" },
        ],
      },
    ],
  },
  {
    section: "CONTEÚDO",
    items: [
      {
        id: "midias",
        label: "Mídias & Avisos",
        icon: <Megaphone size={18} strokeWidth={1.5} />,
        children: [
          { label: "Mural de avisos", href: "/avisos" },
          { label: "Novo aviso", href: "/avisos/novo" },
          { label: "Biblioteca de mídias", href: "/midias" },
          { label: "Galeria de fotos", href: "/midias/fotos" },
          { label: "Álbuns de vídeo", href: "/midias/videos" },
          { label: "Documentos / PDFs", href: "/midias/documentos" },
          { label: "Certificados", href: "/midias/certificados" },
        ],
      },
      {
        id: "ensino",
        label: "Ensino & Discipulado",
        icon: <BookOpen size={18} strokeWidth={1.5} />,
        children: [
          { label: "Catálogo de estudos", href: "/ensino" },
          { label: "Novo estudo", href: "/ensino/novo" },
          { label: "Discipulados ativos", href: "/ensino/discipulados" },
          { label: "Escolas e turmas", href: "/ensino/escolas" },
          { label: "Categorias", href: "/ensino/categorias" },
          { label: "Certificados emitidos", href: "/ensino/certificados" },
        ],
      },
      {
        id: "comunicacao",
        label: "Comunicação",
        icon: <MessageSquare size={18} strokeWidth={1.5} />,
        children: [
          { label: "Mensagem em massa", href: "/comunicacao" },
          { label: "E-mail em massa", href: "/comunicacao/email" },
          { label: "WhatsApp em massa", href: "/comunicacao/whatsapp" },
          { label: "Parabéns automático", href: "/comunicacao/aniversario" },
          { label: "Lembrete de ausentes", href: "/comunicacao/ausentes" },
          { label: "Histórico de envios", href: "/comunicacao/historico" },
        ],
      },
    ],
  },
  {
    section: "SISTEMA",
    items: [
      {
        id: "whitelabel",
        label: "White Label Esmeralda",
        icon: <Crown size={18} strokeWidth={1.5} />,
        isGold: true,
        children: [
          { label: "Minhas igrejas", href: "/white-label" },
          { label: "Criar nova igreja", href: "/white-label/igrejas/nova" },
          { label: "Editor de marca ao vivo", href: "/white-label/personalizar" },
          { label: "Domínio personalizado", href: "/white-label/personalizar" },
          { label: "Faturamento Esmeralda", href: "/white-label/planos" },
          { label: "Material de vendas", href: "/white-label" },
        ],
      },
      {
        id: "configuracoes",
        label: "Configurações",
        icon: <Settings size={18} strokeWidth={1.5} />,
        children: [
          { label: "Perfil da igreja", href: "/configuracoes" },
          { label: "Usuários e permissões", href: "/configuracoes/usuarios" },
          { label: "Meu plano", href: "/configuracoes/plano" },
          { label: "Chave PIX", href: "/configuracoes/pix" },
          { label: "Notificações", href: "/configuracoes/notificacoes" },
          { label: "Segurança (2FA)", href: "/configuracoes/seguranca" },
          { label: "Integrações", href: "/configuracoes/integracoes" },
        ],
      },
      {
        id: "superadmin",
        label: "Super Admin",
        icon: <Shield size={18} strokeWidth={1.5} />,
        isGold: true,
        href: "/superadmin",
      },
    ],
  },
];

interface SidebarProps {
  tenantName?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  userPlan?: string;
  isWhiteLabel?: boolean;
  forceExpanded?: boolean;
  /** Chamado ao clicar em qualquer link — usado para fechar drawer */
  onNavigate?: () => void;
}

export function Sidebar({
  tenantName = "Igreja Firmes",
  userName = "Administrador",
  userRole = "ADMIN",
  userAvatar,
  userPlan = "FREE",
  isWhiteLabel = false,
  forceExpanded = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isEsmeralda = isWhiteLabel || (userPlan?.startsWith("ESMERALDA") ?? false);
  const [collapsed, setCollapsed] = useState(false);
  const effectiveCollapsed = forceExpanded ? false : collapsed;
  const [openMenu, setOpenMenu] = useState<string | null>("dashboard");

  // No drawer (forceExpanded), a sidebar ocupa 100% do container
  const sidebarWidth = forceExpanded ? "100%" : (effectiveCollapsed ? 72 : 260);

  // Padding e altura dos itens — maior no drawer para touch confortável
  const itemPad = forceExpanded
    ? "0.9rem 1.25rem"
    : (effectiveCollapsed ? "0.7rem 0" : "0.7rem 1rem");
  const itemMinH = forceExpanded ? 56 : undefined;
  const subItemPad = forceExpanded ? "0.7rem 1.25rem 0.7rem 3.25rem" : "0.5rem 1rem 0.5rem 2.75rem";
  const subItemMinH = forceExpanded ? 48 : undefined;

  function handleNavigate(href: string) {
    onNavigate?.();
    router.push(href);
  }

  function toggleMenu(id: string) {
    setOpenMenu((prev) => (prev === id ? null : id));
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const goldColor = "#C8922A";

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        background: "#1A3C6E",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{
        padding: effectiveCollapsed ? "1.25rem 0" : "1.25rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: effectiveCollapsed ? "center" : "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
        minHeight: forceExpanded ? 64 : undefined,
      }}>
        {!effectiveCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", overflow: "hidden" }}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: "rgba(200,146,42,0.2)",
              border: "1px solid rgba(200,146,42,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="40" height="6" rx="3" fill="white"/>
                <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
                <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A"/>
                <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
                <rect x="4" y="38" width="40" height="6" rx="3" fill="white"/>
              </svg>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 900, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-nunito), sans-serif" }}>
                {tenantName}
              </div>
              <div style={{ color: "#C8922A", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
                GESTÃO PARA IGREJAS
              </div>
            </div>
          </motion.div>
        )}
        {effectiveCollapsed && (
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "rgba(200,146,42,0.2)",
            border: "1px solid rgba(200,146,42,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="6" rx="3" fill="white"/>
              <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
              <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A"/>
              <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
              <rect x="4" y="38" width="40" height="6" rx="3" fill="white"/>
            </svg>
          </div>
        )}

        {/* Botão fechar (X) — só no drawer mobile */}
        {forceExpanded && (
          <button
            onClick={() => onNavigate?.()}
            aria-label="Fechar menu"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.8)",
              flexShrink: 0,
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0.5rem 0", scrollbarWidth: "none" }}>
        {MENU.map((group, gi) => (
          <div key={gi}>
            {group.section && !effectiveCollapsed && (
              <div style={{
                padding: forceExpanded ? "1rem 1.25rem 0.3rem" : "0.875rem 1rem 0.25rem",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
              }}>
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              // Ocultar White Label para planos não-Esmeralda
              if (item.id === "whitelabel" && !isEsmeralda) return null;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenu === item.id;
              const active = item.href ? isActive(item.href) : false;

              if (!hasChildren && item.href) {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNavigate(item.href!)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") handleNavigate(item.href!); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: itemPad,
                      minHeight: itemMinH,
                      justifyContent: effectiveCollapsed ? "center" : "flex-start",
                      cursor: "pointer",
                      position: "relative",
                      background: active ? "rgba(255,255,255,0.08)" : "transparent",
                      transition: "background 0.15s",
                      margin: "1px 0",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "rgba(255,255,255,0.08)" : "transparent"; }}
                  >
                    {active && (
                      <motion.div
                        layoutId="indicator"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "3px",
                          background: goldColor,
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    )}
                    <span style={{ color: item.isGold ? goldColor : active ? "white" : "rgba(255,255,255,0.7)", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!effectiveCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            color: item.isGold ? goldColor : active ? "white" : "rgba(255,255,255,0.75)",
                            fontSize: forceExpanded ? "0.9rem" : "0.8375rem",
                            fontWeight: active ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <div key={item.id}>
                  <motion.div
                    onClick={() => !effectiveCollapsed && toggleMenu(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: itemPad,
                      minHeight: itemMinH,
                      justifyContent: effectiveCollapsed ? "center" : "flex-start",
                      cursor: "pointer",
                      background: isOpen ? "rgba(255,255,255,0.06)" : "transparent",
                      transition: "background 0.15s",
                      margin: "1px 0",
                    }}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isOpen ? "rgba(255,255,255,0.06)" : "transparent"; }}
                  >
                    <span style={{ color: item.isGold ? goldColor : isOpen ? "white" : "rgba(255,255,255,0.7)", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!effectiveCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            flex: 1,
                            color: item.isGold ? goldColor : isOpen ? "white" : "rgba(255,255,255,0.75)",
                            fontSize: forceExpanded ? "0.9rem" : "0.8375rem",
                            fontWeight: isOpen ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!effectiveCollapsed && (
                      <motion.span
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, display: "flex" }}
                      >
                        <ChevronRight size={14} strokeWidth={2} />
                      </motion.span>
                    )}
                  </motion.div>

                  <AnimatePresence initial={false}>
                    {isOpen && !effectiveCollapsed && item.children && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ overflow: "hidden", background: "rgba(0,0,0,0.12)" }}
                      >
                        {item.children.map((sub) => {
                          const subActive = isActive(sub.href);
                          return (
                            <div
                              key={sub.href}
                              onClick={() => handleNavigate(sub.href)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter") handleNavigate(sub.href); }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: subItemPad,
                                minHeight: subItemMinH,
                                cursor: "pointer",
                                background: subActive ? "rgba(200,146,42,0.1)" : "transparent",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => { if (!subActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                              onMouseLeave={(e) => { if (!subActive) e.currentTarget.style.background = "transparent"; }}
                            >
                              {subActive && (
                                <div style={{
                                  width: "5px", height: "5px", borderRadius: "50%",
                                  background: "#C8922A", flexShrink: 0,
                                }} />
                              )}
                              {!subActive && <div style={{ width: "5px", flexShrink: 0 }} />}
                              <span style={{
                                color: subActive ? "#C8922A" : "rgba(255,255,255,0.6)",
                                fontSize: forceExpanded ? "0.875rem" : "0.8rem",
                                fontWeight: subActive ? 500 : 400,
                              }}>
                                {sub.label}
                              </span>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: effectiveCollapsed ? "0.875rem 0" : "0.875rem 1rem", flexShrink: 0 }}>
        {!effectiveCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: userAvatar ? `url(${userAvatar}) center/cover` : "rgba(200,146,42,0.3)",
              border: "1.5px solid rgba(200,146,42,0.5)",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#C8922A", fontSize: "0.875rem", fontWeight: 700,
            }}>
              {!userAvatar && userName.charAt(0)}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ color: "white", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userName}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>
                {userRole}
              </div>
            </div>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "2px", display: "flex" }}
              title="Sair"
            >
              <LogOut size={15} strokeWidth={1.5} />
            </button>
          </div>
        )}
        {/* Botão colapsar — só no desktop */}
        {!forceExpanded && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "6px",
              padding: "0.45rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            {effectiveCollapsed ? <ChevronRight size={16} strokeWidth={1.5} /> : <ChevronLeft size={16} strokeWidth={1.5} />}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
