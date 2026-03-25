'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const PRIOS = ['Hoch','Mittel','Niedrig']
const PRIO_COLOR = {'Hoch':'badge-red','Mittel':'badge-amber','Niedrig':'badge-gray'}
const empty = {title:'',beschreibung:'',faellig:'',prioritaet:'Mittel',erledigt:false,referenz_typ:'',referenz_id:'',referenz_name:''}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [filter, setFilter] = useState('offen')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      Promise.all([
        supabase.from('tasks').select('*').order('faellig',{ascending:true,nullsFirst:false}),
        supabase.from('clients').select('id,name'),
        supabase.from('leads').select('id,name'),
      ]).then(([t,c,l]) => { setTasks(t.data||[]); setClients(c.data||[]); setLeads(l.data||[]); setLoading(false) })
    })
  }, [])

  const load = async () => {
    const {data} = await supabase.from('tasks').select('*').order('faellig',{ascending:true,nullsFirst:false})
    setTasks(data||[])
  }

  const save = async () => {
    if (!form.title.trim()) return
    await supabase.from('tasks').insert([form])
    setModal(false); setForm(empty); load()
  }

  const toggle = async (id, erledigt) => {
    await supabase.from('tasks').update({erledigt:!erledigt}).eq('id',id); load()
  }

  const del = async (id) => {
    await supabase.from('tasks').delete().eq('id',id); load()
  }

  const setRef = (typ, id) => {
    const name = typ === 'client' ? clients.find(c=>c.id===id)?.name : leads.find(l=>l.id===id)?.name
    setForm({...form, referenz_typ:typ, referenz_id:id, referenz_name:name||''})
  }

  const filtered = tasks.filter(t => filter === 'alle' ? true : filter === 'offen' ? !t.erledigt : t.erledigt)
  const overdue = tasks.filter(t => !t.erledigt && t.faellig && new Date(t.faellig) < new Date()).length
  const today = tasks.filter(t => !t.erledigt && t.faellig && new Date(t.faellig).toDateString() === new Date().toDateString()).length

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Aufgaben</span>
            {overdue > 0 && <span className="badge badge-red">{overdue} ueberfaellig</span>}
          </div>
          <div className="topbar-right">
            <button className="topbar-btn btn-primary" onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Aufgabe
            </button>
          </div>
        </div>
        <div className="page">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[['Gesamt',tasks.length,'#1a1a1a'],['Offen',tasks.filter(t=>!t.erledigt).length,'#2c6ecb'],['Heute',today,'#b98900'],['Ueberfaellig',overdue,'#d72c0d']].map(([l,v,c])=>(
              <div key={l} className="metric"><div className="metric-label">{l}</div><div className="metric-value" style={{color:c}}>{v}</div></div>
            ))}
          </div>

          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {['offen','erledigt','alle'].map(f => (
              <button key={f} onClick={()=>setFilter(f)} style={{height:32,padding:'0 14px',borderRadius:6,border:'1px solid #e3e3e3',background:filter===f?'#1a1a1a':'#fff',color:filter===f?'#fff':'#6b6b6b',fontSize:13,fontFamily:'inherit',cursor:'pointer',transition:'all .15s',textTransform:'capitalize'}}>{f==='offen'?'Offen':f==='erledigt'?'Erledigt':'Alle'}</button>
            ))}
          </div>

          <div className="card">
            {loading ? <div className="empty-state"><p>Laden...</p></div> :
              filtered.length === 0 ? <div className="empty-state"><p>Keine Aufgaben gefunden.</p></div> : (
                filtered.map((t,i) => {
                  const isOverdue = !t.erledigt && t.faellig && new Date(t.faellig) < new Date()
                  return (
                    <div key={t.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 20px',borderBottom:i<filtered.length-1?'1px solid #f0f0f0':'none',opacity:t.erledigt?0.5:1}}>
                      <div onClick={()=>toggle(t.id,t.erledigt)} style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.erledigt?'#008060':'#e3e3e3'}`,background:t.erledigt?'#008060':'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:1,transition:'all .15s'}}>
                        {t.erledigt && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          <span style={{fontSize:14,fontWeight:500,textDecoration:t.erledigt?'line-through':'none'}}>{t.title}</span>
                          <span className={`badge ${PRIO_COLOR[t.prioritaet]||'badge-gray'}`} style={{fontSize:11}}>{t.prioritaet}</span>
                          {t.referenz_name && <span className="badge badge-blue" style={{fontSize:11}}>{t.referenz_name}</span>}
                        </div>
                        {t.beschreibung && <div style={{fontSize:12,color:'#9b9b9b',marginTop:3}}>{t.beschreibung}</div>}
                        {t.faellig && <div style={{fontSize:11,color:isOverdue?'#d72c0d':'#9b9b9b',marginTop:4}}>
                          {isOverdue ? 'Ueberfaellig: ' : 'Faellig: '}{new Date(t.faellig).toLocaleDateString('de-DE')}
                        </div>}
                      </div>
                      <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c0c0c0',fontSize:16,padding:'0 4px',lineHeight:1}}>×</button>
                    </div>
                  )
                })
              )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Neue Aufgabe</div><span className="modal-close" onClick={()=>setModal(false)}>×</span></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Aufgabe *</label><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Was muss erledigt werden?"/></div>
              <div className="form-group"><label className="form-label">Beschreibung</label><textarea className="form-textarea" rows={2} value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})}/></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Faellig am</label><input className="form-input" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Prioritaet</label>
                  <select className="form-select" value={form.prioritaet} onChange={e=>setForm({...form,prioritaet:e.target.value})}>
                    {PRIOS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Bezug</label>
                  <select className="form-select" value={form.referenz_typ} onChange={e=>setForm({...form,referenz_typ:e.target.value,referenz_id:'',referenz_name:''})}>
                    <option value="">Kein Bezug</option><option value="client">Client</option><option value="lead">Lead</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">{form.referenz_typ==='client'?'Client':form.referenz_typ==='lead'?'Lead':'Person'}</label>
                  <select className="form-select" disabled={!form.referenz_typ} value={form.referenz_id} onChange={e=>setRef(form.referenz_typ,e.target.value)}>
                    <option value="">— waehlen —</option>
                    {form.referenz_typ==='client' ? clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>) : leads.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
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
