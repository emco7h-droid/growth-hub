'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PLATFORMS = ['Instagram','TikTok','YouTube','LinkedIn','Twitter','Facebook','Newsletter']
const TYPES = ['Post','Reel','Story','Video','Carousel','Blog']
const STATUSES = ['Idee','In Arbeit','Bereit','Veröffentlicht']
const SC: any = { 'Idee': { bg: '#f5f5f5', color: '#999' }, 'In Arbeit': { bg: '#fef9f0', color: '#f59e0b' }, 'Bereit': { bg: '#f0f9ff', color: '#0ea5e9' }, 'Veröffentlicht': { bg: '#f0fdf4', color: '#16a34a' } }
const PI: any = { Instagram: '📸', TikTok: '🎵', YouTube: '▶', LinkedIn: '💼', Twitter: '𝕏', Facebook: '👥', Newsletter: '✉' }

export default function ContentPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [filterPlatform, setFilterPlatform] = useState('Alle')
  const [form, setForm] = useState({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '' })

  useEffect(() => { load() }, [params.id])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('content_calendar').select('*').eq('workspace_id', params.id).order('geplant_fuer', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '' })
    setShowModal(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    setForm({ titel: item.titel, inhalt: item.inhalt || '', plattform: item.plattform, content_typ: item.content_typ, geplant_fuer: item.geplant_fuer || '', status: item.status, hashtags: item.hashtags || '' })
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, workspace_id: params.id, geplant_fuer: form.geplant_fuer || null }
    if (editing) await supabase.from('content_calendar').update(payload).eq('id', editing.id)
    else await supabase.from('content_calendar').insert(payload)
    setShowModal(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('content_calendar').update({ status }).eq('id', id)
    load()
  }

  async function del(id: string) {
    if (!confirm('Content löschen?')) return
    await supabase.from('content_calendar').delete().eq('id', id)
    load()
  }

  const filtered = items.filter(i => {
    const p = filterPlatform === 'Alle' || i.plattform === filterPlatform
    const s = filterStatus === 'Alle' || i.status === filterStatus
    return p && s
  })

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Content Kalender</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{items.length} Posts geplant</p>
        </div>
        <button onClick={openNew} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Content</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }}>
          <option value="Alle">Alle Plattformen</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Alle', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 13px', borderRadius: 7, border: filterStatus === s ? '1px solid #111' : '1px solid #ebebeb', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: filterStatus === s ? '#111' : '#fff', color: filterStatus === s ? '#fff' : '#666' }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#bbb' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Noch kein Content geplant</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Plane den Content-Kalender für diesen Client.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', overflow: 'hidden' }}>
          {filtered.map(item => (
            <div key={item.id} style={{ padding: '13px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ fontSize: 18 }}>{PI[item.plattform] || '○'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{item.titel}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                  {item.plattform} · {item.content_typ}
                  {item.geplant_fuer ? ` · ${new Date(item.geplant_fuer).toLocaleDateString('de-DE')}` : ''}
                </div>
              </div>
              <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)} style={{ border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none', background: SC[item.status]?.bg || '#f5f5f5', color: SC[item.status]?.color || '#888' }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => openEdit(item)} style={{ background: 'none', border: '1px solid #ebebeb', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => del(item.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 500, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Bearbeiten' : 'Neuer Content'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Titel *</label>
                <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'Plattform', key: 'plattform', opts: PLATFORMS }, { label: 'Typ', key: 'content_typ', opts: TYPES }, { label: 'Status', key: 'status', opts: STATUSES }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Datum</label>
                  <input type="date" value={form.geplant_fuer} onChange={e => setForm(p => ({ ...p, geplant_fuer: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Inhalt / Caption</label>
                <textarea value={form.inhalt} onChange={e => setForm(p => ({ ...p, inhalt: e.target.value }))} rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Hashtags</label>
                <input value={form.hashtags} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#hashtag1 #hashtag2" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px', border: '1px solid #ebebeb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={save} disabled={!form.titel} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: form.titel ? 1 : 0.4 }}>
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
