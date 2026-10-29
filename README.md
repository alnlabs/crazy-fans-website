# Crazy Fans

A community for Indian cinema fans. The first beta lets people read without an account, then join to discuss, vote in fan battles, react, report, and moderate.

Tagline: **Your fandom. Your rules. Your wars.**

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:2700](http://localhost:2700).

The first request creates `data/store.json` with founding discussions, battles, and four local accounts. `data/` is gitignored. Delete that file to restore the starter room.

## Local demo accounts

These exist only in the local data file. Do not reuse the password anywhere else, and replace it before a shared deployment.

| Email | Username | Role |
| --- | --- | --- |
| mira@crazyfans.local | mira | Moderator |
| arjun@crazyfans.local | arjun | Member |
| leela@crazyfans.local | leela | Member |
| karthik@crazyfans.local | karthik | Member |

Password for each: `local-beta-pass`

## What this beta includes

- Home, battles, discussions, search, and public member profiles
- Sign up, sign in, sign out, profile, and notification preferences
- One vote per battle, with the ability to move that vote
- Replies, likes, reports, blocks, and in-app reply notifications
- Moderator tools for reports, content, members, and activity
- Guidelines, privacy, terms, and a copyright complaint process
- Row level security SQL in `supabase/migrations/001_community.sql`

Dream casts, the story studio, weekly challenge entries, and ads are intentionally not in this beta.

## Data and Supabase

Writes go through server actions into the local JSON store. Passwords are hashed with scrypt. The session cookie is httpOnly and signed with `AUTH_SECRET`, or with a secret created in `data/.auth-secret` when that variable is absent.

When you are ready for Postgres:

1. Create a Supabase project.
2. Run `supabase/migrations/001_community.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never expose a service-role key.
4. Prove the policies with two users before pointing the app at Supabase:
   - A member can insert only their own discussion, comment, vote, reaction, and report.
   - A second vote in the same battle fails the unique constraint. Updating `option_id` on their own row is the allowed way to move a vote.
   - A member cannot change `role` or `status` on their profile.
   - Anonymous visitors can read visible battles and discussions, and cannot read reports.
   - A suspended member fails the insert checks.
   - Only an admin can read moderation actions and analytics events.
5. Keep rate limits in server code or a database function. The SQL file does not enforce them yet.

`lib/supabase/browser.ts`, `lib/supabase/server.ts`, and `proxy.ts` follow the current Supabase SSR cookie setup. The running beta does not read or write Supabase tables yet. `proxy.ts` refreshes a Supabase session only when those env vars are present, and it still checks the local session before member and moderator routes. Pages and database policies remain the real authorization.

## Backup and recovery

**Local beta.** Copy `data/store.json` and `data/.auth-secret` before you reset anything. Restoring those two files restores the room and existing sessions. If `store.json` is corrupt, the app stops instead of overwriting it. Replace it with a copy. If you lose `.auth-secret` and have no `AUTH_SECRET`, members must sign in again.

**Supabase.** Use the project's point-in-time recovery or a scheduled `pg_dump` stored outside the app server. Test a restore before launch. Do not commit dumps, `.env.local`, or the service-role key.

## Checks

```bash
npm test
npm run lint
```

`npm test` exercises votes, suspensions, reports, blocks, and the last-moderator guard against a temporary data file.

Legal pages are drafts dated 29 October 2026. Have them reviewed before a public launch, and replace `copyright@crazyfans.local` with a monitored address.
