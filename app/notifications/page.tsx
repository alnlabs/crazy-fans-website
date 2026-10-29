import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { SubmitButton } from "@/components/submit-button"
import { Notice, PageFallback } from "@/components/ui"
import { markReadAction } from "@/lib/actions/community"
import { getCurrentUser } from "@/lib/current"
import { formatWhen } from "@/lib/format"
import { getNotifications } from "@/lib/present"
import { buttonSecondaryClass } from "@/lib/styles"

export const metadata = { title: "Notifications" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<PageFallback title="Notifications" />}>
      <NotificationsPage searchParams={searchParams} />
    </Suspense>
  )
}

async function NotificationsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/notifications")
  const params = await searchParams
  const notes = await getNotifications(user.id)
  const now = await requestNow()
  return (
    <div className="wrap max-w-3xl py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Inbox</p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight">Notifications</h1>
        </div>
        {notes.some((note) => !note.read) ? (
          <form action={markReadAction}>
            <SubmitButton className={buttonSecondaryClass} pendingLabel="Marking…">Mark all read</SubmitButton>
          </form>
        ) : null}
      </div>
      <div className="mt-6"><Notice code={params.notice} /></div>
      {notes.length === 0 ? <p className="mt-8 text-muted">Replies to your discussions and battles will show up here.</p> : null}
      <ul className="mt-6 space-y-3">
        {notes.map((note) => (
          <li key={note.id} className={`panel p-4 ${note.read ? "opacity-70" : ""}`}>
            <p>
              <Link href={`/members/${note.actor.username}`} className="font-semibold hover:text-gold">{note.actor.displayName}</Link>
              {" replied: "}
              <Link href={`/${note.targetType === "discussion" ? "discussions" : "battles"}/${note.targetSlug}`} className="hover:text-gold">
                {note.excerpt}
              </Link>
            </p>
            <p className="mt-2 text-sm text-muted">{formatWhen(note.createdAt, now)}{note.read ? "" : " · unread"}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
