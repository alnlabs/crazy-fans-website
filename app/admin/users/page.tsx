import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { Avatar } from "@/components/avatar"
import { SubmitButton } from "@/components/submit-button"
import { Notice } from "@/components/ui"
import { memberRoleAction, memberStatusAction } from "@/lib/actions/moderation"
import { formatDate } from "@/lib/format"
import { getMembersAdmin } from "@/lib/present"
import { buttonQuietClass, buttonSecondaryClass } from "@/lib/styles"

export const metadata = { title: "Members" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading members…</p>}>
      <Members searchParams={searchParams} />
    </Suspense>
  )
}

async function Members({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await connection()
  const params = await searchParams
  const members = await getMembersAdmin()
  return (
    <div>
      <Notice code={params.notice} />
      <ul className="mt-4 space-y-3">
        {members.map((member) => (
          <li key={member.id} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={member.displayName} color={member.avatarColor} size="sm" />
              <div>
                <Link href={`/members/${member.username}`} className="font-semibold hover:text-gold">{member.displayName}</Link>
                <p className="text-sm text-muted">
                  @{member.username} · {member.email} · {member.role} · {member.status} · joined {formatDate(member.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={memberStatusAction}>
                <input type="hidden" name="userId" value={member.id} />
                <input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} />
                <SubmitButton className={buttonSecondaryClass} pendingLabel="Saving…">
                  {member.status === "active" ? "Suspend" : "Reinstate"}
                </SubmitButton>
              </form>
              <form action={memberRoleAction}>
                <input type="hidden" name="userId" value={member.id} />
                <input type="hidden" name="role" value={member.role === "admin" ? "member" : "admin"} />
                <SubmitButton className={buttonQuietClass} pendingLabel="Saving…">
                  {member.role === "admin" ? "Make member" : "Make moderator"}
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
