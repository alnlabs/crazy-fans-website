import { cache } from "react"
import type {
  AnalyticsEvent,
  Battle,
  BattleOption,
  Block,
  Category,
  Comment,
  Discussion,
  EventType,
  FavoriteIndustry,
  Industry,
  ModerationAction,
  Notification,
  Profile,
  Reaction,
  ReactionTarget,
  Report,
  ReportReason,
  ReportStatus,
  ReportTarget,
  Store,
  Vote,
} from "@/lib/types"

type Row = Record<string, unknown>
type QueryError = { message: string; code?: string }

const MISSING = "The Supabase community tables are not there yet. Open the SQL editor and run supabase/migrations/001_community.sql, then reload."

async function db() {
  const { cookies } = await import("next/headers")
  const { createClient } = await import("@/utils/supabase/server")
  return createClient(await cookies())
}

function dbMessage(error: QueryError) {
  if (error.code === "PGRST205" || /schema cache/i.test(error.message)) return MISSING
  if (error.code === "23505") return "That was already taken."
  if (error.code === "23514") return "That did not meet the community rules."
  return error.message
}

async function allRows(table: string) {
  const supabase = await db()
  const rows: Row[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + pageSize - 1)
    if (error) throw new Error(dbMessage(error))
    const batch = (data ?? []) as Row[]
    rows.push(...batch)
    if (batch.length < pageSize) break
  }
  return rows
}

async function optionalRows(table: string) {
  try {
    return await allRows(table)
  } catch (error) {
    if (error instanceof Error && error.message === MISSING) throw error
    return []
  }
}

function text(row: Row, key: string) {
  return String(row[key] ?? "")
}

function profile(row: Row): Profile {
  return {
    id: text(row, "id"),
    email: "",
    passwordHash: "",
    username: text(row, "username"),
    displayName: text(row, "display_name"),
    bio: text(row, "bio"),
    avatarColor: text(row, "avatar_color"),
    industries: Array.isArray(row.industries) ? (row.industries as FavoriteIndustry[]) : [],
    role: row.role === "admin" ? "admin" : "member",
    status: row.status === "suspended" ? "suspended" : "active",
    notifyReplies: row.notify_replies !== false,
    notifyChallenges: row.notify_challenges === true,
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  }
}

function discussion(row: Row): Discussion {
  return {
    id: text(row, "id"),
    authorId: text(row, "author_id"),
    slug: text(row, "slug"),
    title: text(row, "title"),
    body: text(row, "body"),
    industry: text(row, "industry") as Industry,
    category: text(row, "category") as Category,
    status: row.status === "removed" ? "removed" : "visible",
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  }
}

function comment(row: Row): Comment {
  return {
    id: text(row, "id"),
    authorId: text(row, "author_id"),
    discussionId: row.discussion_id ? text(row, "discussion_id") : null,
    battleId: row.battle_id ? text(row, "battle_id") : null,
    body: text(row, "body"),
    status: row.status === "removed" ? "removed" : "visible",
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  }
}

function battle(row: Row): Battle {
  return {
    id: text(row, "id"),
    authorId: text(row, "author_id"),
    slug: text(row, "slug"),
    title: text(row, "title"),
    prompt: text(row, "prompt"),
    industry: text(row, "industry") as Industry,
    category: text(row, "category") as Category,
    featured: row.featured === true,
    status: row.status === "removed" ? "removed" : "visible",
    createdAt: text(row, "created_at"),
    closesAt: row.closes_at ? text(row, "closes_at") : null,
  }
}

function option(row: Row): BattleOption {
  return { id: text(row, "id"), battleId: text(row, "battle_id"), label: text(row, "label"), position: Number(row.position) }
}

function vote(row: Row): Vote {
  return {
    id: text(row, "id"),
    battleId: text(row, "battle_id"),
    optionId: text(row, "option_id"),
    userId: text(row, "user_id"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  }
}

function reaction(row: Row): Reaction {
  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    targetType: text(row, "target_type") as ReactionTarget,
    targetId: text(row, "target_id"),
    createdAt: text(row, "created_at"),
  }
}

