const KEY = 'namdu-admin-token'

export const getToken = () => {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}
export const setToken = (t) => {
  try {
    t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY)
  } catch {}
}

export class AuthError extends Error {}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { Authorization: 'Bearer ' + getToken() }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const r = await fetch('/api/admin' + path, {
    method,
    headers,
    body: form || (body !== undefined ? JSON.stringify(body) : undefined),
  })
  const data = await r.json().catch(() => ({}))
  if (r.status === 401) {
    setToken('')
    throw new AuthError(data.error || 'Qayta kiring')
  }
  if (!r.ok) throw new Error(data.error || 'Xatolik: ' + r.status)
  return data
}

export async function login(password) {
  const r = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Kirib bo‘lmadi')
  setToken(data.token)
  return true
}

export async function uploadFiles(files) {
  const form = new FormData()
  ;[...files].forEach((f) => form.append('files', f))
  return api('/upload', { method: 'POST', form })
}
