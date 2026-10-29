# Crazy Fans — Product and Development Plan

**Project:** Crazy Fans  
**Tagline:** Your Fandom. Your Rules. Your Wars.  
**Initial audience:** Indian cinema fans across Telugu, Tamil, Hindi, Malayalam, Kannada, and other Indian film industries  
**Primary goal:** Build a lasting, active community and monetize responsibly  
**Launch approach:** Website first  
**Suggested stack:** Next.js + TypeScript + Supabase

---

## 1. Product Vision

Crazy Fans is an interactive entertainment community where fans can debate movies and actors, vote in fan battles, create dream casts, write alternate stories, and earn recognition for meaningful contributions.

The product should be more than a news site or traditional forum. Its core loop is:

**Discover → Participate → Create → Share → Get recognized → Return**

The community should encourage passionate opinions without harassment, targeted abuse, fake engagement, or copyright infringement.

## 2. Product Goals

### Primary goals
- Encourage visitors to return regularly.
- Help members form relationships around shared cinema interests.
- Make user-created content easy to share outside the website.
- Establish repeatable community events and challenges.
- Build a sustainable path to display-ad revenue.

### Early success indicators
Track these from launch:
- Weekly active users.
- 7-day and 30-day returning-user rates.
- Percentage of visitors who vote, comment, or create.
- Meaningful replies per discussion.
- Dream casts and stories created per week.
- Shares and visits referred by members.
- Reports, moderation response time, and policy violations.

Avoid optimizing for page views alone. Retention and healthy participation are better early signals.

## 3. Target Audience

### Initial audience
Indian cinema fans, beginning with broad coverage across:
- Telugu
- Tamil
- Hindi
- Malayalam
- Kannada
- Other Indian cinema

### Member types
1. **Casual fan:** Wants quick polls and debates.
2. **Superfan:** Enjoys actor, director, and movie comparisons.
3. **Creator:** Builds dream casts and writes alternate stories.
4. **Debater:** Likes thoughtful discussions and defending opinions.
5. **Community regular:** Returns for challenges, recognition, and familiar members.

Use language and industry filters so users can find relevant conversations without fragmenting the community too early.

## 4. MVP Scope

Build a small, cohesive product first. Avoid launching every feature at once.

### P0 — Required for first public beta
- Responsive homepage and navigation.
- Browse discussions and featured fan battles.
- Read public content without signing in.
- Supabase authentication.
- Member profile with display name and avatar.
- Create a discussion and comment on it.
- Create a poll or fan battle and cast one valid vote.
- Like or react to content with server-enforced limits.
- Basic search and category filters.
- Report content and users.
- Admin moderation tools.
- Community guidelines, privacy policy, terms, and copyright/reporting process.
- Database Row Level Security (RLS) policies and basic abuse controls.
- Analytics for activation and retention.

### P1 — Add after MVP feedback
- Dream Cast Creator with shareable results.
- Weekly challenges and winner announcements.
- Fan XP, badges, and profile achievements.
- Story Studio for original stories and alternate endings.
- Save/bookmark content.
- Notifications for replies and challenge results.
- Weekly digest emails, only with appropriate consent.
- Better search and personalized feeds.

### P2 — Consider after retention is demonstrated
- Follow members and topics.
- Community groups by language or film industry.
- Collaborative story writing.
- Advanced creator profiles.
- Sponsored challenges and brand partnerships.
- Mobile app, if web usage supports the investment.

## 5. Page Structure

### Public pages
- `/` — Home: featured battle, trending discussions, current challenge, fresh creations.
- `/battles` — Browse fan battles and polls.
- `/battles/[slug]` — Battle details, vote, results, and discussion.
- `/discussions` — Community conversations.
- `/discussions/[slug]` — Discussion thread and replies.
- `/dream-cast` — Dream cast discovery and creation.
- `/stories` — Original stories and alternate endings.
- `/stories/[slug]` — Read and discuss a story.
- `/challenges` — Current and past weekly challenges.
- `/leaderboard` — Helpful contributors and creators.
- `/members/[username]` — Public member profile.
- `/search` — Search content, movies, and members.
- `/guidelines` — Community rules.
- `/privacy`, `/terms`, `/copyright` — Legal and policy pages.

