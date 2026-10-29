import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { Avatar } from "@/components/avatar"
import { BattleCardView, DiscussionCardView } from "@/components/cards"
import { ReportBox } from "@/components/thread"
import { Notice, PageFallback } from "@/components/ui"
import { blockAction } from "@/lib/actions/community"
import { industryLabel } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { formatDate } from "@/lib/format"
import { getMember } from "@/lib/present"
import { buttonSecondaryClass } from "@/lib/styles"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return { title: username, description: `Public profile for ${username} on Crazy Fans.` }
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ notice?: string }>
}) {
  return (
    <Suspense fallback={<PageFallback title="Member" />}>
      <MemberPage params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ notice?: string }>
}) {
  const { username } = await params
  const query = await searchParams
  const user = await getCurrentUser()
  const now = await requestNow()
  const data = await getMember(username, user?.id ?? null, now)
  if (!data) notFound()
  const member = data.member
  const returnTo = `/members/${member.username}`
  return (
    <div className="wrap py-12">
      <div className="flex flex-wrap items-start gap-5">
        <Avatar name={member.displayName} color={member.avatarColor} size="lg" />
        <div>
          <p className="kicker">Member</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">{member.displayName}</h1>
          <p className="mt-1 text-muted">@{member.username}</p>
          {member.bio ? <p className="mt-4 max-w-xl leading-7">{member.bio}</p> : null}
          <p className="mt-3 text-sm text-muted">
            Joined {formatDate(member.createdAt)}
            {member.industries.length > 0 ? ` · ${member.industries.map((item) => industryLabel(item)).join(", ")}` : ""}
          </p>
          <p className="mt-2 text-sm text-muted">
            {member.discussionCount} discussions · {member.battleCount} battles · {member.commentCount} replies
          </p>
        </div>
      </div>
      <div className="mt-6"><Notice code={query.notice} /></div>
      {!data.self && user?.status === "active" ? (
        <div className="mt-6 flex flex-wrap items-start gap-6">
          <form action={blockAction}>
            <input type="hidden" name="username" value={member.username} />
            <input type="hidden" name="blocked" value={member.blocked ? "false" : "true"} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button className={buttonSecondaryClass}>{member.blocked ? "Unblock" : "Block"}</button>
          </form>
          <ReportBox targetType="profile" targetId={data.profileId} returnTo={returnTo} signedIn />
        </div>
      ) : null}
      {member.blocked ? <p className="mt-8 text-muted">You blocked this member, so their posts are hidden from you.</p> : null}
      {data.self ? (
        <p className="mt-6 text-sm">
          <Link href="/settings/profile" className="font-semibold text-gold">Edit your profile</Link>
        </p>
      ) : null}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-3xl">Discussions</h2>
          <div className="mt-4 space-y-4">
            {data.discussions.length === 0 ? <p className="text-muted">No discussions yet.</p> : null}
            {data.discussions.map((item) => (
              <DiscussionCardView key={item.id} item={item} now={now} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-serif text-3xl">Battles</h2>
          <div className="mt-4 space-y-4">
            {data.battles.length === 0 ? <p className="text-muted">No battles yet.</p> : null}
            {data.battles.map((item) => (
              <BattleCardView key={item.id} item={item} now={now} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
