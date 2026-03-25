'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const links = [
  { name:'Discovery Call', dur:'30 Min', url:'https://calendly.com/emco7h/discovery-call', desc:'Erstes Kennenlernen und Bedarfsanalyse' },
  { name:'Onboarding Call', dur:'60 Min', url:'https://calendly.com/emco7h/onboarding-call', desc:'Struktur, Ziele und ersten Aktionsplan' },
  { name:'Strategy Call', dur:'60 Min', url:'https://calendly.com/emco7h/strategy-call', desc:'Tiefes Strategie-Review und Weiterentwicklung' },
  { name:'Monthly Review', dur:'45 Min', url:'https://calendly.com/emco7h/monthly-review', desc:'Monatliches Review der KPIs und Ergebnisse' },
  { name:'Quick Call', dur:'15 Min', url:'https://calendly.com/emco7h/quick-call', desc:'Kurze Rueckfragen und schnelle Updates' },
]

export default function Calls() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; setUser(session.user) }) },[])

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left"><span className="topbar-title">Calls</span><span style={{fontSize:13,color:'#9b9b9b'}}>Alle Calendly Links</span></div>
        </div>
        <div className="page">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
            {links.map((l,i)=>(
              <div key={i} className="card" style={{cursor:'pointer',transition:'box-shadow .15s'}} onClick={()=>window.open(l.url,'_blank')}
                onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={e=>e.currentTarget.style.boxShadow=''}>
                <div className="card-body">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <span className="badge badge-gray" style={{fontSize:11}}>{l.dur}</span>
                    <span className="badge badge-green">Aktiv</span>
                  </div>
                  <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>{l.name}</div>
                  <div style={{fontSize:12,color:'#6b6b6b',marginBottom:14,lineHeight:1.5}}>{l.desc}</div>
                  <div style={{fontSize:11,color:'#2c6ecb',wordBreak:'break-all'}}>{l.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
