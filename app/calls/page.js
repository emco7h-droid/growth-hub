'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const links=[{n:'Discovery Call',d:'30 Min',u:'https://calendly.com/emco7h/discovery-call',desc:'Erstes Kennenlernen und Bedarfsanalyse'},{n:'Onboarding Call',d:'60 Min',u:'https://calendly.com/emco7h/onboarding-call',desc:'Ziele, Struktur und ersten Aktionsplan festlegen'},{n:'Strategy Call',d:'60 Min',u:'https://calendly.com/emco7h/strategy-call',desc:'Tiefes Strategie-Review und Weiterentwicklung'},{n:'Monthly Review',d:'45 Min',u:'https://calendly.com/emco7h/monthly-review',desc:'Monatliches Review aller KPIs und Ergebnisse'},{n:'Quick Call',d:'15 Min',u:'https://calendly.com/emco7h/quick-call',desc:'Schnelle Rueckfragen und kurze Updates'}]
export default function Calls() {
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session)router.push('/login') }) },[])
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">Calls</span></div></div>
        <div className="page"><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {links.map((l,i)=><div key={i} className="card" style={{cursor:'pointer',transition:'all .18s'}} onClick={()=>window.open(l.u,'_blank')} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,0.1)'}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
            <div className="card-body"><div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span className="badge badge-gray">{l.d}</span><span className="badge badge-green">Aktiv</span></div><div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{l.n}</div><div style={{fontSize:12.5,color:'#5c6370',marginBottom:12,lineHeight:1.5}}>{l.desc}</div><div style={{fontSize:11,color:'#1565c0',wordBreak:'break-all'}}>{l.u}</div></div>
          </div>)}
        </div></div>
      </div>
    </div>
  )
}
