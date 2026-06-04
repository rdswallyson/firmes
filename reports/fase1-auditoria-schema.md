# RELATÓRIO DE AUDITORIA — Schema Prisma FIRMES
## Data: 02/06/2026
## Auditor: Verdent

---

## 1. TABELAS EXISTENTES (35 models)

| # | Tabela | Descrição | Status |
|---|--------|-------------|--------|
| 1 | **Tenant** | Igreja/instituição | ✅ Completo |
| 2 | **User** | Usuário admin/pastor | ✅ Completo |
| 3 | **Member** | Membro da igreja | ✅ EXPANDIDO |
| 4 | **Group** | Grupos/células | ✅ Completo |
| 5 | GroupMember | Relação membro-grupo | ✅ |
| 6 | GroupFrequencia | Frequência de grupos | ✅ |
| 7 | **Event** | Eventos da igreja | ✅ Completo |
| 8 | Inscricao | Inscrições em eventos | ✅ Completo |
| 9 | **Finance** | Lançamentos financeiros | ✅ Completo |
| 10 | ContaBancaria | Contas bancárias | ✅ |
| 11 | Meta | Metas financeiras | ✅ |
| 12 | AuditLog | Logs de auditoria | ✅ |
| 13 | EventoRefeicao | Refeições em eventos | ✅ |
| 14 | InscricaoRefeicao | Uso de refeições | ✅ |
| 15 | EventoCheckinPonto | Pontos de check-in | ✅ |
| 16 | EventoCheckinScan | Scans de check-in | ✅ |
| 17 | Produto | Produtos da loja | ✅ |
| 18 | ProdutoVariacao | Variações de produto | ✅ |
| 19 | Pedido | Pedidos/vendas | ✅ |
| 20 | PedidoItem | Itens do pedido | ✅ |
| 21 | InscricaoPedidoItem | Produtos em inscrição | ✅ |
| 22 | EventoProduto | Produtos do evento | ✅ |
| 23 | Cupom | Cupons de desconto | ✅ |
| 24 | EventoFase | Fases de evento | ✅ |
| 25 | EventoEquipe | Equipes de evento | ✅ |
| 26 | EventoMembro | Membros da equipe | ✅ |
| 27 | EventoChecklist | Checklist de evento | ✅ |
| 28 | EventoMarco | Marcos do evento | ✅ |
| 29 | EventoRecurso | Recursos do evento | ✅ |
| 30 | Midia | Mídias/vídeos | ✅ |
| 31 | **CursoCategoria** | Categorias de cursos | ✅ |
| 32 | **Curso** | Cursos/EBD | ✅ |
| 33 | CursoModulo | Módulos do curso | ✅ |
| 34 | CursoAula | Aulas do módulo | ✅ |
| 35 | CursoProgresso | Progresso do aluno | ✅ |
| 36 | **Culto** | Cultos | ✅ Completo |
| 37 | Checkin | Check-ins de culto | ✅ |
| 38 | **Escala** | Escalas de ministério | ✅ |
| 39 | EscalaMembro | Membros na escala | ✅ |
| 40 | **Notification** | Notificações | ✅ NOVO |

---

## 2. TABELAS FALTANTES (Críticas para Igreja Completa)

| # | Tabela | O que deveria ter? | Impacto |
|---|--------|---------------------|--------|
| 1 | **PedidoOracao** | Pedidos de oração | 🔴 ALTO — módulo ausente |
| 2 | **Aviso / Comunicado** | Comunicados da igreja | 🔴 ALTO — módulo ausente |
| 3 | **Ministerio** | Cadastro de ministérios/departamentos | 🟡 MÉDIO — hoje String[] em Member |
| 4 | **Cargo** | Cargos formais (diácono, presbítero...) | 🟡 MÉDIO — hoje String em Member.role |
| 5 | **Batismo** | Registro de batismos | 🟡 MÉDIO — hoje DateTime em Member |
| 6 | **SantaCeia** | Registro de santas ceias | 🟡 MÉDIO — não existe |
| 7 | **Transferencia** | Transferência de membros | 🟡 MÉDIO — não existe |
| 8 **HistoriaIgreja** | Marcos históricos | 🟢 BAIXO — não existe |
| 9 | **Decreto/Carta** | Cartas de recomendação | 🟢 BAIXO — não existe |
| 10 | **Doacao/Oferta** | Registro separado de dízimos | 🟢 BAIXO — Finance cobre |
| 11 | **Pregacao/Sermao** | Sermões/pregações | 🟢 BAIXO — Culto.tema cobre |

---

## 3. MEMBER — Estado Detalhado

### ✅ CAMPOS OK:
- Identificação: id, name, email, phone, photo, cpf, rg
- Endereço: cep, address, number, complement, neighborhood, city, state
- Eclesiástico: birthDate, baptismDate, dataBatismoEspirito, dataConversao, batizado, role, groupId, ministerios[], status
- Família: conjugeId, filhos(Json), indicadoPorId
- Portal: portalEmail, portalPassword, portalStatus
- Outros: sexo, estadoCivil, whatsapp, escolaridade, pais, notes, tags[], deletedAt
- Relações: finances[], lideraGroups[], cultosPregador[], cultosLouvor[], eventosOrganizador[]

### ❌ CAMPOS AUSENTES que poderiam existir:
- **profissao** — profissão do membro
- **nomePai / nomeMae** — filiação
- **observacoesMedicas** — restrições médicas
- **alergias** — alergias alimentares
- **tipoSanguineo** — emergência
- **dataCasamento** — para membros casados
- **conjugeAtual** — nome do cônjuge (além de ID)

