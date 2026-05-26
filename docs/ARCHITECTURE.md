# ARQUITETURA OFICIAL

# FLUXO DE DADOS

UI
↓
Server Actions
↓
Services
↓
Repositories
↓
Supabase

---

# REGRAS

## UI

- Nunca acessar Supabase diretamente.
- Nunca conter regra de negócio complexa.

## Actions

Responsáveis por:

- escrita
- autenticação
- mutações

## Services

Responsáveis por:

- regras de negócio
- cálculos
- validações complexas

## Repositories

Responsáveis por:

- queries
- acesso ao banco

---

# SERVER COMPONENTS

Utilizar para:

- leitura
- dashboards
- tabelas
- relatórios

---

# CLIENT COMPONENTS

Utilizar apenas para:

- interação
- formulários
- estado visual

---

# VALIDAÇÃO

Toda entrada deve:

1. Validar no client
2. Validar novamente no server

---

# PADRÃO DE RESPOSTA

Sempre retornar:

{
success: boolean,
data?: unknown,
message?: string
}
