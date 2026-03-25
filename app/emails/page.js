'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const seq = [
  {day:1, s:'Willkommen — du hast den ersten Schritt gemacht', p:'Was ist ein Growth Operator und wie ich dir konkret helfen kann...'},
  {day:2, s:'Das Problem das die meisten Coaches haben', p:'90% aller Coaches machen denselben Fehler wenn sie wachsen wollen...'},
  {day:3, s:'Wie ich einem Client in 30 Tagen zu 5 Kunden verholfen habe', p:'Konkrete Fallstudie mit echten Zahlen und Strategien...'},
  {day:4, s:'Der groesste Fehler bei der Content-Strategie', p:'Warum mehr Content nicht gleich mehr Umsatz bedeutet...'},
  {day:5, s:'Was in 90 Tagen wirklich moeglich ist', p:'Realistische Ziele und wie wir gemeinsam dahin kommen...'},
  {day:6, s:'Eine Frage die ich dir stellen will', p:'Was haelt dich gerade davon ab dein Business zu skalieren?'},
  {day:7, s:'Letzte Chance: Kostenloser Discovery Call', p:'Buche jetzt deinen Call — nur noch wenige Plaetze frei...'},
]

export default function Emails() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; setUser(session.user) }) },[])

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left"><span className="topbar-title">E-Mail Sequenz</span></div>
          <div className="topbar-right"><span className="badge badge-green">7 aktiv in Klaviyo</span></div>
        </div>
        <div className="page">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">7-Tage Onboarding Sequenz</div>
                <div className="card-subtitle">Automatisch ueber Klaviyo versendet</div>
              </div>
            </div>
            {seq.map((e,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:16,padding:'14px 20px',borderBottom:i<seq.length-1?'1px solid #f0f0f0':'none'}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'#f6f6f7',border:'1px solid #e3e3e3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:'#6b6b6b',flexShrink:0}}>T{e.day}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600}}>{e.s}</div>
                  <div style={{fontSize:12,color:'#9b9b9b',marginTop:2}}>{e.p}</div>
                </div>
                <span className="badge badge-green" style={{fontSize:11}}>Aktiv</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
