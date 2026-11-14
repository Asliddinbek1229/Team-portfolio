import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthError, api, getToken, login, setToken } from './api'
import { ConfirmHost, ToastHost, useToast } from './ui'
import { useContent } from '../data/content'
import ProjectsPage from './Projects'
import ProjectEdit from './ProjectEdit'
import { TeamPage, PostsPage } from './Lists'
import SettingsPage from './Settings'
import MediaPage from './Media'
import './admin.css'

// Admin ma'lumotlari: butun baza + saqlash yordamchilari
const DataCtx = createContext(null)
export const useAdmin = () => useContext(DataCtx)

function DataProvider({ children }) {
  const [db, setDb] = useState(null)
  const site = useContent()
  const nav = useNavigate()
  const toast = useToast()

  const guard = useCallback(
    async (fn) => {
      try {
        return await fn()
      } catch (e) {
        if (e instanceof AuthError) {
          nav('/admin/login', { replace: true })
          toast('Sessiya tugadi, qayta kiring', 'err')
        } else toast(e.message, 'err')
        throw e
      }
    },
    [nav, toast],
  )

  const [failed, setFailed] = useState(false)
  const load = useCallback(
    () =>
      guard(async () => {
        setDb(await api('/content'))
        setFailed(false)
      }).catch(() => setFailed(true)),
    [guard],
  )
  useEffect(() => {
    load()
  }, [load])

  const after = useCallback(
    async (fn) => {
      const r = await guard(fn)
      await load()
      site?.reload?.()
      return r
    },
    [guard, load, site],
  )

  const value = {
    db,
    reload: load,
    create: (col, item, at) => after(() => api(`/${col}${at ? '?at=' + at : ''}`, { method: 'POST', body: item })),
    update: (col, id, patch) => after(() => api(`/${col}/${id}`, { method: 'PUT', body: patch })),
    remove: (col, id) => after(() => api(`/${col}/${id}`, { method: 'DELETE' })),
    order: (col, ids) => after(() => api(`/${col}/order`, { method: 'PUT', body: { ids } })),
    saveSettings: (s) => after(() => api('/settings', { method: 'PUT', body: s })),
    call: (path, opts) => guard(() => api(path, opts)),
  }
  if (!db)
    return (
      <div className="a-loading">
        {failed ? (
          <div className="a-row">
            <span>Server bilan bog‘lanib bo‘lmadi.</span>
            <button className="a-btn sm" onClick={load}>
              Qayta urinish
            </button>
          </div>
        ) : (
          'Yuklanmoqda…'
        )}
      </div>
    )
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  if (getToken()) return <Navigate to="/admin" replace />
  return (
    <div className="a-login">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setErr('')
          try {
            await login(pw)
            nav(loc.state?.from || '/admin', { replace: true })
          } catch (e) {
            setErr(e.message)
          }
          setBusy(false)
        }}
      >
        <div className="a-login-logo">NamDU</div>
        <p className="a-mono">Admin panel</p>
        <input className="a-input" type="password" placeholder="Parol" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err && <p className="a-error">{err}</p>}
        <button className="a-btn primary block" disabled={busy || !pw}>
          {busy ? 'Tekshirilmoqda…' : 'Kirish'}
        </button>
        <Link to="/" className="a-hint">
          ← Saytga qaytish
        </Link>
      </form>
    </div>
  )
}

const NAV = [
  ['/admin', 'Loyihalar', true],
  ['/admin/team', 'Jamoa'],
  ['/admin/posts', 'Maqolalar'],
  ['/admin/media', 'Media'],
  ['/admin/settings', 'Sozlamalar'],
]

function Shell({ children }) {
  const nav = useNavigate()
  const { db } = useAdmin()
  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link to="/admin" className="a-brand">
          NamDU<span>admin</span>
        </Link>
        <nav>
          {NAV.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>
              {label}
              {to === '/admin' && <em>{db.projects.length}</em>}
              {to === '/admin/team' && <em>{db.team.length}</em>}
              {to === '/admin/posts' && <em>{db.posts.length}</em>}
            </NavLink>
          ))}
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noreferrer">
            Saytni ochish ↗
          </a>
          <button
            onClick={() => {
              setToken('')
              nav('/admin/login')
            }}
          >
            Chiqish
          </button>
          {db.updatedAt && <span className="a-hint">Saqlangan: {new Date(db.updatedAt).toLocaleString('uz-UZ')}</span>}
        </div>
      </aside>
      <main className="a-main">{children}</main>
    </div>
  )
}

function Protected({ children }) {
  const loc = useLocation()
  if (!getToken()) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  return (
    <DataProvider>
      <Shell>{children}</Shell>
    </DataProvider>
  )
}

export default function AdminApp() {
  useEffect(() => {
    document.body.classList.add('admin-body')
    const t = document.title
    document.title = 'Admin · NamDU IT Park'
    return () => {
      document.body.classList.remove('admin-body')
      document.title = t
    }
  }, [])
  return (
    <ToastHost>
      <ConfirmHost>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path="*"
            element={
              <Protected>
                <Routes>
                  <Route index element={<ProjectsPage />} />
                  <Route path="projects/:id" element={<ProjectEdit />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="posts" element={<PostsPage />} />
                  <Route path="media" element={<MediaPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </Protected>
            }
          />
        </Routes>
      </ConfirmHost>
    </ToastHost>
  )
}
