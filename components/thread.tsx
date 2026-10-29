import Link from "next/link"
import { CommentForm } from "@/components/forms"
import { SubmitButton } from "@/components/submit-button"
import { reactionAction, removeCommentAction, reportAction } from "@/lib/actions/community"
import { REPORT_REASONS } from "@/lib/constants"
import { formatWhen } from "@/lib/format"
import { buttonQuietClass, inputClass, labelClass } from "@/lib/styles"
import type { CommentCard, ReportTarget } from "@/lib/types"

export function LikeControl({
  targetType,
  targetId,
  returnTo,
  liked,
  count,
  canAct,
}: {
  targetType: "discussion" | "comment" | "battle"
  targetId: string
  returnTo: string
  liked: boolean
  count: number
  canAct: boolean
}) {
  const label = `${liked ? "Liked" : "Like"} · ${count}`
  if (!canAct) return <p className="text-sm text-muted">{count} {count === 1 ? "like" : "likes"}</p>
  return (
    <form action={reactionAction}>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <SubmitButton className={buttonQuietClass} pendingLabel="Saving…">
        {label}
      </SubmitButton>
    </form>
  )
}

export function ReportBox({
  targetType,
  targetId,
  returnTo,
  signedIn,
}: {
  targetType: ReportTarget
  targetId: string
  returnTo: string
  signedIn: boolean
}) {
  if (!signedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(returnTo)}`} className="text-sm text-muted hover:text-gold">
        Sign in to report
      </Link>
    )
  }
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted hover:text-gold">Report</summary>
      <form action={reportAction} className="mt-3 space-y-3">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className={labelClass} htmlFor={`reason-${targetId}`}>
          Reason
        </label>
        <select id={`reason-${targetId}`} name="reason" className={inputClass} required defaultValue="harassment">
          {REPORT_REASONS.map((reason) => (
            <option key={reason.id} value={reason.id}>
              {reason.label}
            </option>
          ))}
        </select>
        <label className={labelClass} htmlFor={`details-${targetId}`}>
          Details
        </label>
        <textarea id={`details-${targetId}`} name="details" className={inputClass} rows={3} maxLength={1000} />
        <SubmitButton pendingLabel="Sending…">Send report</SubmitButton>
      </form>
    </details>
  )
}

export function CommentList({
  comments,
  now,
  returnTo,
  canAct,
  signedIn,
  discussionId,
  battleId,
}: {
  comments: CommentCard[]
  now: number
  returnTo: string
  canAct: boolean
  signedIn: boolean
  discussionId?: string
  battleId?: string
}) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl tracking-tight">Replies</h2>
      {comments.length === 0 ? <p className="mt-3 text-muted">No replies yet. The first useful one sets the tone.</p> : null}
      <ol className="mt-6 space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="panel p-4">
            <p className="text-sm text-muted">
              <Link href={`/members/${comment.author.username}`} className="font-semibold text-paper hover:text-gold">
                {comment.author.displayName}
              </Link>
              <span> · {formatWhen(comment.createdAt, now)}</span>
            </p>
            <p className="mt-3 whitespace-pre-wrap leading-7">{comment.body}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <LikeControl
                targetType="comment"
                targetId={comment.id}
                returnTo={returnTo}
                liked={comment.liked}
                count={comment.likeCount}
                canAct={canAct}
              />
              {comment.mine ? (
                <form action={removeCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <SubmitButton className={buttonQuietClass} pendingLabel="Removing…">
                    Remove
                  </SubmitButton>
                </form>
              ) : (
                <ReportBox targetType="comment" targetId={comment.id} returnTo={returnTo} signedIn={signedIn} />
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        {canAct ? (
          <CommentForm discussionId={discussionId} battleId={battleId} returnTo={returnTo} />
        ) : signedIn ? (
          <p className="text-sm text-muted">Your account is suspended, so replies are paused.</p>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(returnTo)}`} className="font-semibold text-gold hover:underline">
            Sign in to reply
          </Link>
        )}
      </div>
    </section>
  )
}
