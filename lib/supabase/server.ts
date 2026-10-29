import { cookies } from "next/headers"
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server"

export async function createClient() {
  return createSupabaseServerClient(await cookies())
}
