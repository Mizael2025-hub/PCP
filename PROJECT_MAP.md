# SISTEMA DE GESTÃO - BATERIAS

## 1. Stack Tecnológica e Ferramentas

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, next-pwa.
- Backend/Database: Supabase (PostgreSQL), RLS.
- Componentes Visuais: lucide-react, sonner/react-hot-toast.

## 2. Arquitetura do Banco de Dados (Resumo)

- Master Data: `sectors`, `employees`, `machines`, `shifts`, `battery_models`, `lead_alloys`.
- Produção (Peso): `grid_casting_production`, `grid_casting_downtime`, `lead_ball_production`, `oxide_mill_production`, `mixer_production`, `lead_consumption`.
- Rastreabilidade (Unidade): `pasting_production` (EP Code), `sanding_scrap`, `assembly_production` (Lote da bateria).
- Qualidade/Formação: `lab_quality_control`, `formation_records`, `formation_details`.

## 3. Controle de Acessos (RBAC via RLS)

- Perfils: `admin`, `manager`, `lab_technician`, `production_operator`, `warehouse_operator`.
- Controle customizado via tabela pivot `role_permissions`.

## 4. Estrutura de Rotas (Next.js)

- `/login` (pública)
- `/(dashboard)` (privada — requer sessão)
  - `/` — Início
  - `/producao`
    - `/producao/grid-casting` — Fundidora de Grades (apontamentos + paradas)
    - `/producao/lead-ball` — Boleira (produção de bola de chumbo)
    - `/producao/oxide-mill` — Moinho de Óxido (peso de óxido e grau de oxidação)
    - `/producao/mixer` — Misturador (batelada, volumes e densidade)
    - `/producao/lead-consumption` — Consumo de Chumbo (liga e setor destino)
    - `/producao/pasting` — Empastadeira (EP Code, rastreabilidade)
    - `/producao/assembly` — Montagem (lote da bateria, características JSONB)
    - `/producao/sanding-scrap` — Lixação (refugo e placas perdidas)
  - `/qualidade`
    - `/qualidade/laboratorio` — Controle de qualidade laboratorial
    - `/qualidade/formacao` — Registro de formação (master-detail)
  - `/estoque`
  - `/configuracoes`
    - `/configuracoes/setores` — CRUD de setores
    - `/configuracoes/turnos` — CRUD de turnos
    - `/configuracoes/funcionarios` — CRUD de funcionários
    - `/configuracoes/maquinas` — CRUD de máquinas
    - `/configuracoes/modelos-bateria` — CRUD de modelos de bateria
    - `/configuracoes/ligas` — CRUD de ligas de chumbo

---

## 5. Layout e Componentes UI

### Layout principal (`src/app/(dashboard)/`)

| Arquivo       | Responsabilidade                                |
| ------------- | ----------------------------------------------- |
| `layout.tsx`  | Shell do dashboard (Navbar + Sidebar + Tab Bar) |
| `loading.tsx` | Skeleton de carregamento global                 |
| `error.tsx`   | Error boundary com retry                        |

### Layout (`src/components/layout/`)

| Arquivo               | Responsabilidade                                           |
| --------------------- | ---------------------------------------------------------- |
| `dashboard-shell.tsx` | Orquestra sidebar desktop, drawer mobile, navbar e tab bar |
| `navbar.tsx`          | Navigation Bar sticky com título dinâmico                  |
| `sidebar.tsx`         | Menu lateral desktop + drawer mobile                       |
| `tab-bar.tsx`         | Tab Bar fixa no rodapé (mobile)                            |

### UI base (`src/components/ui/`)

| Arquivo                | Responsabilidade                                             |
| ---------------------- | ------------------------------------------------------------ |
| `button.tsx`           | Botão com variantes (primary, secondary, destructive, ghost) |
| `input.tsx`            | Input com label, hint e estado de erro                       |
| `select.tsx`           | Select nativo com label, hint e estado de erro               |
| `card.tsx`             | Container de conteúdo com título/descrição                   |
| `modal.tsx`            | Modal estilo iOS Share Sheet                                 |
| `table-container.tsx`  | Wrapper para tabelas com scroll                              |
| `simple-bar-chart.tsx` | Gráfico de barras horizontal simples (CSS/Tailwind)          |
| `page-header.tsx`      | Cabeçalho de página com título e ações                       |
| `skeleton.tsx`         | Loading skeletons (Page, Table, Card)                        |
| `empty-state.tsx`      | Estado vazio com ícone e ação opcional                       |
| `error-state.tsx`      | Estado de erro com retry                                     |

### Config (`src/config/`)

| Arquivo         | Responsabilidade                          |
| --------------- | ----------------------------------------- |
| `navigation.ts` | Itens de navegação e helper `getNavLabel` |

### Utilitários (`src/lib/utils/`)

| Arquivo | Responsabilidade     |
| ------- | -------------------- |
| `cn.ts` | Merge de classes CSS |

---

## 6. Infraestrutura Base

### Supabase SSR (`src/lib/supabase/`)

