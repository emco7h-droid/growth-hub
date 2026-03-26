'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const flows=[{n:'Calendly → Leads',desc:'Neue Buchung → Lead in Datenbank → Klaviyo Sequenz',status:'Aktiv',trigger:'Calendly Buchung',color:'#34d399'},{n:'Lead Gewonnen → Onboarding',desc:'Status "Gewonnen" → Welcome Email → Onboarding Calendar',status:'Aktiv',trigger:'Status Update',color:'#34d399'},{n:'7-Tage Email Sequenz',desc:'Neuer Lead → 7 automatische Emails in Klaviyo',status:'Aktiv',trigger:'Neuer Lead',color:'#34d399'},{n:'Monthly Report',desc:'Am 1. jeden Monats → KPI Report generieren',status:'Pause',trigger:'Zeitplan (monatlich)',color:'#f59e0b'},{n:'No Show Follow-up',desc:'No Show markiert → Automatische Folge-Email',status:'Entwurf',trigger:'Status "No Show"',color:'#9ba1ab'}]
export default function Automations() {
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')});},[])
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="tb-l"><span className="tb-title">Automations</span><span style={{fontSize:12,color:'#9ba1ab'}}>Make.com Workflows</span></div><div className="tb-r"><a href="https://make.com" target="_blank" className="btn-s">Make.com oeffnen</a></div></div>
        <div className="page">
          <div className="g3" style={{marginBottom:16}}>
            {[['Aktive Flows',flows.filter(f=>f.status==='Aktiv').length],['Gesamte Flows',flows.length],['Laeuft heute','—']].map(([l,v])=>(
              <div key={l} className="metric"><div className="m-lbl">{l}</div><div className="m-val">{v}</div></div>
            ))}
          </div>
          <div className="card">
            <div className="ch"><div className="ct">Meine Workflows</div><div className="csub">Verbunden mit Make.com (Org: 6899832)</div></div>
            {flows.map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:'1px solid #f0f2f5',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='#fafbfd'} onMouseOut={e=>e.currentTarget.style.background=''}>
                <div style={{width:10,height:10,borderRadius:'50%',background:f.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600}}>{f.n}</div>
                  <div style={{fontSize:12,color:'#9ba1ab',marginTop:2}}>{f.desc}</div>
                  <div style={{fontSize:11,color:'#9ba1ab',marginTop:2}}>Trigger: {f.trigger}</div>
                </div>
                <span className={`badge ${f.status==='Aktiv'?'bg':f.status==='Pause'?'ba':'bgr'}`} style={{fontSize:11}}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
