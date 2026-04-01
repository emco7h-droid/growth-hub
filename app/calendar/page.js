'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So']

function CalContent() {
  const { current } = useWorkspace()
  const [today] = useState(new Date())
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])

  // Real events from your Google Calendar (hardcoded from API response)
  const gcalEvents = [
    {d:'2026-03-30',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-03-31',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-04-01',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-04-01',title:'Russisch Unterricht',time:'19:00',type:'Kurs',color:'#6b4bc8'},
    {d:'2026-04-02',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-04-03',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-04-07',title:'Schule',time:'07:45',type:'Schule',color:'#9ba1ab'},
    {d:'2026-04-08',title:'Russisch Unterricht',time:'19:00',type:'Kurs',color:'#6b4bc8'},
    {d:'2026-04-15',title:'Russisch Unterricht',time:'19:00',type:'Kurs',color:'#6b4bc8'},
  ]

  const wsColor = current?.color||'#1565c0'

  // Build calendar grid
  const firstDay = new Date(year,month,1)
  const lastDay = new Date(year,month+1,0)
  const startDow = (firstDay.getDay()+6)%7 // Mon=0
  const cells = []
  for(let i=0;i<startDow;i++) cells.push(null)
  for(let d=1;d<=lastDay.getDate();d++) cells.push(d)

  const getEventsForDay = (day) => {
    if(!day) return []
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return gcalEvents.filter(e=>e.d===dateStr)
  }

  const isToday = (day) => day && today.getDate()===day && today.getMonth()===month && today.getFullYear()===year

  // Upcoming events
  const upcoming = gcalEvents.filter(e=>{
    const d = new Date(e.d)
    const t = new Date()
    t.setHours(0,0,0,0)
    return d>=t
  }).slice(0,6)

  return (
    <div className="page">
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        {/* Calendar */}
        <div className="card">
          <div className="ch">
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1)}} className="btn-s" style={{height:28,padding:'0 10px'}}>‹</button>
              <span style={{fontSize:16,fontWeight:600,minWidth:160,textAlign:'center'}}>{MONTHS[month]} {year}</span>
              <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1)}} className="btn-s" style={{height:28,padding:'0 10px'}}>›</button>
            </div>
            <a href="https://calendar.google.com" target="_blank" className="btn-s" style={{fontSize:12}}>Google Kalender</a>
          </div>
          <div className="cb" style={{padding:'0 16px 16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:8}}>
              {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:11.5,fontWeight:600,color:'#9ba1ab',padding:'6px 0'}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
              {cells.map((day,i)=>{
                const evts = getEventsForDay(day)
                return (
                  <div key={i} style={{minHeight:68,padding:'4px',borderRadius:6,background:isToday(day)?`${wsColor}12`:day?'transparent':'transparent',border:isToday(day)?`2px solid ${wsColor}`:'1px solid transparent',transition:'background .12s',cursor:day?'pointer':'default'}}
                    onMouseOver={e=>{if(day&&!isToday(day))e.currentTarget.style.background='#f4f6f8'}}
                    onMouseOut={e=>{if(day&&!isToday(day))e.currentTarget.style.background='transparent'}}>
                    {day && <>
                      <div style={{fontSize:12.5,fontWeight:isToday(day)?700:400,color:isToday(day)?wsColor:'#1a1a2e',marginBottom:2,textAlign:'center'}}>{day}</div>
                      {evts.map((ev,j)=>(
                        <div key={j} style={{fontSize:9.5,padding:'1px 4px',borderRadius:3,background:ev.color+'20',color:ev.color,fontWeight:500,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {ev.time} {ev.title}
                        </div>
                      ))}
                    </>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <div className="card">
            <div className="ch"><div className="ct">Naechste Termine</div></div>
            <div className="cb">
              {upcoming.length===0 ? <div style={{fontSize:13,color:'#9ba1ab',textAlign:'center',padding:'10px 0'}}>Keine Termine</div> :
              upcoming.map((ev,i)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 0',borderBottom:i<upcoming.length-1?'1px solid #f0f2f5':'none'}}>
                  <div style={{width:4,height:36,borderRadius:2,background:ev.color,flexShrink:0,marginTop:2}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{ev.title}</div>
                    <div style={{fontSize:11.5,color:'#9ba1ab'}}>{ev.d.split('-').reverse().join('.')} · {ev.time} Uhr</div>
                    <span style={{fontSize:10.5,padding:'1px 6px',borderRadius:4,background:`${ev.color}20`,color:ev.color,fontWeight:600}}>{ev.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{marginTop:14}}>
            <div className="ch"><div className="ct">Verbunden mit</div></div>
            <div className="cb">
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'4px 0'}}>
                <div style={{width:32,height:32,borderRadius:8,background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📅</div>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>Google Kalender</div>
                  <div style={{fontSize:11.5,color:'#0a7c59'}}>emco7h@gmail.com ✓</div>
                </div>
              </div>
              <div style={{fontSize:12,color:'#9ba1ab',marginTop:8,lineHeight:1.6}}>Fuer Client-Workspaces kannst du in Einstellungen einen separaten Calendly Link hinterlegen.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar/>
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">Kalender</span></div>
            <div className="tb-r"><a href="https://calendar.google.com" target="_blank" className="btn-p" style={{textDecoration:'none'}}>+ Termin erstellen</a></div>
          </div>
          <CalContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
