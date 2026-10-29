export function formatWhen(iso: string, now: number) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const delta = Math.max(0, now - then)
  const minutes = Math.round(delta / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 36) return `${hours}h ago`
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(then)
}

export function formatDate(iso: string) {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ""
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(then)
}

export function inkOn(hex: string) {
  const h = hex.replace("#", "")
  if (h.length !== 6) return "#fff8f2"
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.62 ? "#110e0c" : "#fff8f2"
}

export function paginate<T>(items: T[], page: number, size = 12) {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), pages)
  const start = (current - 1) * size
  return {
    items: items.slice(start, start + size),
    page: current,
    pages,
    total: items.length,
  }
}
