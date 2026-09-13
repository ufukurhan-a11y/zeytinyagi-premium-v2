/** ₺ format: 12345 -> "₺12.345" */
export function fmtTL(n: number): string {
  return "₺" + n.toLocaleString("tr-TR");
}
