import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { runtimeDataDir } from "@/lib/data-dir"
import { buildSeed } from "@/lib/seed"
import { supabaseStoreEnabled } from "@/lib/supabase/mode"
import type { Store } from "@/lib/types"

let chain: Promise<unknown> = Promise.resolve()
let depth = 0
let memoryStore: Store | null = null

function dataFile() {
  return process.env.CRAZY_FANS_DATA || path.join(runtimeDataDir(), "store.json")
}

function unwritable(error: unknown) {
  const code = (error as NodeJS.ErrnoException).code
  return code === "ENOENT" || code === "EACCES" || code === "EROFS" || code === "EPERM"
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

async function persistOrRemember(store: Store) {
  try {
    await atomicWrite(store)
    memoryStore = null
  } catch (error) {
    if (!unwritable(error)) throw error
    memoryStore = store
  }
}

async function readOrSeed(): Promise<Store> {
  if (memoryStore) return memoryStore
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
    await persistOrRemember(store)
    return store
  }
}

export function view<T>(fn: (store: Store) => T): Promise<T> {
  if (supabaseStoreEnabled()) return import("@/lib/supabase/remote").then((remote) => remote.remoteView(fn))
  return enqueue(async () => fn(await readOrSeed()))
}

export function update<T>(fn: (store: Store) => T): Promise<T> {
  if (supabaseStoreEnabled()) return import("@/lib/supabase/remote").then((remote) => remote.remoteUpdate(fn))
  return enqueue(async () => {
    if (depth > 0) throw new Error("Nested store update")
    depth += 1
    try {
      const store = await readOrSeed()
      const result = fn(store)
      await persistOrRemember(store)
      return result
    } finally {
      depth -= 1
    }
  })
}