| Arquivo             | Responsabilidade                                    |
| ------------------- | --------------------------------------------------- |
| `client.ts`         | Cliente browser (`createBrowserClient`)             |
| `server.ts`         | Cliente servidor com cookies (`createServerClient`) |
| `middleware.ts`     | Refresh de sessão e cookies (`updateSession`)       |
| `database.types.ts` | Tipagem do schema PostgreSQL                        |

### Camadas de dados

| Camada     | Arquivo base                          | Responsabilidade                       |
| ---------- | ------------------------------------- | -------------------------------------- |
| Repository | `src/repositories/base-repository.ts` | Acesso ao banco via Supabase server    |
| Service    | `src/services/base-service.ts`        | Regras de negócio e tratamento de erro |

### Helpers

| Arquivo                            | Responsabilidade                              |
| ---------------------------------- | --------------------------------------------- |
| `src/lib/utils/action-response.ts` | Tipo e helpers `actionSuccess` / `actionFail` |
| `src/lib/utils/handle-error.ts`    | Log + resposta padronizada em catch           |
| `src/lib/errors/app-error.ts`      | Erros de negócio com status HTTP              |

### Autenticação (`src/actions`, `src/services`, `src/repositories`)

| Arquivo                                          | Responsabilidade                                          |
| ------------------------------------------------ | --------------------------------------------------------- |
| `src/validations/auth/login-schema.ts`           | Schema Zod do formulário de login                         |
| `src/types/auth.ts`                              | Tipos `Profile` e `AuthSession` (via `database.types.ts`) |
| `src/repositories/auth-repository.ts`            | `signInWithPassword`, `signOut`, `getUser`, `getProfile`  |
| `src/services/auth-service.ts`                   | Regras de login (perfil ativo), logout e sessão           |
| `src/actions/auth-actions.ts`                    | `loginAction`, `logoutAction`, `getSessionAction`         |
| `src/components/features/auth/login-form.tsx`    | Formulário RHF + Zod com loading e toast                  |
| `src/components/features/auth/logout-button.tsx` | Botão de logout com loading e toast                       |
| `src/components/providers/auth-provider.tsx`     | Hidrata Zustand + listener `onAuthStateChange`            |
| `src/stores/app-store.ts`                        | Estado global: sidebar + sessão (`user`, `profile`)       |

### Middleware raiz (`middleware.ts`)

- Refresh de token em toda requisição via `updateSession`
- Rotas públicas: `/login`
- Redireciona não autenticados para `/login?next=...`
- Redireciona autenticados em `/login` para `/`

### Cadastros — Setores (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/sectors`)

| Arquivo                                                    | Responsabilidade                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/types/sector.ts`                                      | Tipos `Sector`, `SectorInsert`, `SectorUpdate`                   |
| `src/validations/sectors/sector-schema.ts`                 | Schemas Zod create/update                                        |
| `src/repositories/sector-repository.ts`                    | CRUD Supabase (`sectors`), soft delete via `is_active`           |
| `src/services/sector-service.ts`                           | Regras de negócio, duplicidade de nome                           |
| `src/actions/sector-actions.ts`                            | `createSectorAction`, `updateSectorAction`, `deleteSectorAction` |
| `src/components/features/sectors/sectors-manager.tsx`      | Orquestra tabela, modais e exclusão                              |
| `src/components/features/sectors/sectors-table.tsx`        | TanStack Table (busca + paginação)                               |
| `src/components/features/sectors/sector-form.tsx`          | Formulário RHF + Zod                                             |
| `src/components/features/sectors/sector-modal.tsx`         | Modal create/edit (iOS Share Sheet)                              |
| `src/app/(dashboard)/configuracoes/setores/page.tsx`       | Página server com listagem                                       |
| `src/app/(dashboard)/configuracoes/setores/loading.tsx`    | Skeleton de carregamento                                         |
| `supabase/migrations/20260526120000_sectors_is_active.sql` | Coluna `is_active` para soft delete                              |

### Cadastros — Turnos (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/shifts`)

| Arquivo                                                | Responsabilidade                                              |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `src/types/shift.ts`                                   | Tipos `Shift`, `ShiftInsert`, `ShiftUpdate`                   |
| `src/lib/utils/time.ts`                                | Parse, formatação e normalização de horários (date-fns)       |
| `src/validations/shifts/shift-schema.ts`               | Schemas Zod create/update com validação de horários           |
| `src/repositories/shift-repository.ts`                 | CRUD Supabase (`shifts`), exclusão física                     |
| `src/services/shift-service.ts`                        | Regras de negócio, duplicidade de nome, FK em exclusão        |
| `src/actions/shift-actions.ts`                         | `createShiftAction`, `updateShiftAction`, `deleteShiftAction` |
| `src/components/features/shifts/shifts-manager.tsx`    | Orquestra tabela, modais e exclusão                           |
| `src/components/features/shifts/shifts-table.tsx`      | TanStack Table (busca + paginação responsiva)                 |
| `src/components/features/shifts/shift-form.tsx`        | Formulário RHF + Zod (nome, início, fim)                      |
| `src/components/features/shifts/shift-modal.tsx`       | Modal create/edit (iOS Share Sheet)                           |
| `src/app/(dashboard)/configuracoes/turnos/page.tsx`    | Página server com listagem                                    |
| `src/app/(dashboard)/configuracoes/turnos/loading.tsx` | Skeleton de carregamento                                      |

