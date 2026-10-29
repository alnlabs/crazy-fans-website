"use client"

import { useActionState, useRef, useState } from "react"
import { forgotPasswordAction, loginAction, signupAction } from "@/lib/actions/auth"
import { commentAction, createBattleAction, createDiscussionAction, profileAction, updateDiscussionAction } from "@/lib/actions/community"
import { AVATAR_COLORS, CATEGORIES, FAVORITE_INDUSTRIES, INDUSTRIES } from "@/lib/constants"
import { inkOn } from "@/lib/format"
import { buttonClass, errorClass, inputClass, labelClass } from "@/lib/styles"
import type { Category, FavoriteIndustry, FormState, Industry } from "@/lib/types"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className={errorClass} role="alert">
      {message}
    </p>
  )
}

function Honeypot() {
  return <input name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, {} as FormState)
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} />
        <FieldError id="email-error" message={state.fieldErrors?.email} />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  )
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, {} as FormState)
  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      <div>
        <label className={labelClass} htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required minLength={2} maxLength={40} className={inputClass} aria-describedby={state.fieldErrors?.displayName ? "displayName-error" : undefined} />
        <FieldError id="displayName-error" message={state.fieldErrors?.displayName} />
      </div>
      <div>
        <label className={labelClass} htmlFor="username">Username</label>
        <input id="username" name="username" required minLength={3} maxLength={20} className={inputClass} aria-describedby={state.fieldErrors?.username ? "username-error" : undefined} />
        <FieldError id="username-error" message={state.fieldErrors?.username} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} />
        <FieldError id="email-error" message={state.fieldErrors?.email} />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={200} className={inputClass} aria-describedby={state.fieldErrors?.password ? "password-error" : undefined} />
        <FieldError id="password-error" message={state.fieldErrors?.password} />
      </div>
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Creating…" : "Create account"}</button>
    </form>
  )
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {} as FormState)
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <button className={buttonClass} disabled={pending}>{pending ? "Sending…" : "Request reset"}</button>
      {state.ok ? (
        <p role="status" className="text-sm leading-6 text-muted">
          If an account exists for that email, a reset link will be sent once email delivery is connected. This beta does not send email yet.
        </p>
      ) : null}
    </form>
  )
}

function IndustryCategoryFields({
  industry,
  category,
  errors,
}: {
  industry?: Industry
  category?: Category
  errors?: Record<string, string>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="industry">Industry</label>
        <select id="industry" name="industry" defaultValue={industry ?? "all"} className={inputClass}>
          {INDUSTRIES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <FieldError id="industry-error" message={errors?.industry} />
      </div>
      <div>
        <label className={labelClass} htmlFor="category">Topic</label>
        <select id="category" name="category" defaultValue={category ?? "movies"} className={inputClass}>
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <FieldError id="category-error" message={errors?.category} />
      </div>
    </div>
  )
}

export function DiscussionForm({
  mode,
  slug,
  defaults,
}: {
  mode: "create" | "edit"
  slug?: string
  defaults?: { title: string; body: string; industry: Industry; category: Category }
}) {
  const [state, action, pending] = useActionState(mode === "create" ? createDiscussionAction : updateDiscussionAction, {} as FormState)
  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      {slug ? <input type="hidden" name="slug" value={slug} /> : null}
      <div>
        <label className={labelClass} htmlFor="title">Title</label>
        <input id="title" name="title" required minLength={8} maxLength={120} defaultValue={defaults?.title} className={inputClass} />
        <FieldError id="title-error" message={state.fieldErrors?.title} />
      </div>
      <IndustryCategoryFields industry={defaults?.industry} category={defaults?.category} errors={state.fieldErrors} />
      <div>
        <label className={labelClass} htmlFor="body">The argument</label>
        <textarea id="body" name="body" required minLength={20} maxLength={4000} rows={8} defaultValue={defaults?.body} className={inputClass} />
        <FieldError id="body-error" message={state.fieldErrors?.body} />
      </div>
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Publishing…" : mode === "create" ? "Publish discussion" : "Save changes"}</button>
    </form>
  )
}