### Member pages
- `/login`, `/signup`, `/forgot-password`
- `/settings/profile`
- `/settings/notifications`
- `/notifications`
- `/saved`

### Admin pages
- `/admin/reports`
- `/admin/content`
- `/admin/users`
- `/admin/challenges`

Protect admin routes on the server and enforce permissions in the database. Hiding a UI control is not authorization.

## 6. Engagement Strategy

### Daily
- Feature one clear, interesting fan question.
- Rotate between actors, performances, movies, directors, music, villains, and endings.
- Highlight one or two high-quality community contributions.
- Keep the homepage fresh without relying on manufactured controversy.

### Weekly
- Run a Dream Movie Challenge.
- Publish a “What Happens Next?” story prompt.
- Announce winners and explain why their entries were selected.
- Invite members to suggest next week's topic.

### Monthly
- Run community-voted awards.
- Highlight creators and helpful members.
- Review retention data and ask members what should improve.

### Healthy reputation system
Award XP for original creations, helpful replies, and challenge participation. Apply rate limits and anti-abuse checks. Do not reward spam, repeated low-value comments, vote manipulation, or harassment. Avoid punitive streaks that pressure users to visit every day.

### Notifications
Notify users about meaningful events: replies to their posts, comments on their creations, and results of challenges they entered. Give users controls over notification frequency and channels.

## 7. Growth Strategy

### Before launch
- Create a simple landing page explaining the concept.
- Recruit a small group of founding members across multiple Indian film industries.
- Prepare a starter set of original discussion prompts and challenges.
- Invite people to test real features, not just register.
- Ask early members for feedback and permission before featuring their creations.

### First month
**Week 1:** Launch the MVP with a small, curated set of discussions and battles.  
**Week 2:** Invite the first 50–100 interested fans and observe participation.  
**Week 3:** Introduce creator highlights and a weekly challenge.  
**Week 4:** Review returning-user behavior, improve the most-used features, and remove friction.

The first 50–100 users are a recruitment target, not a guaranteed outcome.

### Organic distribution
- Generate shareable images for battles and dream casts.
- Make public pages fast, mobile-friendly, and indexable.
- Use descriptive page titles and metadata.
- Share selected content on relevant social channels without spamming groups.
- Encourage creators to share their own work.
- Build useful evergreen pages around original community content.

Do not publish copyrighted movie footage or posters unless usage is authorized. Check image, metadata, API, and commercial licensing terms before using third-party material.

## 8. Monetization Plan

### Stage 1 — Prove engagement
Focus on a useful community and repeat visits. Avoid placing ads in ways that interrupt voting, writing, or reading.

### Stage 2 — Display ads
- Apply to an ad network when the site meets its current eligibility and content requirements.
- Use clearly distinguishable ad placements.
- Keep ads away from controls to prevent accidental clicks.
- Do not encourage users to click ads.
- Moderate user-generated content because publishers can be responsible for content appearing on their pages.
- Provide required privacy disclosures and consent controls for relevant advertising technologies.

### Stage 3 — Sponsorships
Consider sponsored challenges or clearly labelled entertainment promotions once the community has measurable reach and engagement.

### Stage 4 — Optional premium features
Only test premium features if members show demand. Core community participation should remain useful without payment.

Revenue is uncertain and depends on audience, geography, traffic quality, ad rates, policy compliance, and advertiser demand. Do not forecast income from page views alone.

## 9. Suggested Technical Architecture

### Frontend
- Next.js App Router
- TypeScript
- Responsive, accessible component system
- Server Components for public read pages where appropriate
- Client Components only for interactive controls

### Backend and data
- Supabase Auth for registration and sessions.
- Supabase PostgreSQL for content and community data.
- Supabase Storage only for appropriate user uploads.
- Server-side validation for all write actions.
- Row Level Security (RLS) on exposed tables.
- Database constraints for vote uniqueness and referential integrity.

