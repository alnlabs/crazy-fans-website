import Link from "next/link"
import { voteAction } from "@/lib/actions/community"
import type { BattleCard } from "@/lib/types"

export function VotePanel({
  battle,
  canVote,
  returnTo,
}: {
  battle: BattleCard
  canVote: boolean
  returnTo: string
}) {
  const interactive = canVote && !battle.closed
  const list = (
    <ol className="space-y-3">
      {battle.options.map((option) => {
        const className = `relative w-full overflow-hidden rounded-sm border px-4 py-3 text-left ${
          option.selected ? "border-crimson" : "border-line"
        }`
        const style = {
          backgroundImage: `linear-gradient(90deg, rgba(226,177,90,0.22) ${option.percent}%, transparent ${option.percent}%)`,
        }
        const inner = (
          <span className="relative flex items-start justify-between gap-4">
            <span>
              <span className="block font-semibold">{option.label}</span>
              {option.leading ? <span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-gold">Leading</span> : null}
              {option.selected ? <span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-crimson">Your vote</span> : null}
            </span>
            <span className="font-serif text-2xl">{option.percent}%</span>
          </span>
        )
        return (
          <li key={option.id}>
            {interactive ? (
              <button type="submit" name="optionId" value={option.id} className={className} style={style} aria-pressed={option.selected}>
                {inner}
              </button>
            ) : (
              <div className={className} style={style}>
                {inner}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )

  return (
    <div>
      {interactive ? (
        <form action={voteAction}>
          <input type="hidden" name="battleId" value={battle.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          {list}
        </form>
      ) : (
        list
      )}
      <p className="mt-3 text-sm text-muted">
        {battle.totalVotes} {battle.totalVotes === 1 ? "vote" : "votes"}. One vote per member.
        {battle.closed ? " This battle is closed." : " Choosing another option moves your vote."}
      </p>
      {!canVote && !battle.closed ? (
        <Link href={`/login?next=${encodeURIComponent(returnTo)}`} className="mt-4 inline-block font-semibold text-gold hover:underline">
          Sign in to vote
        </Link>
      ) : null}
    </div>
  )
}
