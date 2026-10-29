import { inkOn } from "@/lib/format"

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
}

export function Avatar({ name, color, size = "md" }: { name: string; color: string; size?: keyof typeof sizes }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm font-semibold ${sizes[size]}`}
      style={{ background: color, color: inkOn(color) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
