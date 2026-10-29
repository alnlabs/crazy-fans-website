import { randomBytes, randomUUID } from "node:crypto"
import { AVATAR_COLORS, CATEGORIES, FAVORITE_INDUSTRIES, INDUSTRIES, LIMITS, REPORT_REASONS } from "@/lib/constants"
import { hashPassword, verifyPassword } from "@/lib/password"
import { update } from "@/lib/persist"
import { cleanText, linkCount, slugify, validEmail, validUsername } from "@/lib/text"
import type {
  Category,
  FavoriteIndustry,
  Industry,
  MutationResult,
  Profile,
  ReportTarget,
  Store,
} from "@/lib/types"

const EMAIL_OR_PASSWORD = "Email or password is wrong."
const TOO_FAST = "You are moving a little fast. Try again in a few minutes."
const SUSPENDED = "Your account is suspended, so this action is paused."

function fail(code: string, message: string, fieldErrors?: Record<string, string>): MutationResult {
  return { ok: false, code, message, fieldErrors }
}

function activeProfile(store: Store, userId: string) {
  return store.profiles.find((profile) => profile.id === userId) ?? null
}

function takeRate(store: Store, key: string, limit: number, windowMs: number, now: number) {
  let bucket = store.rateBuckets.find((item) => item.key === key)
  if (!bucket) {
    bucket = { key, hits: [] }
    store.rateBuckets.push(bucket)
  }
  bucket.hits = bucket.hits.filter((hit) => now - hit < windowMs)
  if (bucket.hits.length >= limit) return false
  bucket.hits.push(now)
  if (store.rateBuckets.length > 400) {
    store.rateBuckets = store.rateBuckets.filter((item) => item.hits.length > 0).slice(-400)
  }
  return true
}

function track(store: Store, type: Store["events"][number]["type"], userId: string | null, now: number) {
  store.events.push({
    id: randomUUID(),
    type,
    userId,
    createdAt: new Date(now).toISOString(),
  })
  if (store.events.length > 5000) store.events.splice(0, store.events.length - 5000)
}

function uniqueSlug(store: Store, title: string, table: "discussions" | "battles") {
  const base = slugify(title)
  const taken = new Set(store[table].map((item) => item.slug))
  if (!taken.has(base)) return base
  for (let i = 2; i < 100; i += 1) {
    const next = `${base}-${i}`
    if (!taken.has(next)) return next
  }
  return `${base}-${randomUUID().slice(0, 8)}`
}

function requireWriter(store: Store, userId: string): MutationResult | Profile {
  const profile = activeProfile(store, userId)
  if (!profile) return fail("forbidden", "Sign in to do that.")
  if (profile.status !== "active") return fail("suspended", SUSPENDED)
  return profile
}

function isAdmin(profile: Profile) {
  return profile.role === "admin" && profile.status === "active"
}

function honeypot(company: string) {
  return company.trim().length > 0
}

export function register(input: {
  email: string
  password: string
  username: string
  displayName: string
  rateKey: string
  company?: string
  now: number
}): Promise<MutationResult> {
  return update((store) => {
    if (honeypot(input.company ?? "")) return fail("invalid", "Could not create that account.")
    const email = input.email.trim().toLowerCase()
    const username = input.username.trim().toLowerCase()
    const displayName = cleanText(input.displayName).replace(/\n/g, " ")
    const fieldErrors: Record<string, string> = {}
    if (!validEmail(email)) fieldErrors.email = "Enter a valid email."
    if (input.password.length < 8) fieldErrors.password = "Use at least 8 characters."
    if (input.password.length > 200) fieldErrors.password = "That password is too long."
    if (!validUsername(username)) fieldErrors.username = "Use 3–20 letters, numbers, or underscores."
    if (displayName.length < 2 || displayName.length > 40) fieldErrors.displayName = "Use 2–40 characters."
    if (Object.keys(fieldErrors).length > 0) return fail("invalid", "Check the form and try again.", fieldErrors)
    if (store.profiles.some((profile) => profile.email === email)) {
      return fail("invalid", "An account with that email already exists.", { email: "An account with that email already exists." })
    }
    if (store.profiles.some((profile) => profile.username === username)) {
      return fail("invalid", "That username is taken.", { username: "That username is taken." })
    }
    if (!takeRate(store, input.rateKey, LIMITS.signup.limit, LIMITS.signup.windowMs, input.now)) {
      return fail("rate-limit", TOO_FAST)
    }
    const id = randomUUID()
    const createdAt = new Date(input.now).toISOString()
    store.profiles.push({
      id,
      email,
      passwordHash: hashPassword(input.password),
      username,
      displayName,
      bio: "",
      avatarColor: AVATAR_COLORS[store.profiles.length % AVATAR_COLORS.length] ?? "#c43228",
      industries: [],
      role: "member",
      status: "active",
      notifyReplies: true,
      notifyChallenges: false,
      createdAt,
      updatedAt: createdAt,
    })
    track(store, "signup", id, input.now)
    track(store, "active", id, input.now)
    return { ok: true, slug: username, userId: id }
  })
}

