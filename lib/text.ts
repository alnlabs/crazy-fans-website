const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "moderator",
  "support",
  "crazyfans",
  "crazy-fans",
  "null",
  "undefined",
  "system",
])

export function cleanText(input: string) {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return base || "post"
}

export function excerpt(input: string, length = 180) {
  const flat = input.replace(/\s+/g, " ").trim()
  if (flat.length <= length) return flat
  return `${flat.slice(0, length - 1).trimEnd()}…`
}

export function linkCount(input: string) {
  return input.match(/https?:\/\//gi)?.length ?? 0
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120
}

export function validUsername(username: string) {
  return /^[a-z0-9_]{3,20}$/.test(username) && !RESERVED_USERNAMES.has(username)
}

export function safeNext(value: unknown, fallback = "/") {
  if (typeof value !== "string" || value.length > 200) return fallback
  if (!/^\/(?!\/)[A-Za-z0-9/_\-.?=&%]*$/.test(value)) return fallback
  if (value.includes("://") || value.includes("\\")) return fallback
  return value
}
