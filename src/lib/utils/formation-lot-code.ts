/**
 * Formato: FORM-{YYYYMMDD}-{SEQ}
 * Ex.: FORM-20260526-001
 */
export function formatFormationLotCode(date: string, sequence: number): string {
  const datePart = date.replace(/-/g, "")
  const seq = String(sequence).padStart(3, "0")

  return `FORM-${datePart}-${seq}`
}