export function authenticate(input: {
  email: string
  password: string
  rateKey: string
  now: number
}): Promise<MutationResult> {
  return update((store) => {
    const email = input.email.trim().toLowerCase()
    const key = `${input.rateKey}:login`
    if (!takeRate(store, key, LIMITS.login.limit, LIMITS.login.windowMs, input.now)) {
      return fail("rate-limit", "Too many attempts. Try again in a few minutes.")
    }
    const profile = store.profiles.find((item) => item.email === email)
    const match = profile ? verifyPassword(input.password, profile.passwordHash) : verifyPassword(input.password, hashPassword("dummy-password-value"))
    if (!profile || !match) return fail("invalid", EMAIL_OR_PASSWORD)
    store.rateBuckets = store.rateBuckets.filter((bucket) => bucket.key !== key)
    track(store, "login", profile.id, input.now)
    track(store, "active", profile.id, input.now)
    return { ok: true, userId: profile.id }
  })
}

export function signInWithGoogle(input: { email: string; displayName: string; now: number }): Promise<MutationResult> {
  return update((store) => {
    const email = input.email.trim().toLowerCase()
    if (!validEmail(email)) return fail("invalid", "Google did not share an email address.")
    const existing = store.profiles.find((profile) => profile.email === email)
    if (existing) {
      track(store, "login", existing.id, input.now)
      track(store, "active", existing.id, input.now)
      return { ok: true, userId: existing.id, slug: existing.username }
    }
    const username = googleUsername(store, email)
    const cleanedName = cleanText(input.displayName).replace(/\n/g, " ")
    const displayName = cleanedName.length >= 2 && cleanedName.length <= 40 ? cleanedName : username
    const id = randomUUID()
    const createdAt = new Date(input.now).toISOString()
    store.profiles.push({
      id,
      email,
      passwordHash: hashPassword(randomBytes(32).toString("hex")),
      username,
      displayName,
      bio: "",
      avatarColor: AVATAR_COLORS[store.profiles.length % AVATAR_COLORS.length] ?? "#c43228",
      industries: [],
      role: "member",
      status: "active",
      notifyReplies: true,
      notifyChallenges: false,
      createdAt,
      updatedAt: createdAt,
    })
    track(store, "signup", id, input.now)
    track(store, "login", id, input.now)
    track(store, "active", id, input.now)
    return { ok: true, userId: id, slug: username }
  })
}

function googleUsername(store: Store, email: string) {
  const local = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? ""
  let base = (local.length >= 3 ? local : `fan${local}`).slice(0, 20)
  if (!validUsername(base)) base = "fan"
  let candidate = base
  let suffix = 2
  while (store.profiles.some((profile) => profile.username === candidate)) {
    if (suffix > 99) return `fan${randomUUID().replace(/-/g, "").slice(0, 8)}`
    const ending = String(suffix)
    candidate = `${base.slice(0, 20 - ending.length)}${ending}`
    suffix += 1
  }
  return candidate
}

