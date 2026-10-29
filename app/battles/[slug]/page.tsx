import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { CommentList, LikeControl, ReportBox } from "@/components/thread"
import { Notice, PageFallback } from "@/components/ui"
import { VotePanel } from "@/components/vote-panel"
import { categoryLabel, industryLabel } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { formatWhen } from "@/lib/format"
import { getBattle } from "@/lib/present"
import { blockAction } from "@/lib/actions/community"
import { buttonSecondaryClass } from "@/lib/styles"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getBattle(slug, null, 0)
  if (!data || data.blocked) return { title: "Battle" }
  return {
    title: data.battle.title,
    description: data.battle.prompt,
    alternates: { canonical: `/battles/${data.battle.slug}` },
  }
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ notice?: string }>
}) {
  return (
    <Suspense fallback={<PageFallback title="Battle" />}>
      <BattlePage params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function BattlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ notice?: string }>
}) {
  const { slug } = await params
  const query = await searchParams
  const user = await getCurrentUser()
  const now = await requestNow()
  const data = await getBattle(slug, user?.id ?? null, now)
  if (!data) notFound()
  const returnTo = `/battles/${slug}`
  if (data.blocked) {
    return (
      <div className="wrap py-16">
        <h1 className="font-serif text-4xl">You blocked this member</h1>
        <p className="mt-3 text-muted">Their battle stays hidden in your lists until you unblock them.</p>
        <form action={blockAction} className="mt-6">
          <input type="hidden" name="username" value={data.username} />
          <input type="hidden" name="blocked" value="false" />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className={buttonSecondaryClass}>Unblock</button>
        </form>
      </div>
    )
  }
  const battle = data.battle
  return (
    <article className="wrap py-12">
      <p className="kicker">
        <Link href="/battles" className="hover:underline">Battles</Link>
        {" · "}
        {industryLabel(battle.industry)} · {categoryLabel(battle.category)}
      </p>
      <h1 className="mt-3 max-w-4xl font-serif text-5xl tracking-tight md:text-6xl">{battle.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{battle.prompt}</p>
      <p className="mt-4 text-sm text-muted">
        <Link href={`/members/${battle.author.username}`} className="font-semibold text-paper hover:text-gold">{battle.author.displayName}</Link>
        {" · "}
        {formatWhen(battle.createdAt, now)}
      </p>
      <div className="mt-6"><Notice code={query.notice} /></div>
      <div className="mt-8 max-w-2xl">
        <VotePanel battle={battle} canVote={user?.status === "active"} returnTo={returnTo} />
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <LikeControl targetType="battle" targetId={battle.id} returnTo={returnTo} liked={battle.liked} count={battle.likeCount} canAct={user?.status === "active"} />
        <ReportBox targetType="battle" targetId={battle.id} returnTo={returnTo} signedIn={Boolean(user)} />
      </div>
      <CommentList
        comments={data.comments}
        now={now}
        returnTo={returnTo}
        canAct={user?.status === "active"}
        signedIn={Boolean(user)}
        battleId={battle.id}
      />
    </article>
  )
}