### Cadastros — Funcionários (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/employees`)

| Arquivo                                                      | Responsabilidade                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `src/types/employee.ts`                                      | Tipos `Employee`, `EmployeeWithSector`                                 |
| `src/validations/employees/employee-schema.ts`               | Schemas Zod create/update (nome, matrícula, setor)                     |
| `src/repositories/employee-repository.ts`                    | CRUD Supabase (`employees`) com join em `sectors`, soft delete         |
| `src/services/employee-service.ts`                           | Regras de negócio, duplicidade de matrícula, validação de setor ativo  |
| `src/actions/employee-actions.ts`                            | `createEmployeeAction`, `updateEmployeeAction`, `deleteEmployeeAction` |
| `src/components/features/employees/employees-manager.tsx`    | Orquestra tabela, modais e exclusão                                    |
| `src/components/features/employees/employees-table.tsx`      | TanStack Table (busca, filtro por setor, paginação responsiva)         |
| `src/components/features/employees/employee-form.tsx`        | Formulário RHF + Zod com select dinâmico de setores                    |
| `src/components/features/employees/employee-modal.tsx`       | Modal create/edit (iOS Share Sheet)                                    |
| `src/app/(dashboard)/configuracoes/funcionarios/page.tsx`    | Página server com listagem e setores                                   |
| `src/app/(dashboard)/configuracoes/funcionarios/loading.tsx` | Skeleton de carregamento                                               |

### Cadastros — Máquinas (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/machines`)

| Arquivo                                                  | Responsabilidade                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/types/machine.ts`                                   | Tipos `Machine`, `MachineWithSector`                                |
| `src/validations/machines/machine-schema.ts`             | Schemas Zod create/update (nome, setor)                             |
| `src/repositories/machine-repository.ts`                 | CRUD Supabase (`machines`), soft delete                             |
| `src/services/machine-service.ts`                        | Regras de negócio, duplicidade de nome, validação de setor ativo    |
| `src/actions/machine-actions.ts`                         | `createMachineAction`, `updateMachineAction`, `deleteMachineAction` |
| `src/components/features/machines/machines-manager.tsx`  | Orquestra tabela, modais e exclusão                                 |
| `src/components/features/machines/machines-table.tsx`    | TanStack Table (busca, filtro por setor, paginação responsiva)      |
| `src/components/features/machines/machine-form.tsx`      | Formulário RHF + Zod com select dinâmico de setores                 |
| `src/components/features/machines/machine-modal.tsx`     | Modal create/edit (iOS Share Sheet)                                 |
| `src/app/(dashboard)/configuracoes/maquinas/page.tsx`    | Página server com listagem e setores                                |
| `src/app/(dashboard)/configuracoes/maquinas/loading.tsx` | Skeleton de carregamento                                            |

### Cadastros — Modelos de bateria (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/battery-models`)

| Arquivo                                                             | Responsabilidade                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/types/battery-model.ts`                                        | Tipos `BatteryModel`, `BatteryModelInsert`, `BatteryModelUpdate`                   |
| `src/validations/battery-models/battery-model-schema.ts`            | Schemas Zod create/update (código, nome, peso nominal numérico)                    |
| `src/repositories/battery-model-repository.ts`                      | CRUD Supabase (`battery_models`), exclusão física                                  |
| `src/services/battery-model-service.ts`                             | Regras de negócio, duplicidade de código, FK em exclusão                           |
| `src/actions/battery-model-actions.ts`                              | `createBatteryModelAction`, `updateBatteryModelAction`, `deleteBatteryModelAction` |
| `src/components/features/battery-models/battery-models-manager.tsx` | Orquestra tabela, modais e exclusão                                                |
| `src/components/features/battery-models/battery-models-table.tsx`   | TanStack Table (busca, filtro por faixa de peso, paginação responsiva)             |
| `src/components/features/battery-models/battery-model-form.tsx`     | Formulário RHF + Zod (código, nome, peso com `tabular-nums`)                       |
| `src/components/features/battery-models/battery-model-modal.tsx`    | Modal create/edit (iOS Share Sheet)                                                |
| `src/app/(dashboard)/configuracoes/modelos-bateria/page.tsx`        | Página server com listagem                                                         |
| `src/app/(dashboard)/configuracoes/modelos-bateria/loading.tsx`     | Skeleton de carregamento                                                           |

### Cadastros — Ligas de chumbo (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/lead-alloys`)

