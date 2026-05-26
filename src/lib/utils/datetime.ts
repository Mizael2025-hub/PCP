import { differenceInMinutes, format, isValid, parseISO } from "date-fns"

export function datetimeLocalToIso(value: string): string {
  const parsed = new Date(value)

  if (!isValid(parsed)) {
    return value
  }

  return parsed.toISOString()
}

export function isoToDatetimeLocal(value: string): string {
  const parsed = parseISO(value)

  if (!isValid(parsed)) {
    return value
  }

  return format(parsed, "yyyy-MM-dd'T'HH:mm")
}

export function computeDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const start = parseISO(startTime)
  const end = parseISO(endTime)

  if (!isValid(start) || !isValid(end)) {
    return 0
  }

  return Math.max(0, differenceInMinutes(end, start))
}

export function computeDurationMinutesFromLocal(
  startLocal: string,
  endLocal: string
): number {
  const start = new Date(startLocal)
  const end = new Date(endLocal)

  if (!isValid(start) || !isValid(end)) {
    return 0
  }

  return Math.max(0, differenceInMinutes(end, start))
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (remainder === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainder} min`
}
