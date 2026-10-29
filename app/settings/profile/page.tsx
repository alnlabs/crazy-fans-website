import { Suspense } from "react"
import { connection } from "next/server"
import { ProfileForm } from "@/components/forms"
import { Notice, PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"

export const metadata = { title: "Profile settings" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<PageFallback title="Profile" />}>
      <ProfileSettings searchParams={searchParams} />
    </Suspense>
  )
}

async function ProfileSettings({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await connection()
  const user = await getCurrentUser()
  const params = await searchParams
  if (!user) return null
  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted">Email stays private: {user.email}</p>
      <div className="mt-4"><Notice code={params.notice} /></div>
      <div className="mt-6">
        <ProfileForm
          username={user.username}
          displayName={user.displayName}
          bio={user.bio}
          avatarColor={user.avatarColor}
          industries={user.industries}
        />
      </div>
    </div>
  )
}