---

## 4. INCONSISTÊNCIAS ENCONTRADAS

### 4.1 Strings Livres vs Enums
| Campo | Tipo Atual | Deveria ser | Risco |
|---------|-------------|-------------|-------|
| Member.status | String | Enum (ACTIVE, INACTIVE, VISITOR...) | Erros de digitação |
| Member.role | String | Reference Cargo/Ministerio | Sem padronização |
| Member.ministerios | String[] | Reference Ministerio[] | Sem controle |
| Finance.type | String | Enum (RECEITA, DESPESA) | Erros de digitação |
| Inscricao.tipo | String | Enum (MEMBRO, VISITANTE) | Erros de digitação |
| Culto.tipo | String | Enum (DOMINICAL, JOVENS...) | Erros de digitação |
| Event.type | String | ??? | Não claro |
| Group.categorias | String[] | Reference Categoria[] | Sem controle |

### 4.2 Relações Potencialmente Quebradas
- ✅ **Group → Member** (leaderId 1-4) → OK
- ✅ **Culto → Member** (pregadorId, liderLouvorId) → OK
- ✅ **Event → Member** (organizadorId) → OK
- ✅ **Finance → Member** (memberId) → OK
- ⚠️ **Member → Group** (groupId) → OK mas Single
- ❓ Member.lideraGroups2, lideraGroups3, lideraGroups4 → FUNCIONAM?

### 4.3 Índices Verificados
- Tenant: ✅ PK
- User: ✅ tenantId, email
- Member: ✅ tenantId, tenantId+status, tenantId+groupId, name, email, birthDate, portalStatus
- Group: ✅ tenantId, tenantId+isActive, leaderId 1-4
- Finance: ✅ tenantId, createdAt, type, status, memberId
- Event: ✅ tenantId, date, status, slug, organizadorId
- Culto: ✅ tenantId, data, ativo, pregadorId, liderLouvorId
- Escala: ✅ tenantId, data, ministerio
- Produto: ✅ tenantId, ativo, nome

**ÍNDICES FALTANDO (performance):**
- Member.birthDate — para aniversariantes (existe! ✅)
- Member.portalEmail — para login do portal
- Event.date — para dashboard (existe! ✅)
- Produto.categoria — para filtro loja
- Midia.tipo — para filtro

---

## 5. RESUMO DOS MÓDULOS vs SCHEMA

| Módulo | Tabelas Usadas | Completo? |
|----------|--------------|-----------|
| Dashboard | Tenant, Member, Finance, Event, Culto, Checkin | ✅ OK |
| Membros | Member, Group, GroupMember | ✅ EXPANDIDO |
| Grupos/Células | Group, GroupMember, GroupFrequencia | ✅ OK |
| Eventos | Event, Inscricao, EventoCheckin*, Evento* | ✅ OK |
| Financeiro | Finance, ContaBancaria, Meta | ✅ OK |
| Cultos | Culto, Checkin | ✅ OK |
| Escalas | Escala, EscalaMembro | ✅ OK |
| Loja | Produto, Pedido, Cupom | ✅ OK |
| EBD/Cursos | Curso, Curso*, CursoProgresso | ✅ OK |
| Mídias | Midia | ✅ OK |
| Notificações | Notification | ✅ NOVO |
| **Pedidos de Oração** | **NENHUMA** | ❌ AUSENTE |
| **Avisos/Comunicados** | **NENHUMA** | ❌ AUSENTE |
| **Patrimônio** | **NENHUMA** | ❌ AUSENTE (mas tem rota) |

---

## 6. RECOMENDAÇÕES POR PRIORIDADE

### 🔴 CRÍTICO (Fase 1)
1. **Criar tabela PedidoOracao** — módulo completamente ausente
2. **Criar tabela Aviso/Comunicado** — módulo ausente
3. **Criar enums** para Member.status, Finance.type, Inscricao.tipo, Culto.tipo
4. **Verificar relações Group.leader2/3/4** se funcionam

### 🟡 MÉDIO (Fase 2)
5. Criar tabela Ministerio (para substituir String[])
6. Criar tabela Cargo (para substituir String role)
7. Criar tabela Transferencia
8. Campos extras em Member (profissao, dataCasamento, alergias)

### 🟢 FUTURO (Fase 3)
9. Tabela HistoriaIgreja
10. Tabela SantaCeia
11. Soft delete em todas as tabelas (hoje só Member.deletedAt)

---

## 7. ESTADO GERAL

| Aspecto | Status |
|---------|--------|
| Estrutura base | ✅ Sólida |
| Multi-tenant | ✅ tenantId em todas as tabelas |
| Índices críticos | ✅ Bons |
| Relações Member↔outros | ✅ Funcionando |
| Soft delete | ⚠️ Só Member |
| AuditLog | ✅ Existe mas simples |
| Enums | ❌ Muitos String livres |
| Módulos ausentes | ❌ 3+ |

**VEREDICTO:** Schema é robusto para SaaS multi-tenant, mas carece de:
- 3 tabelas fundamentais (PedidoOracao, Aviso, Patrimonio)
- Padronização de enums (6+ campos String que deveriam ser enum)
- Soft delete global (só Member tem)

---
*Relatório gerado para Fase 1 — APENAS LEITURA*
