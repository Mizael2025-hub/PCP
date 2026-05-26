/**
 * Densidade calculada a partir da concentração de ácido (%).
 * Espelha a coluna gerada no banco: 1.000 + (acid_concentration / 100.000)
 */
export function computeMassDensity(
  acidConcentration: number | null | undefined
): number | null {
  if (acidConcentration === null || acidConcentration === undefined) {
    return null
  }

  return Math.round((1.0 + acidConcentration / 100.0) * 1000) / 1000
}

export function formatMassDensity(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—"
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })
}
