'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { usePushSubscription } from '@/hooks/usePushSubscription'

type Ticket = {
  id: string; clientName: string; fbLink: string;
  urgency: 'NORMAL' | 'URGENT'; note?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'; createdAt: string;
  createdBy: { name: string }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DONE'>('ALL')
  const { subscribed, subscribe } = usePushSubscription()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.replace('/login'); return }
    if ((session.user as any).role !== 'ADMIN') { router.replace('/employee'); return }
    fetchTickets()
  }, [session, status])

  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onmessage = e => { if (e.data !== 'ping') fetchTickets() }
    return () => es.close()
  }, [])

  const fetchTickets = useCallback(async () => {
    const res = await fetch('/api/tickets')
    if (res.ok) setTickets(await res.json())
  }, [])

  async function updateStatus(id: string, s: string) {
    await fetch(`/api/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) })
    fetchTickets()
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)
  const pending  = tickets.filter(t => t.status === 'PENDING').length
  const urgent   = tickets.filter(t => t.urgency === 'URGENT' && t.status !== 'DONE').length

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--black)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ height: 3, background: 'var(--red)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
          <img src="/logo.jpg" alt="Mi Chic" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--red)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>
              Mi <span style={{ color: 'var(--red)' }}>Chic</span>
            </div>
            <div style={{ fontSize: 11, color: '#777' }}>Admin</div>
          </div>
          <a href="/admin/products" className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }}>🛍️ Produits</a>
          <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => signOut({ callbackUrl: '/login' })}>Déco</button>
        </div>
      </header>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Alerte push */}
        {!subscribed && (
          <div style={{ background: 'var(--black)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Activez les notifications</div>
              <div style={{ color: '#888', fontSize: 12 }}>Pour recevoir les alertes même appli fermée</div>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }} onClick={subscribe}>Activer</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard value={tickets.length} label="Total" accent="#fff" bg="var(--black)" />
          <StatCard value={pending} label="En attente" accent="var(--red)" bg="var(--red-light)" />
          <StatCard value={urgent} label="Urgents" accent="var(--red)" bg="var(--red-light)" />
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'DONE'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn" style={{
              flexShrink: 0, padding: '8px 14px', fontSize: 13,
              background: filter === f ? 'var(--red)' : '#ebebeb',
              color: filter === f ? '#fff' : 'var(--text)',
            }}>
              {f === 'ALL' ? 'Tous' : f === 'PENDING' ? 'En attente' : f === 'IN_PROGRESS' ? 'En cours' : 'Traités'}
            </button>
          ))}
        </div>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '50px 0', fontSize: 14 }}>Aucun ticket</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(t => <AdminTicketCard key={t.id} ticket={t} onUpdate={updateStatus} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ value, label, accent, bg }: { value: number; label: string; accent: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 'var(--radius)', padding: '14px 10px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: accent === '#fff' ? '#888' : accent, fontWeight: 600, marginTop: 4, opacity: .9 }}>{label}</div>
    </div>
  )
}

function AdminTicketCard({ ticket: t, onUpdate }: { ticket: Ticket; onUpdate: (id: string, s: string) => void }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${t.urgency === 'URGENT' ? 'var(--red)' : 'var(--normal)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>{t.clientName}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {t.createdBy.name} · {new Date(t.createdAt).toLocaleString('fr-FR')}
          </div>
        </div>
        <span className={`badge badge-${t.urgency.toLowerCase()}`}>{t.urgency === 'URGENT' ? '🔴 Urgent' : '🟢 Normal'}</span>
      </div>

      {t.note && (
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 10, fontSize: 14, color: 'var(--muted)', borderLeft: '2px solid var(--border)' }}>
          {t.note}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href={t.fbLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, fontSize: 13, padding: '9px 12px' }}>
          💬 Ouvrir Facebook
        </a>
        <select value={t.status} onChange={e => onUpdate(t.id, e.target.value)} style={{ flex: 1, padding: '9px 12px', fontSize: 13, minWidth: 0 }}>
          <option value="PENDING">⏳ En attente</option>
          <option value="IN_PROGRESS">🔵 En cours</option>
          <option value="DONE">✅ Traité</option>
        </select>
      </div>
    </div>
  )
}
