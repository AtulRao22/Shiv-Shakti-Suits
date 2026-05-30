import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/admin/products', icon: 'fa-box', label: 'Products' },
  { to: '/admin/add-product', icon: 'fa-circle-plus', label: 'Add Product' },
  { to: '/admin/orders', icon: 'fa-bag-shopping', label: 'Orders' },
]

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/add-product': 'Add Product',
  '/admin/orders': 'Orders',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin'

  // Update browser tab title on every page change
  useEffect(() => {
    document.title = `${pageTitle} — Shiv Shakti Admin`
  }, [pageTitle])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-glow" />

        <div className="sidebar-brand">
          <a href="/">
            <div className="sidebar-logo">Shiv Shakti Suits</div>
            <div className="sidebar-subtitle">Admin Panel</div>
          </a>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Administrator</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
          </div>

          <a href="/" className="btn-sidebar-action">
            <i className="fa-solid fa-arrow-up-right-from-square" />
            Go to Website
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="main-content">
        {/* Top navbar */}
        <header className="topnav">
          <div className="topnav-left">
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              <i className="fa-solid fa-bars" />
            </button>
            <div className="page-breadcrumb">
              Admin&nbsp;/&nbsp;<span>{pageTitle}</span>
            </div>
          </div>


        </header>

        {/* Page content rendered by child routes */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
