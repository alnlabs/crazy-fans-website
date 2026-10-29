import Link from "next/link"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { BattleCardView, DiscussionCardView } from "@/components/cards"
import { PageFallback } from "@/components/ui"
import { VotePanel } from "@/components/vote-panel"
import { industryLabel } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { formatWhen } from "@/lib/format"
import { getHome } from "@/lib/present"

export default function HomePage() {
  return (
    <Suspense fallback={<PageFallback title="Your fandom. Your rules. Your wars." />}>
      <Home />
    </Suspense>
  )
}

async function Home() {
  const user = await getCurrentUser()
  const now = await requestNow()
  const data = await getHome(user?.id ?? null, now)
  const site = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Crazy Fans",
    description: "A community for Indian cinema fans to debate, vote, and be heard.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:2700",
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(site).replace(/</g, "\\u003c") }} />
      {user?.status === "suspended" ? (
        <p className="wrap mt-6 border border-gold/40 bg-gold/10 px-4 py-3 text-sm" role="status">
          Your account is suspended. You can read. Posting, voting, and reactions are paused.
        </p>
      ) : null}
      {data.featured ? (
        <section className="border-b border-line">
          <div className="wrap grid items-start gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
            <div>
              <p className="kicker">Featured war</p>
              <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight text-balance md:text-7xl">
                {data.featured.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">{data.featured.prompt}</p>
              <p className="mt-6 text-sm text-muted">
                Asked by{" "}
                <Link href={`/members/${data.featured.author.username}`} className="font-semibold text-paper hover:text-gold">
                  {data.featured.author.displayName}
                </Link>
                {" · "}
                {industryLabel(data.featured.industry)}
                {" · "}
                {formatWhen(data.featured.createdAt, now)}
              </p>
            </div>
            <VotePanel battle={data.featured} canVote={user?.status === "active"} returnTo="/" />
          </div>
        </section>
      ) : (
        <section className="wrap py-16">
          <h1 className="font-serif text-5xl">The room is quiet.</h1>
          <p className="mt-3 text-muted">Open the first battle when you are ready.</p>
        </section>
      )}

      <section className="wrap grid gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl tracking-tight">Trending arguments</h2>
            <Link href="/discussions" className="text-sm font-semibold text-gold">All discussions</Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.trending.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="font-serif text-3xl text-gold">{String(index + 1).padStart(2, "0")}</span>
                <DiscussionCardView item={item} now={now} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          {data.weekly ? (
            <section className="panel p-5">
              <p className="kicker">Weekly prompt</p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight">
                <Link href={`/discussions/${data.weekly.slug}`} className="hover:text-gold">{data.weekly.title}</Link>
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{data.weekly.excerpt}</p>
            </section>
          ) : null}
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl tracking-tight">More wars</h2>
              <Link href="/battles" className="text-sm font-semibold text-gold">All battles</Link>
            </div>
            <div className="mt-5 space-y-4">
              {data.battles.map((item) => (
                <BattleCardView key={item.id} item={item} now={now} />
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="wrap grid gap-8 py-12 md:grid-cols-3">
          <div>
            <p className="kicker">01</p>
            <h2 className="mt-2 font-serif text-2xl">Discover a fight worth having</h2>
            <p className="mt-2 text-sm leading-6 text-muted">A featured battle, a weekly prompt, and the arguments people are actually answering.</p>
          </div>
          <div>
            <p className="kicker">02</p>
            <h2 className="mt-2 font-serif text-2xl">Take a side, then defend it</h2>
            <p className="mt-2 text-sm leading-6 text-muted">One vote per battle. You can move it when someone earns the change.</p>
          </div>
          <div>
            <p className="kicker">03</p>
            <h2 className="mt-2 font-serif text-2xl">Come back when someone replies</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Recognition is a reply to your post, not a streak that punishes a quiet day.</p>
          </div>
        </div>
      </section>

      <section className="wrap pb-4">
        <h2 className="font-serif text-3xl tracking-tight">Fresh voices</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.fresh.map((item) => (
            <DiscussionCardView key={item.id} item={item} now={now} />
          ))}
        </div>
      </section>
    </div>
  )
}
