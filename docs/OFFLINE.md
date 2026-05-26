# ESTRATÉGIA OFFLINE

# OBJETIVO

Permitir operação sem internet.

---

# ESTRATÉGIA

## Banco local

- IndexedDB

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
