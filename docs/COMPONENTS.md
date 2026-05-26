# CATÁLOGO DE COMPONENTES UI (APPLE DESIGN SYSTEM / PWA)

Este documento é a referência obrigatória para a criação de interfaces. Nenhuma classe utilitária fora deste padrão deve ser utilizada.

## 1. Botões (Buttons)

```tsx
// Padrão Primário (Interativo)
<button className="apple-pressable bg-blue-500 text-white font-medium px-4 py-2 rounded-ios-btn transition-all duration-300">
  Confirmar
</button>

// Padrão Secundário / Destrutivo
<button className="apple-pressable bg-apple-red/10 text-apple-red font-medium px-4 py-2 rounded-ios-btn transition-all duration-300">
  Excluir Lote
</button>

// Container de formulários e listagens
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-ios-card shadow-sm">
  <h3 className="font-semibold text-lg mb-2">Dados da Máquina</h3>
  <p className="text-zinc-500 text-sm">Preencha os dados abaixo.</p>
</div>

// Input Padrão
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-zinc-700">Modelo da Bateria</label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-zinc-300 rounded-ios-btn focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[16px] scale-[0.93] origin-left"
    placeholder="Digite o modelo..."
  />
</div>

// Input com Erro (Feedback Não Intrusivo)
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-apple-red">Peso Bruto</label>
  <input
    type="number"
    className="w-full px-3 py-2 border border-apple-red/10 bg-apple-red/5 text-apple-red rounded-ios-btn focus:outline-none text-[16px] scale-[0.93] origin-left tabular-nums"
  />
  <span className="text-[12px] text-apple-red">Valor fora da especificação.</span>
</div>

// Navigation Bar (Topo)
<header className="sticky top-0 h-14 w-full apple-blur border-b border-zinc-200/50 flex items-center justify-between px-4 z-50">
  <h1 className="font-semibold text-lg">Produção</h1>
</header>

// Tab Bar (Rodapé Mobile)
<nav className="fixed bottom-0 h-16 w-full apple-blur border-t border-zinc-200/50 flex items-center justify-around pb-safe z-50">
  {/* OBRIGATÓRIO: Ícones Lucide com w-5 h-5 e strokeWidth={1.5} */}
</nav>

// Modal deslizante de baixo para cima (Padrão iOS Share Sheet)
<div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
  <div className="bg-white w-full sm:w-96 rounded-t-ios-modal sm:rounded-ios-card p-6 animate-in slide-in-from-bottom duration-300 ease-out pb-safe">
    {/* Indicador de arraste mobile */}
    <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />
    <h2 className="text-xl font-semibold mb-4">Novo Apontamento</h2>
    {/* Conteúdo do formulário */}
  </div>
</div>
```
