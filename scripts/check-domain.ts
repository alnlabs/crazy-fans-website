import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { test } from "node:test"
import {
  authenticate,
  castVote,
  createComment,
  fileReport,
  register,
  reviewReport,
  setBlock,
  setMemberRole,
  setMemberStatus,
  signInWithGoogle,
  toggleReaction,
  updateDiscussion,
} from "../lib/mutate"
import { activityStats, getBattle, getDiscussion, getDiscussions, getReports } from "../lib/present"
import { DEMO_PASSWORD } from "../lib/seed"
import { readSession, signSession } from "../lib/session"
import { safeNext } from "../lib/text"

process.env.CRAZY_FANS_SCRYPT_N = "1024"

const now = Date.parse("2026-10-29T12:00:00.000Z")

test("community rules hold for the local beta", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "crazy-fans-"))
  process.env.CRAZY_FANS_DATA = path.join(dir, "store.json")
  process.env.AUTH_SECRET = "test-secret-that-is-long-enough"

  try {
    assert.equal(safeNext("/battles/what-makes-a-theatre-erupt"), "/battles/what-makes-a-theatre-erupt")
    assert.equal(safeNext("https://evil.example"), "/")
    assert.equal(safeNext("//evil.example"), "/")

    const token = signSession("u_mira", process.env.AUTH_SECRET, now)
    assert.equal(readSession(token, process.env.AUTH_SECRET, now), "u_mira")
    assert.equal(readSession(token, "wrong-secret-value-here", now), null)
    assert.equal(readSession(`${token}x`, process.env.AUTH_SECRET, now), null)

    const login = await authenticate({
      email: "mira@crazyfans.local",
      password: DEMO_PASSWORD,
      rateKey: "test-login",
      now,
    })
    assert.equal(login.ok, true)
    if (!login.ok) return
    assert.equal(login.userId, "u_mira")

    const wrong = await authenticate({
      email: "mira@crazyfans.local",
      password: "not-the-password",
      rateKey: "test-login-2",
      now,
    })
    assert.equal(wrong.ok, false)

    const moved = await castVote("u_mira", "b_erupt", "o_erupt_2", now)
    assert.equal(moved.ok, true)
    const again = await castVote("u_mira", "b_erupt", "o_erupt_2", now + 1000)
    assert.equal(again.ok, false)
    if (again.ok) return
    assert.equal(again.code, "same-vote")

    const battle = await getBattle("what-makes-a-theatre-erupt", "u_mira", now)
    assert.ok(battle && !battle.blocked)
    if (!battle || battle.blocked) return
    assert.equal(battle.battle.totalVotes, 4)
    assert.equal(battle.battle.options.find((option) => option.id === "o_erupt_2")?.selected, true)

    const outsider = await register({
      email: "newfan@example.com",
      password: "long-enough-password",
      username: "newfan",
      displayName: "New Fan",
      rateKey: "signup-test",
      now,
    })
    assert.equal(outsider.ok, true)
    if (!outsider.ok || !outsider.userId) return

    const short = await register({
      email: "short@example.com",
      password: "short",
      username: "shorty",
      displayName: "Short Pass",
      rateKey: "signup-test-2",
      now,
    })
    assert.equal(short.ok, false)

    const forbiddenEdit = await updateDiscussion(outsider.userId, "mass-cheer-earned-or-announced", {
      title: "A rewritten title that is long enough",
      body: "This rewrite is long enough to pass the body length rule for discussions.",
      industry: "telugu",
      category: "movies",
      now,
    })
    assert.equal(forbiddenEdit.ok, false)
    if (forbiddenEdit.ok) return
    assert.equal(forbiddenEdit.code, "forbidden")

    const voted = await castVote(outsider.userId, "b_erupt", "o_erupt_1", now)
    assert.equal(voted.ok, true)
    const after = await getBattle("what-makes-a-theatre-erupt", outsider.userId, now)
    assert.ok(after && !after.blocked)
    if (!after || after.blocked) return
    assert.equal(after.battle.totalVotes, 5)

    const suspended = await setMemberStatus("u_mira", outsider.userId, "suspended", now)
    assert.equal(suspended.ok, true)
    const blockedWrite = await createComment(outsider.userId, {
      body: "A suspended member should not be able to post this reply.",
      discussionId: "d_silence",
      now,
    })
    assert.equal(blockedWrite.ok, false)
    if (blockedWrite.ok) return
    assert.equal(blockedWrite.code, "suspended")

    await setMemberStatus("u_mira", outsider.userId, "active", now)
    const report = await fileReport("u_arjun", {
      targetType: "discussion",
      targetId: "d_silence",
      reason: "spam",
      details: "This is a test report with enough detail.",
      now,
    })
    assert.equal(report.ok, true)
    const memberReview = await reviewReport(outsider.userId, {
      reportId: "missing",
      decision: "dismiss",
      note: "",
      now,
    })
    assert.equal(memberReview.ok, false)

    const open = await getReports()
    const filed = open.find((item) => item.targetId === "d_silence" && item.status === "open")
    assert.ok(filed)
    const removed = await reviewReport("u_mira", {
      reportId: filed.id,
      decision: "remove",
      note: "Removed in the domain check.",
      now,
    })
    assert.equal(removed.ok, true)
    assert.equal(await getDiscussion("directors-who-trust-silence", null), null)

    const liked = await toggleReaction("u_mira", "discussion", "d_interval", now)
    assert.equal(liked.ok, true)
    const unliked = await toggleReaction("u_mira", "discussion", "d_interval", now + 10)
    assert.equal(unliked.ok, true)
    const interval = await getDiscussion("the-interval-as-a-contract", "u_mira")
    assert.ok(interval && !interval.blocked)
    if (!interval || interval.blocked) return
    assert.equal(interval.discussion.liked, false)

    await setBlock("u_mira", "arjun", true, now)
    const list = await getDiscussions("u_mira", "all", undefined, 1)
    assert.equal(list.items.some((item) => item.slug === "mass-cheer-earned-or-announced"), false)

    const ownRole = await setMemberRole("u_mira", "u_mira", "member", now)
    assert.equal(ownRole.ok, false)
    const promoted = await setMemberRole("u_mira", outsider.userId, "admin", now)
    assert.equal(promoted.ok, true)
    await setMemberStatus("u_mira", outsider.userId, "suspended", now)
    const keepOne = await setMemberRole("u_mira", outsider.userId, "member", now)
    assert.equal(keepOne.ok, false)
    if (keepOne.ok) return
    assert.equal(keepOne.code, "forbidden")

    const stats = await activityStats(now)
    assert.equal(stats.members >= 4, true)
    assert.equal(stats.retention30, null)
    assert.ok(stats.retention7 !== null && stats.retention7 > 0 && stats.retention7 < 1)
    assert.equal(stats.votes >= 5, true)

    const google = await signInWithGoogle({
      email: "NewFan@example.com",
      displayName: "New Fan",
      now,
    })
    assert.equal(google.ok, true)
    const againGoogle = await signInWithGoogle({
      email: "newfan@example.com",
      displayName: "Someone Else",
      now: now + 1000,
    })
    assert.equal(againGoogle.ok, true)
    if (google.ok && againGoogle.ok) assert.equal(againGoogle.userId, google.userId)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
