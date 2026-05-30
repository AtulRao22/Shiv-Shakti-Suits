import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts, deleteProduct, updateProduct } from '../api'

/* ── Confirm Delete Dialog ──────────────────────────────────────── */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <div className="confirm-title">Delete Product?</div>
        <div className="confirm-text">
          This action is permanent and cannot be undone. The product and its
          images will be removed from your store.
        </div>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <i className="fa-solid fa-trash" /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Edit Product Modal ─────────────────────────────────────────── */
function EditModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:        product.name        || '',
    mrp:         product.mrp         || '',
    salePrice:   product.salePrice   || '',
    category:    product.category    || '',
    description: product.description || '',
    tags: Array.isArray(product.tags)
      ? product.tags.join(', ')
      : (product.tags || ''),
  })
  const [newImages, setNewImages]   = useState([])
  const [previews, setPreviews]     = useState(product.imageUrls || [])
  const [saving, setSaving]         = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Product name is required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name',        form.name)
      fd.append('mrp',         form.mrp)
      fd.append('salePrice',   form.salePrice)
      fd.append('category',    form.category)
      fd.append('description', form.description)
      fd.append('tags',        form.tags)
      newImages.forEach((img) => fd.append('images', img))

      const data = await updateProduct(product._id, fd)
      onSaved(data.product || { ...product, ...form })
      toast.success('Product updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa-solid fa-pen" style={{ marginRight: 8, color: 'var(--primary)' }} />
            Edit Product
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Product Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <input className="form-control" name="category" value={form.category} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">MRP (₹)</label>
              <input className="form-control" type="number" name="mrp" value={form.mrp} onChange={handleChange} min="0" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sale Price (₹)</label>
              <input className="form-control" type="number" name="salePrice" value={form.salePrice} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags <span className="optional">(comma-separated)</span></label>
            <input
              className="form-control" name="tags" value={form.tags}
              onChange={handleChange} placeholder="e.g. Trending, Festival"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Replace Images <span className="optional">(leave empty to keep current)</span>
            </label>
            <input className="form-control" type="file" multiple accept="image/*" onChange={handleImageChange} />
            {previews.length > 0 && (
              <div className="image-preview-grid">
                {previews.map((src, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={src} alt={`Preview ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────── */
const getTotalStock = (p) =>
  p.variants?.length
    ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : p.stock || 0

/* ── Products Page ───────────────────────────────────────────────── */
export default function Products() {
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      (Array.isArray(p.tags) ? p.tags.join(' ') : p.tags || '')
        .toLowerCase()
        .includes(q)
    )
  })

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId)
      setProducts((prev) => prev.filter((p) => p._id !== deleteId))
      toast.success('Product deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  const handleSaved = (updated) => {
    setProducts((prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)))
    setEditProduct(null)
  }

  return (
    <>
      {deleteId  && <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      {editProduct && <EditModal product={editProduct} onClose={() => setEditProduct(null)} onSaved={handleSaved} />}

      <div className="page-header-row">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in your store</p>
        </div>
        <Link to="/admin/add-product" className="btn btn-primary">
          <i className="fa-solid fa-circle-plus" /> Add Product
        </Link>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="form-control"
              placeholder="Search by name, category or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-box-open" />
            <p>{search ? 'No products match your search' : 'No products yet'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Tags</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const stock = getTotalStock(p)
                  const tags  = Array.isArray(p.tags)
                    ? p.tags
                    : (p.tags || '').split(',').map((t) => t.trim()).filter(Boolean)

                  return (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>

                      <td>
                        <img
                          className="product-img"
                          src={p.imageUrls?.[0] || '/assets/no-image.jpg'}
                          alt={p.name}
                        />
                      </td>

                      <td style={{ fontWeight: 600 }}>{p.name}</td>

                      <td>
                        <span className="category-chip">{p.category}</span>
                      </td>

                      <td>
                        <div className="price-main">₹{p.salePrice || p.mrp}</div>
                        {p.mrp && p.salePrice && p.mrp !== p.salePrice && (
                          <div className="price-original">₹{p.mrp}</div>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {tags.slice(0, 3).map((tag, ti) => (
                            <span key={ti} className="tag-chip">{tag}</span>
                          ))}
                          {tags.length > 3 && (
                            <span className="tag-chip">+{tags.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={
                          stock === 0 ? 'stock-out' :
                          stock < 2   ? 'stock-low' : 'stock-ok'
                        }>
                          {stock}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-warning btn-icon btn-sm"
                            onClick={() => setEditProduct(p)}
                            title="Edit product"
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => setDeleteId(p._id)}
                            title="Delete product"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