function report(row: Row): Report {
  return {
    id: text(row, "id"),
    reporterId: text(row, "reporter_id"),
    targetType: text(row, "target_type") as ReportTarget,
    targetId: text(row, "target_id"),
    reason: text(row, "reason") as ReportReason,
    details: text(row, "details"),
    status: text(row, "status") as ReportStatus,
    createdAt: text(row, "created_at"),
    resolvedAt: row.resolved_at ? text(row, "resolved_at") : null,
  }
}

function moderation(row: Row): ModerationAction {
  return {
    id: text(row, "id"),
    moderatorId: text(row, "moderator_id"),
    reportId: row.report_id ? text(row, "report_id") : null,
    action: text(row, "action"),
    note: text(row, "note"),
    targetType: text(row, "target_type") as ReportTarget,
    targetId: text(row, "target_id"),
    createdAt: text(row, "created_at"),
  }
}

function notification(row: Row): Notification {
  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    actorId: text(row, "actor_id"),
    kind: "reply",
    targetType: row.target_type === "battle" ? "battle" : "discussion",
    targetSlug: text(row, "target_slug"),
    excerpt: text(row, "excerpt"),
    read: row.read === true,
    createdAt: text(row, "created_at"),
  }
}

function block(row: Row): Block {
  return { id: text(row, "id"), blockerId: text(row, "blocker_id"), blockedId: text(row, "blocked_id"), createdAt: text(row, "created_at") }
}

function event(row: Row): AnalyticsEvent {
  return { id: text(row, "id"), type: text(row, "type") as EventType, userId: row.user_id ? text(row, "user_id") : null, createdAt: text(row, "created_at") }
}

const loadStore = cache(async (): Promise<Store> => {
  const supabase = await db()
  const [profiles, discussions, comments, battles, battleOptions, votes, reactions, reports, moderationActions, notifications, blocks, events] = await Promise.all([
    allRows("profiles"),
    allRows("discussions"),
    allRows("comments"),
    allRows("battles"),
    allRows("battle_options"),
    allRows("votes"),
    allRows("reactions"),
    optionalRows("reports"),
    optionalRows("moderation_actions"),
    optionalRows("notifications"),
    optionalRows("blocks"),
    optionalRows("analytics_events"),
  ])
  const store: Store = {
    version: 1,
    profiles: profiles.map(profile),
    discussions: discussions.map(discussion),
    comments: comments.map(comment),
    battles: battles.map(battle),
    battleOptions: battleOptions.map(option),
    votes: votes.map(vote),
    reactions: reactions.map(reaction),
    reports: reports.map(report),
    moderationActions: moderationActions.map(moderation),
    notifications: notifications.map(notification),
    blocks: blocks.map(block),
    events: events.map(event),
    rateBuckets: [],
  }
  const emails = await supabase.rpc("admin_profile_emails")
  if (!emails.error && Array.isArray(emails.data)) {
    const byId = new Map((emails.data as { id: string; email: string }[]).map((item) => [item.id, item.email]))
    for (const member of store.profiles) member.email = byId.get(member.id) ?? ""
  }
  const buckets = await supabase.rpc("load_rate_buckets")
  if (!buckets.error && Array.isArray(buckets.data)) {
    store.rateBuckets = (buckets.data as { key: string; hits: unknown }[]).map((item) => ({
      key: item.key,
      hits: Array.isArray(item.hits) ? item.hits.filter((hit): hit is number => typeof hit === "number") : [],
    }))
  }
  return store
})

function added<T extends { id: string }>(before: T[], after: T[]) {
  const ids = new Set(before.map((item) => item.id))
  return after.filter((item) => !ids.has(item.id))
}

function removed<T extends { id: string }>(before: T[], after: T[]) {
  const ids = new Set(after.map((item) => item.id))
  return before.filter((item) => !ids.has(item.id))
}

function changed<T extends { id: string }>(before: T[], after: T[]) {
  const previous = new Map(before.map((item) => [item.id, JSON.stringify(item)]))
  return after.filter((item) => previous.has(item.id) && previous.get(item.id) !== JSON.stringify(item))
}

