import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getOrders, updateOrderStatus } from '../api'

const STATUS_OPTIONS = ['Placed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_BADGE = {
  Placed:     'badge-placed',
  Paid:       'badge-paid',
  Processing: 'badge-processing',
  Shipped:    'badge-shipped',
  Delivered:  'badge-delivered',
  Cancelled:  'badge-cancelled',
}

/* ── Single order row — has its own status state ─────────────────── */
function OrderRow({ order, onStatusSaved }) {
  const [status, setStatus]   = useState(order.status)
  const [saving, setSaving]   = useState(false)

  const handleSave = async () => {
    if (status === order.status) {
      toast('Status unchanged', { icon: 'ℹ️' })
      return
    }
    setSaving(true)
    try {
      await updateOrderStatus(order._id, status)
      onStatusSaved(order._id, status)     // lift state up so the filter chips update
      toast.success(`Order updated to ${status}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
      setStatus(order.status)              // revert on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr>
      {/* Date */}
      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        {new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}
      </td>

      {/* Customer */}
      <td>
        <div style={{ fontWeight: 600 }}>
          {order.user?.name || order.user?.email || 'Guest'}
        </div>
        {order.user?.email && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {order.user.email}
          </div>
        )}
      </td>

      {/* Items */}
      <td>
        {order.products?.length ? (
          <>
            {order.products.slice(0, 2).map((item, i) => (
              <div key={i} style={{ fontSize: '0.82rem', marginBottom: 2 }}>
                {item.product?.name || item.name || 'Product'}
                <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                  ({item.size || 'N/A'} × {item.qty || 1})
                </span>
              </div>
            ))}
            {order.products.length > 2 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                +{order.products.length - 2} more
              </div>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>No items</span>
        )}
      </td>

      {/* Total */}
      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        ₹{(order.total || 0).toLocaleString('en-IN')}
      </td>

      {/* Current status badge (reflects saved state) */}
      <td>
        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-default'}`}>
          {order.status}
        </span>
      </td>

      {/* Status updater */}
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
            title="Save status"
          >
            {saving
              ? <i className="fa-solid fa-spinner fa-spin" />
              : <i className="fa-solid fa-floppy-disk" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ── Orders Page ──────────────────────────────────────────────────── */
export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  /* Update the order's status in local state after a successful save */
  const handleStatusSaved = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    )
  }

  /* Status counts for filter chips */
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})

  const filtered = orders.filter((o) => {
    const matchFilter = filter === 'All' || o.status === filter
    const matchSearch =
      !search ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">{orders.length} total orders</p>
      </div>

      {/* Filter chips */}
      <div className="filter-chips">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            className={`filter-chip${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== 'All' && counts[s] > 0 && (
              <span style={{ marginLeft: 5, opacity: 0.75 }}>({counts[s]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="form-control"
              placeholder="Search by customer name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-bag-shopping" />
            <p>
              {search || filter !== 'All'
                ? 'No orders match your filters'
                : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onStatusSaved={handleStatusSaved}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
