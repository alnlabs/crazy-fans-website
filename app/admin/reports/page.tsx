import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { SubmitButton } from "@/components/submit-button"
import { Notice } from "@/components/ui"
import { reviewReportAction } from "@/lib/actions/moderation"
import { formatWhen } from "@/lib/format"
import { getReports } from "@/lib/present"
import { buttonQuietClass, buttonSecondaryClass, inputClass } from "@/lib/styles"

export const metadata = { title: "Reports" }

export default function Page({ searchParams }: { searchParams: Promise<{ notice?: string; status?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading reports…</p>}>
      <Reports searchParams={searchParams} />
    </Suspense>
  )
}

async function Reports({ searchParams }: { searchParams: Promise<{ notice?: string; status?: string }> }) {
  const params = await searchParams
  const status = params.status === "all" ? "all" : "open"
  const now = await requestNow()
  const reports = (await getReports()).filter((report) => status === "all" || report.status === "open")
  return (
    <div>
      <div className="flex gap-4 text-sm font-semibold">
        <a href="/admin/reports" className={status === "open" ? "text-gold" : "text-muted"}>Open</a>
        <a href="/admin/reports?status=all" className={status === "all" ? "text-gold" : "text-muted"}>All</a>
      </div>
      <div className="mt-4"><Notice code={params.notice} /></div>
      {reports.length === 0 ? <p className="mt-6 text-muted">No reports in this view. That is a good stretch.</p> : null}
      <ul className="mt-6 space-y-4">
        {reports.map((report) => (
          <li key={report.id} className="panel p-4">
            <p className="text-sm text-gold">{report.reason} · {report.targetType} · {report.status}</p>
            <h2 className="mt-1 font-serif text-2xl">{report.summary}</h2>
            {report.details ? <p className="mt-2 text-sm leading-6 text-muted">{report.details}</p> : null}
            <p className="mt-2 text-sm text-muted">
              From {report.reporter.displayName} · {formatWhen(report.createdAt, now)}
            </p>
            {report.status === "open" ? (
              <div className="mt-4 flex flex-col gap-3">
                <form action={reviewReportAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="decision" value="dismiss" />
                  <input name="note" placeholder="Note for the log" className={inputClass} />
                  <SubmitButton className={buttonSecondaryClass} pendingLabel="Saving…">Dismiss</SubmitButton>
                </form>
                {report.targetType === "profile" ? null : (
                  <form action={reviewReportAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="decision" value="remove" />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="confirm" required />
                      I reviewed this against the guidelines
                    </label>
                    <SubmitButton className={`${buttonQuietClass} mt-2`} pendingLabel="Removing…">Remove content</SubmitButton>
                  </form>
                )}
                <form action={reviewReportAction}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="decision" value="suspend" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="confirm" required />
                    Suspend the member behind this report
                  </label>
                  <SubmitButton className={`${buttonQuietClass} mt-2`} pendingLabel="Suspending…">Suspend member</SubmitButton>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
