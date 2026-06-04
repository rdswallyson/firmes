# RELATÓRIO AUDITORIA COMPLETA — FIRMES
**Data:** 02/06/2026 | **Fase 1 — APENAS LEITURA**

---

## 1. SCHEMA — Modelos com memberId (FK para Member)

| # | Model | memberId | Relação | Uso |
|---|-------|----------|---------|-----|
| 1 | **GroupMember** | ✅ String | Member @relation + onDelete:Cascade | Membro→Grupo |
| 2 | **Inscricao** | ✅ String? | Member @relation | Inscrição evento |
| 3 | **Finance** | ✅ String? | Member @relation | Lançamento financeiro |
| 4 | **Pedido** | ✅ String? | *(SEM RELATION DECLARADA)* | Pedido loja |
| 5 | **CursoProgresso** | ✅ String | *(SEM RELATION)* | Progresso EBD |
| 6 | **Checkin** | ✅ String? | *(SEM RELATION)* | Check-in culto |
| 7 | **EscalaMembro** | ✅ String | Member @relation + onDelete:Cascade | Escala ministério |

**⚠️ INCONSISTÊNCIA:**
- `Pedido`, `CursoProgresso`, `Checkin` têm `memberId` mas **NÃO DECLARAM** `@relation`.
- `Inscricao` tem `memberId` relação **incompleta** (String? sem @relation).

---

## 2. Modelos que NÃO têm memberId mas DEVERIAM ter

| # | Model | Justificatíva |
|---|-------|--------------|
| 1 | **Event** | organizadorId existe (FK Member), OK |
| 2 | **Culto** | pregadorId, liderLouvorId existem (FK Member), OK |
| 3 | **Aviso** | ❌ NÃO TEM — quem criou? |
| 4 | **Patrimonio** | ❌ NÃO TEM — responsável? |
| 5 | **AudiLog** | ❌ NÃO TEM — quem fez a ação? targetId genérico |
| 6 | **ContaBancaria** | ❌ NÃO TEM — responsável? |

**Conclusão:** A maioria dos modelos principais já referencia Member. Os que não têm são secundários.

---

## 3. Modelos SEM churchId/tenantId (CRÍTICO!)

| # | Model | tenantId? | churchId? | 🔴/🟢 |
|---|-------|-----------|------------|--------|
| 1 | **Tenant** | N/A (raiz) | N/A | 🟢 |
| 2 | User | ✅ | N/A | 🟢 |
| 3 | Member | ✅ | N/A | 🟢 |
| 4 | Group | ✅ | N/A | 🟢 |
| 5 | Event | ✅ | N/A | 🟢 |
| 6 | Inscricao | ✅ | N/A | 🟢 |
| 7 | Finance | ✅ | N/A | 🟢 |
| 8 | ContaBancaria | ✅ | N/A | 🟢 |
| 9 | Meta | ✅ | N/A | 🟢 |
| 10 | **AuditLog** | ❌ | ❌ | 🔴 |
| 11 | EventoRefeicao | N/A (filho Event) | N/A | 🟢 |
| 12 | InscricaoRefeicao | N/A (filho Inscricao) | N/A | 🟢 |
| 13 | Produto | ✅ | N/A | 🟢 |
| 14 | Pedido | ✅ | N/A | 🟢 |
| 15 | Cupom | ✅ | N/A | 🟢 |
| 16 | Midia | ✅ | N/A | 🟢 |
| 17 | Curso* | ✅ | N/A | 🟢 |
| 18 | Culto | ✅ | N/A | 🟢 |
| 19 | Checkin | ✅ | N/A | 🟢 |
| 20 | Escala | ✅ | N/A | 🟢 |
| 21 | EscalaMembro | N/A (filho Escala) | N/A | 🟢 |
| 22 | Notification | ✅ | N/A | 🟢 |

**🔴 CRÍTICO:** `AuditLog` NÃO tem tenantId. Significa que logs de todas as igrejas misturam.

---

## 4. APIs EXISTENTES (105 arquivos route.ts)

### Autenticação (3)
- `api/auth/login` — Login usuário
- `api/auth/register` — Registro
- `api/session` — Sessão atual

### Membros (6)
- `api/members` — CRUD membros
- `api/members/[id]` — Membro específico
- `api/members/aniversariantes` — Aniversariantes
- `api/members/export` — Export CSV
- `api/members/public-register` — Auto-cadastro público
- `api/public/members` — API pública

### Eventos (8)
- `api/eventos` — CRUD eventos
- `api/eventos/[id]` — Evento
- `api/eventos/[id]/avancado` — Avançado
- `api/eventos/[id]/refeicao` — Refeições
- `api/eventos/[id]/relatorio` — Relatório
- `api/eventos/[id]/scan` — Scan QR

### Grupos (5)
- `api/grupos` — CRUD
- `api/grupos/[id]` — Grupo
- `api/grupos/[id]/frequencia` — Frequência
- `api/grupos/[id]/membros` — Membros
- `api/grupos/[id]/relatorio` — Relatório

### Financeiro (10)
- `api/financeiro` — Lançamentos
- `api/financeiro/[id]` — Lançamento
- `api/financeiro/contas` — Contas bancárias
- `api/financeiro/dizimos` — Dízimos
- `api/financeiro/metas` — Metas
- `api/financeiro/pix/gerar` — PIX

### Cultos (7)
- `api/cultos` — CRUD
- `api/cultos/[id]` — Culto
- `api/cultos/assiduidade`
- `api/cultos/faltas`
- `api/cultos/frequencia`
- `api/cultos/presenca`
- `api/cultos/stats`

### Escalas (2)
- `api/escalas` — CRUD
- `api/escalas/[id]` — Escala

