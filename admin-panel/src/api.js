/**
 * Centralized API helpers for the React admin panel.
 * All fetch calls include credentials: 'include' so the Express session
 * cookie is sent automatically (same origin in production).
 */

const request = async (method, url, body) => {
  const isFormData = body instanceof FormData

  const options = {
    method,
    credentials: 'include',
    headers: isFormData
      ? { Accept: 'application/json' }
      : { Accept: 'application/json', 'Content-Type': 'application/json' },
  }

  if (body) options.body = isFormData ? body : JSON.stringify(body)

  const res = await fetch(url, options)

  // Unauthorized / not admin → redirect to main site login
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/?login=true'
    return
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`)
  }

  return data
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export const getStats = () => request('GET', '/admin/api/stats')

// ── Products ────────────────────────────────────────────────────────────────
export const getProducts    = ()          => request('GET',    '/api/products')
export const addProduct     = (formData)  => request('POST',   '/api/products/add', formData)
export const updateProduct  = (id, fd)    => request('PUT',    `/api/products/${id}`, fd)
export const deleteProduct  = (id)        => request('DELETE', `/api/products/${id}`)

// ── Orders ──────────────────────────────────────────────────────────────────
export const getOrders          = ()               => request('GET',  '/admin/api/orders')
export const updateOrderStatus  = (id, status)     =>
  request('POST', `/admin/orders/${id}/status`, { status })
