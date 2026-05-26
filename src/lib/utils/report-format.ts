export function formatReportWeight(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} kg`
}

export function formatReportInteger(value: number): string {
  return value.toLocaleString("pt-BR")
}

export function formatReportPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`
}
