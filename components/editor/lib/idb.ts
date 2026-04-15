import { IDB_NAME, IDB_STORE, IDB_VERSION, MODELS } from "../constants"
import type { ModelKey } from "../types"

const MODEL_FETCH_TIMEOUT_MS = 10 * 60 * 1000
const MODEL_STALL_TIMEOUT_MS = 30 * 1000

/**
 * Opens (or creates) the IndexedDB database used to cache ONNX model buffers.
 * On first run the object store is created via the `onupgradeneeded` event.
 */
export const openModelDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

/**
 * Retrieves a cached ArrayBuffer from IndexedDB by its key.
 * Returns `null` when the entry does not exist yet.
 */
export const getFromIDB = (
  db: IDBDatabase,
  key: string
): Promise<ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(IDB_STORE, "readonly")
      .objectStore(IDB_STORE)
      .get(key)
    req.onsuccess = () => resolve((req.result as ArrayBuffer) ?? null)
    req.onerror = () => reject(req.error)
  })

/**
 * Persists an ArrayBuffer in IndexedDB under the given key.
 * Overwrites any existing entry with the same key.
 */
export const saveToIDB = (
  db: IDBDatabase,
  key: string,
  buf: ArrayBuffer
): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(IDB_STORE, "readwrite")
      .objectStore(IDB_STORE)
      .put(buf, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })

/**
 * Returns `true` when the given model is already stored in IndexedDB.
 * Used to show the "Cached" status badge without a full download attempt.
 */
export const isModelCached = async (modelKey: ModelKey): Promise<boolean> => {
  const db = await openModelDB()
  const buf = await getFromIDB(db, MODELS[modelKey].cacheKey)
  return buf !== null
}

/**
 * Ensures the ONNX model binary is available locally.
 *
 * Flow:
 *  1. Open IndexedDB.
 *  2. If the model buffer already exists, return it immediately (cache hit).
 *  3. Otherwise stream-download from HuggingFace, reporting byte-level
 *     progress via `onProgress` (0–100).
 *  4. Assemble chunks into a single ArrayBuffer, persist to IndexedDB, then
 *     return the buffer.
 *
 * @param modelKey   - Which model variant to fetch ("quantized" | "fp16").
 * @param onProgress - Called repeatedly with a percentage value (0–100).
 * @returns          - The raw ONNX model as an ArrayBuffer.
 */
export const checkAndDownloadModel = async (
  modelKey: ModelKey,
  onProgress: (pct: number) => void
): Promise<ArrayBuffer> => {
  const { url, cacheKey } = MODELS[modelKey]
  const db = await openModelDB()

  // ── Cache hit ────────────────────────────────────────────────────────────
  const cached = await getFromIDB(db, cacheKey)
  if (cached) {
    onProgress(100)
    return cached
  }

  // ── Network fetch ────────────────────────────────────────────────────────
  const controller = new AbortController()
  const fetchTimeoutId = setTimeout(() => controller.abort(), MODEL_FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: { Accept: "*/*" },
      signal: controller.signal,
    })

    if (!res.ok)
      throw new Error(`Model fetch failed: ${res.status} ${res.statusText}`)

    if (!res.body) {
      const arrayBuffer = await res.arrayBuffer()
      await saveToIDB(db, cacheKey, arrayBuffer)
      onProgress(100)
      return arrayBuffer
    }

    const total = parseInt(res.headers.get("Content-Length") ?? "0", 10)
    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let received = 0

    const readWithTimeout = async () => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      try {
        return await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(
              () =>
                reject(new Error("Model download stalled. Please check your connection.")),
              MODEL_STALL_TIMEOUT_MS
            )
          }),
        ])
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    while (true) {
      const { done, value } = await readWithTimeout()

      if (done) break

      chunks.push(value)
      received += value.length

      // Report progress only when Content-Length is known
      if (total > 0) {
        onProgress(Math.min(99, Math.round((received / total) * 100)))
      } else {
        // Keep visible progress feedback when server omits Content-Length.
        const pseudo = Math.min(95, Math.round(chunks.length * 1.5))
        onProgress(pseudo)
      }
    }

    // ── Assemble buffer ────────────────────────────────────────────────────
    const merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }

    const arrayBuffer = merged.buffer

    // ── Persist to cache ───────────────────────────────────────────────────
    await saveToIDB(db, cacheKey, arrayBuffer)
    onProgress(100)

    return arrayBuffer
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(
        `Model download timed out after ${Math.round(MODEL_FETCH_TIMEOUT_MS / 1000)}s.`
      )
    }
    throw err
  } finally {
    clearTimeout(fetchTimeoutId)
  }
}
