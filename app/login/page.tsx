'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Email ou mot de passe incorrect'); return }
    router.replace('/')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--black)',
    }}>
      {/* Top red strip */}
      <div style={{ height: 4, background: 'var(--red)', flexShrink: 0 }} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <img
            src="/logo.jpg"
            alt="Mi Chic"
            style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--red)', display: 'block', margin: '0 auto 16px' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#888', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Espace équipe
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 8px 40px rgba(0,0,0,.4)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 20, letterSpacing: '.02em' }}>
            Connexion
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4, padding: '14px', fontSize: 15, fontFamily: 'var(--font-display)', letterSpacing: '.04em', fontSize: 16 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ color: '#555', fontSize: 12, marginTop: 24 }}>Mi Chic · 034 89 244 00</p>
      </div>
    </div>
  )
}
