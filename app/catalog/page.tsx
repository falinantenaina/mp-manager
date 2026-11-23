'use client'
import { useEffect, useState } from 'react'

type Product = {
  id: string; name: string; price: number;
  colors: string[]; sizes: string[]; images: string[]
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
  }, [])

  function openProduct(p: Product) { setSelected(p); setImgIndex(0) }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 40 }}>

      {/* ── Header ── */}
      <header style={{ background: 'var(--black)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ height: 3, background: 'var(--red)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <img src="/logo.jpg" alt="Mi Chic" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--red)', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#fff', lineHeight: 1.1, letterSpacing: '.02em' }}>
              Mi <span style={{ color: 'var(--red)' }}>Chic</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>034 89 244 00</div>
          </div>
          <a
            href="tel:0348924400"
            style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            📞 Commander
          </a>
        </div>
      </header>

      {/* ── Hero tagline ── */}
      <div style={{ background: 'var(--black)', padding: '10px 16px 20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '.01em' }}>
          NOTRE<br/><span style={{ color: 'var(--red)' }}>CATALOGUE</span>
        </div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
          {loading ? '…' : `${products.length} modèle${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ── Grille produits ── */}
      <div style={{ padding: '0 12px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👟</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Catalogue en préparation</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Revenez bientôt !</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {products.map(p => <ProductCard key={p.id} product={p} onClick={() => openProduct(p)} />)}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ marginTop: 40, padding: '0 16px', textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <img src="/logo.jpg" alt="Mi Chic" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '.02em' }}>Mi Chic</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>034 89 244 00</div>
        </div>
      </footer>

      {/* ── Modal produit ── */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ width: '100%', maxWidth: 540, margin: '0 auto', background: 'var(--surface)', borderRadius: '24px 24px 0 0', maxHeight: '92dvh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 4 }} />
            </div>

            {/* Image principale */}
            {selected.images.length > 0 && (
              <div style={{ padding: '12px 16px 0' }}>
                <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#f0f0f0', aspectRatio: '1/1' }}>
                  <img src={selected.images[imgIndex]} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  {/* Flèches navigation */}
                  {selected.images.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex(i => (i - 1 + selected.images.length) % selected.images.length)}
                        style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>‹</button>
                      <button onClick={() => setImgIndex(i => (i + 1) % selected.images.length)}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>›</button>
                      {/* Dots */}
                      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                        {selected.images.map((_, i) => (
                          <button key={i} onClick={() => setImgIndex(i)} style={{ width: 7, height: 7, borderRadius: '50%', border: 'none', background: i === imgIndex ? '#fff' : 'rgba(255,255,255,.45)', cursor: 'pointer', padding: 0 }} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badge nb photos */}
                  {selected.images.length > 1 && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                      {imgIndex + 1}/{selected.images.length}
                    </div>
                  )}
                </div>

                {/* Miniatures */}
                {selected.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
                    {selected.images.map((img, i) => (
                      <img key={i} src={img} onClick={() => setImgIndex(i)} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === imgIndex ? '2.5px solid var(--red)' : '2.5px solid transparent', flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Infos produit */}
            <div style={{ padding: '16px 16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '.01em', lineHeight: 1.1, flex: 1 }}>{selected.name}</h2>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--red)', flexShrink: 0, marginLeft: 12 }}>
                  {selected.price.toLocaleString('fr-FR')} Ar
                </div>
              </div>

              {selected.colors.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: '.04em' }}>Couleurs disponibles</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.colors.map(c => (
                      <span key={c} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--bg)', fontSize: 13, fontWeight: 500, border: '1px solid var(--border)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.sizes.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 7, letterSpacing: '.04em' }}>Pointures disponibles</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.sizes.map(s => (
                      <span key={s} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--black)', color: '#fff', fontSize: 14, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={selected.images[imgIndex]}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: 14 }}
                >
                  ⬇ Télécharger
                </a>
                <a
                  href="tel:0348924400"
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: 14 }}
                >
                  📞 Commander
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'transform .15s', WebkitTapHighlightColor: 'transparent' }}
    >
      <div style={{ aspectRatio: '1/1', background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
        {p.images[0]
          ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👟</div>
        }
        {p.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 12 }}>
            +{p.images.length - 1}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 11px 13px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, lineHeight: 1.2, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--red)', fontSize: 16 }}>
          {p.price.toLocaleString('fr-FR')} Ar
        </div>
        {p.sizes.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {p.sizes.slice(0, 4).join(' · ')}{p.sizes.length > 4 ? ' …' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin .8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
