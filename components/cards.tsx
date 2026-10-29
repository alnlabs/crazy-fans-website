import Link from "next/link"
import { categoryLabel, industryLabel } from "@/lib/constants"
import { formatWhen } from "@/lib/format"
import type { BattleCard, DiscussionCard } from "@/lib/types"

export function DiscussionCardView({ item, now }: { item: DiscussionCard; now: number }) {
  return (
    <article className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        {industryLabel(item.industry)} · {categoryLabel(item.category)}
      </p>
      <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight">
        <Link href={`/discussions/${item.slug}`} className="hover:text-gold">
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">{item.excerpt}</p>
      <p className="mt-4 text-sm text-muted">
        <Link href={`/members/${item.author.username}`} className="font-semibold text-paper hover:text-gold">
          {item.author.displayName}
        </Link>
        <span> · {formatWhen(item.createdAt, now)}</span>
        <span> · {item.commentCount} {item.commentCount === 1 ? "reply" : "replies"}</span>
        <span> · {item.likeCount} {item.likeCount === 1 ? "like" : "likes"}</span>
      </p>
    </article>
  )
}

export function BattleCardView({ item, now }: { item: BattleCard; now: number }) {
  const leader = item.options.find((option) => option.leading)
  return (
    <article className="panel border-l-4 border-l-crimson p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        {item.featured ? "Featured · " : ""}
        {industryLabel(item.industry)} · {categoryLabel(item.category)}
      </p>
      <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight">
        <Link href={`/battles/${item.slug}`} className="hover:text-gold">
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">{item.prompt}</p>
      <p className="mt-4 text-sm text-muted">
        {leader ? `Leading: ${leader.label} · ${leader.percent}%` : "No votes yet"}
        <span> · {item.totalVotes} {item.totalVotes === 1 ? "vote" : "votes"}</span>
        <span> · {formatWhen(item.createdAt, now)}</span>
      </p>
    </article>
  )
}
