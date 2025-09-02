const BASE = '/api'

export async function apiFetch(url, { method = 'GET', headers = {}, body, withAuth = false } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  }

  //getting token from localstorage but we are using in cookies
  const token = localStorage.getItem('token')
  if (withAuth && token && !opts.headers['Authorization']) {
    opts.headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(BASE + url, opts)
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText
    throw new Error(message)
  }
  return data
}