### Initial database entities
- `profiles`
- `discussions`
- `comments`
- `battles`
- `battle_options`
- `votes`
- `reactions`
- `dream_casts`
- `dream_cast_roles`
- `stories`
- `challenges`
- `challenge_entries`
- `notifications`
- `reports`
- `moderation_actions`

Add only tables needed for the features actually being built. Define ownership, timestamps, indexes, constraints, and deletion behavior explicitly.

### Supabase environment
Use `.env.local` for local development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These values are intended to be public configuration. Never expose a Supabase service-role or secret key in browser code or a `NEXT_PUBLIC_` variable. Keep `.env.local` out of version control.

### Supabase SSR setup
- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Create separate browser and server client helpers.
- Implement the session-refresh request handler using the current Supabase SSR guide for the installed Next.js version. Recent Next.js versions may use `proxy.ts` instead of `middleware.ts`.
- Do not rely on middleware alone for authorization. Validate the user and permissions on protected server operations and enforce database access with RLS.
- Regenerate any secret that was accidentally exposed; never commit secrets.

## 10. Security and Moderation

Before opening user-generated content publicly:
- Enable RLS on all exposed tables.
- Let users edit or delete only their own content, subject to moderation and retention rules.
- Ensure each user can cast at most one vote per battle where that is the intended rule.
- Validate all submitted content on the server.
- Rate-limit account creation, comments, reactions, votes, and reports.
- Provide report, block, mute, and moderation workflows as appropriate.
- Define rules against threats, targeted harassment, hate, impersonation, spam, and illegal content.
- Create a copyright complaint and takedown process.
- Use safe rendering for user-generated text and validate uploaded file types and sizes.
- Keep admin privileges separate from normal user roles.
- Log important moderation actions without collecting unnecessary personal data.

Passionate disagreement is welcome; abuse is not.

## 11. SEO and Content Quality

- Render public discussion and creation pages so search engines can discover useful content.
- Use unique titles, descriptions, canonical URLs, and social sharing metadata.
- Add structured data only when accurate and appropriate.
- Provide pagination or controlled loading for long feeds.
- Prevent thin, duplicate, spam, and private pages from being indexed.
- Make it clear which content is user-created and which is official information.
- Do not imply endorsement by actors, studios, or film franchises.

## 12. Analytics and Decision Rules

Review weekly:
- New visitors and sign-ups.
- First meaningful action after sign-up.
- Weekly active members.
- 7-day and 30-day retention.
- Posts and comments per active member.
- Share-to-visit conversion.
- Report volume and moderation response time.
- Performance and errors on mobile devices.

Use findings to choose the next feature. For example, if battles attract visits but dream casts create more returning users and shares, prioritize improving the creator experience.

Do not set arbitrary retention targets without a baseline. Establish baseline measurements during the beta, then set improvement goals.

## 13. Definition of Done for the MVP

The MVP is ready for a public beta when:
- Visitors can browse public content without an account.
- Members can register, sign in, sign out, and manage their profiles.
- Authorized users can create discussions and comments.
- Battles accept valid votes and prevent duplicate voting according to the rules.
- RLS prevents unauthorized reads and writes.
- Reports can be submitted and reviewed by admins.
- Mobile layouts are usable and accessible.
- Empty, loading, error, and success states are handled.
- Basic analytics and error monitoring work.
- Legal, privacy, community, and copyright pages are published.
- No secret keys are committed to source control.
- A backup and recovery approach is documented.

## 14. Immediate Next Steps

1. Confirm whether an existing Next.js repository will be used or a new project will be created.
2. Set up the Next.js application and Supabase client helpers.
3. Create the initial schema for profiles, discussions, comments, battles, options, and votes.
4. Write and test RLS policies before building the write UI.
5. Build the homepage, battle list, battle detail, and discussion flow.
6. Add reporting and moderation before public user-generated content is opened.
7. Invite a small beta group, measure repeat participation, and iterate.
8. Add Dream Cast Creator, challenges, and reputation features based on user feedback.
9. Add display ads only after the content, consent, and ad-network requirements are satisfied.

---

## Product Principle

**Crazy Fans should make fans feel heard, creative, and connected—not pressured to stay online.**

Build a reliable community loop first. Expand the feature set and monetization only when real users demonstrate that they want to return.