export function updateProfile(
  userId: string,
  input: {
    username: string
    displayName: string
    bio: string
    avatarColor: string
    industries: string[]
    now: number
  },
): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const username = input.username.trim().toLowerCase()
    const displayName = cleanText(input.displayName).replace(/\n/g, " ")
    const bio = cleanText(input.bio)
    const fieldErrors: Record<string, string> = {}
    if (!validUsername(username)) fieldErrors.username = "Use 3–20 letters, numbers, or underscores."
    if (displayName.length < 2 || displayName.length > 40) fieldErrors.displayName = "Use 2–40 characters."
    if (bio.length > 280) fieldErrors.bio = "Keep the bio under 280 characters."
    if (!AVATAR_COLORS.includes(input.avatarColor)) fieldErrors.avatarColor = "Pick a colour from the set."
    const industries = input.industries.filter((item): item is FavoriteIndustry =>
      FAVORITE_INDUSTRIES.some((industry) => industry.id === item),
    )
    if (store.profiles.some((profile) => profile.username === username && profile.id !== userId)) {
      fieldErrors.username = "That username is taken."
    }
    if (Object.keys(fieldErrors).length > 0) return fail("invalid", "Check the form and try again.", fieldErrors)
    writer.username = username
    writer.displayName = displayName
    writer.bio = bio
    writer.avatarColor = input.avatarColor
    writer.industries = industries
    writer.updatedAt = new Date(input.now).toISOString()
    return { ok: true, slug: username }
  })
}

export function updateNotificationPrefs(
  userId: string,
  input: { replies: boolean; challenges: boolean; now: number },
): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    writer.notifyReplies = input.replies
    writer.notifyChallenges = input.challenges
    writer.updatedAt = new Date(input.now).toISOString()
    return { ok: true }
  })
}

function contentFields(title: string, body: string, industry: string, category: string, titleMin: number, bodyMin: number, bodyMax: number) {
  const cleanTitle = cleanText(title).replace(/\n/g, " ")
  const cleanBody = cleanText(body)
  const fieldErrors: Record<string, string> = {}
  if (cleanTitle.length < titleMin || cleanTitle.length > 120) fieldErrors.title = `Use ${titleMin}–120 characters.`
  if (cleanBody.length < bodyMin || cleanBody.length > bodyMax) fieldErrors.body = `Use ${bodyMin}–${bodyMax} characters.`
  if (linkCount(`${cleanTitle}\n${cleanBody}`) > 5) fieldErrors.body = "Too many links."
  if (!INDUSTRIES.some((item) => item.id === industry)) fieldErrors.industry = "Pick an industry."
  if (!CATEGORIES.some((item) => item.id === category)) fieldErrors.category = "Pick a category."
  return { cleanTitle, cleanBody, fieldErrors, industry: industry as Industry, category: category as Category }
}

export function createDiscussion(
  userId: string,
  input: { title: string; body: string; industry: string; category: string; company?: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    if (honeypot(input.company ?? "")) return fail("invalid", "Could not publish that.")
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const fields = contentFields(input.title, input.body, input.industry, input.category, 8, 20, 4000)
    if (Object.keys(fields.fieldErrors).length > 0) return fail("invalid", "Check the form and try again.", fields.fieldErrors)
    if (!takeRate(store, `discussion:${userId}`, LIMITS.discussion.limit, LIMITS.discussion.windowMs, input.now)) {
      return fail("rate-limit", TOO_FAST)
    }
    const createdAt = new Date(input.now).toISOString()
    const slug = uniqueSlug(store, fields.cleanTitle, "discussions")
    store.discussions.push({
      id: randomUUID(),
      authorId: userId,
      slug,
      title: fields.cleanTitle,
      body: fields.cleanBody,
      industry: fields.industry,
      category: fields.category,
      status: "visible",
      createdAt,
      updatedAt: createdAt,
    })
    track(store, "discussion", userId, input.now)
    return { ok: true, slug }
  })
}

export function updateDiscussion(
  userId: string,
  slug: string,
  input: { title: string; body: string; industry: string; category: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const discussion = store.discussions.find((item) => item.slug === slug && item.status === "visible")
    if (!discussion) return fail("not-found", "That discussion is not available.")
    if (discussion.authorId !== userId && !isAdmin(writer)) return fail("forbidden", "You can edit your own discussions.")
    const fields = contentFields(input.title, input.body, input.industry, input.category, 8, 20, 4000)
    if (Object.keys(fields.fieldErrors).length > 0) return fail("invalid", "Check the form and try again.", fields.fieldErrors)
    discussion.title = fields.cleanTitle
    discussion.body = fields.cleanBody
    discussion.industry = fields.industry
    discussion.category = fields.category
    discussion.updatedAt = new Date(input.now).toISOString()
    return { ok: true, slug: discussion.slug }
  })
}

