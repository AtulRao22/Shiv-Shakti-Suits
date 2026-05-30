import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addProduct } from '../api'

const DETAIL_FIELDS = [
  { name: 'topType',      label: 'Top Type'        },
  { name: 'neckline',     label: 'Neckline'        },
  { name: 'topPattern',   label: 'Top Pattern'     },
  { name: 'sleeveType',   label: 'Sleeve Type'     },
  { name: 'bottomType',   label: 'Bottom Type'     },
  { name: 'dupattaStole', label: 'Dupatta / Stole' },
  { name: 'fit',          label: 'Fit'             },
  { name: 'fabric',       label: 'Fabric'          },
]

export default function AddProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', mrp: '', salePrice: '', category: '', description: '', tags: '',
  })
  const [details, setDetails]   = useState({})
  const [variants, setVariants] = useState([{ size: '', stock: '' }])
  const [images, setImages]     = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving]     = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleDetailChange = (e) =>
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }))

  /* Variant management */
  const addVariant    = ()           => setVariants((v) => [...v, { size: '', stock: '' }])
  const removeVariant = (i)          => setVariants((v) => v.filter((_, idx) => idx !== i))
  const updateVariant = (i, k, val)  =>
    setVariants((v) => v.map((item, idx) => (idx === i ? { ...item, [k]: val } : item)))

  /* Image preview */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim())  return toast.error('Product name is required')
    if (!form.mrp)          return toast.error('MRP is required')
    if (!form.salePrice)    return toast.error('Sale price is required')
    if (!form.category.trim()) return toast.error('Category is required')

    setSaving(true)
    try {
      const fd = new FormData()

      // Basic fields
      fd.append('name',        form.name)
      fd.append('mrp',         form.mrp)
      fd.append('salePrice',   form.salePrice)
      fd.append('category',    form.category)
      fd.append('description', form.description)

      // Tags → JSON array
      const parsedTags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      fd.append('tags', JSON.stringify(parsedTags))

      // Variants → JSON array
      const parsedVariants = variants
        .filter((v) => v.size.trim())
        .map((v) => ({ size: v.size.trim(), stock: parseInt(v.stock) || 0 }))
      fd.append('variants', JSON.stringify(parsedVariants))

      // Details → JSON object (only non-empty fields)
      const parsedDetails = {}
      Object.entries(details).forEach(([k, v]) => {
        if (v.trim()) parsedDetails[k] = v.trim()
      })
      fd.append('details', JSON.stringify(parsedDetails))

      // Images
      images.forEach((img) => fd.append('images', img))

      const data = await addProduct(fd)

      if (data.success) {
        toast.success('Product created successfully!')
        navigate('/admin/products')
      } else {
        toast.error(data.error || 'Failed to create product')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Fill in the details to add a new product to your store</p>
        </div>
        <Link to="/admin/products" className="btn btn-ghost">
          <i className="fa-solid fa-arrow-left" /> Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }}>

          {/* ── Left column ── */}
          <div>
            {/* Basic info */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <div className="form-section-title">Basic Information</div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-control" name="name" value={form.name}
                    onChange={handleChange} placeholder="e.g. Punjabi Salwar Kameez" required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">MRP (₹) *</label>
                    <input
                      className="form-control" type="number" name="mrp"
                      value={form.mrp} onChange={handleChange} min="0" required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sale Price (₹) *</label>
                    <input
                      className="form-control" type="number" name="salePrice"
                      value={form.salePrice} onChange={handleChange} min="0" required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      className="form-control" name="category" value={form.category}
                      onChange={handleChange} placeholder="e.g. Punjabi, Modern" required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Tags <span className="optional">(comma-separated)</span>
                    </label>
                    <input
                      className="form-control" name="tags" value={form.tags}
                      onChange={handleChange} placeholder="e.g. Trending, Festival-Special"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control" name="description" value={form.description}
                    onChange={handleChange} rows={4} placeholder="Enter product details…"
                  />
                </div>
              </div>
            </div>

            {/* Product details */}
            <div className="card">
              <div className="card-body">
                <div className="form-section-title">Product Details</div>
                <div className="form-row">
                  {DETAIL_FIELDS.map((field) => (
                    <div key={field.name} className="form-group">
                      <label className="form-label">{field.label}</label>
                      <input
                        className="form-control"
                        name={field.name}
                        value={details[field.name] || ''}
                        onChange={handleDetailChange}
                        placeholder="Optional"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div>
            {/* Variants */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <div className="form-section-title">Variants (Size + Stock)</div>
                <div className="variant-list">
                  {variants.map((v, i) => (
                    <div key={i} className="variant-row">
                      <input
                        className="form-control"
                        placeholder="Size (e.g. M)"
                        value={v.size}
                        onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      />
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => removeVariant(i)}
                          title="Remove variant"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button" className="btn btn-ghost btn-sm"
                  onClick={addVariant}
                >
                  <i className="fa-solid fa-plus" /> Add Variant
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <div className="form-section-title">Product Images</div>
                <input
                  className="form-control"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="form-hint">Upload up to 5 images. First image is the thumbnail.</p>

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

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 18px' }}
              disabled={saving}
            >
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin" /> Creating Product…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Product</>}
            </button>
          </div>

        </div>
      </form>
    </>
  )
}