| Arquivo                                                       | Responsabilidade                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/types/lead-alloy.ts`                                     | Tipos `LeadAlloy`, `LeadAlloyInsert`, `LeadAlloyUpdate`                   |
| `src/validations/lead-alloys/lead-alloy-schema.ts`            | Schemas Zod create/update (código, descrição opcional)                    |
| `src/repositories/lead-alloy-repository.ts`                   | CRUD Supabase (`lead_alloys`), exclusão física                            |
| `src/services/lead-alloy-service.ts`                          | Regras de negócio, duplicidade de código, FK em exclusão                  |
| `src/actions/lead-alloy-actions.ts`                           | `createLeadAlloyAction`, `updateLeadAlloyAction`, `deleteLeadAlloyAction` |
| `src/components/features/lead-alloys/lead-alloys-manager.tsx` | Orquestra tabela, modais e exclusão                                       |
| `src/components/features/lead-alloys/lead-alloys-table.tsx`   | TanStack Table (busca, filtro por descrição, paginação responsiva)        |
| `src/components/features/lead-alloys/lead-alloy-form.tsx`     | Formulário RHF + Zod (código, descrição)                                  |
| `src/components/features/lead-alloys/lead-alloy-modal.tsx`    | Modal create/edit (iOS Share Sheet)                                       |
| `src/app/(dashboard)/configuracoes/ligas/page.tsx`            | Página server com listagem                                                |
| `src/app/(dashboard)/configuracoes/ligas/loading.tsx`         | Skeleton de carregamento                                                  |

### Infra Supabase (ajuste de tipagem)

| Arquivo                              | Responsabilidade                                                       |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `src/lib/supabase/server.ts`         | `TypedSupabaseClient` — corrige inferência de tipos do `@supabase/ssr` |
| `src/lib/supabase/database.types.ts` | `sectors.is_active` + `Relationships` em todas as tabelas              |

### Produção — Fundidora de Grades (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/grid-casting`)

| Arquivo                                                         | Responsabilidade                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/types/grid-casting.ts`                                     | Tipos `GridCastingProduction`, `GridCastingProductionWithRelations`, filtros   |
| `src/validations/grid-casting/production-schema.ts`             | Schemas Zod create/update com validação de pesos e selects dependentes (setor) |
| `src/repositories/grid-casting-production-repository.ts`        | CRUD Supabase (`grid_casting_production`) com filtros por data/turno           |
| `src/services/grid-casting-service.ts`                          | Regras de negócio, FKs ativas, `created_by`, attach de relações                |
| `src/actions/grid-casting-actions.ts`                           | `createGridCastingAction`, `updateGridCastingAction`                           |
| `src/components/features/grid-casting/grid-casting-manager.tsx` | Orquestra tabela, modal e empty state                                          |
| `src/components/features/grid-casting/grid-casting-table.tsx`   | TanStack Table, filtros por data/turno (URL), busca e paginação                |
| `src/components/features/grid-casting/grid-casting-form.tsx`    | Formulário RHF + Zod com selects dependentes (setor → máquina/operador)        |
| `src/components/features/grid-casting/grid-casting-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                            |
| `src/app/(dashboard)/producao/page.tsx`                         | Hub de módulos de produção                                                     |
| `src/app/(dashboard)/producao/grid-casting/page.tsx`            | Página server com listagem, master data e filtros via searchParams             |
| `src/app/(dashboard)/producao/grid-casting/loading.tsx`         | Skeleton de carregamento                                                       |

### Produção — Paradas da Fundidora (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/grid-casting`)

| Arquivo                                                                  | Responsabilidade                                                            |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `src/types/grid-casting-downtime.ts`                                     | Tipos `GridCastingDowntime`, `GridCastingDowntimeWithProduction`, filtros   |
| `src/validations/grid-casting/downtime-schema.ts`                        | Schemas Zod create/update com cálculo automático de `duration_minutes`      |
| `src/lib/utils/datetime.ts`                                              | Conversão datetime-local ↔ ISO e formatação de duração                      |
| `src/repositories/grid-casting-downtime-repository.ts`                   | CRUD Supabase (`grid_casting_downtime`) filtrado por apontamentos           |
| `src/services/grid-casting-downtime-service.ts`                          | Regras de negócio, FK em `production_id`, attach de relações do apontamento |
| `src/actions/grid-casting-downtime-actions.ts`                           | `createGridCastingDowntimeAction`, `updateGridCastingDowntimeAction`        |
| `src/components/features/grid-casting/grid-casting-tabs.tsx`             | Abas Apontamentos / Paradas na mesma rota                                   |
| `src/components/features/grid-casting/grid-casting-downtime-manager.tsx` | Orquestra tabela histórica, modal e empty state                             |
| `src/components/features/grid-casting/grid-casting-downtime-table.tsx`   | TanStack Table, filtros data/turno/apontamento (URL), busca e paginação     |
| `src/components/features/grid-casting/grid-casting-downtime-form.tsx`    | Formulário RHF + Zod com duração calculada em tempo real                    |
| `src/components/features/grid-casting/grid-casting-downtime-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                         |
| `supabase/migrations/20260526130000_grid_casting_downtime_rls.sql`       | RLS + índices em `grid_casting_downtime`                                    |

### Produção — Boleira (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/lead-ball-production`)