export function removeOwnDiscussion(userId: string, slug: string, now: number): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const discussion = store.discussions.find((item) => item.slug === slug && item.status === "visible")
    if (!discussion) return fail("not-found", "That discussion is not available.")
    if (discussion.authorId !== userId) return fail("forbidden", "You can remove your own discussions.")
    discussion.status = "removed"
    discussion.updatedAt = new Date(now).toISOString()
    return { ok: true }
  })
}

export function createComment(
  userId: string,
  input: { body: string; discussionId?: string; battleId?: string; company?: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    if (honeypot(input.company ?? "")) return fail("invalid", "Could not post that.")
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const body = cleanText(input.body)
    if (body.length < 2 || body.length > 2000) return fail("invalid", "Use 2–2000 characters.", { body: "Use 2–2000 characters." })
    if (linkCount(body) > 5) return fail("invalid", "Too many links.", { body: "Too many links." })
    const discussion = input.discussionId
      ? store.discussions.find((item) => item.id === input.discussionId && item.status === "visible")
      : undefined
    const battle = input.battleId ? store.battles.find((item) => item.id === input.battleId && item.status === "visible") : undefined
    if (!discussion && !battle) return fail("not-found", "That conversation is not available.")
    if (Boolean(discussion) === Boolean(battle)) return fail("invalid", "Pick one conversation.")
    const parentAuthorId = discussion?.authorId ?? battle?.authorId
    if (!parentAuthorId) return fail("not-found", "That conversation is not available.")
    if (store.blocks.some((block) => block.blockerId === parentAuthorId && block.blockedId === userId)) {
      return fail("forbidden", "You cannot reply in this thread.")
    }
    const duplicate = store.comments.some(
      (comment) =>
        comment.authorId === userId &&
        comment.body === body &&
        input.now - new Date(comment.createdAt).getTime() < 2 * 60 * 1000,
    )
    if (duplicate) return fail("duplicate", "You already said that.")
    if (!takeRate(store, `comment:${userId}`, LIMITS.comment.limit, LIMITS.comment.windowMs, input.now)) {
      return fail("rate-limit", TOO_FAST)
    }
    const createdAt = new Date(input.now).toISOString()
    store.comments.push({
      id: randomUUID(),
      authorId: userId,
      discussionId: discussion?.id ?? null,
      battleId: battle?.id ?? null,
      body,
      status: "visible",
      createdAt,
      updatedAt: createdAt,
    })
    if (parentAuthorId !== userId) {
      const parent = store.profiles.find((profile) => profile.id === parentAuthorId)
      if (parent?.notifyReplies) {
        store.notifications.push({
          id: randomUUID(),
          userId: parentAuthorId,
          actorId: userId,
          kind: "reply",
          targetType: discussion ? "discussion" : "battle",
          targetSlug: discussion?.slug ?? battle?.slug ?? "",
          excerpt: body.slice(0, 140),
          read: false,
          createdAt,
        })
      }
    }
    track(store, "comment", userId, input.now)
    return { ok: true, slug: discussion?.slug ?? battle?.slug }
  })
}

export function removeOwnComment(userId: string, commentId: string, now: number): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const comment = store.comments.find((item) => item.id === commentId && item.status === "visible")
    if (!comment) return fail("not-found", "That comment is not available.")
    if (comment.authorId !== userId && !isAdmin(writer)) return fail("forbidden", "You can remove your own comments.")
    comment.status = "removed"
    comment.updatedAt = new Date(now).toISOString()
    return { ok: true }
  })
}

