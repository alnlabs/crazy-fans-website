import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { buildSeed } from "@/lib/seed"
import type { Store } from "@/lib/types"

let chain: Promise<unknown> = Promise.resolve()
let depth = 0

function dataFile() {
  return process.env.CRAZY_FANS_DATA || path.join(process.cwd(), "data", "store.json")
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function atomicWrite(store: Store) {
  const file = dataFile()
  await mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(store, null, 2), "utf8")
  await rename(/*turbopackIgnore: true*/ tmp, file)
}

async function readOrSeed(): Promise<Store> {
  const file = dataFile()
  try {
    const raw = await readFile(/*turbopackIgnore: true*/ file, "utf8")
    const store = JSON.parse(raw) as Store
    if (store.version !== 1) {
      throw new Error("This local data file is from a different version. Restore a backup before continuing.")
    }
    return store
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      if (error instanceof SyntaxError) {
        throw new Error("The local data file is unreadable. Restore it from a backup.")
      }
      throw error
    }
    const store = buildSeed()
    await atomicWrite(store)
    return store
  }
}

export function view<T>(fn: (store: Store) => T): Promise<T> {
  return enqueue(async () => fn(await readOrSeed()))
}

export function update<T>(fn: (store: Store) => T): Promise<T> {
  return enqueue(async () => {
    if (depth > 0) throw new Error("Nested store update")
    depth += 1
    try {
      const store = await readOrSeed()
      const result = fn(store)
      await atomicWrite(store)
      return result
    } finally {
      depth -= 1
    }
  })
}
