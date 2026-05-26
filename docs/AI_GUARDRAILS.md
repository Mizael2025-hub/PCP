# AI GUARDRAILS

# OBJETIVO

Garantir estabilidade e evitar destruição arquitetural.

---

# PROIBIDO

- Refatorar código sem solicitação.
- Alterar estrutura existente.
- Criar arquivos desnecessários.
- Trocar bibliotecas.
- Reescrever componentes inteiros.
- Alterar tipagens globais.
- Criar abstrações prematuras.
- Criar lógica duplicada.

---

# OBRIGATÓRIO

- Mudanças pequenas.
- Preservar padrão existente.
- Reutilizar componentes.
- Validar TypeScript.
- Atualizar PROJECT_MAP.md.

---

# PERFORMANCE

Priorizar:

- Server Components
- Lazy loading
- Memoização apenas quando necessário

Evitar:

- useEffect desnecessário
- múltiplos fetches
- re-render excessivo

---

# SEGURANÇA

- Nunca confiar no client.
- Validar tudo no servidor.
- Respeitar RLS.
- Nunca expor secrets.
