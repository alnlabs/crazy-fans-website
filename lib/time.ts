import { connection } from "next/server"

export async function requestNow() {
  await connection()
  return Date.now()
}
