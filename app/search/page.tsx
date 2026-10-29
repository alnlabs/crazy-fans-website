import Link from "next/link"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { Avatar } from "@/components/avatar"
import { BattleCardView, DiscussionCardView } from "@/components/cards"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"
import { searchContent } from "@/lib/present"
import { buttonClass, inputClass } from "@/lib/styles"

export const metadata = { title: "Search", description: "Search discussions, battles, and members." }

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<PageFallback title="Search" />}>
      <SearchPage searchParams={searchParams} />
    </Suspense>
  )
}

async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams
  const user = await getCurrentUser()
  const now = await requestNow()
  const results = await searchContent(q, user?.id ?? null, now)
  return (
    <div className="wrap py-12">
      <p className="kicker">Find</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Search</h1>
      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/search">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={results.query} placeholder="A film, a question, a member" className={inputClass} />
        <button className={buttonClass}>Search</button>
      </form>
      {results.tooShort ? <p className="mt-6 text-muted">Type at least two characters.</p> : null}
      {!results.tooShort && results.discussions.length + results.battles.length + results.members.length === 0 ? (
        <p className="mt-6 text-muted">Nothing matched. Try a film industry, a title, or a username.</p>
      ) : null}
      {results.members.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">Members</h2>
          <ul className="mt-4 space-y-3">
            {results.members.map((member) => (
              <li key={member.username}>
                <Link href={`/members/${member.username}`} className="flex items-center gap-3 hover:text-gold">
                  <Avatar name={member.displayName} color={member.avatarColor} size="sm" />
                  <span>
                    <span className="block font-semibold">{member.displayName}</span>
                    <span className="text-sm text-muted">@{member.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {results.battles.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-3xl">Battles</h2>
          {results.battles.map((item) => (
            <BattleCardView key={item.id} item={item} now={now} />
          ))}
        </section>
      ) : null}
      {results.discussions.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="font-serif text-3xl">Discussions</h2>
          {results.discussions.map((item) => (
            <DiscussionCardView key={item.id} item={item} now={now} />
          ))}
        </section>
      ) : null}
    </div>
  )
}
