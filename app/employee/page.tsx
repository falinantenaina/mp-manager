'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Ticket = {
  id: string; clientName: string; fbLink: string;
  urgency: 'NORMAL' | 'URGENT'; note?: string;
  status: string; createdAt: string;
}

export default function EmployeePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [form, setForm] = useState({ clientName: '', fbLink: '', urgency: 'NORMAL', note: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.replace('/login'); return }
    if ((session.user as any).role !== 'EMPLOYEE') { router.replace('/admin'); return }
    fetchTickets()
  }, [session, status])

  async function fetchTickets() {
    const res = await fetch('/api/tickets')
    if (res.ok) setTickets(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setForm({ clientName: '', fbLink: '', urgency: 'NORMAL', note: '' })
      fetchTickets()
      setTimeout(() => setSuccess(false), 4000)
    }
  }

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
            <div style={{ fontSize: 11, color: '#777' }}>{session?.user?.name}</div>
          </div>
          <a href="/catalog" className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }}>
  🛍️ Catalogue
</a>
          <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => signOut({ callbackUrl: '/login' })}>
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>
        {/* Formulaire */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: 'var(--red)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📩</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '.02em' }}>Signaler un message</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Notifie Nantenaina immédiatement</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Nom du client Facebook *</label>
              <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Ex: Jean Rakoto" required />
            </div>
            <div className="form-group">
              <label>Lien / info du message *</label>
              <input value={form.fbLink} onChange={e => setForm({ ...form, fbLink: e.target.value })} placeholder="Lien profil ou description du problème" required />
            </div>

            <div className="form-group">
              <label>Urgence</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['NORMAL', 'URGENT'] as const).map(u => (
                  <button
                    key={u} type="button"
                    onClick={() => setForm({ ...form, urgency: u })}
                    style={{
                      padding: '10px', borderRadius: 'var(--radius-sm)', border: '2px solid',
                      borderColor: form.urgency === u ? (u === 'URGENT' ? 'var(--red)' : 'var(--normal)') : 'var(--border)',
                      background: form.urgency === u ? (u === 'URGENT' ? 'var(--red-light)' : '#f0faf5') : 'transparent',
                      color: form.urgency === u ? (u === 'URGENT' ? 'var(--red)' : 'var(--normal)') : 'var(--muted)',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    {u === 'URGENT' ? '🔴 Urgent' : '🟢 Normal'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Note (facultatif)</label>
              <textarea rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Contexte, question du client…" style={{ resize: 'vertical' }} />
            </div>

            {success && (
              <div style={{ background: '#f0faf5', color: 'var(--normal)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✅ Notification envoyée à Nantenaina !
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '14px', fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '.04em' }}>
              {loading ? 'Envoi…' : '🚀 Envoyer'}
            </button>
          </form>
        </div>

        {/* Historique */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, letterSpacing: '.02em' }}>
          Mes signalements
        </div>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 0', fontSize: 14 }}>Aucun signalement pour l'instant</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(t => <TicketRow key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function TicketRow({ ticket: t }: { ticket: Ticket }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${t.urgency === 'URGENT' ? 'var(--red)' : 'var(--normal)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{t.clientName}</div>
        <div style={{ display: 'flex', gap: 5 }}>
          <span className={`badge badge-${t.urgency.toLowerCase()}`}>{t.urgency === 'URGENT' ? '🔴' : '🟢'} {t.urgency}</span>
        </div>
      </div>
      {t.note && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{t.note}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(t.createdAt).toLocaleString('fr-FR')}</span>
        <span className={`badge badge-${t.status.toLowerCase()}`}>
          {t.status === 'PENDING' ? '⏳ En attente' : t.status === 'IN_PROGRESS' ? '🔵 En cours' : '✅ Traité'}
        </span>
      </div>
    </div>
  )
}
