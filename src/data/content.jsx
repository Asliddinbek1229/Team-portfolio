import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { normalizeProjects } from './projects'

const Ctx = createContext(null)

export function ContentProvider({ children }) {
  const [raw, setRaw] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/content', { cache: 'no-store' })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      setRaw(await r.json())
      setError(null)
    } catch (e) {
      setError(String(e.message || e))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(() => {
    if (!raw) return { ready: false, error, reload: load }
    return {
      ready: true,
      error: null,
      reload: load,
      settings: raw.settings || {},
      projects: normalizeProjects(raw.projects),
      team: raw.team || [],
      posts: raw.posts || [],
    }
  }, [raw, error, load])

  useEffect(() => {
    if (value.ready && value.settings.siteTitle) document.title = value.settings.siteTitle
  }, [value])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useContent = () => useContext(Ctx)
