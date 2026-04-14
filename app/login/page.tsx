'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.error === 'no_access' ? 'Kein Zugang zu diesem System.' : '')

  async function login() {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Email oder Passwort falsch.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: '#1a1a1a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 auto 12px' }}>GH</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Growth Hub</h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Melde dich an um fortzufahren</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eaeaea', padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.com"
                onKeyDown={e => e.key === 'Enter' && login()}
                className="gh-input"
                style={{ fontSize: 14 }}
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && login()}
                className="gh-input"
                style={{ fontSize: 14 }}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button
              onClick={login}
              disabled={!email || !password || loading}
              className="btn-primary"
              style={{ padding: '11px', fontSize: 14, marginTop: 4, width: '100%' }}
            >
              {loading ? 'Anmelden...' : 'Anmelden →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 20 }}>
          Growth Hub · Nur für autorisierte Nutzer
        </p>
      </div>
    </div>
  )
}
