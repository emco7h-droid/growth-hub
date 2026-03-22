'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

export default function KPIs() {
  const [clients, setClients] = useState([])
  const [kpis, setKpis] = useState([])
  const [selected, setSelected] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ monat:1, follower_instagram:0, follower_tiktok:0, umsatz:0, neue_kunden:0, email_subscriber:0, email_oeffnungsrate:0, conversion_rate:0, engagement_rate:0 })

  useEffect(() => {
    supabase.from('clients').select('id,name').then(({data}) => setClients(data||[]))
  }, [])

  useEffect(() => {
    if (!selected) return
    supabase.from('kpis').select('*').eq('client_id', selected).order('monat').then(({data}) => setKpis(data||[]))
  }, [selected])

  const save = async () => {
    await supabase.from('kpis').insert([{...form, client_id: selected}])
    setModal(false)
    supabase.from('kpis').select('*').eq('client_id', selected).order('monat').then(({data}) => setKpis(data||[]))
  }

  const fields = ['follower_instagram','follower_tiktok','umsatz','neue_kunden','email_subscriber','email_oeffnungsrate','conversion_rate','engagement_rate']
  const labels = { follower_instagram:'Instagram', follower_tiktok:'TikTok', umsatz:'Umsatz (€)', neue_kunden:'Neue Kunden', email_subscriber:'Email Subscriber', email_oeffnungsrate:'Open Rate %', conversion_rate:'Conversion %', engagement_rate:'Engagement %' }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">KPI Tracker</h1><p className="page-sub">Kennzahlen und Fortschritt</p></div>
          {selected && <button className="btn btn-primary" onClick={() => setModal(true)}>+ KPIs eintragen</button>}
        </div>

        <div className="section-card" style={{marginBottom:'24px'}}>
          <div style={{padding:'20px'}}>
            <label className="form-label">Client auswaehlen</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} style={{maxWidth:'300px'}}>
              <option value="">— Client auswaehlen —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {selected && (
          <div className="section-card">
            <div className="section-header"><span className="section-title">Monatliche Kennzahlen</span></div>
            {kpis.length === 0 ? (
              <div className="empty-state">Noch keine KPIs eingetragen. Klick auf + KPIs eintragen.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Kennzahl</th>{kpis.map(k => <th key={k.id}>Monat {k.monat}</th>)}</tr>
                </thead>
                <tbody>
                  {fields.map(f => (
                    <tr key={f}>
                      <td style={{fontWeight:500, color:'var(--text-muted)'}}>{labels[f]}</td>
                      {kpis.map(k => <td key={k.id}>{k[f] || 0}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {modal && (
          <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">KPIs eintragen</div>
              <div className="form-group"><label className="form-label">Monat</label>
                <select value={form.monat} onChange={e => setForm({...form, monat:parseInt(e.target.value)})}>
                  <option value={1}>Monat 1</option><option value={2}>Monat 2</option><option value={3}>Monat 3</option>
                </select>
              </div>
              {fields.map(f => (
                <div className="form-group" key={f}>
                  <label className="form-label">{labels[f]}</label>
                  <input type="number" value={form[f]} onChange={e => setForm({...form, [f]: parseFloat(e.target.value)||0})} />
                </div>
              ))}
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
