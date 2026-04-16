'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientData } from '@/lib/clientContext'

const TRIGGERS = ['Lead gewonnen', 'Lead angemeldet', 'Kein Kauf', 'No-Show', 'Onboarding', 'Re-Engagement', 'Willkommen', 'Sonstiges']

export default function EmailsPage({ params }: { params: { id: string } }) {
  const { emails: sequences, client, loading, refresh } = useClientData()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', beschreibung: '', trigger_event: 'Lead gewonnen', emails_anzahl: '7', klaviyo_list_id: '', notizen: '', aktiv: false })


  if (loading) return (
    <div style={{ padding: '28px 32px' }}>
      <div className="skeleton-pulse" style={{ height: 24, width: 180, background: '#e5e7eb', borderRadius: 8, marginBottom: 24 }} />
      <div className="skeleton-pulse" style={{ height: 40, width: '100%', background: '#f3f4f6', borderRadius: 10, marginBottom: 10 }} />
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton-pulse" style={{ height: 52, width: '100%', background: '#f9fafb', borderRadius: 10, marginBottom: 8, border: '1px solid #f0f0f0', animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )

  async function save() {
    const payload = { ...form, workspace_id: params.id, emails_anzahl: Number(form.emails_anzahl) || 0 }
    if (editing) await supabase.from('email_sequences').update(payload).eq('id', editing.id)
    else await supabase.from('email_sequences').insert(payload)
    setShowModal(false)
    refresh('email_sequences')
  }

  async function toggleActive(seq: any) {
    await supabase.from('email_sequences').update({ aktiv: !seq.aktiv }).eq('id', seq.id)
    refresh('email_sequences')
  }

  async function del(id: string) {
    if (!confirm('Sequenz löschen?')) return
    await supabase.from('email_sequences').delete().eq('id', id)
    refresh('email_sequences')
  }

  const color = client?.color || '#6366f1'
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/leads?workspace_id=${params.id}` : ''

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Email Sequenzen</h1>
          <p style={{ fontSize: 12.5, color: '#aaa', margin: '3px 0 0' }}>Klaviyo Sequenzen planen und tracken</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', beschreibung: '', trigger_event: 'Lead gewonnen', emails_anzahl: '7', klaviyo_list_id: '', notizen: '', aktiv: false }); setShowModal(true) }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Sequenz
        </button>
      </div>

      {/* Klaviyo info */}
      <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '14px 18px', marginBottom: 22, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 18, flexShrink: 0 }}>✉</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>Klaviyo Integration</div>
          <div style={{ fontSize: 12.5, color: '#6d28d9' }}>
            Leads kommen automatisch über den Webhook in den Growth Hub und Klaviyo. Webhook URL:&nbsp;
            <code style={{ fontSize: 11, background: '#ede9fe', padding: '2px 6px', borderRadius: 4 }}>{webhookUrl}</code>
          </div>
          <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 6 }}>
            Trag die Klaviyo List ID unten ein damit Make automatisch die richtige Sequenz für diesen Client startet.
          </div>
        </div>
      </div>

      {sequences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, background: '#fff', borderRadius: 14, border: '1.5px dashed #ddd' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✉</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Noch keine Email Sequenzen</div>
          <p style={{ fontSize: 13, color: '#aaa', maxWidth: 320, margin: '0 auto 22px' }}>Plane Email-Sequenzen für diesen Client. Zum Beispiel eine 7-Tage Sequenz nach einem Lead.</p>
          <button onClick={() => { setEditing(null); setForm({ name: '', beschreibung: '', trigger_event: 'Lead gewonnen', emails_anzahl: '7', klaviyo_list_id: '', notizen: '', aktiv: false }); setShowModal(true) }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Erste Sequenz erstellen</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sequences.map(seq => (
            <div key={seq.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{seq.name}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: seq.aktiv ? '#f0fdf4' : '#f5f5f5', color: seq.aktiv ? '#16a34a' : '#aaa', fontWeight: 600 }}>
                    {seq.aktiv ? '● Aktiv' : '○ Inaktiv'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#aaa' }}>
                  <span>Trigger: <strong style={{ color: '#555' }}>{seq.trigger_event}</strong></span>
                  <span>{seq.emails_anzahl} Emails</span>
                  {seq.klaviyo_list_id && <span>Klaviyo ID: <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>{seq.klaviyo_list_id}</code></span>}
                </div>
                {seq.beschreibung && <div style={{ fontSize: 12, color: '#bbb', marginTop: 5 }}>{seq.beschreibung}</div>}
              </div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => toggleActive(seq)} style={{ padding: '6px 14px', border: `1px solid ${seq.aktiv ? '#fee2e2' : '#d1fae5'}`, borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: seq.aktiv ? '#ef4444' : '#16a34a' }}>
                  {seq.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button onClick={() => { setEditing(seq); setForm({ name: seq.name, beschreibung: seq.beschreibung || '', trigger_event: seq.trigger_event, emails_anzahl: String(seq.emails_anzahl), klaviyo_list_id: seq.klaviyo_list_id || '', notizen: seq.notizen || '', aktiv: seq.aktiv }); setShowModal(true) }} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Bearbeiten</button>
                <button onClick={() => del(seq.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 500, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Sequenz bearbeiten' : 'Neue Email Sequenz'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="z.B. 7-Tage Lead Sequenz" style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Trigger</label>
                  <select value={form.trigger_event} onChange={e => setForm(p => ({ ...p, trigger_event: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}>
                    {TRIGGERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Anzahl Emails</label>
                  <input type="number" value={form.emails_anzahl} onChange={e => setForm(p => ({ ...p, emails_anzahl: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Klaviyo List ID</label>
                <input value={form.klaviyo_list_id} onChange={e => setForm(p => ({ ...p, klaviyo_list_id: e.target.value }))} placeholder="z.B. TJYXbQ" style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Beschreibung</label>
                <textarea value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.aktiv} onChange={e => setForm(p => ({ ...p, aktiv: e.target.checked }))} />
                Sofort aktivieren
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #eaeaea', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={save} disabled={!form.name} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#1a1a1a', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: form.name ? 1 : 0.4 }}>
                  {editing ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
