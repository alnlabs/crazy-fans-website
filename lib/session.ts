import { createHmac, timingSafeEqual } from "node:crypto"
import { SESSION_DAYS } from "@/lib/constants"

const MAX_AGE_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

export function signSession(userId: string, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: now + MAX_AGE_MS })).toString("base64url")
  const sig = createHmac("sha256", secret).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

export function readSession(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret) return null
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  if (!payload || !sig) return null
  const expected = createHmac("sha256", secret).update(payload).digest("base64url")
  const left = Buffer.from(sig)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: unknown
      exp?: unknown
    }
    if (typeof data.uid !== "string" || typeof data.exp !== "number") return null
    if (!/^[A-Za-z0-9_-]{4,80}$/.test(data.uid)) return null
    if (data.exp < now) return null
    return data.uid
  } catch {
    return null
  }
}