export function createBattle(
  userId: string,
  input: { title: string; prompt: string; industry: string; category: string; options: string[]; company?: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    if (honeypot(input.company ?? "")) return fail("invalid", "Could not publish that.")
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const fields = contentFields(input.title, input.prompt, input.industry, input.category, 8, 20, 500)
    if (fields.fieldErrors.body) {
      fields.fieldErrors.prompt = fields.fieldErrors.body
      delete fields.fieldErrors.body
    }
    const options = input.options.map((option) => cleanText(option).replace(/\n/g, " ")).filter(Boolean)
    const unique = new Set(options.map((option) => option.toLowerCase()))
    if (options.length < 2 || options.length > 4 || unique.size !== options.length) {
      fields.fieldErrors.options = "Add 2–4 different options."
    }
    if (options.some((option) => option.length < 2 || option.length > 80)) {
      fields.fieldErrors.options = "Each option needs 2–80 characters."
    }
    if (Object.keys(fields.fieldErrors).length > 0) return fail("invalid", "Check the form and try again.", fields.fieldErrors)
    if (!takeRate(store, `battle:${userId}`, LIMITS.battle.limit, LIMITS.battle.windowMs, input.now)) {
      return fail("rate-limit", TOO_FAST)
    }
    const createdAt = new Date(input.now).toISOString()
    const id = randomUUID()
    const slug = uniqueSlug(store, fields.cleanTitle, "battles")
    store.battles.push({
      id,
      authorId: userId,
      slug,
      title: fields.cleanTitle,
      prompt: fields.cleanBody,
      industry: fields.industry,
      category: fields.category,
      featured: false,
      status: "visible",
      createdAt,
      closesAt: null,
    })
    options.forEach((label, position) => {
      store.battleOptions.push({ id: randomUUID(), battleId: id, label, position })
    })
    track(store, "battle", userId, input.now)
    return { ok: true, slug }
  })
}

export function castVote(userId: string, battleId: string, optionId: string, now: number): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const battle = store.battles.find((item) => item.id === battleId && item.status === "visible")
    if (!battle) return fail("not-found", "That battle is not available.")
    if (battle.closesAt && new Date(battle.closesAt).getTime() <= now) return fail("closed", "This battle is closed.")
    const option = store.battleOptions.find((item) => item.id === optionId && item.battleId === battle.id)
    if (!option) return fail("invalid", "Pick one of the options.")
    const existing = store.votes.find((vote) => vote.battleId === battle.id && vote.userId === userId)
    if (existing?.optionId === optionId) return fail("same-vote", "That is already your vote.")
    if (!existing && !takeRate(store, `vote:${userId}`, LIMITS.vote.limit, LIMITS.vote.windowMs, now)) {
      return fail("rate-limit", TOO_FAST)
    }
    const at = new Date(now).toISOString()
    if (existing) {
      existing.optionId = optionId
      existing.updatedAt = at
    } else {
      store.votes.push({ id: randomUUID(), battleId: battle.id, optionId, userId, createdAt: at, updatedAt: at })
      track(store, "vote", userId, now)
    }
    return { ok: true, slug: battle.slug }
  })
}

export function toggleReaction(
  userId: string,
  targetType: "discussion" | "comment" | "battle",
  targetId: string,
  now: number,
): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const exists =
      (targetType === "discussion" && store.discussions.some((item) => item.id === targetId && item.status === "visible")) ||
      (targetType === "comment" && store.comments.some((item) => item.id === targetId && item.status === "visible")) ||
      (targetType === "battle" && store.battles.some((item) => item.id === targetId && item.status === "visible"))
    if (!exists) return fail("not-found", "That is not available.")
    const current = store.reactions.find(
      (reaction) => reaction.userId === userId && reaction.targetType === targetType && reaction.targetId === targetId,
    )
    if (!takeRate(store, `reaction:${userId}`, LIMITS.reaction.limit, LIMITS.reaction.windowMs, now)) {
      return fail("rate-limit", TOO_FAST)
    }
    if (current) {
      store.reactions = store.reactions.filter((reaction) => reaction.id !== current.id)
    } else {
      store.reactions.push({ id: randomUUID(), userId, targetType, targetId, createdAt: new Date(now).toISOString() })
      track(store, "reaction", userId, now)
    }
    return { ok: true }
  })
}

