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
  - `/qualidade`
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

| Arquivo               | Responsabilidade                                             |
| --------------------- | ------------------------------------------------------------ |
| `button.tsx`          | Botão com variantes (primary, secondary, destructive, ghost) |
| `input.tsx`           | Input com label, hint e estado de erro                       |
| `select.tsx`          | Select nativo com label, hint e estado de erro               |
| `card.tsx`            | Container de conteúdo com título/descrição                   |
| `modal.tsx`           | Modal estilo iOS Share Sheet                                 |
| `table-container.tsx` | Wrapper para tabelas com scroll                              |
| `page-header.tsx`     | Cabeçalho de página com título e ações                       |
| `skeleton.tsx`        | Loading skeletons (Page, Table, Card)                        |
| `empty-state.tsx`     | Estado vazio com ícone e ação opcional                       |
| `error-state.tsx`     | Estado de erro com retry                                     |

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

- [ ] Fundidora de Grade (Produção e Paradas).
- [ ] Boleira.
- [ ] Moinho e Misturador.
- [ ] Consumo de Chumbo.

### Fase 4: Rastreabilidade e Qualidade

- [ ] Empastadeira (Geração EP).
- [ ] Lixação (Percas).
- [ ] Laboratório (Análises síncronas e assíncronas).
- [ ] Montagem (Geração de Lote e Características).
- [ ] Formação (Cabeçalho e Repetições).
