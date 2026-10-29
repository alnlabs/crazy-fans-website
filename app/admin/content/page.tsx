import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { SubmitButton } from "@/components/submit-button"
import { Notice } from "@/components/ui"
import { contentStatusAction } from "@/lib/actions/moderation"
import { getModerationQueue } from "@/lib/present"
import { buttonQuietClass, buttonSecondaryClass } from "@/lib/styles"

export const metadata = { title: "Content" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading content…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  )
}

async function Content({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await connection()
  const params = await searchParams
  const queue = await getModerationQueue()
  return (
    <div className="space-y-10">
      <Notice code={params.notice} />
      <section>
        <h2 className="font-serif text-3xl">Discussions</h2>
        <ul className="mt-4 space-y-3">
          {queue.discussions.map((item) => (
            <li key={item.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/discussions/${item.slug}`} className="font-semibold hover:text-gold">{item.title}</Link>
                <p className="text-sm text-muted">{item.status} · {item.author.displayName}</p>
              </div>
              <StatusForm targetType="discussion" targetId={item.id} status={item.status} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Battles</h2>
        <ul className="mt-4 space-y-3">
          {queue.battles.map((item) => (
            <li key={item.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/battles/${item.slug}`} className="font-semibold hover:text-gold">{item.title}</Link>
                <p className="text-sm text-muted">{item.status} · {item.author.displayName}</p>
              </div>
              <StatusForm targetType="battle" targetId={item.id} status={item.status} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Replies</h2>
        <ul className="mt-4 space-y-3">
          {queue.comments.map((item) => (
            <li key={item.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p>{item.body}</p>
                <p className="text-sm text-muted">{item.status} · {item.author.displayName}</p>
              </div>
              <StatusForm targetType="comment" targetId={item.id} status={item.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function StatusForm({
  targetType,
  targetId,
  status,
}: {
  targetType: "discussion" | "comment" | "battle"
  targetId: string
  status: "visible" | "removed"
}) {
  const next = status === "visible" ? "removed" : "visible"
  return (
    <form action={contentStatusAction}>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="status" value={next} />
      <SubmitButton className={next === "removed" ? buttonQuietClass : buttonSecondaryClass} pendingLabel="Saving…">
        {next === "removed" ? "Remove" : "Restore"}
      </SubmitButton>
    </form>
  )
}