| Arquivo                                                                         | Responsabilidade                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/types/lead-ball-production.ts`                                             | Tipos `LeadBallProduction`, `LeadBallProductionWithRelations`, filtros |
| `src/validations/lead-ball-production/production-schema.ts`                     | Schemas Zod create/update (`silo_number`, `weight_produced`)           |
| `src/repositories/lead-ball-production-repository.ts`                           | CRUD Supabase (`lead_ball_production`) com filtros por data/turno/silo |
| `src/services/lead-ball-production-service.ts`                                  | Regras de negócio, FKs ativas, attach de relações (turno, operador)    |
| `src/actions/lead-ball-production-actions.ts`                                   | `createLeadBallAction`, `updateLeadBallAction`                         |
| `src/components/features/lead-ball-production/lead-ball-production-manager.tsx` | Orquestra tabela, modal e empty state                                  |
| `src/components/features/lead-ball-production/lead-ball-production-table.tsx`   | TanStack Table, filtros data/turno/silo (URL), busca e paginação       |
| `src/components/features/lead-ball-production/lead-ball-production-form.tsx`    | Formulário RHF + Zod (data, turno, operador, silo, peso)               |
| `src/components/features/lead-ball-production/lead-ball-production-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                    |
| `src/app/(dashboard)/producao/lead-ball/page.tsx`                               | Página server com listagem, master data e filtros via searchParams     |
| `src/app/(dashboard)/producao/lead-ball/loading.tsx`                            | Skeleton de carregamento                                               |
| `supabase/migrations/20260526140000_lead_ball_production_rls.sql`               | RLS + índices em `lead_ball_production`                                |

### Produção — Moinho de Óxido (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/oxide-mill-production`)

| Arquivo                                                                           | Responsabilidade                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/types/oxide-mill-production.ts`                                              | Tipos `OxideMillProduction`, `OxideMillProductionWithRelations`, filtros       |
| `src/validations/oxide-mill-production/production-schema.ts`                      | Schemas Zod create/update (`oxide_weight`, `oxidation_degree`)                 |
| `src/repositories/oxide-mill-production-repository.ts`                            | CRUD Supabase (`oxide_mill_production`) com filtros por data/turno             |
| `src/services/oxide-mill-production-service.ts`                                   | Regras de negócio, FKs ativas, attach de relações, resumo diário para gráficos |
| `src/actions/oxide-mill-production-actions.ts`                                    | `createOxideMillAction`, `updateOxideMillAction`                               |
| `src/components/features/oxide-mill-production/oxide-mill-production-manager.tsx` | Orquestra gráficos, tabela, modal e empty state                                |
| `src/components/features/oxide-mill-production/oxide-mill-production-charts.tsx`  | Gráficos simples de peso e grau de oxidação por dia                            |
| `src/components/features/oxide-mill-production/oxide-mill-production-table.tsx`   | TanStack Table, filtros data/turno (URL), busca e paginação                    |
| `src/components/features/oxide-mill-production/oxide-mill-production-form.tsx`    | Formulário RHF + Zod (data, turno, operador, peso, grau)                       |
| `src/components/features/oxide-mill-production/oxide-mill-production-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                            |
| `src/app/(dashboard)/producao/oxide-mill/page.tsx`                                | Página server com listagem, gráficos, master data e filtros via searchParams   |
| `src/app/(dashboard)/producao/oxide-mill/loading.tsx`                             | Skeleton de carregamento                                                       |
| `supabase/migrations/20260526150000_oxide_mill_production_rls.sql`                | RLS + índices em `oxide_mill_production`                                       |

### Produção — Misturador (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/mixer-production`)

| Arquivo                                                                 | Responsabilidade                                                       |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/types/mixer-production.ts`                                         | Tipos `MixerProduction`, `MixerProductionWithRelations`, filtros       |
| `src/validations/mixer-production/production-schema.ts`                 | Schemas Zod create/update (`batch_number`, volumes, densidade, pesos)  |
| `src/repositories/mixer-production-repository.ts`                       | CRUD Supabase (`mixer_production`) com filtros por data/turno/batelada |
| `src/services/mixer-production-service.ts`                              | Regras de negócio, FKs ativas, attach de relações (turno, operador)    |
| `src/actions/mixer-production-actions.ts`                               | `createMixerAction`, `updateMixerAction`                               |
| `src/components/features/mixer-production/mixer-production-manager.tsx` | Orquestra tabela, modal e empty state                                  |
| `src/components/features/mixer-production/mixer-production-table.tsx`   | TanStack Table, filtros data/turno/batelada (URL), busca e paginação   |
| `src/components/features/mixer-production/mixer-production-form.tsx`    | Formulário RHF + Zod (data, turno, operador, batelada, pesos, volumes) |
| `src/components/features/mixer-production/mixer-production-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                    |
| `src/app/(dashboard)/producao/mixer/page.tsx`                           | Página server com listagem, master data e filtros via searchParams     |
| `src/app/(dashboard)/producao/mixer/loading.tsx`                        | Skeleton de carregamento                                               |
| `supabase/migrations/20260526160000_mixer_production_rls.sql`           | RLS + índices em `mixer_production`                                    |

### Produção — Consumo de Chumbo (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/lead-consumption`)

