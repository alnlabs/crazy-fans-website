"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/current"
import { noticePath, toForm } from "@/lib/form"
import {
  castVote,
  createBattle,
  createComment,
  createDiscussion,
  fileReport,
  markActive,
  markNotificationsRead,
  removeOwnComment,
  removeOwnDiscussion,
  setBlock,
  toggleReaction,
  updateDiscussion,
  updateNotificationPrefs,
  updateProfile,
} from "@/lib/mutate"
import { safeNext } from "@/lib/text"
import type { FormState } from "@/lib/types"

function bounce(formData: FormData, code: string): never {
  const path = safeNext(formData.get("returnTo"), "/")
  redirect(noticePath(path, code))
}

function refresh(paths: string[]) {
  for (const path of new Set(paths.map((item) => item.split("?")[0] || "/"))) revalidatePath(path)
}

export async function createDiscussionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/discussions/new")
  const result = await createDiscussion(user.id, {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    category: String(formData.get("category") ?? ""),
    company: String(formData.get("company") ?? ""),
    now: Date.now(),
  })
  if (!result.ok || !result.slug) return toForm(result)
  refresh(["/", "/discussions", `/discussions/${result.slug}`])
  redirect(`/discussions/${result.slug}`)
}

export async function updateDiscussionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  const slug = String(formData.get("slug") ?? "")
  if (!user) redirect(`/login?next=/discussions/${slug}/edit`)
  const result = await updateDiscussion(user.id, slug, {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    category: String(formData.get("category") ?? ""),
    now: Date.now(),
  })
  if (!result.ok) return toForm(result)
  refresh(["/", "/discussions", `/discussions/${slug}`])
  redirect(`/discussions/${slug}`)
}

export async function removeDiscussionAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const result = await removeOwnDiscussion(user.id, String(formData.get("slug") ?? ""), Date.now())
  if (!result.ok) bounce(formData, result.code)
  refresh(["/", "/discussions"])
  redirect("/discussions?notice=discussion-removed")
}

export async function createBattleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/battles/new")
  const options = [0, 1, 2, 3].map((index) => String(formData.get(`option${index}`) ?? ""))
  const result = await createBattle(user.id, {
    title: String(formData.get("title") ?? ""),
    prompt: String(formData.get("prompt") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    category: String(formData.get("category") ?? ""),
    options,
    company: String(formData.get("company") ?? ""),
    now: Date.now(),
  })
  if (!result.ok || !result.slug) return toForm(result)
  refresh(["/", "/battles", `/battles/${result.slug}`])
  redirect(`/battles/${result.slug}`)
}

export async function voteAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const result = await castVote(user.id, String(formData.get("battleId") ?? ""), String(formData.get("optionId") ?? ""), Date.now())
  const slug = result.ok ? result.slug : undefined
  refresh(["/", "/battles", slug ? `/battles/${slug}` : "/battles"])
  if (!result.ok) bounce(formData, result.code)
  bounce(formData, "voted")
}

export async function commentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  const returnTo = safeNext(formData.get("returnTo"), "/")
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`)
  const discussionId = String(formData.get("discussionId") ?? "")
  const battleId = String(formData.get("battleId") ?? "")
  const result = await createComment(user.id, {
    body: String(formData.get("body") ?? ""),
    discussionId: discussionId || undefined,
    battleId: battleId || undefined,
    company: String(formData.get("company") ?? ""),
    now: Date.now(),
  })
  if (!result.ok) return toForm(result)
  refresh(["/", returnTo, "/discussions", "/battles", "/notifications"])
  return { ok: true }
}

export async function removeCommentAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const result = await removeOwnComment(user.id, String(formData.get("commentId") ?? ""), Date.now())
  refresh([safeNext(formData.get("returnTo"), "/")])
  if (!result.ok) bounce(formData, result.code)
  bounce(formData, "comment-removed")
}

export async function reactionAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const targetType = String(formData.get("targetType") ?? "")
  if (targetType !== "discussion" && targetType !== "comment" && targetType !== "battle") bounce(formData, "invalid")
  const result = await toggleReaction(user.id, targetType, String(formData.get("targetId") ?? ""), Date.now())
  refresh(["/", safeNext(formData.get("returnTo"), "/")])
  if (!result.ok) bounce(formData, result.code)
  redirect(safeNext(formData.get("returnTo"), "/"))
}

export async function reportAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const result = await fileReport(user.id, {
    targetType: String(formData.get("targetType") ?? ""),
    targetId: String(formData.get("targetId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    details: String(formData.get("details") ?? ""),
    now: Date.now(),
  })
  refresh(["/admin/reports"])
  if (!result.ok) bounce(formData, result.code)
  bounce(formData, "reported")
}

export async function blockAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) bounce(formData, "forbidden")
  const blocked = formData.get("blocked") === "true"
  const username = String(formData.get("username") ?? "")
  const result = await setBlock(user.id, username, blocked, Date.now())
  refresh(["/", `/members/${username}`, "/discussions", "/battles"])
  if (!result.ok) bounce(formData, result.code)
  bounce(formData, blocked ? "blocked" : "unblocked")
}

export async function profileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/settings/profile")
  const industries = formData.getAll("industry").map(String)
  const result = await updateProfile(user.id, {
    username: String(formData.get("username") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    avatarColor: String(formData.get("avatarColor") ?? ""),
    industries,
    now: Date.now(),
  })
  if (!result.ok) return toForm(result)
  refresh(["/", `/members/${result.slug ?? user.username}`, "/settings/profile"])
  redirect("/settings/profile?notice=saved")
}

export async function notificationPrefsAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/settings/notifications")
  const result = await updateNotificationPrefs(user.id, {
    replies: formData.get("replies") === "on",
    challenges: formData.get("challenges") === "on",
    now: Date.now(),
  })
  if (!result.ok) redirect(`/settings/notifications?notice=${result.code}`)
  revalidatePath("/settings/notifications")
  redirect("/settings/notifications?notice=saved")
}

export async function markReadAction() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/notifications")
  await markNotificationsRead(user.id)
  revalidatePath("/notifications")
  revalidatePath("/", "layout")
  redirect("/notifications?notice=marked-read")
}

export async function markActiveAction() {
  const user = await getCurrentUser()
  if (!user) return
  await markActive(user.id, Date.now())
}
