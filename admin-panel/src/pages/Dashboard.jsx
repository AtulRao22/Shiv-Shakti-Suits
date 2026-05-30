import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getStats } from '../api'

const STATUS_BADGE = {
  Placed: 'badge-placed',
  Paid: 'badge-paid',
  Processing: 'badge-processing',
  Shipped: 'badge-shipped',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
}

/* Animated counter that counts up from 0 to `target` */
function AnimatedNumber({ target = 0, prefix = '', decimals = false }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!target) return
    const duration = 1100
    const steps = 55
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target])

  const formatted = decimals
    ? value.toLocaleString('en-IN')
    : value.toLocaleString()

  return (
    <>
      {prefix}
      {formatted}
    </>
  )
}

const STAT_CARDS = (s) => [
  {
    key: 'revenue',
    icon: 'fa-indian-rupee-sign',
    label: 'Total Revenue',
    value: s.totalRevenue || 0,
    prefix: '₹',
    decimals: true,
  },
  {
    key: 'users',
    icon: 'fa-users',
    label: 'Total Users',
    value: s.totalUsers || 0,
  },
  {
    key: 'orders',
    icon: 'fa-bag-shopping',
    label: 'Total Orders',
    value: s.totalOrders || 0,
  },
  {
    key: 'traffic',
    icon: 'fa-chart-line',
    label: 'Website Visits',
    value: s.websiteTraffic || 0,
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  const cards = STAT_CARDS(stats || {})

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
        </p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.key} className="stat-card">
            <div className={`stat-icon ${card.key}`}>
              <i className={`fa-solid ${card.icon}`} />
            </div>
            <div className="stat-value">
              <AnimatedNumber
                target={card.value}
                prefix={card.prefix || ''}
                decimals={card.decimals}
              />
            </div>
            <div className="stat-label">{card.label}</div>
            <div className={`stat-card-bg ${card.key}`} />
          </div>
        ))}
      </div>

      {/* Dashboard grid */}
      <div className="dashboard-grid">

        {/* Recent orders */}
        <div className="table-card">
          <div className="table-card-header">
            <span className="table-card-title">
              <i className="fa-solid fa-clock-rotate-left" />
              Recent Orders
            </span>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>

          {!stats?.recentOrders?.length ? (
            <div className="empty-state">
              <i className="fa-solid fa-bag-shopping" />
              <p>No orders yet</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.user?.name || order.user?.email || 'Guest'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {order.user?.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{(order.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-default'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick actions */}
          <div className="card">
            <div className="card-body">
              <div className="table-card-title" style={{ marginBottom: 16 }}>
                <i className="fa-solid fa-bolt" style={{ color: 'var(--primary)', marginRight: 8 }} />
                Quick Actions
              </div>
              <div className="quick-actions">
                <Link to="/admin/add-product" className="quick-action-btn">
                  <i className="fa-solid fa-circle-plus" />
                  Add New Product
                </Link>
                <Link to="/admin/orders" className="quick-action-btn">
                  <i className="fa-solid fa-bag-shopping" />
                  Manage Orders
                </Link>
                <Link to="/admin/products" className="quick-action-btn">
                  <i className="fa-solid fa-box" />
                  View Products
                </Link>
                <a href="/" className="quick-action-btn">
                  <i className="fa-solid fa-store" />
                  Visit Store
                </a>
              </div>
            </div>
          </div>

          {/* Store summary */}
          <div className="card">
            <div className="card-body">
              <div className="table-card-title" style={{ marginBottom: 16 }}>
                <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)', marginRight: 8 }} />
                Store Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Total Products', val: stats?.totalProducts || 0, icon: 'fa-box', color: '#667eea' },
                  { label: 'Total Users', val: stats?.totalUsers || 0, icon: 'fa-users', color: '#3182ce' },
                  { label: 'Total Orders', val: stats?.totalOrders || 0, icon: 'fa-bag-shopping', color: '#d69e2e' },
                ].map((item) => (
                  <div key={item.label} className="mini-stat-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <i className={`fa-solid ${item.icon}`} style={{ color: item.color, width: 16, textAlign: 'center' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: item.color }}>
                      {item.val.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
