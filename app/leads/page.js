'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const STATUSES = ['Neu', 'In Kontakt', 'Qualifiziert', 'Call gebucht', 'Gewonnen', 'Verloren', 'No Show']
const QUELLEN = ['Organisch', 'Instagram DM', 'TikTok', 'YouTube', 'Calendly', 'Empfehlung', 'Kalt Akquise', 'Werbung']
const STATUS_BADGE = { 'Gewonnen': 'badge-green', 'In Kontakt': 'badge-blue', 'Qualifiziert': 'badge-purple', 'Neu': 'badge-gray', 'Call gebucht': 'badge-blue', 'Verloren': 'badge-red', 'No Show': 'badge-amber' }

const empty = { name: '', email: '', phone: '', nische: '', quelle: 'Organisch', status: 'Neu', wert: 0, tags: '', notizen: '' }

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user); load()
    })
  }, [])

  const load = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || []); setLoading(false)
  }

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('leads').insert([{ ...form, wert: parseFloat(form.wert) || 0 }])
    setModal(false); setForm(empty); load()
  }

  const updateStatus = async (id, status) => {
    await supabase.from('leads').update({ status }).eq('id', id); load()
  }

  const deleteLead = async (id) => {
    if (!confirm('Lead loeschen?')) return
    await supabase.from('leads').delete().eq('id', id); load()
  }

  const filtered = leads.filter(l => {
    const s = search.toLowerCase()
    const matchSearch = !s || l.name?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s) || l.nische?.toLowerCase().includes(s)
    const matchStatus = !filterStatus || l.status === filterStatus
    const matchSource = !filterSource || l.quelle === filterSource
    return matchSearch && matchStatus && matchSource
  })

  const stats = STATUSES.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }))

  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Leads</span>
            <span style={{ fontSize: 13, color: '#9b9b9b' }}>{leads.length} gesamt</span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn btn-primary" onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Lead hinzufuegen
            </button>
          </div>
        </div>

        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
            {stats.slice(0, 5).map(s => (
              <div key={s.status} style={{ background: '#fff', border: '1px solid #e3e3e3', borderRadius: 8, padding: '12px 16px', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === s.status ? '' : s.status)}>
                <div style={{ fontSize: 11, color: '#9b9b9b', marginBottom: 4 }}>{s.status}</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>{s.count}</div>
              </div>
            ))}
          </div>

          <div className="filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34, background: '#fff', border: '1px solid #e3e3e3', borderRadius: 8, padding: '0 12px', flex: '0 0 240px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', width: '100%', fontFamily: 'inherit' }} />
            </div>
            <select className="form-select" style={{ width: 150, height: 34, fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Alle Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: 150, height: 34, fontSize: 13 }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
              <option value="">Alle Quellen</option>
              {QUELLEN.map(q => <option key={q}>{q}</option>)}
            </select>
            {(search || filterStatus || filterSource) && (
              <button className="topbar-btn btn-secondary" onClick={() => { setSearch(''); setFilterStatus(''); setFilterSource('') }} style={{ fontSize: 13 }}>Filter zuruecksetzen</button>
            )}
          </div>

          <div className="card">
            {loading ? <div className="empty-state"><p>Laden...</p></div> :
              filtered.length === 0 ? <div className="empty-state"><p>Keine Leads gefunden.</p></div> : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th><th>Email</th><th>Nische</th><th>Quelle</th><th>Wert</th><th>Tags</th><th>Status</th><th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(l => (
                        <tr key={l.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div>
                              <div>
                                <div className="font-medium" style={{ fontSize: 13 }}>{l.name}</div>
                                {l.phone && <div style={{ fontSize: 11, color: '#9b9b9b' }}>{l.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="text-muted text-sm">{l.email || '—'}</td>
                          <td className="text-sm">{l.nische || '—'}</td>
                          <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{l.quelle || '—'}</span></td>
                          <td className="font-medium">{l.wert ? `€${l.wert.toLocaleString('de-DE')}` : '—'}</td>
                          <td className="text-sm text-muted">{l.tags || '—'}</td>
                          <td>
                            <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', color: '#1a1a1a', outline: 'none' }}>
                              {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <button onClick={() => deleteLead(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b9b9b', fontSize: 16, lineHeight: 1, padding: '4px' }} title="Loeschen">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Neuer Lead</div>
              <span className="modal-close" onClick={() => setModal(false)}>×</span>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Max Mustermann" /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Nische</label><input className="form-input" value={form.nische} onChange={e => setForm({ ...form, nische: e.target.value })} placeholder="Trading, Fitness..." /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Quelle</label><select className="form-select" value={form.quelle} onChange={e => setForm({ ...form, quelle: e.target.value })}>{QUELLEN.map(q => <option key={q}>{q}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Wert (€)</label><input className="form-input" type="number" value={form.wert} onChange={e => setForm({ ...form, wert: e.target.value })} placeholder="1500" /></div>
                <div className="form-group"><label className="form-label">Tags</label><input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Follow Up, VIP..." /></div>
              </div>
              <div className="form-group"><label className="form-label">Notizen</label><textarea className="form-textarea" value={form.notizen} onChange={e => setForm({ ...form, notizen: e.target.value })} rows={3} /></div>
            </div>
            <div className="modal-footer">
              <button className="topbar-btn btn-secondary" onClick={() => { setModal(false); setForm(empty) }}>Abbrechen</button>
              <button className="topbar-btn btn-primary" onClick={save}>Lead speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
