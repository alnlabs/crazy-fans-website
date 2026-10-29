import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { CommentList, LikeControl, ReportBox } from "@/components/thread"
import { Notice, PageFallback } from "@/components/ui"
import { blockAction, removeDiscussionAction } from "@/lib/actions/community"
import { categoryLabel, industryLabel } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { formatWhen } from "@/lib/format"
import { getDiscussion } from "@/lib/present"
import { buttonQuietClass, buttonSecondaryClass } from "@/lib/styles"
import { SubmitButton } from "@/components/submit-button"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getDiscussion(slug, null)
  if (!data || data.blocked) return { title: "Discussion" }
  return {
    title: data.discussion.title,
    description: data.discussion.excerpt,
    alternates: { canonical: `/discussions/${data.discussion.slug}` },
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
    <Suspense fallback={<PageFallback title="Discussion" />}>
      <DiscussionPage params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function DiscussionPage({
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
  const data = await getDiscussion(slug, user?.id ?? null)
  if (!data) notFound()
  const returnTo = `/discussions/${slug}`
  if (data.blocked) {
    return (
      <div className="wrap py-16">
        <h1 className="font-serif text-4xl">You blocked this member</h1>
        <form action={blockAction} className="mt-6">
          <input type="hidden" name="username" value={data.username} />
          <input type="hidden" name="blocked" value="false" />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className={buttonSecondaryClass}>Unblock</button>
        </form>
      </div>
    )
  }
  const discussion = data.discussion
  const edited = new Date(discussion.updatedAt).getTime() - new Date(discussion.createdAt).getTime() > 60_000
  return (
    <article className="wrap max-w-3xl py-12">
      <p className="kicker">
        <Link href="/discussions" className="hover:underline">Discussions</Link>
        {" · "}
        {industryLabel(discussion.industry)} · {categoryLabel(discussion.category)}
      </p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">{discussion.title}</h1>
      <p className="mt-4 text-sm text-muted">
        <Link href={`/members/${discussion.author.username}`} className="font-semibold text-paper hover:text-gold">{discussion.author.displayName}</Link>
        {" · "}
        {formatWhen(discussion.createdAt, now)}
        {edited ? " · edited" : ""}
      </p>
      <div className="mt-6"><Notice code={query.notice} /></div>
      <div className="mt-6 whitespace-pre-wrap text-lg leading-8">{discussion.body}</div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <LikeControl
          targetType="discussion"
          targetId={discussion.id}
          returnTo={returnTo}
          liked={discussion.liked}
          count={discussion.likeCount}
          canAct={user?.status === "active"}
        />
        {discussion.mine ? (
          <>
            <Link href={`/discussions/${discussion.slug}/edit`} className={buttonSecondaryClass}>Edit</Link>
            <form action={removeDiscussionAction}>
              <input type="hidden" name="slug" value={discussion.slug} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <SubmitButton className={buttonQuietClass} pendingLabel="Removing…">Remove</SubmitButton>
            </form>
          </>
        ) : (
          <ReportBox targetType="discussion" targetId={discussion.id} returnTo={returnTo} signedIn={Boolean(user)} />
        )}
      </div>
      <CommentList
        comments={data.comments}
        now={now}
        returnTo={returnTo}
        canAct={user?.status === "active"}
        signedIn={Boolean(user)}
        discussionId={discussion.id}
      />
    </article>
  )
}