async function must(result: PromiseLike<{ error: QueryError | null }>) {
  const { error } = await result
  if (error) throw new Error(dbMessage(error))
}

async function sync(before: Store, after: Store) {
  const supabase = await db()
  for (const item of changed(before.profiles, after.profiles)) {
    await must(supabase.from("profiles").update({
      username: item.username,
      display_name: item.displayName,
      bio: item.bio,
      avatar_color: item.avatarColor,
      industries: item.industries,
      role: item.role,
      status: item.status,
      notify_replies: item.notifyReplies,
      notify_challenges: item.notifyChallenges,
    }).eq("id", item.id))
  }
  for (const item of added(before.discussions, after.discussions)) {
    await must(supabase.from("discussions").insert({
      id: item.id,
      author_id: item.authorId,
      slug: item.slug,
      title: item.title,
      body: item.body,
      industry: item.industry,
      category: item.category,
      status: item.status,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }))
  }
  for (const item of changed(before.discussions, after.discussions)) {
    await must(supabase.from("discussions").update({
      slug: item.slug,
      title: item.title,
      body: item.body,
      industry: item.industry,
      category: item.category,
      status: item.status,
      updated_at: item.updatedAt,
    }).eq("id", item.id))
  }
  for (const item of added(before.battles, after.battles)) {
    await must(supabase.from("battles").insert({
      id: item.id,
      author_id: item.authorId,
      slug: item.slug,
      title: item.title,
      prompt: item.prompt,
      industry: item.industry,
      category: item.category,
      featured: item.featured,
      status: item.status,
      created_at: item.createdAt,
      closes_at: item.closesAt,
    }))
  }
  for (const item of changed(before.battles, after.battles)) {
    await must(supabase.from("battles").update({
      title: item.title,
      prompt: item.prompt,
      industry: item.industry,
      category: item.category,
      status: item.status,
      closes_at: item.closesAt,
    }).eq("id", item.id))
  }
  for (const item of added(before.battleOptions, after.battleOptions)) {
    await must(supabase.from("battle_options").insert({
      id: item.id,
      battle_id: item.battleId,
      label: item.label,
      position: item.position,
    }))
  }
  for (const item of added(before.votes, after.votes)) {
    await must(supabase.from("votes").insert({
      id: item.id,
      battle_id: item.battleId,
      option_id: item.optionId,
      user_id: item.userId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }))
  }
  for (const item of changed(before.votes, after.votes)) {
    await must(supabase.from("votes").update({ option_id: item.optionId }).eq("id", item.id))
  }
  for (const item of added(before.comments, after.comments)) {
    await must(supabase.from("comments").insert({
      id: item.id,
      author_id: item.authorId,
      discussion_id: item.discussionId,
      battle_id: item.battleId,
      body: item.body,
      status: item.status,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }))
  }
  for (const item of changed(before.comments, after.comments)) {
    await must(supabase.from("comments").update({
      body: item.body,
      status: item.status,
      updated_at: item.updatedAt,
    }).eq("id", item.id))
  }
  for (const item of added(before.reactions, after.reactions)) {
    await must(supabase.from("reactions").insert({
      id: item.id,
      user_id: item.userId,
      target_type: item.targetType,
      target_id: item.targetId,
      created_at: item.createdAt,
    }))
  }
  for (const item of removed(before.reactions, after.reactions)) {
    await must(supabase.from("reactions").delete().eq("id", item.id))
  }
  for (const item of added(before.reports, after.reports)) {
    await must(supabase.from("reports").insert({
      id: item.id,
      reporter_id: item.reporterId,
      target_type: item.targetType,
      target_id: item.targetId,
      reason: item.reason,
      details: item.details,
      status: item.status,
      created_at: item.createdAt,
      resolved_at: item.resolvedAt,
    }))
  }
  for (const item of changed(before.reports, after.reports)) {
    await must(supabase.from("reports").update({ status: item.status, resolved_at: item.resolvedAt }).eq("id", item.id))
  }
  for (const item of added(before.moderationActions, after.moderationActions)) {
    await must(supabase.from("moderation_actions").insert({
      id: item.id,
      moderator_id: item.moderatorId,
      report_id: item.reportId,
      action: item.action,
      note: item.note,
      target_type: item.targetType,
      target_id: item.targetId,
      created_at: item.createdAt,
    }))
  }
  for (const item of added(before.notifications, after.notifications)) {
    await must(supabase.from("notifications").insert({
      id: item.id,
      user_id: item.userId,
      actor_id: item.actorId,
      kind: item.kind,
      target_type: item.targetType,
      target_slug: item.targetSlug,
      excerpt: item.excerpt,
      read: item.read,
      created_at: item.createdAt,
    }))
  }
  for (const item of changed(before.notifications, after.notifications)) {
    await must(supabase.from("notifications").update({ read: item.read }).eq("id", item.id))
  }
  for (const item of added(before.blocks, after.blocks)) {
    await must(supabase.from("blocks").insert({
      id: item.id,
      blocker_id: item.blockerId,
      blocked_id: item.blockedId,
      created_at: item.createdAt,
    }))
  }
  for (const item of removed(before.blocks, after.blocks)) {
    await must(supabase.from("blocks").delete().eq("id", item.id))
  }
  const newEvents = added(before.events, after.events).map((item) => item.type).filter((type) => type !== "signup")
  if (newEvents.length > 0) {
    const tracked = await supabase.rpc("track_events", { event_types: newEvents })
    if (tracked.error && tracked.error.code !== "PGRST202") throw new Error(dbMessage(tracked.error))
  }
  const previousBuckets = new Map(before.rateBuckets.map((bucket) => [bucket.key, JSON.stringify(bucket.hits)]))
  const bucketChanges = after.rateBuckets.filter((bucket) => previousBuckets.get(bucket.key) !== JSON.stringify(bucket.hits))
  if (bucketChanges.length > 0) {
    const saved = await supabase.rpc("save_rate_buckets", {
      buckets: bucketChanges.map((bucket) => ({ key: bucket.key, hits: bucket.hits })),
    })
    if (saved.error && saved.error.code !== "PGRST202") throw new Error(dbMessage(saved.error))
  }
}

