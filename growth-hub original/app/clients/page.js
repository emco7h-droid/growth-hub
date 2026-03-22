'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', nische:'', coaching_modell:'1 zu 1',
    retainer:0, startdatum:'', aktueller_monat:1, status:'Aktiv',
    ziel_1:'', ziel_2:'', ziel_3:'', bottleneck:'', quick_win:'', notizen:''
  })

  const load = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name.trim()) return
    await supabase.from('clients').insert([{...form, retainer: parseFloat(form.retainer) || 0}])
    setModal(false)
    resetForm()
    load()
  }

  const resetForm = () => setForm({
    name:'', email:'', phone:'', nische:'', coaching_modell:'1 zu 1',
    retainer:0, startdatum:'', aktueller_monat:1, status:'Aktiv',
    ziel_1:'', ziel_2:'', ziel_3:'', bottleneck:'', quick_win:'', notizen:''
  })

  const deleteClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Clients</h1>
            <p className="page-sub">Aktive Zusammenarbeiten im Ueberblick</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Client hinzufuegen</button>
        </div>

        {!selected ? (
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Alle Clients ({clients.length})</span>
            </div>
            {loading ? (
              <div className="empty-state">Laden...</div>
            ) : clients.length === 0 ? (
              <div className="empty-state">Noch keine Clients.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Nische</th><th>Modell</th><th>Retainer</th><th>Start</th><th>Monat</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} style={{cursor:'pointer'}} onClick={() => setSelected(c)}>
                      <td style={{fontWeight:600}}>{c.name}</td>
                      <td style={{color:'var(--text-muted)'}}>{c.nische || '—'}</td>
                      <td style={{color:'var(--text-muted)'}}>{c.coaching_modell}</td>
                      <td style={{color:'var(--green)', fontWeight:600}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
                      <td style={{color:'var(--text-muted)'}}>{c.startdatum ? new Date(c.startdatum).toLocaleDateString('de-DE') : '—'}</td>
                      <td>
                        <div style={{fontSize:'12px'}}>Monat {c.aktueller_monat||1}/3</div>
                        <div className="progress-bar" style={{width:'80px'}}>
                          <div className="progress-fill" style={{width:`${Math.min(100,((c.aktueller_monat||1)/3)*100)}%`}}></div>
                        </div>
                      </td>
                      <td><span className={`badge badge-${c.status==='Aktiv'?'green':'gray'}`}>{c.status}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:'12px'}} onClick={() => deleteClient(c.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            <button className="btn btn-ghost" style={{marginBottom:'20px'}} onClick={() => setSelected(null)}>← Zurueck</button>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
              <div className="section-card">
                <div className="section-header"><span className="section-title">Client Info</span></div>
                <div style={{padding:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  {[['Name', selected.name], ['Email', selected.email], ['Nische', selected.nische], ['Modell', selected.coaching_modell], ['Retainer', `€${(selected.retainer||0).toLocaleString('de-DE')}/Mo`], ['Start', selected.startdatum ? new Date(selected.startdatum).toLocaleDateString('de-DE') : '—']].map(([k,v]) => (
                    <div key={k}>
                      <div style={{fontSize:'11px', color:'var(--text-dim)', textTransform:'uppercase', fontWeight:600, marginBottom:'4px', fontFamily:'Syne'}}>{k}</div>
                      <div style={{fontSize:'14px'}}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-card">
                <div className="section-header"><span className="section-title">Ziele (90 Tage)</span></div>
                <div style={{padding:'20px', display:'flex', flexDirection:'column', gap:'12px'}}>
                  {[selected.ziel_1, selected.ziel_2, selected.ziel_3].map((z, i) => z && (
                    <div key={i} style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                      <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'rgba(59,130,246,0.15)', color:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:'14px'}}>{z}</div>
                    </div>
                  ))}
                  {!selected.ziel_1 && <div style={{color:'var(--text-dim)', fontSize:'13px'}}>Keine Ziele eingetragen</div>}
                </div>
              </div>
              <div className="section-card">
                <div className="section-header"><span className="section-title">Bottleneck und Quick Win</span></div>
                <div style={{padding:'20px', display:'flex', flexDirection:'column', gap:'16px'}}>
                  <div>
                    <div style={{fontSize:'11px', color:'var(--text-dim)', textTransform:'uppercase', fontWeight:600, marginBottom:'6px', fontFamily:'Syne'}}>Bottleneck</div>
                    <div style={{fontSize:'14px', color: selected.bottleneck ? 'var(--text)' : 'var(--text-dim)'}}>{selected.bottleneck || 'Noch nicht eingetragen'}</div>
                  </div>
                  <div>
                    <div style={{fontSize:'11px', color:'var(--text-dim)', textTransform:'uppercase', fontWeight:600, marginBottom:'6px', fontFamily:'Syne'}}>Quick Win</div>
                    <div style={{fontSize:'14px', color: selected.quick_win ? 'var(--text)' : 'var(--text-dim)'}}>{selected.quick_win || 'Noch nicht eingetragen'}</div>
                  </div>
                </div>
              </div>
              <div className="section-card">
                <div className="section-header"><span className="section-title">Notizen</span></div>
                <div style={{padding:'20px'}}>
                  <div style={{fontSize:'14px', color: selected.notizen ? 'var(--text)' : 'var(--text-dim)'}}>{selected.notizen || 'Keine Notizen'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {modal && (
          <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Neuer Client</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name*</label><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email</label><input value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Nische</label><input value={form.nische} onChange={e => setForm({...form, nische:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Coaching Modell</label>
                  <select value={form.coaching_modell} onChange={e => setForm({...form, coaching_modell:e.target.value})}>
                    <option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Retainer (Euro/Mo)</label><input type="number" value={form.retainer} onChange={e => setForm({...form, retainer:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Startdatum</label><input type="date" value={form.startdatum} onChange={e => setForm({...form, startdatum:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Ziel 1</label><input value={form.ziel_1} onChange={e => setForm({...form, ziel_1:e.target.value})} placeholder="Konkretes messbares Ziel..." /></div>
              <div className="form-group"><label className="form-label">Ziel 2</label><input value={form.ziel_2} onChange={e => setForm({...form, ziel_2:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Ziel 3</label><input value={form.ziel_3} onChange={e => setForm({...form, ziel_3:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Notizen</label><textarea value={form.notizen} onChange={e => setForm({...form, notizen:e.target.value})} rows={3} /></div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => { setModal(false); resetForm(); }}>Abbrechen</button>
                <button className="btn btn-primary" onClick={save}>Speichern</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