export function fileReport(
  userId: string,
  input: { targetType: string; targetId: string; reason: string; details: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const reason = REPORT_REASONS.find((item) => item.id === input.reason)?.id
    const details = cleanText(input.details)
    if (!reason) return fail("invalid", "Pick a reason.", { reason: "Pick a reason." })
    if (reason === "other" && details.length < 8) return fail("invalid", "Add a short explanation.", { details: "Add a short explanation." })
    if (details.length > 1000) return fail("invalid", "Keep the details under 1000 characters.", { details: "Keep the details under 1000 characters." })
    const targetType = input.targetType as ReportTarget
    const target = findTarget(store, targetType, input.targetId)
    if (!target) return fail("not-found", "That is not available to report.")
    if (target.ownerId === userId) return fail("forbidden", "You cannot report your own account or post.")
    const already = store.reports.some(
      (report) =>
        report.reporterId === userId &&
        report.targetType === targetType &&
        report.targetId === input.targetId &&
        report.status === "open",
    )
    if (already) return fail("duplicate", "You already have an open report on this.")
    if (!takeRate(store, `report:${userId}`, LIMITS.report.limit, LIMITS.report.windowMs, input.now)) {
      return fail("rate-limit", TOO_FAST)
    }
    store.reports.push({
      id: randomUUID(),
      reporterId: userId,
      targetType,
      targetId: input.targetId,
      reason,
      details,
      status: "open",
      createdAt: new Date(input.now).toISOString(),
      resolvedAt: null,
    })
    track(store, "report", userId, input.now)
    return { ok: true }
  })
}

export function setBlock(userId: string, username: string, blocked: boolean, now: number): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    const other = store.profiles.find((profile) => profile.username === username)
    if (!other || other.id === userId) return fail("forbidden", "You cannot block that member.")
    store.blocks = store.blocks.filter((block) => !(block.blockerId === userId && block.blockedId === other.id))
    if (blocked) {
      store.blocks.push({ id: randomUUID(), blockerId: userId, blockedId: other.id, createdAt: new Date(now).toISOString() })
    }
    return { ok: true }
  })
}

export function markNotificationsRead(userId: string): Promise<MutationResult> {
  return update((store) => {
    const writer = requireWriter(store, userId)
    if ("ok" in writer) return writer
    for (const note of store.notifications) {
      if (note.userId === userId) note.read = true
    }
    return { ok: true }
  })
}

export function markActive(userId: string, now: number): Promise<MutationResult> {
  return update((store) => {
    const profile = activeProfile(store, userId)
    if (!profile || profile.status !== "active") return { ok: true }
    const day = new Date(now).toISOString().slice(0, 10)
    const exists = store.events.some((event) => event.type === "active" && event.userId === userId && event.createdAt.startsWith(day))
    if (!exists) track(store, "active", userId, now)
    return { ok: true }
  })
}

export function reviewReport(
  adminId: string,
  input: { reportId: string; decision: "dismiss" | "remove" | "suspend"; note: string; now: number },
): Promise<MutationResult> {
  return update((store) => {
    const admin = requireAdmin(store, adminId)
    if ("ok" in admin) return admin
    const report = store.reports.find((item) => item.id === input.reportId && item.status === "open")
    if (!report) return fail("not-found", "That report is not open.")
    const note = cleanText(input.note).slice(0, 500)
    const at = new Date(input.now).toISOString()
    if (input.decision === "dismiss") {
      report.status = "dismissed"
      report.resolvedAt = at
      logModeration(store, adminId, report.id, "dismiss", note, report.targetType, report.targetId, at)
      return { ok: true }
    }
    const target = findTarget(store, report.targetType, report.targetId)
    if (!target) return fail("not-found", "The reported item is already gone.")
    if (input.decision === "suspend") {
      if (!target.ownerId || target.ownerId === adminId) return fail("forbidden", "You cannot suspend that member.")
      const member = store.profiles.find((profile) => profile.id === target.ownerId)
      if (!member) return fail("not-found", "That member is gone.")
      member.status = "suspended"
      member.updatedAt = at
      report.status = "actioned"
      report.resolvedAt = at
      logModeration(store, adminId, report.id, "suspend", note, "profile", member.id, at)
      return { ok: true }
    }
    if (report.targetType === "profile") return fail("invalid", "Remove a post, or suspend the member.")
    setRemoved(store, report.targetType, report.targetId, at)
    report.status = "actioned"
    report.resolvedAt = at
    logModeration(store, adminId, report.id, "remove", note, report.targetType, report.targetId, at)
    return { ok: true }
  })
}

export function setContentStatus(
  adminId: string,
  targetType: "discussion" | "comment" | "battle",
  targetId: string,
  status: "visible" | "removed",
  now: number,
): Promise<MutationResult> {
  return update((store) => {
    const admin = requireAdmin(store, adminId)
    if ("ok" in admin) return admin
    const at = new Date(now).toISOString()
    if (status === "removed") setRemoved(store, targetType, targetId, at)
    else restore(store, targetType, targetId, at)
    logModeration(store, adminId, null, status === "removed" ? "remove" : "restore", "", targetType, targetId, at)
    return { ok: true }
  })
}

