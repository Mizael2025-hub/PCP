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

- `/login`
- `/(dashboard)`
  - `/producao`
  - `/qualidade`
  - `/estoque`
  - `/configuracoes`

---

## 5. Log de Execução (Roadmap)

### Fase 1: Setup e Autenticação

- [x] Configuração do projeto (Next.js, Tailwind, PWA).
- [x] Configuração de estilos globais Apple UI no Tailwind.
- [ ] Setup do Supabase e tabelas de autenticação (`roles`, `profiles`).
- [x] Criação da tela de Login.
- [ ] Layout principal responsivo (Sidebar Desktop / Tab Bar Mobile).

### Fase 2: Cadastros Base (Configurações)

- [ ] Telas de CRUD: Setores, Máquinas, Operadores, Turnos, Modelos, Ligas.

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
