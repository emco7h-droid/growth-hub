'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const seq=[{d:1,s:'Willkommen — du hast den ersten Schritt gemacht',p:'Was ist ein Growth Operator und wie kann ich dir konkret helfen...'},{d:2,s:'Das Problem das die meisten Coaches haben',p:'90% aller Coaches machen denselben Fehler wenn sie wachsen wollen...'},{d:3,s:'Wie ich einem Client in 30 Tagen zu 5 Kunden verholfen habe',p:'Konkrete Fallstudie mit echten Zahlen und Strategien...'},{d:4,s:'Der groesste Fehler bei der Content-Strategie',p:'Warum mehr Content nicht gleich mehr Umsatz bedeutet...'},{d:5,s:'Was in 90 Tagen wirklich moeglich ist',p:'Realistische Ziele und wie wir gemeinsam dahin kommen...'},{d:6,s:'Eine Frage die ich dir stellen will',p:'Was haelt dich gerade davon ab dein Business zu skalieren?'},{d:7,s:'Letzte Chance: Kostenloser Discovery Call',p:'Buche jetzt deinen Call — nur noch wenige Plaetze frei...'}]
export default function Emails() {
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session)router.push('/login') }) },[])
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">E-Mail Sequenz</span></div><div className="topbar-right"><span className="badge badge-green">7 aktiv in Klaviyo</span></div></div>
        <div className="page"><div className="card">{seq.map((e,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 20px',borderBottom:i<seq.length-1?'1px solid #f0f2f5':'none'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'#e3f0ff',border:'1px solid #c5d8fd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11.5,fontWeight:600,color:'#1565c0',flexShrink:0}}>T{e.d}</div>
            <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:500}}>{e.s}</div><div style={{fontSize:12,color:'#9ba1ab',marginTop:2}}>{e.p}</div></div>
            <span className="badge badge-green" style={{fontSize:11}}>Aktiv</span>
          </div>
        ))}</div></div>
      </div>
    </div>
  )
}
