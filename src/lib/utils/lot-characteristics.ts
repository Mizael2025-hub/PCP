import type { Json } from "@/lib/supabase/database.types"

export type LotCharacteristicEntry = {
  key: string
  value: string
}

export function characteristicsToJson(
  entries: LotCharacteristicEntry[]
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const entry of entries) {
    const key = entry.key.trim()
    const value = entry.value.trim()

    if (!key || !value) {
      continue
    }

    result[key] = value
  }

  return result
}

export function jsonToCharacteristicEntries(
  json: Json | Record<string, unknown> | null | undefined
): LotCharacteristicEntry[] {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return []
  }

  return Object.entries(json as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      value: String(value)
    }))
}

export function formatCharacteristicsSummary(
  json: Json | Record<string, unknown> | null | undefined
): string {
  const entries = jsonToCharacteristicEntries(json)

  if (entries.length === 0) {
    return "—"
  }

  return entries.map((entry) => `${entry.key}: ${entry.value}`).join(" · ")
}
