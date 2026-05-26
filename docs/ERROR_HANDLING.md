# PADRÃO DE ERROS

# OBJETIVO

Padronizar erros do sistema.

---

# PADRÃO

try {

} catch (error) {
console.error("[functionName]", error)

return {
success: false,
message: "Erro interno."
}
}

---

# FRONTEND

- Toast amigável
- Nunca expor stacktrace

---

# BACKEND

Sempre logar:

- função
- erro
- payload relevante

---

# PROIBIDO

- catch vazio
- throw genérico
- silenciar erro
