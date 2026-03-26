"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
          { label: "Cartão digital", href: "/pessoas/cartao" },
          { label: "Auto-cadastro público", href: "/cadastro/igreja" },
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
          { label: "Dízimo online — PIX", href: "/financeiro/pix" },
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
        icon: <Church size={18} strokeWidth={1.5} />,
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
          { label: "Escala da semana", href: "/escalas" },
          { label: "Louvor & Música", href: "/escalas/louvor" },
          { label: "Técnico de som", href: "/escalas/som" },
          { label: "Recepção e portaria", href: "/escalas/recepcao" },
          { label: "Ministério infantil", href: "/escalas/infantil" },
          { label: "Confirmações pendentes", href: "/escalas/confirmacoes" },
          { label: "Histórico de escalas", href: "/escalas/historico" },
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
        label: "White Label Rubi",
        icon: <Crown size={18} strokeWidth={1.5} />,
        isGold: true,
        children: [
          { label: "Minhas igrejas", href: "/white-label" },
          { label: "Criar nova igreja", href: "/white-label/nova" },
          { label: "Editor de marca ao vivo", href: "/white-label/editor" },
          { label: "Domínio personalizado", href: "/white-label/dominio" },
          { label: "Faturamento Rubi", href: "/white-label/faturamento" },
          { label: "Material de vendas", href: "/white-label/material" },
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
        href: "/super-admin",
      },
    ],
  },
];

interface SidebarProps {
  tenantName?: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export function Sidebar({ tenantName = "Igreja Firmes", userName = "Administrador", userRole = "ADMIN", userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>("dashboard");

  function toggleMenu(id: string) {
    setOpenMenu((prev) => (prev === id ? null : id));
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebarWidth = collapsed ? 72 : 260;

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
      <div style={{ padding: collapsed ? "1.25rem 0" : "1.25rem 1rem", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        {!collapsed && (
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
              <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
                <path d="M22 6 C14 6 8 12 8 20 C8 27 12 33 18 36 L18 38 C18 39.1 18.9 40 20 39.5 C21 39 22 37 22 35 C22 37 23 39 24 39.5 C25.1 40 26 39.1 26 38 L26 36 C32 33 36 27 36 20 C36 12 30 6 22 6Z" fill="#C8922A" opacity="0.9"/>
                <circle cx="17.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
                <circle cx="26.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tenantName}
              </div>
              <div style={{ color: "rgba(200,146,42,0.8)", fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Firmes
              </div>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "rgba(200,146,42,0.2)",
            border: "1px solid rgba(200,146,42,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
              <path d="M22 6 C14 6 8 12 8 20 C8 27 12 33 18 36 L18 38 C18 39.1 18.9 40 20 39.5 C21 39 22 37 22 35 C22 37 23 39 24 39.5 C25.1 40 26 39.1 26 38 L26 36 C32 33 36 27 36 20 C36 12 30 6 22 6Z" fill="#C8922A" opacity="0.9"/>
              <circle cx="17.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="26.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0.75rem 0", scrollbarWidth: "none" }}>
        {MENU.map((group, gi) => (
          <div key={gi}>
            {group.section && !collapsed && (
              <div style={{
                padding: "0.875rem 1rem 0.25rem",
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
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenu === item.id;
              const active = item.href ? isActive(item.href) : false;
              const goldColor = "#C8922A";

              if (!hasChildren && item.href) {
                return (
                  <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ x: 0 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: collapsed ? "0.7rem 0" : "0.7rem 1rem",
                        justifyContent: collapsed ? "center" : "flex-start",
                        cursor: "pointer",
                        position: "relative",
                        background: active ? "rgba(255,255,255,0.08)" : "transparent",
                        transition: "background 0.15s",
                        margin: "1px 0",
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
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
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              color: item.isGold ? goldColor : active ? "white" : "rgba(255,255,255,0.75)",
                              fontSize: "0.8375rem",
                              fontWeight: active ? 600 : 400,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              }

              return (
                <div key={item.id}>
                  <motion.div
                    onClick={() => !collapsed && toggleMenu(item.id)}
                    whileHover={{ x: 0 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: collapsed ? "0.7rem 0" : "0.7rem 1rem",
                      justifyContent: collapsed ? "center" : "flex-start",
                      cursor: "pointer",
                      background: isOpen ? "rgba(255,255,255,0.06)" : "transparent",
                      transition: "background 0.15s",
                      margin: "1px 0",
                    }}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = isOpen ? "rgba(255,255,255,0.06)" : "transparent"; }}
                  >
                    <span style={{ color: item.isGold ? goldColor : isOpen ? "white" : "rgba(255,255,255,0.7)", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            flex: 1,
                            color: item.isGold ? goldColor : isOpen ? "white" : "rgba(255,255,255,0.75)",
                            fontSize: "0.8375rem",
                            fontWeight: isOpen ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && (
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
                    {isOpen && !collapsed && item.children && (
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
                            <Link key={sub.href} href={sub.href} style={{ textDecoration: "none" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.5rem 1rem 0.5rem 2.75rem",
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
                                  fontSize: "0.8rem",
                                  fontWeight: subActive ? 500 : 400,
                                }}>
                                  {sub.label}
                                </span>
                              </div>
                            </Link>
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
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: collapsed ? "0.875rem 0" : "0.875rem 1rem", flexShrink: 0 }}>
        {!collapsed && (
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
          {collapsed ? <ChevronRight size={16} strokeWidth={1.5} /> : <ChevronLeft size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </motion.aside>
  );
}
