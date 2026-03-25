'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const fields = [
  { key:'follower_ig', label:'Instagram Follower' },
  { key:'follower_tt', label:'TikTok Follower' },
  { key:'umsatz', label:'Umsatz (€)' },
  { key:'neue_kunden', label:'Neue Kunden' },
  { key:'email_sub', label:'Email Subscriber' },
  { key:'open_rate', label:'Open Rate (%)' },
  { key:'conv_rate', label:'Conversion (%)' },
  { key:'engage_rate', label:'Engagement (%)' },
]

export default function KPIs() {
  const [clients, setClients] = useState([])
  const [kpis, setKpis] = useState([])
  const [sel, setSel] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({monat:1,follower_ig:0,follower_tt:0,umsatz:0,neue_kunden:0,email_sub:0,open_rate:0,conv_rate:0,engage_rate:0})
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      supabase.from('clients').select('id,name').then(({data}) => setClients(data||[]))
    })
  }, [])

  useEffect(() => {
    if (!sel) return
    supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data}) => setKpis(data||[]))
  }, [sel])

  const save = async () => {
    await supabase.from('kpis').insert([{...form,client_id:sel}])
    setModal(false)
    supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data}) => setKpis(data||[]))
  }

  const change = (m1, m2, key) => {
    if (!m1 || !m2 || !m1[key] || !m2[key]) return null
    const diff = ((m2[key]-m1[key])/m1[key]*100).toFixed(1)
    return diff > 0 ? `+${diff}%` : `${diff}%`
  }

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">KPI Tracker</span>
          </div>
          <div className="topbar-right">
            {sel && <button className="topbar-btn btn-primary" onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              KPIs eintragen
            </button>}
          </div>
        </div>
        <div className="page">
          <div className="card" style={{marginBottom:20,padding:'20px'}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Client auswaehlen</label>
              <select className="form-select" style={{maxWidth:320}} value={sel} onChange={e=>setSel(e.target.value)}>
                <option value="">— Client waehlen —</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {sel && <>
            {kpis.length === 0 ? (
              <div className="card"><div className="empty-state"><p>Noch keine KPIs fuer diesen Client. Klick auf "KPIs eintragen".</p></div></div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Monatliche Kennzahlen</div>
                  <span style={{fontSize:12,color:'#6b6b6b'}}>{kpis.length} Monate erfasst</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Kennzahl</th>
                        {kpis.map(k=><th key={k.id}>Monat {k.monat}</th>)}
                        {kpis.length > 1 && <th>Trend</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map(f=>(
                        <tr key={f.key}>
                          <td className="font-medium" style={{color:'#6b6b6b'}}>{f.label}</td>
                          {kpis.map(k=><td key={k.id} className="font-medium">{k[f.key]||0}</td>)}
                          {kpis.length > 1 && (
                            <td>
                              {(() => {
                                const c = change(kpis[kpis.length-2], kpis[kpis.length-1], f.key)
                                if (!c) return <span style={{color:'#9b9b9b'}}>—</span>
                                return <span style={{color:c.startsWith('+')?'#008060':'#d72c0d',fontSize:12,fontWeight:600}}>{c}</span>
                              })()}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">KPIs eintragen</div><span className="modal-close" onClick={()=>setModal(false)}>×</span></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Monat</label>
                <select className="form-select" value={form.monat} onChange={e=>setForm({...form,monat:parseInt(e.target.value)})}>
                  <option value={1}>Monat 1</option><option value={2}>Monat 2</option><option value={3}>Monat 3</option>
                </select>
              </div>
              {fields.map(f=>(
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type="number" value={form[f.key]} onChange={e=>setForm({...form,[f.key]:parseFloat(e.target.value)||0})}/>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="topbar-btn btn-secondary" onClick={()=>setModal(false)}>Abbrechen</button>
              <button className="topbar-btn btn-primary" onClick={save}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
