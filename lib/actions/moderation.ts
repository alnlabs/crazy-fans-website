"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/current"
import { noticePath } from "@/lib/form"
import { reviewReport, setContentStatus, setMemberRole, setMemberStatus } from "@/lib/mutate"

function refreshAdmin() {
  revalidatePath("/admin/reports")
  revalidatePath("/admin/content")
  revalidatePath("/admin/users")
  revalidatePath("/admin/activity")
  revalidatePath("/")
  revalidatePath("/discussions")
  revalidatePath("/battles")
}

export async function reviewReportAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/admin/reports")
  const decision = String(formData.get("decision") ?? "")
  if (decision !== "dismiss" && decision !== "remove" && decision !== "suspend") {
    redirect("/admin/reports?notice=invalid")
  }
  if ((decision === "remove" || decision === "suspend") && formData.get("confirm") !== "on") {
    redirect("/admin/reports?notice=invalid")
  }
  const result = await reviewReport(user.id, {
    reportId: String(formData.get("reportId") ?? ""),
    decision,
    note: String(formData.get("note") ?? ""),
    now: Date.now(),
  })
  refreshAdmin()
  redirect(noticePath("/admin/reports", result.ok ? "saved" : result.code))
}

export async function contentStatusAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/admin/content")
  const targetType = String(formData.get("targetType") ?? "")
  const status = String(formData.get("status") ?? "")
  if ((targetType !== "discussion" && targetType !== "comment" && targetType !== "battle") || (status !== "visible" && status !== "removed")) {
    redirect("/admin/content?notice=invalid")
  }
  const result = await setContentStatus(user.id, targetType, String(formData.get("targetId") ?? ""), status, Date.now())
  refreshAdmin()
  redirect(noticePath("/admin/content", result.ok ? (status === "removed" ? "removed" : "restored") : result.code))
}

export async function memberStatusAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/admin/users")
  const status = String(formData.get("status") ?? "")
  if (status !== "active" && status !== "suspended") redirect("/admin/users?notice=invalid")
  const result = await setMemberStatus(user.id, String(formData.get("userId") ?? ""), status, Date.now())
  refreshAdmin()
  redirect(noticePath("/admin/users", result.ok ? "saved" : result.code))
}

export async function memberRoleAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/admin/users")
  const role = String(formData.get("role") ?? "")
  if (role !== "member" && role !== "admin") redirect("/admin/users?notice=invalid")
  const result = await setMemberRole(user.id, String(formData.get("userId") ?? ""), role, Date.now())
  refreshAdmin()
  redirect(noticePath("/admin/users", result.ok ? "saved" : result.code))
}