function isFailure(result: unknown): result is { ok: false } {
  return Boolean(result && typeof result === "object" && "ok" in result && result.ok === false)
}

export async function remoteView<T>(fn: (store: Store) => T): Promise<T> {
  return fn(structuredClone(await loadStore()))
}

export async function remoteUpdate<T>(fn: (store: Store) => T): Promise<T> {
  const store = await loadStore()
  const before = structuredClone(store)
  const result = fn(store)
  try {
    await sync(before, store)
  } catch (error) {
    if (isFailure(result)) return result
    const message = error instanceof Error ? error.message : "Could not save that."
    if (result && typeof result === "object" && "ok" in result) {
      return { ok: false, code: "invalid", message } as T
    }
    throw error
  }
  return result
}

export async function ensureProfile(user: { id: string; user_metadata?: Record<string, unknown> }) {
  const supabase = await db()
  const existing = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
  if (existing.error) throw new Error(dbMessage(existing.error))
  if (existing.data) return
  const meta = user.user_metadata ?? {}
  const requested = String(meta.username ?? "").toLowerCase()
  const username = /^[a-z0-9_]{3,20}$/.test(requested) ? requested : `fan_${user.id.replace(/-/g, "").slice(0, 8)}`
  const rawName = String(meta.display_name || meta.full_name || meta.name || "Fan").replace(/\s+/g, " ").trim().slice(0, 40)
  const displayName = rawName.length >= 2 ? rawName : "Fan"
  const inserted = await supabase.from("profiles").insert({ id: user.id, username, display_name: displayName })
  if (inserted.error && inserted.error.code !== "23505") throw new Error(dbMessage(inserted.error))
}

export async function currentProfile(userId: string) {
  const supabase = await db()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  if (error) throw new Error(dbMessage(error))
  return data ? profile(data as Row) : null
}
