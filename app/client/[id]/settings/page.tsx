'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4']
const MODELLE = ['1 zu 1','Gruppe','Community','Online Kurs','Membership','Done For You','Sonstiges']

export default function SettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', nische: '', retainer: '', status: 'Aktiv', start_date: '', modell: '1 zu 1', color: '#6366f1', client_email: '', calendly_url: '', website: '', notizen: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('workspaces').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) setForm({ name: data.name || '', nische: data.nische || '', retainer: String(data.retainer || ''), status: data.status || 'Aktiv', start_date: data.start_date || '', modell: data.modell || '1 zu 1', color: data.color || '#6366f1', client_email: data.client_email || '', calendly_url: data.calendly_url || '', website: data.website || '', notizen: data.notizen || '' })
    })
  }, [params.id])

  async function save() {
    setSaving(true)
    await supabase.from('workspaces').update({ ...form, retainer: Number(form.retainer) || 0 }).eq('id', params.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteClient() {
    if (!confirm(`Client "${form.name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return
    await supabase.from('workspaces').delete().eq('id', params.id)
    router.push('/')
  }

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/leads?workspace_id=${params.id}`

  return (
    <div style={{ padding: '28px 32px', maxWidth: 660 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Einstellungen</h1>
        <p style={{ fontSize: 12, color: '#aaa', margin: '3px 0 0' }}>Client-Details und Integrationen</p>
      </div>

      {/* Basic Info */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 18 }}>Allgemein</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Name *', key: 'name', type: 'text' },
            { label: 'Nische', key: 'nische', type: 'text' },
            { label: 'MRR (€)', key: 'retainer', type: 'number' },
            { label: 'Start Datum', key: 'start_date', type: 'date' },
            { label: 'Client Email', key: 'client_email', type: 'email' },
            { label: 'Website', key: 'website', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              <option>Aktiv</option><option>Pausiert</option><option>Beendet</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Business Modell</label>
            <select value={form.modell} onChange={e => setForm(p => ({ ...p, modell: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              {MODELLE.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 8 }}>Farbe</label>
          <div style={{ display: 'flex', gap: 7 }}>
            {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 99, background: c, border: form.color === c ? '3px solid #111' : '3px solid transparent', cursor: 'pointer' }} />)}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Notizen</label>
          <textarea value={form.notizen} onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Integrations */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 18 }}>Integrationen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Calendly URL des Clients</label>
            <input value={form.calendly_url} onChange={e => setForm(p => ({ ...p, calendly_url: e.target.value }))} placeholder="https://calendly.com/client-name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Trag hier den Calendly Link des Clients ein. Die Webhook URL für Make / OnePage.io:</p>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 500, marginBottom: 4 }}>Webhook URL für Make / OnePage.io / Typeform:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ fontSize: 11, color: '#0369a1', flex: 1, wordBreak: 'break-all' }}>{webhookUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(webhookUrl)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>Kopieren</button>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={deleteClient} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#ef4444', fontWeight: 500 }}>
          Client löschen
        </button>
        <button onClick={save} disabled={saving} style={{ background: saved ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {saved ? '✓ Gespeichert' : saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}
