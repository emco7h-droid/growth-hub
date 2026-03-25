'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
export default function Reports() {
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')});},[])
  const reports=[{n:'Monatsreport März 2026',d:'Alle KPIs, Umsatz, Clients',t:'25.03.2026'},{n:'Wochenreport KW12',d:'Leads, Calls, Fortschritt',t:'23.03.2026'},{n:'Q1 2026 Zusammenfassung',d:'Quartalsbericht komplett',t:'01.03.2026'},{n:'Client Onboarding Report',d:'Neue Clients, Ziele, Setup',t:'15.02.2026'}]
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="tb-l"><span className="tb-title">Reports</span></div><div className="tb-r"><button className="btn-p">+ Neuer Report</button></div></div>
        <div className="page">
          <div className="card">
            <div className="ch"><div className="ct">Alle Reports</div><div className="csub">Gespeicherte Berichte und Zusammenfassungen</div></div>
            {reports.map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:'1px solid #f0f2f5',cursor:'pointer',transition:'background .12s'}} onMouseOver={e=>e.currentTarget.style.background='#fafbfd'} onMouseOut={e=>e.currentTarget.style.background=''}>
                <div style={{width:36,height:36,borderRadius:8,background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                </div>
                <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:500}}>{r.n}</div><div style={{fontSize:12,color:'#9ba1ab',marginTop:2}}>{r.d}</div></div>
                <div style={{fontSize:11,color:'#9ba1ab'}}>{r.t}</div>
                <button className="btn-s" style={{height:28,padding:'0 10px',fontSize:11}}>Oeffnen</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
