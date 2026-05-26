import { format, isValid, parse } from "date-fns"

const REFERENCE_DATE = new Date(2000, 0, 1)

const TIME_FORMATS = ["HH:mm:ss", "HH:mm"] as const

export function parseTimeValue(value: string): Date | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  for (const timeFormat of TIME_FORMATS) {
    const parsed = parse(trimmed, timeFormat, REFERENCE_DATE)

    if (isValid(parsed)) {
      return parsed
    }
  }

  return null
}

export function isValidTimeValue(value: string): boolean {
  return parseTimeValue(value) !== null
}

export function formatTimeDisplay(value: string): string {
  const parsed = parseTimeValue(value)

  if (!parsed) {
    return value
  }

  return format(parsed, "HH:mm")
}

export function normalizeTimeForDb(value: string): string {
  const parsed = parseTimeValue(value)

  if (!parsed) {
    return value
  }

  return format(parsed, "HH:mm:ss")
}
