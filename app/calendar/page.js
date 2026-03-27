'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Calendar() {
  const [events,setEvents]=useState([])
  const [date,setDate]=useState(new Date())
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({titel:'',datum:new Date().toISOString().split('T')[0],uhrzeit:'10:00',typ:'Call',notiz:''})
  const router=useRouter()
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return}})
    const saved=localStorage.getItem('gh_calendar'); if(saved)setEvents(JSON.parse(saved))
  },[])

  const save=(evts)=>{setEvents(evts);localStorage.setItem('gh_calendar',JSON.stringify(evts))}
  const addEvent=()=>{if(!form.titel.trim())return;save([{...form,id:Date.now()},...events]);setModal(false);setForm({titel:'',datum:new Date().toISOString().split('T')[0],uhrzeit:'10:00',typ:'Call',notiz:''})}
  const del=(id)=>save(events.filter(e=>e.id!==id))

  const year=date.getFullYear(), month=date.getMonth()
  const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate()
  const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
  const typeColors={'Call':'#5b9cf6','Meeting':'#a78bfa','Task':'#34d399','Deadline':'#ef4444','Sonstiges':'#9ba1ab'}

  const getDayEvents=(day)=>{
    const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e=>e.datum===d)
  }

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Kalender</span><span style={{fontSize:13,color:'#9ba1ab'}}>{monthNames[month]} {year}</span></div>
          <div className="tb-r">
            <button className="btn-s" style={{height:28,padding:'0 10px',fontSize:12}} onClick={()=>setDate(new Date(year,month-1,1))}>←</button>
            <button className="btn-s" style={{height:28,padding:'0 10px',fontSize:12}} onClick={()=>setDate(new Date())}>Heute</button>
            <button className="btn-s" style={{height:28,padding:'0 10px',fontSize:12}} onClick={()=>setDate(new Date(year,month+1,1))}>→</button>
            <button className="btn-p" onClick={()=>setModal(true)}>+ Termin</button>
          </div>
        </div>
        <div className="page">
          <div className="g21">
            <div className="card">
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #f0f2f5'}}>
                {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:11,fontWeight:600,color:'#9ba1ab'}}>{d}</div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
                {Array.from({length:(firstDay||7)-1}).map((_,i)=><div key={`e${i}`} style={{minHeight:80,border:'1px solid transparent',borderRight:'1px solid #f0f2f5',borderBottom:'1px solid #f0f2f5'}}/>)}
                {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
                  const dayEvents=getDayEvents(day)
                  const today=new Date();const isToday=day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()
                  return <div key={day} style={{minHeight:80,padding:'4px',border:'1px solid transparent',borderRight:'1px solid #f0f2f5',borderBottom:'1px solid #f0f2f5',background:isToday?'#e3f0ff':undefined}}>
                    <div style={{fontSize:12,fontWeight:isToday?700:500,color:isToday?'#1565c0':'#1a1a2e',marginBottom:3,width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:isToday?'#1565c0':undefined,color:isToday?'#fff':'#1a1a2e'}}>{day}</div>
                    {dayEvents.slice(0,2).map(e=><div key={e.id} style={{fontSize:10,background:typeColors[e.typ]||'#9ba1ab',color:'#fff',borderRadius:3,padding:'1px 4px',marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.uhrzeit} {e.titel}</div>)}
                    {dayEvents.length>2&&<div style={{fontSize:9,color:'#9ba1ab'}}>+{dayEvents.length-2} mehr</div>}
                  </div>
                })}
              </div>
            </div>
            <div>
              <div className="card" style={{marginBottom:14}}>
                <div className="ch"><div className="ct">Naechste Termine</div></div>
                {events.length===0?<div className="empty"><p>Keine Termine geplant.</p></div>:
                events.sort((a,b)=>a.datum>b.datum?1:-1).slice(0,8).map((e,i)=>(
                  <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:'1px solid #f0f2f5'}}>
                    <div style={{width:4,height:36,borderRadius:2,background:typeColors[e.typ]||'#9ba1ab',flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500}}>{e.titel}</div>
                      <div style={{fontSize:11,color:'#9ba1ab'}}>{e.datum} · {e.uhrzeit} · {e.typ}</div>
                    </div>
                    <button onClick={()=>del(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:15}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#c5ccd4'}>×</button>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="ch"><div className="ct">Calendly Links</div></div>
                <div className="cb">
                  {[['Discovery Call','30 Min'],['Onboarding','60 Min'],['Strategy','60 Min'],['Monthly Review','45 Min']].map(([n,d])=>(
                    <a key={n} href={`https://calendly.com/emco7h/${n.toLowerCase().replace(' ','-')}`} target="_blank" style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f0f2f5',fontSize:13,color:'var(--text)',textDecoration:'none'}}
                      onMouseOver={e=>e.currentTarget.style.color='#1565c0'} onMouseOut={e=>e.currentTarget.style.color='var(--text)'}>
                      <span>{n}</span><span style={{fontSize:11,color:'#9ba1ab'}}>{d}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Termin</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fg"><label className="fl">Titel *</label><input className="fi" value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})}/></div>
          <div className="fr">
            <div className="fg"><label className="fl">Datum</label><input className="fi" type="date" value={form.datum} onChange={e=>setForm({...form,datum:e.target.value})}/></div>
            <div className="fg"><label className="fl">Uhrzeit</label><input className="fi" type="time" value={form.uhrzeit} onChange={e=>setForm({...form,uhrzeit:e.target.value})}/></div>
          </div>
          <div className="fg"><label className="fl">Typ</label><select className="fsel" value={form.typ} onChange={e=>setForm({...form,typ:e.target.value})}><option>Call</option><option>Meeting</option><option>Task</option><option>Deadline</option><option>Sonstiges</option></select></div>
          <div className="fg"><label className="fl">Notiz</label><textarea className="fta" value={form.notiz} onChange={e=>setForm({...form,notiz:e.target.value})} rows={2}/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={addEvent}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
