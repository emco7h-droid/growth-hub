'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email oder Passwort falsch.')
      setLoading(false)
      return
    }

    // Check if admin or client
    const { data: portalUser } = await supabase
      .from('client_portal_users')
      .select('client_id')
      .eq('auth_user_id', data.user.id)
      .single()

    if (portalUser) {
      router.push(`/portal/${portalUser.client_id}`)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Growth Operator Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Melde dich an um fortzufahren</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="deine@email.de"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Growth Operator Hub — Fuer authorisierte Nutzer
        </p>
      </div>
    </div>
  )
}
