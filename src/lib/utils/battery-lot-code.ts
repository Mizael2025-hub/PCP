/**
 * Formato: BAT-{CODIGO_MODELO}-{YYYYMMDD}-{SEQ}
 * Ex.: BAT-MF60-20260526-001
 */
export function formatBatteryLotCode(
  modelCode: string,
  date: string,
  sequence: number
): string {
  const datePart = date.replace(/-/g, "")
  const seq = String(sequence).padStart(3, "0")
  const sanitizedModel = modelCode
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20)

  return `BAT-${sanitizedModel}-${datePart}-${seq}`
}
