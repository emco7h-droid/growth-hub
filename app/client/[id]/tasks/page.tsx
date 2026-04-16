'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PRIO: any = { Hoch: { bg: '#fef2f2', color: '#dc2626' }, Mittel: { bg: '#fefce8', color: '#ca8a04' }, Niedrig: { bg: '#f0fdf4', color: '#16a34a' } }
const STAT: any = { Offen: { bg: '#f5f5f5', color: '#888' }, 'In Arbeit': { bg: '#fef9f0', color: '#f59e0b' }, Erledigt: { bg: '#f0fdf4', color: '#16a34a' } }
const KATS = ['Admin', 'Marketing', 'Content', 'Technik', 'Sales', 'Strategie', 'Sonstiges']

export default function TasksPage({ params }: { params: { id: string } }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [filter, setFilter] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ titel: '', beschreibung: '', prioritaet: 'Mittel', status: 'Offen', kategorie: 'Admin', faellig: '' })

  useEffect(() => { load() }, [params.id])

  async function load() {
    const [tr, cr] = await Promise.all([
      supabase.from('tasks').select('*').eq('workspace_id', params.id).order('created_at', { ascending: false }),
      supabase.from('workspaces').select('*').eq('id', params.id).single(),
    ])
    setTasks(tr.data || [])
    setClient(cr.data)
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ titel: '', beschreibung: '', prioritaet: 'Mittel', status: 'Offen', kategorie: 'Admin', faellig: '' })
    setShowModal(true)
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
    const payload = { ...form, workspace_id: params.id, faellig: form.faellig || null }
    if (editing) await supabase.from('tasks').update(payload).eq('id', editing.id)
    else await supabase.from('tasks').insert(payload)
    setShowModal(false)
    load()
  }

  async function toggleDone(task: any) {
    await supabase.from('tasks').update({ status: task.status === 'Erledigt' ? 'Offen' : 'Erledigt' }).eq('id', task.id)
    load()
  }

  async function del(id: string) {
    if (!confirm('Aufgabe löschen?')) return
    await supabase.from('tasks').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'Alle' ? tasks : tasks.filter(t => t.status === filter)
  const color = client?.color || '#6366f1'
  const openCount = tasks.filter(t => t.status !== 'Erledigt').length
  const doneCount = tasks.filter(t => t.status === 'Erledigt').length

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Aufgaben</h1>
          <p style={{ fontSize: 12.5, color: '#aaa', margin: '3px 0 0' }}>{openCount} offen · {doneCount} erledigt</p>
        </div>
        <button onClick={openNew} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Aufgabe</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f0f0ee', padding: 4, borderRadius: 9, width: 'fit-content' }}>
        {['Alle', 'Offen', 'In Arbeit', 'Erledigt'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: filter === s ? '#fff' : 'transparent', color: filter === s ? '#1a1a1a' : '#888', boxShadow: filter === s ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, background: '#fff', borderRadius: 14, border: '1px solid #eaeaea' }}>
          <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
            {filter === 'Erledigt' ? 'Noch nichts erledigt' : 'Keine offenen Aufgaben'}
          </div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Super! Erstelle eine neue Aufgabe wenn du etwas erledigen musst.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(task => (
            <div key={task.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: task.status === 'Erledigt' ? 0.6 : 1 }}>
              {/* Checkbox */}
              <button onClick={() => toggleDone(task)} style={{ width: 20, height: 20, borderRadius: 99, border: `2px solid ${task.status === 'Erledigt' ? color : '#ddd'}`, background: task.status === 'Erledigt' ? color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {task.status === 'Erledigt' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a1a', textDecoration: task.status === 'Erledigt' ? 'line-through' : 'none' }}>{task.titel}</div>
                {task.beschreibung && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.beschreibung}</div>}
              </div>
              {/* Meta */}
              <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
                {task.faellig && (
                  <span style={{ fontSize: 11.5, color: new Date(task.faellig) < new Date() && task.status !== 'Erledigt' ? '#dc2626' : '#aaa', fontWeight: 500 }}>
                    {new Date(task.faellig).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500, background: PRIO[task.prioritaet]?.bg || '#f5f5f5', color: PRIO[task.prioritaet]?.color || '#888' }}>{task.prioritaet}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500, background: '#f5f5f5', color: '#888' }}>{task.kategorie}</span>
                <button onClick={() => { setEditing(task); setForm({ titel: task.titel, beschreibung: task.beschreibung || '', prioritaet: task.prioritaet, status: task.status, kategorie: task.kategorie, faellig: task.faellig || '' }); setShowModal(true) }} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 6, padding: '3px 9px', fontSize: 11.5, cursor: 'pointer', color: '#666' }}>Edit</button>
                <button onClick={() => del(task.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '3px 7px', fontSize: 11.5, cursor: 'pointer', color: '#ef4444' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 480, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>{editing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Titel *</label>
                <input value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Beschreibung</label>
                <textarea value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Priorität', key: 'prioritaet', opts: ['Hoch', 'Mittel', 'Niedrig'] },
                  { label: 'Status', key: 'status', opts: ['Offen', 'In Arbeit', 'Erledigt'] },
                  { label: 'Kategorie', key: 'kategorie', opts: KATS },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Fällig am</label>
                  <input type="date" value={form.faellig} onChange={e => setForm(p => ({ ...p, faellig: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
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
