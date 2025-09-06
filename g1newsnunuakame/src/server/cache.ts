type CacheEntry = {
  data: any
  expiresAt: number
}

export function createCache() {
  const map = new Map<string, CacheEntry>()

  function get(key: string) {
    const entry = map.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      map.delete(key)
      return null
    }
    return entry.data
  }

  function set(key: string, data: any, ttlSeconds = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000
    map.set(key, { data, expiresAt })
  }

  function clear() {
    map.clear()
  }

  return { get, set, clear }
}