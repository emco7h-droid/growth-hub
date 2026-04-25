'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientData } from '@/lib/clientContext'

const PLATFORMS = ['Instagram','TikTok','YouTube','LinkedIn','Twitter','Facebook','Newsletter']
const TYPES = ['Post','Reel','Story','Video','Carousel','Blog','Email']
const STATUSES = ['Idee','In Arbeit','Bereit','Veröffentlicht']
const SC: any = { 'Idee': { bg: '#f5f5f5', color: '#999' }, 'In Arbeit': { bg: '#fef9f0', color: '#f59e0b' }, 'Bereit': { bg: '#f0f9ff', color: '#0ea5e9' }, 'Veröffentlicht': { bg: '#f0fdf4', color: '#16a34a' } }
const PI: any = { Instagram: '📸', TikTok: '🎵', YouTube: '▶', LinkedIn: '💼', Twitter: '𝕏', Facebook: '👥', Newsletter: '✉' }

export default function CalendarPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'content' | 'google'>('content')
  const { calendar: items, client, loading, refresh } = useClientData()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [filterPlatform, setFilterPlatform] = useState('Alle')
  const [showGoogleEdit, setShowGoogleEdit] = useState(false)
  const [googleUrl, setGoogleUrl] = useState(client?.google_calendar_url || '')
  const [form, setForm] = useState({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '' })


  if (loading) return (
    <div style={{ padding: '28px 32px' }}>
      <div className="skeleton-pulse" style={{ height: 24, width: 180, background: '#e5e7eb', borderRadius: 8, marginBottom: 24 }} />
      <div className="skeleton-pulse" style={{ height: 40, width: '100%', background: '#f3f4f6', borderRadius: 10, marginBottom: 10 }} />
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton-pulse" style={{ height: 52, width: '100%', background: '#f9fafb', borderRadius: 10, marginBottom: 8, border: '1px solid #f0f0f0', animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )

  async function saveGoogleUrl() {
    await supabase.from('workspaces').update({ google_calendar_url: googleUrl }).eq('id', params.id)
    setShowGoogleEdit(false)
    refresh('content_calendar')
  }

  function openNew() {
    setEditing(null)
    setForm({ titel: '', inhalt: '', plattform: 'Instagram', content_typ: 'Post', geplant_fuer: '', status: 'Idee', hashtags: '' })
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, workspace_id: params.id, geplant_fuer: form.geplant_fuer || null }
    if (editing) await supabase.from('content_calendar').update(payload).eq('id', editing.id)
    else await supabase.from('content_calendar').insert(payload)
    setShowModal(false)
    refresh('content_calendar')
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('content_calendar').update({ status }).eq('id', id)
    refresh('content_calendar')
  }

  async function del(id: string) {
    if (!confirm('Content löschen?')) return
    await supabase.from('content_calendar').delete().eq('id', id)
    refresh('content_calendar')
  }

  const filtered = items.filter(i => (filterPlatform === 'Alle' || i.plattform === filterPlatform) && (filterStatus === 'Alle' || i.status === filterStatus))
  const color = client?.color || '#6366f1'

  // Group by week for calendar view
  const byDate: any = {}
  filtered.filter(i => i.geplant_fuer).forEach(i => {
    const d = i.geplant_fuer.substring(0, 10)
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(i)
  })
  const noDate = filtered.filter(i => !i.geplant_fuer)

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Kalender</h1>
          <p style={{ fontSize: 12.5, color: '#aaa', margin: '3px 0 0' }}>{items.length} Content Posts geplant</p>
        </div>
        {tab === 'content' && <button onClick={openNew} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Content</button>}
        {tab === 'google' && <button onClick={() => setShowGoogleEdit(true)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Google Kalender einrichten</button>}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f0f0ee', padding: 4, borderRadius: 9, width: 'fit-content' }}>
        {([['content', '📅 Content Kalender'], ['google', '📆 Google Kalender']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '7px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === key ? '#fff' : 'transparent', color: tab === key ? '#1a1a1a' : '#888', boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content Calendar */}
      {tab === 'content' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ padding: '7px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 12.5, background: '#fff' }}>
              <option value="Alle">Alle Plattformen</option>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Alle', ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 13px', borderRadius: 7, border: filterStatus === s ? '1px solid #1a1a1a' : '1px solid #eaeaea', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: filterStatus === s ? '#1a1a1a' : '#fff', color: filterStatus === s ? '#fff' : '#666' }}>{s}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, background: '#fff', borderRadius: 14, border: '1px solid #eaeaea' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Noch kein Content geplant</div>
              <div style={{ fontSize: 13, color: '#aaa' }}>Füge deinen ersten Content-Post hinzu.</div>
            </div>
          ) : (
            <div>
              {noDate.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Kein Datum</div>
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden' }}>
                    {noDate.map(item => <ContentRow key={item.id} item={item} onStatusChange={updateStatus} onEdit={() => { setEditing(item); setForm({ titel: item.titel, inhalt: item.inhalt || '', plattform: item.plattform, content_typ: item.content_typ, geplant_fuer: '', status: item.status, hashtags: item.hashtags || '' }); setShowModal(true) }} onDelete={() => del(item.id)} />)}
                  </div>
                </div>
              )}
              {Object.entries(byDate).sort().map(([date, dateItems]: any) => (
                <div key={date} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden' }}>
                    {dateItems.map((item: any) => <ContentRow key={item.id} item={item} onStatusChange={updateStatus} onEdit={() => { setEditing(item); setForm({ titel: item.titel, inhalt: item.inhalt || '', plattform: item.plattform, content_typ: item.content_typ, geplant_fuer: item.geplant_fuer || '', status: item.status, hashtags: item.hashtags || '' }); setShowModal(true) }} onDelete={() => del(item.id)} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Google Calendar */}
      {tab === 'google' && (
        <div>
          {client?.google_calendar_url ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #eaeaea', background: '#fff' }}>
              <iframe src={client.google_calendar_url} style={{ width: '100%', height: 620, border: 'none' }} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 72, background: '#fff', borderRadius: 14, border: '1.5px dashed #ddd' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>📆</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Google Kalender noch nicht verbunden</div>
              <p style={{ fontSize: 13, color: '#aaa', maxWidth: 380, margin: '0 auto 22px' }}>
                Lass den Client seinen Google Kalender als öffentlichen Embed-Link teilen. In Google Kalender → Einstellungen → Kalender → "Diesen Kalender einbetten" → Link kopieren.
              </p>
              <button onClick={() => setShowGoogleEdit(true)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Google Kalender einrichten
              </button>
            </div>
          )}
        </div>
      )}

      {/* Google URL Modal */}
      {showGoogleEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 520, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Google Kalender einbetten</h2>
            <p style={{ fontSize: 12.5, color: '#aaa', marginBottom: 20 }}>Geh im Google Kalender des Clients auf Einstellungen → Kalender auswählen → "Einbetten" → die vollständige URL kopieren (beginnt mit https://calendar.google.com/calendar/embed?...)</p>
            <textarea value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} rows={3} placeholder="https://calendar.google.com/calendar/embed?src=..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGoogleEdit(false)} style={{ flex: 1, padding: '10px', border: '1px solid #eaeaea', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={saveGoogleUrl} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#1a1a1a', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 520, padding: 28, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Bearbeiten' : 'Neuer Content'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Titel *</label>
                <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ label: 'Plattform', key: 'plattform', opts: PLATFORMS }, { label: 'Typ', key: 'content_typ', opts: TYPES }, { label: 'Status', key: 'status', opts: STATUSES }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Datum</label>
                  <input type="date" value={form.geplant_fuer} onChange={e => setForm(p => ({ ...p, geplant_fuer: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Inhalt / Caption</label>
                <textarea value={form.inhalt} onChange={e => setForm(p => ({ ...p, inhalt: e.target.value }))} rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Hashtags</label>
                <input value={form.hashtags} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#hashtag1 #hashtag2" style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
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

function ContentRow({ item, onStatusChange, onEdit, onDelete }: any) {
  const SC: any = { 'Idee': { bg: '#f5f5f5', color: '#999' }, 'In Arbeit': { bg: '#fef9f0', color: '#f59e0b' }, 'Bereit': { bg: '#f0f9ff', color: '#0ea5e9' }, 'Veröffentlicht': { bg: '#f0fdf4', color: '#16a34a' } }
  const PI: any = { Instagram: '📸', TikTok: '🎵', YouTube: '▶', LinkedIn: '💼', Twitter: '𝕏', Facebook: '👥', Newsletter: '✉' }
  const STATUSES = ['Idee','In Arbeit','Bereit','Veröffentlicht']
  return (
    <div style={{ padding: '12px 18px', borderBottom: '1px solid #f7f7f5', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 16 }}>{PI[item.plattform] || '○'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a1a' }}>{item.titel}</div>
        <div style={{ fontSize: 11.5, color: '#aaa', marginTop: 2 }}>{item.plattform} · {item.content_typ}</div>
      </div>
      <select value={item.status} onChange={e => onStatusChange(item.id, e.target.value)} style={{ border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: SC[item.status]?.bg || '#f5f5f5', color: SC[item.status]?.color || '#888' }}>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <button onClick={onEdit} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 6, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer' }}>Edit</button>
      <button onClick={onDelete} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', fontSize: 11.5, cursor: 'pointer', color: '#ef4444' }}>×</button>
    </div>
  )
}