export function BattleForm() {
  const [state, action, pending] = useActionState(createBattleAction, {} as FormState)
  const [count, setCount] = useState(2)
  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      <div>
        <label className={labelClass} htmlFor="title">Question</label>
        <input id="title" name="title" required minLength={8} maxLength={120} className={inputClass} />
        <FieldError id="title-error" message={state.fieldErrors?.title} />
      </div>
      <IndustryCategoryFields errors={state.fieldErrors} />
      <div>
        <label className={labelClass} htmlFor="prompt">Why it matters</label>
        <textarea id="prompt" name="prompt" required minLength={20} maxLength={500} rows={4} className={inputClass} />
        <FieldError id="prompt-error" message={state.fieldErrors?.prompt} />
      </div>
      <fieldset className="space-y-3">
        <legend className={labelClass}>Options</legend>
        {Array.from({ length: count }, (_, index) => (
          <div key={index}>
            <label className="sr-only" htmlFor={`option${index}`}>Option {index + 1}</label>
            <input id={`option${index}`} name={`option${index}`} required minLength={2} maxLength={80} placeholder={`Option ${index + 1}`} className={inputClass} />
          </div>
        ))}
        <FieldError id="options-error" message={state.fieldErrors?.options} />
        {count < 4 ? (
          <button type="button" className="text-sm font-semibold text-gold" onClick={() => setCount((value) => Math.min(4, value + 1))}>
            Add an option
          </button>
        ) : null}
      </fieldset>
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Publishing…" : "Open the battle"}</button>
    </form>
  )
}

export function CommentForm({
  discussionId,
  battleId,
  returnTo,
}: {
  discussionId?: string
  battleId?: string
  returnTo: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await commentAction(prev, formData)
    if (result.ok) formRef.current?.reset()
    return result
  }, {} as FormState)
  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Honeypot />
      {discussionId ? <input type="hidden" name="discussionId" value={discussionId} /> : null}
      {battleId ? <input type="hidden" name="battleId" value={battleId} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className={labelClass} htmlFor="reply">Your reply</label>
      <textarea
        id="reply"
        name="body"
        required
        minLength={2}
        maxLength={2000}
        rows={4}
        className={inputClass}
      />
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      {state.ok ? <p role="status" className="text-sm text-teal">Reply posted.</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Posting…" : "Reply"}</button>
    </form>
  )
}

export function ProfileForm({
  username,
  displayName,
  bio,
  avatarColor,
  industries,
}: {
  username: string
  displayName: string
  bio: string
  avatarColor: string
  industries: FavoriteIndustry[]
}) {
  const [state, action, pending] = useActionState(profileAction, {} as FormState)
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required minLength={2} maxLength={40} defaultValue={displayName} className={inputClass} />
        <FieldError id="displayName-error" message={state.fieldErrors?.displayName} />
      </div>
      <div>
        <label className={labelClass} htmlFor="username">Username</label>
        <input id="username" name="username" required minLength={3} maxLength={20} defaultValue={username} className={inputClass} />
        <FieldError id="username-error" message={state.fieldErrors?.username} />
      </div>
      <div>
        <label className={labelClass} htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" maxLength={280} rows={4} defaultValue={bio} className={inputClass} />
        <FieldError id="bio-error" message={state.fieldErrors?.bio} />
      </div>
      <fieldset>
        <legend className={labelClass}>Avatar colour</legend>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input type="radio" name="avatarColor" value={color} defaultChecked={color === avatarColor} className="peer sr-only" />
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line text-xs font-bold peer-checked:ring-2 peer-checked:ring-gold" style={{ background: color, color: inkOn(color) }}>
                Aa
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={labelClass}>Industries you follow</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {FAVORITE_INDUSTRIES.map((industry) => (
            <label key={industry.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="industry" value={industry.id} defaultChecked={industries.includes(industry.id)} />
              {industry.label}
            </label>
          ))}
        </div>
      </fieldset>
      {state.error ? <p role="alert" className={errorClass}>{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  )
}
