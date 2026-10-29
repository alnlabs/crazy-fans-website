import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/constants"
import { getAuthSecret } from "@/lib/secret"
import { readSession } from "@/lib/session"
import { createClient } from "@/utils/supabase/middleware"

export async function proxy(request: NextRequest) {
  const response = await createClient(request)

  const path = request.nextUrl.pathname
  const needsSession =
    path.startsWith("/settings") ||
    path.startsWith("/admin") ||
    path.startsWith("/notifications") ||
    path === "/discussions/new" ||
    path === "/battles/new" ||
    path.endsWith("/edit")

  if (!needsSession) return response

  const secret = await getAuthSecret()
  const userId = readSession(request.cookies.get(SESSION_COOKIE)?.value, secret)
  if (userId) return response

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = "/login"
  redirectUrl.searchParams.set("next", path)
  const redirect = NextResponse.redirect(redirectUrl)
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