| Arquivo                                                                 | Responsabilidade                                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/types/lead-consumption.ts`                                         | Tipos `LeadConsumption`, `LeadConsumptionWithRelations`, filtros e resumos   |
| `src/validations/lead-consumption/consumption-schema.ts`                | Schemas Zod create/update (`alloy_id`, `destination_sector_id`, peso)        |
| `src/repositories/lead-consumption-repository.ts`                       | CRUD Supabase (`lead_consumption`) com filtros por data/liga/setor           |
| `src/services/lead-consumption-service.ts`                              | Regras de negócio, FKs ativas, attach de relações, resumos para gráficos     |
| `src/actions/lead-consumption-actions.ts`                               | `createLeadConsumptionAction`, `updateLeadConsumptionAction`                 |
| `src/components/features/lead-consumption/lead-consumption-manager.tsx` | Orquestra gráficos, tabela, modal e empty state                              |
| `src/components/features/lead-consumption/lead-consumption-charts.tsx`  | Gráficos simples por dia, liga e setor de destino                            |
| `src/components/features/lead-consumption/lead-consumption-table.tsx`   | TanStack Table, filtros data/liga/setor (URL), busca e paginação             |
| `src/components/features/lead-consumption/lead-consumption-form.tsx`    | Formulário RHF + Zod (data, liga, setor, peso)                               |
| `src/components/features/lead-consumption/lead-consumption-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                          |
| `src/app/(dashboard)/producao/lead-consumption/page.tsx`                | Página server com listagem, gráficos, master data e filtros via searchParams |
| `src/app/(dashboard)/producao/lead-consumption/loading.tsx`             | Skeleton de carregamento                                                     |
| `supabase/migrations/20260526170000_lead_consumption_rls.sql`           | RLS + índices em `lead_consumption`                                          |

### Rastreabilidade — Empastadeira (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/pasting-production`)

| Arquivo                                                                     | Responsabilidade                                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/types/pasting-production.ts`                                           | Tipos `PastingProduction`, `PastingProductionWithRelations`, filtros             |
| `src/lib/utils/ep-code.ts`                                                  | Formatação do EP Code (`EP-{MODELO}-{YYYYMMDD}-{SEQ}`)                           |
| `src/validations/pasting-production/production-schema.ts`                   | Schemas Zod create/update com selects dependentes (setor)                        |
| `src/repositories/pasting-production-repository.ts`                         | CRUD Supabase (`pasting_production`) com filtros por data/turno/EP/modelo        |
| `src/services/pasting-production-service.ts`                                | Regras de negócio, FKs ativas, geração automática de EP Code, attach de relações |
| `src/actions/pasting-production-actions.ts`                                 | `createPastingAction`, `updatePastingAction`                                     |
| `src/components/features/pasting-production/pasting-production-manager.tsx` | Orquestra tabela, modal e empty state                                            |
| `src/components/features/pasting-production/pasting-production-table.tsx`   | TanStack Table, filtros data/turno/EP/modelo (URL), busca e paginação            |
| `src/components/features/pasting-production/pasting-production-form.tsx`    | Formulário RHF + Zod com selects dependentes (setor → máquina/operador)          |
| `src/components/features/pasting-production/pasting-production-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                              |
| `src/app/(dashboard)/producao/pasting/page.tsx`                             | Página server com listagem, master data e filtros via searchParams               |
| `src/app/(dashboard)/producao/pasting/loading.tsx`                          | Skeleton de carregamento                                                         |
| `supabase/migrations/20260526180000_pasting_production_rls.sql`             | RLS + índices em `pasting_production`                                            |

### Rastreabilidade — Lixação (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/sanding-scrap`)

| Arquivo                                                           | Responsabilidade                                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/types/sanding-scrap.ts`                                      | Tipos `SandingScrap`, `SandingScrapWithRelations`, filtros e resumos         |
| `src/validations/sanding-scrap/scrap-schema.ts`                   | Schemas Zod create/update (`scrap_weight`, `plates_qty_lost`)                |
| `src/repositories/sanding-scrap-repository.ts`                    | CRUD Supabase (`sanding_scrap`) com filtros por data/operador                |
| `src/services/sanding-scrap-service.ts`                           | Regras de negócio, FKs ativas, resumos para gráficos, attach de relações     |
| `src/actions/sanding-scrap-actions.ts`                            | `createSandingScrapAction`, `updateSandingScrapAction`                       |
| `src/components/features/sanding-scrap/sanding-scrap-manager.tsx` | Orquestra gráficos, tabela, modal e empty state                              |
| `src/components/features/sanding-scrap/sanding-scrap-charts.tsx`  | Gráficos de refugo diário, placas perdidas e por operador                    |
| `src/components/features/sanding-scrap/sanding-scrap-table.tsx`   | TanStack Table, filtros data/operador (URL), busca e paginação               |
| `src/components/features/sanding-scrap/sanding-scrap-form.tsx`    | Formulário RHF + Zod (data, operador, peso, placas)                          |
| `src/components/features/sanding-scrap/sanding-scrap-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                          |
| `src/app/(dashboard)/producao/sanding-scrap/page.tsx`             | Página server com listagem, gráficos, master data e filtros via searchParams |
| `src/app/(dashboard)/producao/sanding-scrap/loading.tsx`          | Skeleton de carregamento                                                     |
| `supabase/migrations/20260526190000_sanding_scrap_rls.sql`        | RLS + índices em `sanding_scrap`                                             |

### Rastreabilidade — Montagem (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/assembly-production`)

