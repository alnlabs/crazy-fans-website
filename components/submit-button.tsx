"use client"

import { useFormStatus } from "react-dom"
import { buttonClass } from "@/lib/styles"

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = buttonClass,
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  )
}
