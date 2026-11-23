'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

type Product = {
  id: string; name: string; price: number;
  colors: string[]; sizes: string[]; images: string[]
}

const EMPTY = { name: '', price: '', colors: '', sizes: '', images: [] as string[] }

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any).role !== 'ADMIN') { router.replace('/'); return }
    fetchProducts()
  }, [session, status])

  async function fetchProducts() {
    const r = await fetch('/api/products')
    if (r.ok) setProducts(await r.json())
  }

  async function uploadImages(files: FileList) {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      if (r.ok) { const d = await r.json(); urls.push(d.url) }
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name,
      price: form.price,
      colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images,
    }
    const url    = editing ? `/api/products/${editing}` : '/api/products'
    const method = editing ? 'PATCH' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (r.ok) { fetchProducts(); resetForm() }
  }

  function editProduct(p: Product) {
    setForm({ name: p.name, price: String(p.price), colors: p.colors.join(', '), sizes: p.sizes.join(', '), images: p.images })
    setEditing(p.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  function resetForm() { setForm(EMPTY); setEditing(null); setShowForm(false) }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--black)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ height: 3, background: 'var(--red)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
          <a href="/admin" style={{ color: '#888', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>‹</a>
          <img src="/logo.jpg" alt="Mi Chic" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--red)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>
              🛍️ Catalogue produits
            </div>
            <div style={{ fontSize: 11, color: '#777' }}>{products.length} produit{products.length > 1 ? 's' : ''}</div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <a href="/catalog" target="_blank" className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }}>Voir →</a>
            <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => { resetForm(); setShowForm(true) }}>+ Ajouter</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Formulaire */}
        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '.02em', marginBottom: 16 }}>
              {editing ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nom du produit *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Chaussure Nike Air Max" />
              </div>
              <div className="form-group">
                <label>Prix (Ar) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Ex: 85000" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Couleurs <span style={{ fontWeight: 400 }}>(virgule)</span></label>
                  <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Rouge, Noir, Blanc" />
                </div>
                <div className="form-group">
                  <label>Pointures <span style={{ fontWeight: 400 }}>(virgule)</span></label>
                  <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="38, 39, 40, 41" />
                </div>
              </div>

              {/* Upload */}
              <div className="form-group">
                <label>Photos du produit {form.images.length > 0 && `(${form.images.length})`}</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '18px', textAlign: 'center', cursor: 'pointer', background: uploading ? 'var(--bg)' : '#fff', transition: 'background .15s' }}
                >
                  {uploading
                    ? <><div style={{ fontSize: 20 }}>⏳</div><div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Upload en cours…</div></>
                    : <><div style={{ fontSize: 24 }}>📷</div><div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Appuyer pour ajouter des photos</div><div style={{ fontSize: 11, color: 'var(--border)', marginTop: 2 }}>Plusieurs sélections possibles</div></>
                  }
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files && uploadImages(e.target.files)} />
              </div>

              {/* Aperçu */}
              {form.images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                      <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        style={{ position: 'absolute', top: -6, right: -6, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetForm}>Annuler</button>
                <button className="btn btn-primary" style={{ flex: 2, fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '.03em' }} onClick={handleSave} disabled={saving || uploading || !form.name || !form.price}>
                  {saving ? 'Sauvegarde…' : editing ? 'Enregistrer' : 'Créer le produit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map(p => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {p.images[0]
                  ? <img src={p.images[0]} style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                  : <div style={{ width: 68, height: 68, background: 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👟</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '.01em' }}>{p.name}</div>
                  <div style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, margin: '2px 0' }}>{p.price.toLocaleString('fr-FR')} Ar</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {p.images.length} photo{p.images.length > 1 ? 's' : ''}
                    {p.colors.length > 0 ? ' · ' + p.colors.slice(0, 2).join(', ') + (p.colors.length > 2 ? '…' : '') : ''}
                    {p.sizes.length > 0 ? ' · ' + p.sizes.slice(0, 3).join(' ') + (p.sizes.length > 3 ? '…' : '') : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13, padding: '9px' }} onClick={() => editProduct(p)}>✏️ Modifier</button>
                <button className="btn btn-danger"    style={{ flex: 1, fontSize: 13, padding: '9px' }} onClick={() => deleteProduct(p.id)}>🗑️ Supprimer</button>
              </div>
            </div>
          ))}
          {products.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '50px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👟</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Aucun produit</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Cliquez sur "+ Ajouter" pour commencer</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