export function setMemberStatus(adminId: string, userId: string, status: "active" | "suspended", now: number): Promise<MutationResult> {
  return update((store) => {
    const admin = requireAdmin(store, adminId)
    if ("ok" in admin) return admin
    if (userId === adminId) return fail("forbidden", "You cannot change your own standing.")
    const member = store.profiles.find((profile) => profile.id === userId)
    if (!member) return fail("not-found", "That member is gone.")
    member.status = status
    member.updatedAt = new Date(now).toISOString()
    logModeration(store, adminId, null, status === "suspended" ? "suspend" : "reinstate", "", "profile", userId, member.updatedAt)
    return { ok: true }
  })
}

export function setMemberRole(adminId: string, userId: string, role: "member" | "admin", now: number): Promise<MutationResult> {
  return update((store) => {
    const admin = requireAdmin(store, adminId)
    if ("ok" in admin) return admin
    if (userId === adminId) return fail("forbidden", "You cannot change your own role.")
    const admins = store.profiles.filter((profile) => profile.role === "admin" && profile.status === "active")
    const member = store.profiles.find((profile) => profile.id === userId)
    if (!member) return fail("not-found", "That member is gone.")
    if (member.role === "admin" && role === "member" && admins.length < 2) {
      return fail("forbidden", "Keep at least one active moderator.")
    }
    member.role = role
    member.updatedAt = new Date(now).toISOString()
    logModeration(store, adminId, null, role === "admin" ? "promote" : "demote", "", "profile", userId, member.updatedAt)
    return { ok: true }
  })
}

function requireAdmin(store: Store, userId: string): MutationResult | Profile {
  const profile = activeProfile(store, userId)
  if (!profile || !isAdmin(profile)) return fail("forbidden", "That page is for moderators.")
  return profile
}

function findTarget(store: Store, targetType: ReportTarget, targetId: string) {
  if (targetType === "discussion") {
    const item = store.discussions.find((discussion) => discussion.id === targetId)
    return item ? { ownerId: item.authorId, status: item.status } : null
  }
  if (targetType === "comment") {
    const item = store.comments.find((comment) => comment.id === targetId)
    return item ? { ownerId: item.authorId, status: item.status } : null
  }
  if (targetType === "battle") {
    const item = store.battles.find((battle) => battle.id === targetId)
    return item ? { ownerId: item.authorId, status: item.status } : null
  }
  if (targetType === "profile") {
    const item = store.profiles.find((profile) => profile.id === targetId)
    return item ? { ownerId: item.id, status: "visible" as const } : null
  }
  return null
}

function setRemoved(store: Store, targetType: ReportTarget, targetId: string, at: string) {
  if (targetType === "discussion") {
    const item = store.discussions.find((discussion) => discussion.id === targetId)
    if (item) {
      item.status = "removed"
      item.updatedAt = at
    }
  }
  if (targetType === "comment") {
    const item = store.comments.find((comment) => comment.id === targetId)
    if (item) {
      item.status = "removed"
      item.updatedAt = at
    }
  }
  if (targetType === "battle") {
    const item = store.battles.find((battle) => battle.id === targetId)
    if (item) item.status = "removed"
  }
}

function restore(store: Store, targetType: "discussion" | "comment" | "battle", targetId: string, at: string) {
  if (targetType === "discussion") {
    const item = store.discussions.find((discussion) => discussion.id === targetId)
    if (item) {
      item.status = "visible"
      item.updatedAt = at
    }
  }
  if (targetType === "comment") {
    const item = store.comments.find((comment) => comment.id === targetId)
    if (item) {
      item.status = "visible"
      item.updatedAt = at
    }
  }
  if (targetType === "battle") {
    const item = store.battles.find((battle) => battle.id === targetId)
    if (item) item.status = "visible"
  }
}

function logModeration(
  store: Store,
  moderatorId: string,
  reportId: string | null,
  action: string,
  note: string,
  targetType: ReportTarget,
  targetId: string,
  createdAt: string,
) {
  store.moderationActions.push({
    id: randomUUID(),
    moderatorId,
    reportId,
    action,
    note,
    targetType,
    targetId,
    createdAt,
  })
}
