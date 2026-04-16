'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']
const MODELLE = ['1 zu 1','Gruppe','Community','Online Kurs','Membership','Done For You','Sonstiges']

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', nische: '', retainer: '', modell: '1 zu 1', color: '#6366f1', client_email: '', calendly_url: '', start_date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    const { data, error } = await supabase.from('workspaces').insert({
      name: form.name,
      nische: form.nische || null,
      retainer: Number(form.retainer) || 0,
      modell: form.modell,
      color: form.color,
      client_email: form.client_email || null,
      calendly_url: form.calendly_url || null,
      start_date: form.start_date || null,
      status: 'Aktiv',
      slug,
    }).select().single()
    setSaving(false)
    if (data) router.push(`/client/${data.id}/leads`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#bbb', textDecoration: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Alle Clients
        </Link>
        <span style={{ color: '#ddd', fontSize: 12 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Neuer Client</span>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>Neuen Client anlegen</h1>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 28 }}>Erstelle einen neuen Workspace für deinen Client.</p>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebebeb', padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Name des Clients *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="z.B. Max Mustermann Coaching" autoFocus style={{ width: '100%', padding: '10px 14px', border: '1px solid #ebebeb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} onKeyDown={e => e.key === 'Enter' && save()} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Nische</label>
                  <input value={form.nische} onChange={e => setForm(p => ({ ...p, nische: e.target.value }))} placeholder="z.B. Business Coaching" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>MRR (€)</label>
                  <input type="number" value={form.retainer} onChange={e => setForm(p => ({ ...p, retainer: e.target.value }))} placeholder="1500" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Business Modell</label>
                  <select value={form.modell} onChange={e => setForm(p => ({ ...p, modell: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    {MODELLE.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Start Datum</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Client Email</label>
                  <input type="email" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} placeholder="client@example.com" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>Calendly URL</label>
                  <input value={form.calendly_url} onChange={e => setForm(p => ({ ...p, calendly_url: e.target.value }))} placeholder="calendly.com/client" style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>Farbe</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: 99, background: c, border: form.color === c ? '3px solid #111' : '3px solid transparent', cursor: 'pointer' }} />)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <Link href="/" style={{ flex: 1, padding: '11px', border: '1px solid #ebebeb', borderRadius: 9, background: '#fff', fontSize: 14, cursor: 'pointer', textAlign: 'center', color: '#666', fontWeight: 500 }}>Abbrechen</Link>
                <button onClick={save} disabled={!form.name.trim() || saving} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 9, background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600, opacity: form.name.trim() ? 1 : 0.4 }}>
                  {saving ? 'Erstellen...' : 'Client erstellen →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
