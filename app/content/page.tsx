'use client'
import { useEffect, useState } from 'react'
import { supabase, type ContentItem } from '@/lib/supabase'
import { useWorkspace } from '@/components/Layout'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter', 'Facebook']
const TYPES = ['Post', 'Reel', 'Story', 'Video', 'Carousel', 'Newsletter', 'Blog']
const STATUSES = ['Idee', 'In Arbeit', 'Bereit', 'Veröffentlicht']
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Idee': { bg: '#f5f5f5', color: '#888' },
  'In Arbeit': { bg: '#fef9f0', color: '#f59e0b' },
  'Bereit': { bg: '#f0f9ff', color: '#3b82f6' },
  'Veröffentlicht': { bg: '#f0fdf4', color: '#22c55e' },
}

export default function ContentPage() {
  const ws = useWorkspace()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [filterPlatform, setFilterPlatform] = useState('Alle')
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [form, setForm] = useState({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '', notizen: '' })

  useEffect(() => { if (ws) load() }, [ws])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('content_calendar').select('*').eq('workspace_id', ws!.id).order('geplant_fuer', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '', notizen: '' })
    setShowModal(true)
  }

  function openEdit(item: ContentItem) {
    setEditing(item)
    setForm({ titel: item.titel, inhalt: item.inhalt || '', plattform: item.plattform, content_typ: item.content_typ, geplant_fuer: item.geplant_fuer || '', status: item.status, hashtags: item.hashtags || '', notizen: item.notizen || '' })
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, workspace_id: ws!.id, geplant_fuer: form.geplant_fuer || null }
    if (editing) await supabase.from('content_calendar').update(payload).eq('id', editing.id)
    else await supabase.from('content_calendar').insert(payload)
    setShowModal(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('content_calendar').update({ status }).eq('id', id)
    load()
  }

  async function deleteItem(id: string) {
    if (!confirm('Content löschen?')) return
    await supabase.from('content_calendar').delete().eq('id', id)
    load()
  }

  const filtered = items.filter(i => {
    const p = filterPlatform === 'Alle' || i.plattform === filterPlatform
    const s = filterStatus === 'Alle' || i.status === filterStatus
    return p && s
  })

  // Calendar view - group by week
  const weeks: Record<string, ContentItem[]> = {}
  filtered.filter(i => i.geplant_fuer).forEach(item => {
    const d = new Date(item.geplant_fuer!)
    const monday = new Date(d)
    monday.setDate(d.getDate() - d.getDay() + 1)
    const key = monday.toISOString().substring(0, 10)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(item)
  })

  const PLATFORM_ICONS: Record<string, string> = { Instagram: '📸', TikTok: '🎵', YouTube: '▶', LinkedIn: '💼', Twitter: '𝕏', Facebook: '👥' }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Content Kalender</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{ws?.name} · {items.length} Posts geplant</p>
        </div>
        <button onClick={openNew} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Content</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: '#f5f5f5', padding: 4, borderRadius: 8 }}>
          {(['list', 'calendar'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: view === v ? '#fff' : 'transparent', color: view === v ? '#111' : '#888' }}>
              {v === 'list' ? 'Liste' : 'Kalender'}
            </button>
          ))}
        </div>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }}>
          <option value="Alle">Alle Plattformen</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }}>
          <option value="Alle">Alle Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Laden...</div> :
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Noch kein Content geplant</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Plane den Content für {ws?.name}.</div>
          </div>
        ) : view === 'list' ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            {filtered.map(item => (
              <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 20 }}>{PLATFORM_ICONS[item.plattform] || '○'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{item.titel}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {item.plattform} · {item.content_typ}
                    {item.geplant_fuer && ` · ${new Date(item.geplant_fuer).toLocaleDateString('de-DE')}`}
                  </div>
                </div>
                <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)} style={{
                  border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: STATUS_COLORS[item.status]?.bg || '#f5f5f5',
                  color: STATUS_COLORS[item.status]?.color || '#888',
                  outline: 'none',
                }}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(item)} style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Bearbeiten</button>
                  <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(weeks).sort().map(([weekStart, weekItems]) => (
              <div key={weekStart} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', fontSize: 12, fontWeight: 700, color: '#111' }}>
                  Woche vom {new Date(weekStart).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                </div>
                {weekItems.map(item => (
                  <div key={item.id} style={{ padding: '10px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, fontSize: 11, color: '#aaa', flexShrink: 0 }}>
                      {new Date(item.geplant_fuer!).toLocaleDateString('de-DE', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 16 }}>{PLATFORM_ICONS[item.plattform]}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111' }}>{item.titel}</div>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 600, background: STATUS_COLORS[item.status]?.bg, color: STATUS_COLORS[item.status]?.color }}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 520, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Content bearbeiten' : 'Neuer Content'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Titel *</label>
                <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Plattform</label>
                  <select value={form.plattform} onChange={e => setForm(p => ({ ...p, plattform: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Typ</label>
                  <select value={form.content_typ} onChange={e => setForm(p => ({ ...p, content_typ: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Datum</label>
                  <input type="date" value={form.geplant_fuer} onChange={e => setForm(p => ({ ...p, geplant_fuer: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Inhalt / Caption</label>
                <textarea value={form.inhalt} onChange={e => setForm(p => ({ ...p, inhalt: e.target.value }))} rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Hashtags</label>
                <input value={form.hashtags} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#hashtag1 #hashtag2" style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={save} disabled={!form.titel} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: !form.titel ? 0.5 : 1 }}>
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
