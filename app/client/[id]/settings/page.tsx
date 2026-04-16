'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4']
const MODELLE = ['1 zu 1','Gruppe','Community','Online Kurs','Membership','Done For You','Sonstiges']

export default function SettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', nische: '', retainer: '', status: 'Aktiv', start_date: '', modell: '1 zu 1', color: '#6366f1', client_email: '', calendly_url: '', website: '', notizen: '', allow_manual_leads: true, portal_email: '' })
  const [isPersonal, setIsPersonal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('workspaces').select('*').eq('id', params.id).single().then(({ data }) => {
      if (data) {
        setIsPersonal(!!data.is_personal)
        setForm({ name: data.name || '', nische: data.nische || '', retainer: String(data.retainer || ''), status: data.status || 'Aktiv', start_date: data.start_date || '', modell: data.modell || '1 zu 1', color: data.color || '#6366f1', client_email: data.client_email || '', calendly_url: data.calendly_url || '', website: data.website || '', notizen: data.notizen || '', allow_manual_leads: data.allow_manual_leads !== false, portal_email: data.portal_email || '' })
      }
    })
  }, [params.id])

  async function save() {
    setSaving(true)
    await supabase.from('workspaces').update({ ...form, retainer: Number(form.retainer) || 0 }).eq('id', params.id)
    if (form.portal_email) {
      await supabase.from('workspace_members').upsert({ workspace_id: params.id, email: form.portal_email, role: 'client' }, { onConflict: 'workspace_id,email' })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteClient() {
    if (!confirm(`"${form.name}" wirklich löschen?`)) return
    await supabase.from('workspaces').delete().eq('id', params.id)
    router.push('/')
  }

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/leads?workspace_id=${params.id}`

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )

  const inp = (props: any) => (
    <input {...props} style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as any, ...props.style }} />
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 660 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>
          {isPersonal ? 'Mein Workspace — Einstellungen' : 'Einstellungen'}
        </h1>
        <p style={{ fontSize: 12, color: '#aaa', margin: '3px 0 0' }}>
          {isPersonal ? 'Dein persönlicher Outreach-Bereich' : 'Client-Details und Integrationen'}
        </p>
      </div>

      {/* Grundinfos */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 18 }}>Allgemein</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isPersonal ? '1fr' : '1fr 1fr', gap: 14 }}>
          {field('Name', inp({ value: form.name, onChange: (e: any) => setForm(p => ({ ...p, name: e.target.value })), placeholder: isPersonal ? 'Mein Workspace' : 'Client Name' }))}
          {!isPersonal && field('Nische', inp({ value: form.nische, onChange: (e: any) => setForm(p => ({ ...p, nische: e.target.value })), placeholder: 'z.B. Business Coaching' }))}
          {!isPersonal && field('MRR (€)', inp({ type: 'number', value: form.retainer, onChange: (e: any) => setForm(p => ({ ...p, retainer: e.target.value })), placeholder: '1500' }))}
          {!isPersonal && field('Business Modell',
            <select value={form.modell} onChange={e => setForm(p => ({ ...p, modell: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              {MODELLE.map(m => <option key={m}>{m}</option>)}
            </select>
          )}
          {!isPersonal && field('Start Datum', inp({ type: 'date', value: form.start_date, onChange: (e: any) => setForm(p => ({ ...p, start_date: e.target.value })) }))}
          {!isPersonal && field('Status',
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              {['Aktiv','Pausiert','Gekündigt'].map(s => <option key={s}>{s}</option>)}
            </select>
          )}
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Farbe</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: 99, background: c, border: form.color === c ? '3px solid #111' : '3px solid transparent', cursor: 'pointer' }} />)}
          </div>
        </div>
      </div>

      {/* Calendly & Integrationen */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 18 }}>Calendly & Integrationen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Calendly URL', inp({ value: form.calendly_url, onChange: (e: any) => setForm(p => ({ ...p, calendly_url: e.target.value })), placeholder: 'https://calendly.com/...' }))}
          {!isPersonal && field('Website', inp({ value: form.website, onChange: (e: any) => setForm(p => ({ ...p, website: e.target.value })), placeholder: 'https://...' }))}
          {!isPersonal && field('Client Email (für Portal-Zugang)', inp({ type: 'email', value: form.client_email, onChange: (e: any) => setForm(p => ({ ...p, client_email: e.target.value })), placeholder: 'client@example.com' }))}
        </div>
      </div>

      {/* Webhook */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>Webhook URL</h2>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
          {isPersonal ? 'Trag diese URL in Onepage.io oder ManyChat ein um Leads automatisch zu speichern.' : 'Für Onepage.io, ManyChat oder andere Tools.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={webhookUrl} style={{ flex: 1, padding: '9px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 11, color: '#666', background: '#fafafa', outline: 'none' }} />
          <button onClick={() => navigator.clipboard.writeText(webhookUrl)} style={{ padding: '9px 14px', border: '1px solid #ebebeb', borderRadius: 8, background: '#fff', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Kopieren</button>
        </div>
      </div>

      {/* Lead-Einstellungen */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Manuell Leads eintragen</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Leads direkt im Dashboard erstellen</div>
          </div>
          <button onClick={() => setForm(p => ({ ...p, allow_manual_leads: !p.allow_manual_leads }))} style={{ width: 42, height: 24, borderRadius: 99, background: form.allow_manual_leads ? '#22c55e' : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: 99, background: '#fff', position: 'absolute', top: 3, left: form.allow_manual_leads ? 20 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </div>

      {/* Notizen (nur für persönlichen Workspace versteckt) */}
      {!isPersonal && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', padding: '20px 24px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12 }}>Interne Notizen</h2>
          <textarea value={form.notizen} onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))} rows={4} placeholder="Notizen zu diesem Client..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 9, background: '#111', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
          {saving ? 'Speichern...' : saved ? 'Gespeichert ✓' : 'Speichern'}
        </button>
        {!isPersonal && (
          <button onClick={deleteClient} style={{ padding: '12px 18px', border: '1px solid #fecaca', borderRadius: 9, background: '#fff', color: '#dc2626', fontSize: 13, cursor: 'pointer' }}>
            Löschen
          </button>
        )}
      </div>
    </div>
  )
}
