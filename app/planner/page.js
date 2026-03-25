'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const PLATFORMS = ['Instagram','TikTok','YouTube','LinkedIn','Facebook','X (Twitter)']
const TYPES = ['Reel','Story','Post','Carousel','Video','Blog','Newsletter']
const PLAT_COLOR = {'Instagram':'#e1306c','TikTok':'#1a1a1a','YouTube':'#ff0000','LinkedIn':'#0a66c2','Facebook':'#1877f2','X (Twitter)':'#1a1a1a'}
const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So']

export default function Planner() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [view, setView] = useState('week')
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({titel:'',inhalt:'',plattform:'Instagram',typ:'Post',geplant_fuer:'',status:'Entwurf',hashtags:''})
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user); load()
    })
  }, [])

  const load = async () => {
    const {data} = await supabase.from('content_planner').select('*').order('geplant_fuer',{ascending:true})
    setPosts(data||[]); setLoading(false)
  }

  const save = async () => {
    if (!form.titel.trim()) return
    await supabase.from('content_planner').insert([form])
    setModal(false); setForm({titel:'',inhalt:'',plattform:'Instagram',typ:'Post',geplant_fuer:selectedDay||'',status:'Entwurf',hashtags:''}); load()
  }

  const del = async (id) => {
    await supabase.from('content_planner').delete().eq('id',id); load()
  }

  const updateStatus = async (id, status) => {
    await supabase.from('content_planner').update({status}).eq('id',id); load()
  }

  // Build current week
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  const weekDays = Array.from({length:7},(_,i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate()+i); return d
  })

  const postsOnDay = (day) => posts.filter(p => {
    if (!p.geplant_fuer) return false
    const d = new Date(p.geplant_fuer)
    return d.toDateString() === day.toDateString()
  })

  const openModal = (day) => {
    const ds = day.toISOString().split('T')[0]
    setSelectedDay(ds)
    setForm({...form, geplant_fuer: ds})
    setModal(true)
  }

  const statusColor = {'Entwurf':'badge-gray','Geplant':'badge-blue','Veroeffentlicht':'badge-green','Archiviert':'badge-amber'}

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Content Planer</span>
          </div>
          <div className="topbar-right">
            <div style={{display:'flex',gap:4,background:'#f6f6f7',borderRadius:6,padding:3}}>
              {['week','list'].map(v=><button key={v} onClick={()=>setView(v)} style={{height:28,padding:'0 12px',borderRadius:4,border:'none',background:view===v?'#fff':'transparent',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit',boxShadow:view===v?'0 1px 2px rgba(0,0,0,0.08)':'none'}}>{v==='week'?'Woche':'Liste'}</button>)}
            </div>
            <button className="topbar-btn btn-primary" onClick={()=>openModal(today)} style={{display:'flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Beitrag
            </button>
          </div>
        </div>
        <div className="page">
          {view === 'week' ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">KW {Math.ceil((today - new Date(today.getFullYear(),0,1)) / 604800000)} — {weekDays[0].toLocaleDateString('de-DE',{day:'2-digit',month:'short'})} bis {weekDays[6].toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'})}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderTop:'1px solid #f0f0f0'}}>
                {weekDays.map((day,i) => {
                  const isToday = day.toDateString() === today.toDateString()
                  const dayPosts = postsOnDay(day)
                  return (
                    <div key={i} style={{borderRight:i<6?'1px solid #f0f0f0':'none',minHeight:180}}>
                      <div style={{padding:'8px 10px',borderBottom:'1px solid #f0f0f0',background:isToday?'#1a1a1a':'transparent',cursor:'pointer'}} onClick={()=>openModal(day)}>
                        <div style={{fontSize:11,color:isToday?'#fff':'#9b9b9b',fontWeight:500}}>{DAYS[i]}</div>
                        <div style={{fontSize:16,fontWeight:600,color:isToday?'#fff':'#1a1a1a'}}>{day.getDate()}</div>
                      </div>
                      <div style={{padding:6}}>
                        {dayPosts.map(p=>(
                          <div key={p.id} style={{background:'#fff',border:`1px solid ${PLAT_COLOR[p.plattform]}40`,borderLeft:`3px solid ${PLAT_COLOR[p.plattform]}`,borderRadius:4,padding:'5px 8px',marginBottom:4,cursor:'pointer',fontSize:11}} title={p.inhalt}>
                            <div style={{fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titel}</div>
                            <div style={{color:PLAT_COLOR[p.plattform],marginTop:2}}>{p.plattform} · {p.typ}</div>
                          </div>
                        ))}
                        {dayPosts.length === 0 && <div style={{textAlign:'center',padding:'8px 4px',cursor:'pointer'}} onClick={()=>openModal(day)}>
                          <div style={{fontSize:18,color:'#e3e3e3'}}>+</div>
                        </div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="card">
              {loading ? <div className="empty-state"><p>Laden...</p></div> :
                posts.length === 0 ? <div className="empty-state"><p>Noch keine Beitraege geplant.</p></div> : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Titel</th><th>Plattform</th><th>Typ</th><th>Geplant</th><th>Hashtags</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {posts.map(p=>(
                          <tr key={p.id}>
                            <td className="font-medium">{p.titel}</td>
                            <td><span style={{color:PLAT_COLOR[p.plattform],fontWeight:600,fontSize:13}}>{p.plattform}</span></td>
                            <td><span className="badge badge-gray" style={{fontSize:11}}>{p.typ}</span></td>
                            <td className="text-sm text-muted">{p.geplant_fuer?new Date(p.geplant_fuer).toLocaleDateString('de-DE'):'—'}</td>
                            <td className="text-sm text-muted" style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.hashtags||'—'}</td>
                            <td>
                              <select value={p.status} onChange={e=>updateStatus(p.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12,fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
                                {['Entwurf','Geplant','Veroeffentlicht','Archiviert'].map(s=><option key={s}>{s}</option>)}
                              </select>
                            </td>
                            <td><button onClick={()=>del(p.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c0c0c0',fontSize:16,padding:'4px'}}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Neuer Beitrag</div><span className="modal-close" onClick={()=>setModal(false)}>×</span></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Titel *</label><input className="form-input" value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})} placeholder="Beitragstitel..."/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Plattform</label><select className="form-select" value={form.plattform} onChange={e=>setForm({...form,plattform:e.target.value})}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Format</label><select className="form-select" value={form.typ} onChange={e=>setForm({...form,typ:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Datum</label><input className="form-input" type="date" value={form.geplant_fuer} onChange={e=>setForm({...form,geplant_fuer:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{['Entwurf','Geplant','Veroeffentlicht'].map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Inhalt / Caption</label><textarea className="form-textarea" rows={4} value={form.inhalt} onChange={e=>setForm({...form,inhalt:e.target.value})} placeholder="Schreibe deinen Caption..."/></div>
              <div className="form-group"><label className="form-label">Hashtags</label><input className="form-input" value={form.hashtags} onChange={e=>setForm({...form,hashtags:e.target.value})} placeholder="#wachstum #coaching #growthhack"/></div>
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
