import { Suspense } from "react"
import { connection } from "next/server"
import { SubmitButton } from "@/components/submit-button"
import { Notice } from "@/components/ui"
import { notificationPrefsAction } from "@/lib/actions/community"
import { getCurrentUser } from "@/lib/current"

export const metadata = { title: "Notification settings" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading notification settings…</p>}>
      <NotificationSettings searchParams={searchParams} />
    </Suspense>
  )
}

async function NotificationSettings({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await connection()
  const user = await getCurrentUser()
  const params = await searchParams
  if (!user) return null
  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Notifications</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        Replies show up on the site when you ask for them. Email delivery is not connected, and nothing here will nag you into a daily streak.
      </p>
      <div className="mt-4"><Notice code={params.notice} /></div>
      <form action={notificationPrefsAction} className="mt-6 space-y-4">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="replies" defaultChecked={user.notifyReplies} />
          <span>
            <span className="block font-semibold">Replies</span>
            <span className="text-sm text-muted">When someone replies to your discussion or battle.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="challenges" defaultChecked={user.notifyChallenges} />
          <span>
            <span className="block font-semibold">Challenges</span>
            <span className="text-sm text-muted">Saved for later. Weekly challenges are not running yet.</span>
          </span>
        </label>
        <SubmitButton>Save preferences</SubmitButton>
      </form>
    </div>
  )
}
