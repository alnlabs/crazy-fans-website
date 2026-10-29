"use client"

import { useEffect } from "react"
import { markActiveAction } from "@/lib/actions/community"

export function ActivePing() {
  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10)
    try {
      if (window.sessionStorage.getItem("cf-active") === day) return
      window.sessionStorage.setItem("cf-active", day)
    } catch {
      // Storage can be blocked. The server still dedupes by day.
    }
    void markActiveAction()
  }, [])
  return null
}
