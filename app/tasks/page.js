'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const PRIOS = ['Hoch','Mittel','Niedrig']
const STATI = ['Offen','In Arbeit','Erledigt']
const CATS = ['Client Arbeit','Lead Follow-up','Content','Admin','Strategie','Sales']
const PRIO_COLORS = {'Hoch':['#fce8e6','#c0392b'],'Mittel':['#fff8e1','#b7860b'],'Niedrig':['#e0f5ee','#0a7c59']}
const STAT_COLORS = {'Offen':['#f4f6f8','#5c6370'],'In Arbeit':['#e3f0ff','#1565c0'],'Erledigt':['#e0f5ee','#0a7c59']}
const empty={titel:'',beschreibung:'',faellig:'',prioritaet:'Mittel',status:'Offen',kategorie:'Client Arbeit',client_name:''}

export default function Tasks() {
  const [tasks,setTasks]=useState([]);const [modal,setModal]=useState(false);const [form,setForm]=useState(empty)
  const [filter,setFilter]=useState('Alle');const [view,setView]=useState('list')
  const router=useRouter()
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return}})
    const saved=localStorage.getItem('gh_tasks');if(saved)setTasks(JSON.parse(saved))
  },[])
  const save=(t)=>{setTasks(t);localStorage.setItem('gh_tasks',JSON.stringify(t))}
  const add=()=>{if(!form.titel.trim())return;save([{...form,id:Date.now()},...tasks]);setModal(false);setForm(empty)}
  const toggle=(id)=>save(tasks.map(t=>t.id===id?{...t,status:t.status==='Erledigt'?'Offen':t.status==='Offen'?'In Arbeit':'Erledigt'}:t))
  const del=(id)=>save(tasks.filter(t=>t.id!==id))
  const filtered=filter==='Alle'?tasks:tasks.filter(t=>t.status===filter||t.kategorie===filter||t.prioritaet===filter)
  const overdue=tasks.filter(t=>t.faellig&&new Date(t.faellig)<new Date()&&t.status!=='Erledigt')

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Aufgaben</span><span style={{fontSize:12,color:'#9ba1ab'}}>{tasks.filter(t=>t.status!=='Erledigt').length} offen</span></div>
          <div className="tb-r">
            <div style={{display:'flex',background:'#f4f6f8',borderRadius:7,padding:2,gap:1}}>
              {[['list','☰'],['board','⊞']].map(([v,ic])=><button key={v} onClick={()=>setView(v)} style={{width:30,height:26,border:'none',borderRadius:5,cursor:'pointer',background:view===v?'#fff':'transparent',boxShadow:view===v?'0 1px 3px rgba(0,0,0,.1)':undefined,fontSize:14}}>{ic}</button>)}
            </div>
            <button className="btn-p" onClick={()=>setModal(true)}>+ Aufgabe</button>
          </div>
        </div>
        <div className="page">
          {overdue.length>0&&<div style={{background:'#fce8e6',border:'1px solid #f5c6c0',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#c0392b',display:'flex',alignItems:'center',gap:8}}>
            <span>⚠️</span><span><strong>{overdue.length} Aufgabe{overdue.length>1?'n':''}</strong> ueberfaellig: {overdue.map(t=>t.titel).join(', ')}</span>
          </div>}

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[['Gesamt',tasks.length,'#1565c0'],['Offen',tasks.filter(t=>t.status==='Offen').length,'#b7860b'],['In Arbeit',tasks.filter(t=>t.status==='In Arbeit').length,'#1565c0'],['Erledigt',tasks.filter(t=>t.status==='Erledigt').length,'#0a7c59']].map(([l,v,c])=>(
              <div key={l} className="metric" style={{padding:'12px 16px',cursor:'pointer'}} onClick={()=>setFilter(filter===l?'Alle':l)}>
                <div className="m-lbl">{l}</div>
                <div className="m-val" style={{fontSize:22,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
            {['Alle','Hoch','Mittel','Niedrig',...CATS].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{height:28,padding:'0 12px',borderRadius:20,border:'1px solid',fontSize:12,cursor:'pointer',fontFamily:'inherit',transition:'all .12s',
                background:filter===f?'#1565c0':'#fff',color:filter===f?'#fff':'#5c6370',borderColor:filter===f?'#1565c0':'#e1e4e8'}}>{f}</button>
            ))}
          </div>

          {view==='list'?(
            <div className="card">
              {filtered.length===0?<div className="empty"><p>Keine Aufgaben. Erstelle deine erste!</p></div>:
              filtered.map((t,i)=>{
                const [sb,st]=STAT_COLORS[t.status]||['#f4f6f8','#5c6370']
                const [pb,pt]=PRIO_COLORS[t.prioritaet]||['#f4f6f8','#9ba1ab']
                const isOver=t.faellig&&new Date(t.faellig)<new Date()&&t.status!=='Erledigt'
                return <div key={t.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 18px',borderBottom:i<filtered.length-1?'1px solid #f0f2f5':'none',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='#fafbfd'} onMouseOut={e=>e.currentTarget.style.background=''}>
                  <div onClick={()=>toggle(t.id)} style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.status==='Erledigt'?'#0a7c59':'#c5ccd4'}`,background:t.status==='Erledigt'?'#0a7c59':'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all .12s'}}>
                    {t.status==='Erledigt'&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {t.status==='In Arbeit'&&<div style={{width:6,height:6,borderRadius:'50%',background:'#1565c0'}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:500,textDecoration:t.status==='Erledigt'?'line-through':'none',color:t.status==='Erledigt'?'#9ba1ab':'#1a1a2e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.titel}</div>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
                      {t.kategorie&&<span style={{fontSize:10.5,padding:'1px 7px',borderRadius:20,background:'#f0f2f5',color:'#5c6370'}}>{t.kategorie}</span>}
                      {t.client_name&&<span style={{fontSize:10.5,color:'#1565c0',fontWeight:500}}>{t.client_name}</span>}
                      {t.beschreibung&&<span style={{fontSize:11,color:'#9ba1ab',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{t.beschreibung}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                    {t.faellig&&<span style={{fontSize:11,color:isOver?'#c0392b':'#9ba1ab',fontWeight:isOver?600:400}}>📅 {new Date(t.faellig).toLocaleDateString('de-DE')}</span>}
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:pb,color:pt,fontWeight:500}}>{t.prioritaet}</span>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:sb,color:st,fontWeight:500}}>{t.status}</span>
                    <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:16,padding:'2px 4px'}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#c5ccd4'}>×</button>
                  </div>
                </div>
              })}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {STATI.map(col=>{
                const [sb,st]=STAT_COLORS[col]
                return <div key={col} style={{background:'#f4f6f8',borderRadius:10,padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{fontSize:11.5,fontWeight:600,color:'#5c6370',textTransform:'uppercase',letterSpacing:'.06em'}}>{col}</span>
                    <span style={{background:sb,color:st,fontSize:10.5,padding:'1px 7px',borderRadius:10,fontWeight:600}}>{tasks.filter(t=>t.status===col).length}</span>
                  </div>
                  {tasks.filter(t=>t.status===col).map(t=>{
                    const [pb,pt]=PRIO_COLORS[t.prioritaet]||['#f4f6f8','#9ba1ab']
                    return <div key={t.id} className="kcard">
                      <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>{t.titel}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:10.5,padding:'1px 7px',borderRadius:20,background:pb,color:pt}}>{t.prioritaet}</span>
                        {t.faellig&&<span style={{fontSize:10.5,color:'#9ba1ab'}}>📅 {new Date(t.faellig).toLocaleDateString('de-DE')}</span>}
                      </div>
                      {t.client_name&&<div style={{fontSize:11,color:'#1565c0',marginTop:4}}>{t.client_name}</div>}
                    </div>
                  })}
                  {tasks.filter(t=>t.status===col).length===0&&<div style={{padding:'12px 0',textAlign:'center',fontSize:12,color:'#c5ccd4'}}>Leer</div>}
                </div>
              })}
            </div>
          )}
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neue Aufgabe</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fg"><label className="fl">Titel *</label><input className="fi" value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})} placeholder="Aufgabe beschreiben..."/></div>
          <div className="fg"><label className="fl">Beschreibung</label><textarea className="fta" value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})} rows={2} placeholder="Mehr Details..."/></div>
          <div className="fr">
            <div className="fg"><label className="fl">Prioritaet</label><select className="fsel" value={form.prioritaet} onChange={e=>setForm({...form,prioritaet:e.target.value})}>{PRIOS.map(p=><option key={p}>{p}</option>)}</select></div>
            <div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATI.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Kategorie</label><select className="fsel" value={form.kategorie} onChange={e=>setForm({...form,kategorie:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="fg"><label className="fl">Faellig am</label><input className="fi" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div>
          </div>
          <div className="fg"><label className="fl">Client (optional)</label><input className="fi" value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Name des zugehoerigen Clients..."/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={add}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
