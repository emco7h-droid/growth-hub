'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const PRIOS = ['Hoch','Mittel','Niedrig']
const STATI = ['Offen','In Arbeit','Erledigt']
const CATS = ['Client Arbeit','Lead Follow-up','Content','Admin','Strategie']
const PRIO_C = {'Hoch':'badge-red','Mittel':'badge-amber','Niedrig':'badge-green'}
const empty = {titel:'',beschreibung:'',faellig:'',prioritaet:'Mittel',status:'Offen',kategorie:'Client Arbeit',client_name:''}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [filterStatus, setFilterStatus] = useState('')
  const router = useRouter()

  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return} })
    // Load from localStorage for now (no DB table yet)
    const saved = localStorage.getItem('gh_tasks')
    if (saved) setTasks(JSON.parse(saved))
  },[])

  const saveTasks = (t) => { setTasks(t); localStorage.setItem('gh_tasks', JSON.stringify(t)) }
  const addTask = () => { if(!form.titel.trim())return; saveTasks([{...form,id:Date.now()},...tasks]); setModal(false); setForm(empty) }
  const toggleStatus = (id) => { saveTasks(tasks.map(t=>t.id===id?{...t,status:t.status==='Erledigt'?'Offen':'Erledigt'}:t)) }
  const del = (id) => saveTasks(tasks.filter(t=>t.id!==id))

  const filtered = tasks.filter(t=>!filterStatus||t.status===filterStatus)
  const open = tasks.filter(t=>t.status!=='Erledigt').length
  const done = tasks.filter(t=>t.status==='Erledigt').length

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">Aufgaben</span><span style={{fontSize:12.5,color:'#9ba1ab'}}>{open} offen</span></div><div className="topbar-right"><button className="btn-primary" onClick={()=>setModal(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Aufgabe</button></div></div>
        <div className="page">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[['Offen',open,'badge-amber'],['In Arbeit',tasks.filter(t=>t.status==='In Arbeit').length,'badge-blue'],['Erledigt',done,'badge-green'],['Gesamt',tasks.length,'badge-gray']].map(([l,v,b])=>(
              <div key={l} className="metric"><div className="metric-label">{l}</div><div className="metric-value">{v}</div></div>
            ))}
          </div>
          <div className="filter-row">
            {STATI.map(s=><button key={s} className={filterStatus===s?'btn-primary':'btn-secondary'} style={{height:30,fontSize:12}} onClick={()=>setFilterStatus(filterStatus===s?'':s)}>{s}</button>)}
          </div>
          <div className="card">
            {filtered.length===0?<div className="empty"><p>Keine Aufgaben. Erstelle deine erste!</p></div>:(
              filtered.map((t,i)=>(
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<filtered.length-1?'1px solid #f0f2f5':'none',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='#fafbfd'} onMouseOut={e=>e.currentTarget.style.background=''}>
                  <input type="checkbox" checked={t.status==='Erledigt'} onChange={()=>toggleStatus(t.id)} style={{width:16,height:16,cursor:'pointer',accentColor:'#1565c0',flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:500,textDecoration:t.status==='Erledigt'?'line-through':'none',color:t.status==='Erledigt'?'#9ba1ab':'#1a1a2e'}}>{t.titel}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
                      {t.kategorie&&<span className="tag-gray" style={{fontSize:10.5}}>{t.kategorie}</span>}
                      {t.client_name&&<span style={{fontSize:11,color:'#1565c0'}}>{t.client_name}</span>}
                      {t.faellig&&<span style={{fontSize:11,color:new Date(t.faellig)<new Date()&&t.status!=='Erledigt'?'#c0392b':'#9ba1ab'}}>Faellig: {new Date(t.faellig).toLocaleDateString('de-DE')}</span>}
                    </div>
                  </div>
                  <span className={`badge ${PRIO_C[t.prioritaet]}`} style={{fontSize:11,flexShrink:0}}>{t.prioritaet}</span>
                  <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:16,padding:'2px 6px',flexShrink:0}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#c5ccd4'}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neue Aufgabe</span><span className="mc-x" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fg"><label className="fl">Titel *</label><input className="fi" value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})} placeholder="Aufgabe beschreiben..."/></div>
          <div className="fr"><div className="fg"><label className="fl">Prioritaet</label><select className="fsel" value={form.prioritaet} onChange={e=>setForm({...form,prioritaet:e.target.value})}>{PRIOS.map(p=><option key={p}>{p}</option>)}</select></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATI.map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Kategorie</label><select className="fsel" value={form.kategorie} onChange={e=>setForm({...form,kategorie:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div><div className="fg"><label className="fl">Faelligkeitsdatum</label><input className="fi" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Zugehöriger Client</label><input className="fi" value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Name des Clients..."/></div>
        </div>
        <div className="mf"><button className="btn-secondary" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-primary" onClick={addTask}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
