# ESTRATÉGIA OFFLINE

# OBJETIVO

Permitir operação sem internet.

---

# ESTRATÉGIA

## Banco local

- IndexedDB (Dexie)

## Implementação (status atual)

- Outbox (fila) persistida em `IndexedDB` via Dexie: `src/lib/offline/*`
- Provider de sincronização (foreground): `src/components/providers/offline-sync-provider.tsx`
- Forms de produção: ao detectar offline, enfileiram operação e exibem toast “Salvo no dispositivo…”

## Sincronização

Outbox Pattern:

- salva local
- envia depois

## Retry

- automático
- exponencial

## Conflitos

Comparar:

- updated_at
- version

Usuário escolhe:

- local
- servidor

---

# STATUS

Mostrar:

- online
- sincronizando
- offline
- erro

---

# PRIORIDADE

1. salvar local
2. sincronizar depois

Nunca bloquear operação do usuário.
