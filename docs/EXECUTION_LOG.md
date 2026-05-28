# Log de Execução (Retomável) — Offline+RLS+Auditoria

Este arquivo é o **ponto único de retomada** do plano “Offline+RLS+Auditoria”.

## Como usar (importante)

- Ao iniciar uma sessão: escrever uma entrada em **Sessões**.
- Ao concluir uma fase: preencher **Feito**, **Arquivos alterados**, **Migrations**, **Como validar** e **Como retomar**.
- Não apagar itens antigos: acrescentar novos checkpoints.

## Atalhos de comandos (projeto)

- Rodar app: `npm run dev`
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Testes unitários: `npm test`
- E2E: `npm run test:e2e`

## Sessões

### Sessão 1

- **Data/hora (início)**:
- **Objetivo da sessão**:
- **Fase(s) alvo**:
- **Branch**:
- **Observações**:

---

## Fase 0 — Baseline e inventário

### Status

- **Início**: 2026-05-28
- **Estado atual**: em andamento

### Feito

- [ ] Confirmar scripts e dependências (`package.json`)
- [ ] Confirmar PWA (next-pwa) e estado do service worker
- [ ] Confirmar padrões atuais de erro/toast
- [ ] Confirmar quais tabelas usam soft delete vs delete físico

### Arquivos alterados

- (nenhum ainda)

### Migrations (Supabase)

- (nenhuma ainda)

### Como validar

- [ ] `npm run dev` inicia sem erros

### Como retomar

- Abrir este arquivo e continuar pelos itens “Feito” pendentes.

---

## Fase 1 — Padronizar erros (UI + server actions)

### Objetivo

Padronizar mensagens pt-BR para usuário e logs técnicos no console, evitando `catch` redundante e mantendo `ActionResponse` consistente.

### Checklist

- [ ] Criar helper de toast para `ActionResponse`
- [ ] Fortalecer `src/lib/utils/handle-error.ts` para mapear erros comuns
- [ ] Remover padrões divergentes de toast em forms/managers (progressivo)

### Como validar

- [ ] Uma action com falha retorna `success:false` e UI mostra toast coerente

### Como retomar

- Ver commits/diffs da fase e continuar pelos componentes faltantes.

---

## Fase 2 — Soft delete universal

### Checklist

- [x] Adicionar `is_active` nas tabelas que faltam (master data)
- [x] Ajustar repositórios/services para `softDelete` + listagens filtradas

### Arquivos/migrations desta fase

- Migration: `supabase/migrations/20260528092400_master_data_soft_delete.sql`
- Tipos: `src/lib/supabase/database.types.ts`
- Repos: `src/repositories/{battery-model,lead-alloy,shift}-repository.ts`
- Services: `src/services/{battery-model,lead-alloy,shift}-service.ts`

---

## Fase 3 — Concorrência (optimistic locking)

### Checklist

- [x] Adicionar `updated_at` + trigger nas tabelas editáveis
- [x] Update condicionado por `updated_at` (conflito → erro amigável)

### Arquivos/migrations desta fase

- Migration: `supabase/migrations/20260528094000_updated_at_optimistic_lock.sql`
- Erro de conflito: `src/lib/errors/app-error.ts` (`AppError.conflict`)
- Repositórios: `src/repositories/**` (updates com filtro por `updated_at`)
- Schemas Zod (updates): `src/validations/**` (campo `updated_at`)
- Forms: `src/components/features/**` (envia `updated_at` no update)

---

## Fase 4 — Auditoria (DB)

### Checklist

- [x] Criar `audit_log` e triggers para tabelas críticas

### Arquivos/migrations desta fase

- Migration: `supabase/migrations/20260528095500_audit_log.sql`

---

## Fase 5 — RBAC/RLS 24h

### Checklist

- [x] Padronizar `created_by` nas tabelas de produção
- [x] RLS: operador (24h) vs manager/admin (retroativo)

### Arquivos/migrations desta fase

- Migration: `supabase/migrations/20260528101000_created_by_and_rls_24h.sql`

---

## Fase 6 — Offline-first (fila local + sync)

### Checklist

- [x] Implementar outbox (IndexedDB/Dexie)
- [x] Sync foreground + (opcional) background sync via service worker
- [x] UX: banner offline + pendências

### Arquivos desta fase

- Dexie DB/outbox: `src/lib/offline/{db,outbox,outbox-executor}.ts`
- Provider: `src/components/providers/offline-sync-provider.tsx`
- Integração: `src/components/providers/app-providers.tsx`

---

## Fase 7 — Validações físicas + constraints (DB)

### Checklist

- [x] Reforçar Zod com faixas realistas
- [x] Adicionar `CHECK` constraints no Postgres

### Arquivos/migrations desta fase

- Zod: `src/validations/mixer-production/production-schema.ts`
- Migration: `supabase/migrations/20260528105000_physical_constraints.sql`

---

## Fase 8 — Playwright (mobile + rede)

### Checklist

- [x] Adicionar projeto iPhone
- [x] Cenários offline/3G/500

### Arquivos desta fase

- Config: `playwright.config.ts`
- Testes: `tests/e2e/login.spec.ts`, `tests/e2e/login-offline.spec.ts`

---

## Fase 9 — Seed + k6

### Checklist

- [x] Criar `supabase/seed.sql`
- [x] Criar scripts k6 de pico e validação RLS

### Arquivos desta fase

- Seed: `supabase/seed.sql`
- k6: `k6/smoke.js`
