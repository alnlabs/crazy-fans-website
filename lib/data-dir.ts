import path from "node:path"

export function runtimeDataDir() {
  if (process.env.CRAZY_FANS_DATA) return path.dirname(process.env.CRAZY_FANS_DATA)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return "/tmp/crazy-fans"
  return path.join(process.cwd(), "data")
}
