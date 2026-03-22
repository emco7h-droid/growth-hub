'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', nische:'', call_datum:'', status:'Ausstehend', notizen:'' })

  const load = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('leads').insert([form])
    setModal(false)
    setForm({ name:'', email:'', phone:'', nische:'', call_datum:'', status:'Ausstehend', notizen:'' })
    load()
  }

  const updateStatus = async (id, status) => {
    await supabase.from('leads').update({ status }).eq('id', id)
    load()
  }

  const deleteLead = async (id) => {
    await supabase.from('leads').delete().eq('id', id)
    load()
  }

  const statusBadge = (s) => {
    const map = { 'Gewonnen': 'green', 'Interessiert': 'blue', 'Ausstehend': 'amber', 'Verloren': 'red' }
    return <span className={`badge badge-${map[s]||'gray'}`}>{s}</span>
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Leads</h1>
            <p className="page-sub">Discovery Call Interessenten verwalten</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Lead hinzufuegen</button>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="section-title">Alle Leads ({leads.length})</span>
          </div>
          {loading ? (
            <div className="empty-state">Laden...</div>
          ) : leads.length === 0 ? (
            <div className="empty-state">Noch keine Leads. Klick auf + Lead hinzufuegen.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Nische</th><th>Call Datum</th><th>Status</th><th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id}>
                    <td style={{fontWeight:500}}>{l.name}</td>
                    <td style={{color:'var(--text-muted)'}}>{l.email || '—'}</td>
                    <td>{l.nische || '—'}</td>
                    <td style={{color:'var(--text-muted)'}}>{l.call_datum ? new Date(l.call_datum).toLocaleDateString('de-DE') : '—'}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td>
                      <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <select
                          value={l.status}
                          onChange={(e) => updateStatus(l.id, e.target.value)}
                          style={{width:'140px', padding:'6px 10px', fontSize:'12px'}}
                        >
                          <option>Ausstehend</option>
                          <option>Interessiert</option>
                          <option>Gewonnen</option>
                          <option>Verloren</option>
                        </select>
                        <button
                          className="btn btn-ghost"
                          style={{padding:'6px 10px', fontSize:'12px'}}
                          onClick={() => deleteLead(l.id)}
                        >×</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modal && (
          <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Neuer Lead</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name*</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Max Mustermann" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="max@beispiel.de" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nische</label>
                  <input value={form.nische} onChange={e => setForm({...form, nische: e.target.value})} placeholder="Trading, Fitness..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Call Datum</label>
                  <input type="date" value={form.call_datum} onChange={e => setForm({...form, call_datum: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>Ausstehend</option>
                  <option>Interessiert</option>
                  <option>Gewonnen</option>
                  <option>Verloren</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notizen</label>
                <textarea value={form.notizen} onChange={e => setForm({...form, notizen: e.target.value})} rows={3} placeholder="Wichtige Infos..." />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModal(false)}>Abbrechen</button>
                <button className="btn btn-primary" onClick={save}>Speichern</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
