import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const createClient = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!supabaseUrl || !supabaseKey) return { response: supabaseResponse, userId: null }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Refreshes the auth cookies. Do not add logic between creating the client and this call.
  const { data } = await supabase.auth.getUser()
  return { response: supabaseResponse, userId: data.user?.id ?? null }
}