### Loja/Vendas (7)
- `api/produtos` — Produtos
- `api/pedidos` — Pedidos
- `api/cupons` — Cupons
- `api/loja/[slug]` — Loja pública
- `api/stripe/checkout`
- `api/webhooks/stripe`

### Dashboard (5)
- `api/dashboard/activity`
- `api/dashboard/checkins`
- `api/dashboard/growth`
- `api/dashboard/notices`
- `api/dashboard/stats`

### Portal Membro (2)
- `api/portal/auth/login`
- `api/portal/me`

### Superadmin (6)
- `api/superadmin/*`

### Configuracoes/Tenant (7)
- `api/tenant/*`
- `api/config/whatsapp`
- `api/backup`

### Notificações (1)
- `api/notificacoes`

### Patrimônio (1)
- `api/patrimonio` (mas SEM tabela Prisma!)

### Ensino/Curso (5)
- `api/ensino/*`
- `api/ensino/categorias`

### Check-in/Scan (5)
- `api/checkin/*`
- `api/inscricoes/*`
- `api/inscricoes-code/*`

### Comunicacao/Midia (1)
- `api/midias`
- `api/emails/welcome`

### Debug (1)
- `api/debug`

---

## 5. FORMULÁRIOS POR MÓDULO

### Membros/Pessoas (9 páginas)
| Página | Tipo | Formulário? |
|--------|------|-------------|
| `pessoas/page.tsx` | LISTAGEM | ❌ |
| `pessoas/novo/page.tsx` | **CADASTRO** | ✅ Formulário principal |
| `pessoas/[id]/page.tsx` | PERFIL | ❌ |
| `pessoas/[id]/editar/page.tsx` | **EDIÇÃO** | ✅ Reusa MemberForm |
| `pessoas/inativos/page.tsx` | LISTAGEM | ❌ |
| `pessoas/aniversariantes/page.tsx` | LISTAGEM | ❌ |

### Eventos (12 páginas)
| Página | Formulário? |
|--------|-------------|
| `eventos/novo/page.tsx` | ✅ CADASTRO |
| `eventos/[id]/page.tsx` | VISUALIZAÇÃO |
| `eventos/[id]/avancado/page.tsx` | ✅ AVANÇADO |

### Grupos/Células (7 páginas)
| Página | Formulário? |
|--------|-------------|
| `grupos/novo/page.tsx` | ✅ CADASTRO |
| `grupos/[id]/page.tsx` | VISUALIZAÇÃO |

### Cultos (10 páginas)
| Página | Formulário? |
|--------|-------------|
| `cultos/novo/page.tsx` | ✅ CADASTRO |
| `cultos/[id]/page.tsx` | VISUALIZAÇÃO |

### Escalas (5 páginas)
| Página | Formulário? |
|--------|-------------|
| `escalas/novo/page.tsx` | ✅ CADASTRO |
| `escalas/[id]/editar/page.tsx` | ✅ EDIÇÃO |

### Financeiro (9 páginas)
| Página | Formulário? |
|--------|-------------|
| `financeiro/lancamentos/page.tsx` | ✅ LANÇAMENTOS |
| `financeiro/metas/page.tsx` | ✅ METAS? |

### Produtos/Loja (1 página)
| Página | Formulário? |
|--------|-------------|
| `produtos/page.tsx` | LISTAGEM? |

### Pedidos (1 página)
| Página | Formulário? |
|--------|-------------|
| `pedidos/page.tsx` | LISTAGEM |

### Ensino/EBD (9 páginas)
| Página | Formulário? |
|--------|-------------|
| `ensino/novo/page.tsx` | ✅ CADASTRO |
| `ensino/categorias/page.tsx` | ✅? |

### Comunicação (7 páginas)
| Página | Formulário? |
|--------|-------------|
| `comunicacao/email/page.tsx` | ✅ E-MAIL |
| `comunicacao/whatsapp/page.tsx` | ✅ WHATSAPP |

### Avisos (2 páginas)
| Página | Formulário? |
|--------|-------------|
| `avisos/novo/page.tsx` | ✅ CADASTRO |
| `avisos/page.tsx` | LISTAGEM |

### Patrimônio (5 páginas)
| Página | Formulário? |
|--------|-------------|
| `patrimonio/novo/page.tsx` | ✅ CADASTRO |
| `patrimonio/page.tsx` | LISTAGEM |

### Configurações (9 páginas)
| Página | Formulário? |
|--------|-------------|
| `configuracoes/igreja/page.tsx` | ✅ PERFIL IGREJA |
| `configuracoes/plano/page.tsx` | ✅ PLANO |
| `configuracoes/pix/page.tsx` | ✅ PIX |

---

## 6. RESUMO EXECUTIVO

| Aspecto | Total | Com Formulário |
|-----------|--------|---------------|
| APIs | 105 | N/A |
| Páginas frontend | ~100+ | ~30 com formulário |
| Models Prisma | 40 | N/A |
| Models com memberId | 7 | N/A |

### 🔴 CRÍTICOS ENCONTRADOS:
1. **AuditLog** — SEM tenantId (dados misturados)
2. **Pedido** — memberId sem @relation
3. **CursoProgresso** — memberId sem @relation
4. **Checkin** — memberId sem @relation
5. **Patrimonio** — API existe, tabela NÃO existe
6. **Aviso** — SEM tabela Prisma (usa NoticeItem no frontend?)

### 🟡 MÉDIO:
7. **Inscricao.memberId** — relação incompleta
8. Many String[] sem referência (ministerios, tags, categorias)

### ✅ OK:
- tenantId em 39/40 models
- Group, Event, Culto, Escala com FK para Member
- APIs completas para Membros, Eventos, Grupos, Financeiro, Cultos, Escalas

---
**FIM FASE 1 — ZERO ALTERAÇÕES**
