import { cookies } from "next/headers"
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants"
import { getProfile, type SessionUser } from "@/lib/present"
import { getAuthSecret } from "@/lib/secret"
import { readSession, signSession } from "@/lib/session"

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const secret = await getAuthSecret()
  const id = readSession(token, secret)
  if (!id) return null
  const profile = await getProfile(id)
  if (!profile) return null
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarColor: profile.avatarColor,
    industries: profile.industries,
    role: profile.role,
    status: profile.status,
    notifyReplies: profile.notifyReplies,
    notifyChallenges: profile.notifyChallenges,
  }
}

export async function setSessionCookie(userId: string) {
  const secret = await getAuthSecret()
  const token = signSession(userId, secret)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}
