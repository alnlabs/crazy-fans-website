export function supabaseStoreEnabled() {
  if (process.env.CRAZY_FANS_DATA) return false
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}
