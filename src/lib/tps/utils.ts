// Utilidades especificas de TPS (formato de moneda, fecha, etc.)
// `cn` se reutiliza desde $lib/utils

export function formatCurrency(amount: number, currency: "MXN" | "USD" = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  if (!date) return "---"
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function searchMatch(text: string, query: string): boolean {
  if (!query) return true
  const t = text.toLowerCase()
  // Coincidencia por tokens: todas las palabras deben aparecer, sin importar el orden
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((tok) => t.includes(tok))
}