| Arquivo                                                                       | Responsabilidade                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/types/assembly-production.ts`                                            | Tipos `AssemblyProduction`, `AssemblyProductionWithRelations`, filtros      |
| `src/lib/utils/battery-lot-code.ts`                                           | Formatação do lote (`BAT-{MODELO}-{YYYYMMDD}-{SEQ}`)                        |
| `src/lib/utils/lot-characteristics.ts`                                        | Conversão JSONB ↔ pares chave/valor dinâmicos                               |
| `src/validations/assembly-production/production-schema.ts`                    | Schemas Zod create/update com selects dependentes e características         |
| `src/repositories/assembly-production-repository.ts`                          | CRUD Supabase (`assembly_production`) com filtros por data/turno/lote/EP    |
| `src/services/assembly-production-service.ts`                                 | Regras de negócio, FKs, geração de lote, EP disponíveis, attach de relações |
| `src/actions/assembly-production-actions.ts`                                  | `createAssemblyAction`, `updateAssemblyAction`                              |
| `src/components/features/assembly-production/assembly-production-manager.tsx` | Orquestra tabela, modal e empty state                                       |
| `src/components/features/assembly-production/assembly-production-table.tsx`   | TanStack Table, filtros data/turno/lote/EP (URL), busca e paginação         |
| `src/components/features/assembly-production/assembly-production-form.tsx`    | Formulário RHF + Zod com selects dependentes (setor) e EP Code              |
| `src/components/features/assembly-production/lot-characteristics-editor.tsx`  | Editor dinâmico de `lot_characteristics` (JSONB)                            |
| `src/components/features/assembly-production/assembly-production-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                         |
| `src/app/(dashboard)/producao/assembly/page.tsx`                              | Página server com listagem, master data e filtros via searchParams          |
| `src/app/(dashboard)/producao/assembly/loading.tsx`                           | Skeleton de carregamento                                                    |
| `supabase/migrations/20260526200000_assembly_production_rls.sql`              | RLS + índices em `assembly_production`                                      |

### Qualidade — Laboratório (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/lab-quality-control`)

| Arquivo                                                                       | Responsabilidade                                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/types/lab-quality-control.ts`                                            | Tipos, status (`PENDING`, `APPROVED`, `REJECTED`) e filtros                         |
| `src/lib/utils/mass-density.ts`                                               | Cálculo e formatação da densidade a partir do ácido (coluna gerada no banco)        |
| `src/validations/lab-quality-control/quality-schema.ts`                       | Schemas Zod create/update com campos nullable (`acid_concentration`, `temperature`) |
| `src/repositories/lab-quality-control-repository.ts`                          | CRUD Supabase (`lab_quality_control`) com filtros por data/status                   |
| `src/repositories/auth-repository.ts`                                         | `findProfilesByIds` para join de técnicos                                           |
| `src/repositories/mixer-production-repository.ts`                             | `findByIds` para amostras vinculadas                                                |
| `src/services/lab-quality-control-service.ts`                                 | Regras de negócio, técnico da sessão, amostras do misturador, attach de relações    |
| `src/actions/lab-quality-control-actions.ts`                                  | `createLabQualityControlAction`, `updateLabQualityControlAction`                    |
| `src/components/features/lab-quality-control/lab-quality-control-manager.tsx` | Orquestra tabela histórica, modal e empty state                                     |
| `src/components/features/lab-quality-control/lab-quality-control-table.tsx`   | TanStack Table, filtros data/status (URL), busca e paginação                        |
| `src/components/features/lab-quality-control/lab-quality-control-form.tsx`    | Formulário RHF + Zod com densidade calculada em tempo real                          |
| `src/components/features/lab-quality-control/lab-quality-control-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                                 |
| `src/app/(dashboard)/qualidade/page.tsx`                                      | Hub de módulos de qualidade                                                         |
| `src/app/(dashboard)/qualidade/laboratorio/page.tsx`                          | Página server com histórico, master data e filtros via searchParams                 |
| `src/app/(dashboard)/qualidade/laboratorio/loading.tsx`                       | Skeleton de carregamento                                                            |
| `supabase/migrations/20260526210000_lab_quality_control_rls.sql`              | RLS + índices em `lab_quality_control`                                              |

### Qualidade — Formação (`src/types`, `src/validations`, `src/repositories`, `src/services`, `src/actions`, `src/components/features/formation-records`)

| Arquivo                                                                  | Responsabilidade                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `src/types/formation-record.ts`                                          | Tipos master/detail, status (`IN_PROGRESS`, `COMPLETED`) e filtros            |
| `src/lib/utils/formation-lot-code.ts`                                    | Formatação do lote (`FORM-{YYYYMMDD}-{SEQ}`)                                  |
| `src/validations/formation-records/formation-schema.ts`                  | Schemas Zod master-detail com linhas dinâmicas e validação de duplicatas      |
| `src/repositories/formation-record-repository.ts`                        | CRUD Supabase (`formation_records`) com filtros por data/status/operador      |
| `src/repositories/formation-detail-repository.ts`                        | CRUD de detalhes com `replaceForFormation` (delete + insert)                  |
| `src/repositories/assembly-production-repository.ts`                     | `listBatteryLotCodes` para selects de lote de bateria                         |
| `src/services/formation-record-service.ts`                               | Regras de negócio, geração de lote, attach de relações, validação de FKs      |
| `src/actions/formation-record-actions.ts`                                | `createFormationRecordAction`, `updateFormationRecordAction`                  |
| `src/components/features/formation-records/formation-record-manager.tsx` | Orquestra tabela histórica expandível, modal e empty state                    |
| `src/components/features/formation-records/formation-record-table.tsx`   | TanStack Table com master expandível (detail), filtros URL, busca e paginação |
| `src/components/features/formation-records/formation-details-editor.tsx` | Editor de linhas ilimitadas com `useFieldArray` (circuito, lote, tensões)     |
| `src/components/features/formation-records/formation-record-form.tsx`    | Formulário master-detail RHF + Zod                                            |
| `src/components/features/formation-records/formation-record-modal.tsx`   | Modal create/edit (iOS Share Sheet)                                           |
| `src/app/(dashboard)/qualidade/formacao/page.tsx`                        | Página server com histórico, master data e filtros via searchParams           |
| `src/app/(dashboard)/qualidade/formacao/loading.tsx`                     | Skeleton de carregamento                                                      |
| `supabase/migrations/20260526220000_formation_records_rls.sql`           | RLS + índices em `formation_records` e `formation_details`                    |

