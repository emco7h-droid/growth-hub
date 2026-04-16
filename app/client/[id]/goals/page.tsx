'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']
const KATS = ['Umsatz','Leads','Follower','Email Liste','Conversion','Calls','Sonstiges']

export default function GoalsPage({ params }: { params: { id: string } }) {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ titel: '', beschreibung: '', ziel_wert: '', aktuell_wert: '', einheit: '%', kategorie: 'Umsatz', faellig: '', farbe: '#6366f1' })

  useEffect(() => { load() }, [params.id])

  async function load() {
    const [gr, cr] = await Promise.all([
      supabase.from('client_goals').select('*').eq('workspace_id', params.id).order('created_at'),
      supabase.from('workspaces').select('*').eq('id', params.id).single(),
    ])
    setGoals(gr.data || [])
    setClient(cr.data)
    setLoading(false)
  }


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
    const payload = { ...form, workspace_id: params.id, ziel_wert: Number(form.ziel_wert) || 100, aktuell_wert: Number(form.aktuell_wert) || 0, faellig: form.faellig || null }
    if (editing) await supabase.from('client_goals').update(payload).eq('id', editing.id)
    else await supabase.from('client_goals').insert(payload)
    setShowModal(false)
    load()
  }

  async function updateProgress(id: string, val: string) {
    await supabase.from('client_goals').update({ aktuell_wert: Number(val) }).eq('id', id)
    load()
  }

  async function del(id: string) {
    if (!confirm('Ziel löschen?')) return
    await supabase.from('client_goals').delete().eq('id', id)
    load()
  }

  const color = client?.color || '#6366f1'

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Ziele & Fortschritt</h1>
          <p style={{ fontSize: 12.5, color: '#aaa', margin: '3px 0 0' }}>{goals.length} Projektziele insgesamt</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ titel: '', beschreibung: '', ziel_wert: '100', aktuell_wert: '0', einheit: '%', kategorie: 'Umsatz', faellig: '', farbe: color }); setShowModal(true) }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Ziel hinzufügen
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 72, background: '#fff', borderRadius: 14, border: '1.5px dashed #ddd' }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>◎</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Noch keine Projektziele</div>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 22, maxWidth: 320, margin: '0 auto 22px' }}>Definiere messbare Ziele für diesen Client und tracke den Fortschritt.</p>
          <button onClick={() => { setEditing(null); setForm({ titel: '', beschreibung: '', ziel_wert: '100', aktuell_wert: '0', einheit: '%', kategorie: 'Umsatz', faellig: '', farbe: color }); setShowModal(true) }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Erstes Ziel erstellen</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {goals.map(g => {
            const pct = g.ziel_wert > 0 ? Math.min(100, Math.round((g.aktuell_wert / g.ziel_wert) * 100)) : 0
            const done = pct >= 100
            return (
              <div key={g.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 99, background: g.farbe || color }} />
                      <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{g.kategorie}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.2px' }}>{g.titel}</div>
                    {g.beschreibung && <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{g.beschreibung}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditing(g); setForm({ titel: g.titel, beschreibung: g.beschreibung || '', ziel_wert: String(g.ziel_wert), aktuell_wert: String(g.aktuell_wert), einheit: g.einheit, kategorie: g.kategorie, faellig: g.faellig || '', farbe: g.farbe }); setShowModal(true) }} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => del(g.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '3px 7px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: done ? '#22c55e' : '#1a1a1a', letterSpacing: '-0.5px' }}>{pct}%</span>
                    <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'flex-end' }}>{Number(g.aktuell_wert).toLocaleString('de')} / {Number(g.ziel_wert).toLocaleString('de')} {g.einheit}</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f0ee', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: done ? '#22c55e' : (g.farbe || color), borderRadius: 99, width: `${pct}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Quick update */}
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <input type="number" defaultValue={g.aktuell_wert} onBlur={e => { if (e.target.value !== String(g.aktuell_wert)) updateProgress(g.id, e.target.value) }} style={{ flex: 1, padding: '6px 10px', border: '1px solid #eaeaea', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' }} />
                  <span style={{ fontSize: 12, color: '#bbb', flexShrink: 0 }}>/ {Number(g.ziel_wert).toLocaleString('de')} {g.einheit}</span>
                  {g.faellig && <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>bis {new Date(g.faellig).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 460, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Ziel bearbeiten' : 'Neues Ziel'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Titel *</label>
                <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} placeholder="z.B. 50 neue Leads im März" style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Zielwert</label>
                  <input type="number" value={form.ziel_wert} onChange={e => setForm(p => ({ ...p, ziel_wert: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Aktueller Wert</label>
                  <input type="number" value={form.aktuell_wert} onChange={e => setForm(p => ({ ...p, aktuell_wert: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Einheit</label>
                  <input value={form.einheit} onChange={e => setForm(p => ({ ...p, einheit: e.target.value }))} placeholder="%, €, Leads..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Kategorie</label>
                  <select value={form.kategorie} onChange={e => setForm(p => ({ ...p, kategorie: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}>
                    {KATS.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Deadline</label>
                  <input type="date" value={form.faellig} onChange={e => setForm(p => ({ ...p, faellig: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Farbe</label>
                <div style={{ display: 'flex', gap: 7 }}>
                  {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, farbe: c }))} style={{ width: 24, height: 24, borderRadius: 99, background: c, border: form.farbe === c ? '3px solid #1a1a1a' : '3px solid transparent', cursor: 'pointer' }} />)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #eaeaea', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={save} disabled={!form.titel} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#1a1a1a', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: form.titel ? 1 : 0.4 }}>
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
