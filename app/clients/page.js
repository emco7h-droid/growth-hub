'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const empty = { name:'',email:'',phone:'',nische:'',modell:'1 zu 1',retainer:0,startdatum:'',monat:1,status:'Aktiv',ziel_1:'',ziel_2:'',ziel_3:'',bottleneck:'',quick_win:'',notizen:'' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(empty)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user); load()
    })
  }, [])

  const load = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at',{ascending:false})
    setClients(data||[]); setLoading(false)
  }

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('clients').insert([{...form,retainer:parseFloat(form.retainer)||0}])
    setModal(false); setForm(empty); load()
  }

  const del = async (id) => {
    if (!confirm('Client loeschen?')) return
    await supabase.from('clients').delete().eq('id',id); load()
  }

  const active = clients.filter(c=>c.status==='Aktiv')
  const totalRev = active.reduce((s,c)=>s+(c.retainer||0),0)

  const InfoRow = ({label, value}) => (
    <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f0f0f0'}}>
      <span style={{fontSize:13,color:'#6b6b6b'}}>{label}</span>
      <span style={{fontSize:13,fontWeight:500}}>{value||'—'}</span>
    </div>
  )

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{selected ? selected.name : 'Clients'}</span>
            {selected && <button className="topbar-btn btn-secondary" onClick={()=>setSelected(null)} style={{fontSize:13}}>← Zurueck</button>}
          </div>
          <div className="topbar-right">
            {!selected && <button className="topbar-btn btn-primary" onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Client hinzufuegen
            </button>}
          </div>
        </div>

        <div className="page">
          {!selected ? <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
              {[['Aktive Clients',active.length],['Monatl. Umsatz',`€${totalRev.toLocaleString('de-DE')}`],['Ø Retainer',active.length?`€${Math.round(totalRev/active.length).toLocaleString('de-DE')}`:'—']].map(([l,v])=>(
                <div key={l} className="metric"><div className="metric-label">{l}</div><div className="metric-value">{v}</div></div>
              ))}
            </div>
            <div className="card">
              {loading?<div className="empty-state"><p>Laden...</p></div>:clients.length===0?<div className="empty-state"><p>Noch keine Clients.</p></div>:(
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Nische</th><th>Modell</th><th>Retainer</th><th>Start</th><th>Fortschritt</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {clients.map(c=>(
                        <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setSelected(c)}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:32,height:32,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#fff',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div>
                              <div>
                                <div className="font-medium" style={{fontSize:13}}>{c.name}</div>
                                <div style={{fontSize:11,color:'#9b9b9b'}}>{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm text-muted">{c.nische||'—'}</td>
                          <td><span className="badge badge-gray" style={{fontSize:11}}>{c.modell}</span></td>
                          <td className="font-semibold" style={{color:'#008060'}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
                          <td className="text-sm text-muted">{c.startdatum?new Date(c.startdatum).toLocaleDateString('de-DE'):'—'}</td>
                          <td style={{minWidth:120}}>
                            <div style={{fontSize:11,color:'#6b6b6b',marginBottom:4}}>Monat {c.monat||1} / 3</div>
                            <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,((c.monat||1)/3)*100)}%`}}/></div>
                          </td>
                          <td><span className={`badge ${c.status==='Aktiv'?'badge-green':'badge-gray'}`}>{c.status}</span></td>
                          <td onClick={e=>e.stopPropagation()}><button onClick={()=>del(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9b9b9b',fontSize:16,padding:'4px'}}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </> : (
            <div className="grid-2">
              <div>
                <div className="card" style={{marginBottom:16}}>
                  <div className="card-header"><div className="card-title">Client Info</div><span className={`badge ${selected.status==='Aktiv'?'badge-green':'badge-gray'}`}>{selected.status}</span></div>
                  <div className="card-body">
                    <InfoRow label="Email" value={selected.email}/>
                    <InfoRow label="Telefon" value={selected.phone}/>
                    <InfoRow label="Nische" value={selected.nische}/>
                    <InfoRow label="Coaching Modell" value={selected.modell}/>
                    <InfoRow label="Retainer" value={`€${(selected.retainer||0).toLocaleString('de-DE')}/Mo`}/>
                    <InfoRow label="Startdatum" value={selected.startdatum?new Date(selected.startdatum).toLocaleDateString('de-DE'):'—'}/>
                    <InfoRow label="Aktueller Monat" value={`${selected.monat||1} von 3`}/>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Notizen</div></div>
                  <div className="card-body"><p style={{fontSize:13,color:selected.notizen?'#1a1a1a':'#9b9b9b'}}>{selected.notizen||'Keine Notizen vorhanden.'}</p></div>
                </div>
              </div>
              <div>
                <div className="card" style={{marginBottom:16}}>
                  <div className="card-header"><div className="card-title">90-Tage Ziele</div></div>
                  <div className="card-body">
                    {[selected.ziel_1,selected.ziel_2,selected.ziel_3].filter(Boolean).map((z,i)=>(
                      <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                        <div style={{width:22,height:22,borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,flexShrink:0}}>{i+1}</div>
                        <span style={{fontSize:13}}>{z}</span>
                      </div>
                    ))}
                    {!selected.ziel_1&&<p style={{fontSize:13,color:'#9b9b9b'}}>Keine Ziele eingetragen.</p>}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><div className="card-title">Bottleneck & Quick Win</div></div>
                  <div className="card-body">
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:500,color:'#9b9b9b',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:6}}>Bottleneck</div>
                      <p style={{fontSize:13,color:selected.bottleneck?'#1a1a1a':'#9b9b9b'}}>{selected.bottleneck||'—'}</p>
                    </div>
                    <div>
                      <div style={{fontSize:11,fontWeight:500,color:'#9b9b9b',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:6}}>Quick Win</div>
                      <p style={{fontSize:13,color:selected.quick_win?'#1a1a1a':'#9b9b9b'}}>{selected.quick_win||'—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal&&(
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Neuer Client</div><span className="modal-close" onClick={()=>setModal(false)}>×</span></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Nische</label><input className="form-input" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Modell</label><select className="form-select" value={form.modell} onChange={e=>setForm({...form,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Kurs</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Retainer (€/Mo)</label><input className="form-input" type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Startdatum</label><input className="form-input" type="date" value={form.startdatum} onChange={e=>setForm({...form,startdatum:e.target.value})}/></div>
              </div>
              <div className="form-group"><label className="form-label">Ziel 1</label><input className="form-input" value={form.ziel_1} onChange={e=>setForm({...form,ziel_1:e.target.value})} placeholder="Konkretes messbares Ziel..."/></div>
              <div className="form-group"><label className="form-label">Ziel 2</label><input className="form-input" value={form.ziel_2} onChange={e=>setForm({...form,ziel_2:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Ziel 3</label><input className="form-input" value={form.ziel_3} onChange={e=>setForm({...form,ziel_3:e.target.value})}/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Bottleneck</label><input className="form-input" value={form.bottleneck} onChange={e=>setForm({...form,bottleneck:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Quick Win</label><input className="form-input" value={form.quick_win} onChange={e=>setForm({...form,quick_win:e.target.value})}/></div>
              </div>
              <div className="form-group"><label className="form-label">Notizen</label><textarea className="form-textarea" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
            </div>
            <div className="modal-footer">
              <button className="topbar-btn btn-secondary" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button>
              <button className="topbar-btn btn-primary" onClick={save}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