---

## 7. Log de Execução (Roadmap)

### Fase 1: Setup e Autenticação

- [x] Configuração do projeto (Next.js, Tailwind, PWA).
- [x] Configuração de estilos globais Apple UI no Tailwind.
- [x] Supabase SSR (client, server, middleware).
- [x] Repositories e services base.
- [x] Middleware de rotas privadas.
- [x] Helpers de erro (`AppError`, `handleError`, `action-response`).
- [ ] Setup do Supabase e tabelas de autenticação (`roles`, `profiles`).
- [x] Criação da tela de Login (RHF + Zod + Server Actions).
- [x] Fluxo completo de autenticação (login, logout, sessão persistente, proteção de rotas).
- [x] Zustand global com estado de sessão (`AuthProvider`).
- [x] Layout principal responsivo (Sidebar Desktop / Tab Bar Mobile).

### Fase 2: Cadastros Base (Configurações)

- [x] CRUD Setores (`/configuracoes/setores`) — TanStack Table, modal, soft delete, RHF + Zod.
- [x] CRUD Turnos (`/configuracoes/turnos`) — TanStack Table, modal, exclusão física, RHF + Zod, validação date-fns.
- [x] CRUD Funcionários (`/configuracoes/funcionarios`) — TanStack Table, modal, soft delete, RHF + Zod, select dinâmico de setores, busca e filtros.
- [x] CRUD Máquinas (`/configuracoes/maquinas`) — TanStack Table, modal, soft delete, RHF + Zod, select dinâmico de setores, busca e filtros.
- [x] CRUD Modelos de bateria (`/configuracoes/modelos-bateria`) — TanStack Table, modal, exclusão física, RHF + Zod, validação numérica de peso, busca e filtros por faixa de peso.
- [x] CRUD Ligas de chumbo (`/configuracoes/ligas`) — TanStack Table, modal, exclusão física, RHF + Zod, busca e filtros por descrição.

### Fase 3: Produção (Peso)

- [x] Fundidora de Grade (`/producao/grid-casting`) — formulário completo, selects dependentes, Zod, Server Actions, tabela histórica, filtros data/turno, loading/empty states, toast.
- [x] Paradas da Fundidora (`/producao/grid-casting?tab=paradas`) — vínculo com apontamento, modal deslizante, duração automática, histórico com filtros, Zod, Server Actions, RLS.
- [x] Boleira (`/producao/lead-ball`) — `silo_number`, `weight_produced`, tabela histórica, filtros data/turno/silo, Zod, Server Actions, RLS.
- [x] Moinho de Óxido (`/producao/oxide-mill`) — `oxide_weight`, `oxidation_degree`, gráficos simples, tabela histórica, filtros data/turno, Zod, Server Actions, RLS.
- [x] Misturador (`/producao/mixer`) — `batch_number`, volumes, densidade, tabela histórica, filtros data/turno/batelada, Zod, Server Actions, RLS.
- [x] Consumo de Chumbo (`/producao/lead-consumption`) — `alloy_id`, `destination_sector_id`, gráficos simples, tabela histórica, filtros data/liga/setor, Zod, Server Actions, RLS.

### Fase 4: Rastreabilidade e Qualidade

- [x] Empastadeira (`/producao/pasting`) — geração automática de EP Code, rastreabilidade, histórico com filtros data/turno/EP/modelo, Zod, Server Actions, RLS.
- [x] Lixação (`/producao/sanding-scrap`) — `scrap_weight`, `plates_qty_lost`, gráficos simples, histórico com filtros data/operador, Zod, Server Actions, RLS.
- [x] Laboratório (`/qualidade/laboratorio`) — `mass_density`, `acid_concentration`, `temperature` (nullable), `status`, histórico com filtros, Zod, Server Actions, RLS.
- [x] Montagem (`/producao/assembly`) — geração automática de lote da bateria, EP Code de origem, `lot_characteristics` JSONB dinâmico, histórico com filtros, Zod, Server Actions, RLS.
- [x] Formação (`/qualidade/formacao`) — master-detail, linhas dinâmicas ilimitadas, lote `FORM-*`, histórico expandível, filtros data/status/operador, Zod, Server Actions, RLS.
