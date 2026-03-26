'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const calls = [
  { name:'Discovery Call', dur:'30 Min', url:'https://calendly.com/emco7h/discovery-call', color:'#1565c0', bg:'#e3f0ff',
    desc:'Erstes Kennenlernen und Bedarfsanalyse. Wir besprechen deine aktuelle Situation, Ziele und ob wir zusammenpassen.',
    steps:['Rapport aufbauen (5 Min)','Aktuelle Situation (10 Min)','Ziele und Wuensche (10 Min)','Naechste Schritte (5 Min)'],
    stats:{booked:47,done:41,conversion:'87%'} },
  { name:'Onboarding Call', dur:'60 Min', url:'https://calendly.com/emco7h/onboarding-call', color:'#0a7c59', bg:'#e0f5ee',
    desc:'Kickoff des Zusammenarbeit. Gemeinsam definieren wir Ziele, Strategie und die ersten 30-Tage Aktionen.',
    steps:['Erwartungen klaeren (10 Min)','Ziele setzen (20 Min)','Strategie entwickeln (20 Min)','Quick Wins identifizieren (10 Min)'],
    stats:{booked:12,done:12,conversion:'100%'} },
  { name:'Strategy Call', dur:'60 Min', url:'https://calendly.com/emco7h/strategy-call', color:'#6b4bc8', bg:'#f0ebfd',
    desc:'Tiefes Strategie-Review und Weiterentwicklung. Analyse der bisherigen Ergebnisse und Anpassung der Strategie.',
    steps:['KPI Review (15 Min)','Analyse Was funktioniert (15 Min)','Neue Strategie (20 Min)','Action Items (10 Min)'],
    stats:{booked:28,done:26,conversion:'93%'} },
  { name:'Monthly Review', dur:'45 Min', url:'https://calendly.com/emco7h/monthly-review', color:'#b7860b', bg:'#fff8e1',
    desc:'Monatliches Review aller KPIs und Ergebnisse. Wir messen Fortschritt und planen den naechsten Monat.',
    steps:['Zahlen auswerten (15 Min)','Erfolge feiern (10 Min)','Probleme loesen (10 Min)','Naechster Monat (10 Min)'],
    stats:{booked:18,done:16,conversion:'89%'} },
  { name:'Quick Call', dur:'15 Min', url:'https://calendly.com/emco7h/quick-call', color:'#5c6370', bg:'#f4f6f8',
    desc:'Schnelle Rueckfragen und kurze Updates. Fuer dringende Themen zwischen den regulaeren Calls.',
    steps:['Problem erlaeutern (5 Min)','Loesung besprechen (7 Min)','Naechste Schritte (3 Min)'],
    stats:{booked:22,done:22,conversion:'100%'} },
]

export default function Calls() {
  const [expanded,setExpanded]=useState(null)
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')});},[])

  const total=calls.reduce((s,c)=>s+c.stats.booked,0)
  const done=calls.reduce((s,c)=>s+c.stats.done,0)

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Calls</span><span style={{fontSize:12,color:'#9ba1ab'}}>Alle Calendly Event Types</span></div>
          <div className="tb-r"><a href="https://calendly.com/emco7h" target="_blank" className="btn-p">Calendly oeffnen</a></div>
        </div>
        <div className="page">
          {/* Stats row */}
          <div className="g4" style={{marginBottom:20}}>
            {[['Gesamt Calls','callsstats',total],['Abgehalten',null,done],['Conversion',null,`${Math.round((done/total)*100)||0}%`],['Naechste Woche',null,'—']].map(([l,,v],i)=>(
              <div key={i} className="metric" style={{padding:'14px 16px'}}>
                <div className="m-lbl">{l}</div>
                <div className="m-val" style={{fontSize:22}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Call cards */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {calls.map((c,i)=>(
              <div key={i} className="card" style={{overflow:'hidden',transition:'all .2s',cursor:'pointer'}} onClick={()=>setExpanded(expanded===i?null:i)}>
                <div style={{display:'flex',alignItems:'center',gap:16,padding:'16px 20px'}}>
                  <div style={{width:46,height:46,borderRadius:12,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3}}>
                      <span style={{fontSize:15,fontWeight:600}}>{c.name}</span>
                      <span className="badge bgr" style={{fontSize:11}}>{c.dur}</span>
                      <span className="badge bg" style={{fontSize:11}}>Aktiv</span>
                    </div>
                    <div style={{fontSize:12.5,color:'#5c6370'}}>{c.desc}</div>
                  </div>
                  <div style={{display:'flex',align:'center',gap:16,flexShrink:0}}>
                    <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:600,color:c.color}}>{c.stats.booked}</div><div style={{fontSize:10,color:'#9ba1ab'}}>Gebucht</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:600,color:'#0a7c59'}}>{c.stats.conversion}</div><div style={{fontSize:10,color:'#9ba1ab'}}>Rate</div></div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round" style={{transform:expanded===i?'rotate(180deg)':'none',transition:'transform .2s'}}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
                {expanded===i&&(
                  <div style={{borderTop:`1px solid ${c.bg}`,background:c.bg+'40',padding:'16px 20px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <div>
                        <div style={{fontSize:11.5,fontWeight:600,color:'#5c6370',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Call Ablauf</div>
                        {c.steps.map((s,j)=>(
                          <div key={j} style={{display:'flex',gap:10,marginBottom:8,alignItems:'flex-start'}}>
                            <div style={{width:20,height:20,borderRadius:'50%',background:c.bg,border:`1.5px solid ${c.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:700,color:c.color,flexShrink:0}}>{j+1}</div>
                            <span style={{fontSize:13}}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{fontSize:11.5,fontWeight:600,color:'#5c6370',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Quick Actions</div>
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          <a href={c.url} target="_blank" className="btn-p" style={{justifyContent:'center',textDecoration:'none',background:c.color}}>Link kopieren</a>
                          <a href={c.url} target="_blank" className="btn-s" style={{justifyContent:'center',textDecoration:'none'}}>Calendly oeffnen →</a>
                          <div style={{fontSize:11,color:'#9ba1ab',wordBreak:'break-all',padding:'6px 10px',background:'#f4f6f8',borderRadius:6}}>{c.url}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
