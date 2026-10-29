import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

function scryptN() {
  const n = Number(process.env.CRAZY_FANS_SCRYPT_N)
  if (Number.isInteger(n) && n >= 1024 && n <= 1048576) return n
  return 16384
}

export function hashPassword(password: string) {
  const n = scryptN()
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 32, { N: n, r: 8, p: 1 }).toString("hex")
  return `scrypt$${n}$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string) {
  if (password.length === 0 || password.length > 200) return false
  const [algo, nRaw, salt, hash] = stored.split("$")
  const n = Number(nRaw)
  if (algo !== "scrypt" || !salt || !hash || !Number.isInteger(n) || n < 1024) return false
  const next = scryptSync(password, salt, 32, { N: n, r: 8, p: 1 })
  const prev = Buffer.from(hash, "hex")
  if (next.length !== prev.length) return false
  return timingSafeEqual(next, prev)
}
