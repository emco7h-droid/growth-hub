'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const features=[{id:'copy',n:'AI Copywriter',d:'E-Mails, Ads und Content generieren',p:'Du bist ein erfahrener Growth Operator Copywriter. Erstelle professionellen Marketing-Content auf Deutsch.'},{id:'score',n:'Lead Scoring',d:'KI bewertet und priorisiert Leads',p:'Du bist ein Lead-Scoring Experte. Analysiere diesen Lead und vergib eine Bewertung von 1-10 mit Begruendung.'},{id:'call',n:'Call Vorbereitung',d:'Gesprächsleitfaden erstellen',p:'Du bist ein Sales-Coach. Erstelle einen strukturierten Gesprächsleitfaden fuer einen Discovery Call.'},{id:'forecast',n:'Prognose Engine',d:'Revenue Forecast erstellen',p:'Du bist ein Business-Analyst. Erstelle eine realistische Umsatzprognose basierend auf den Daten.'}]
export default function AI() {
  const [active,setActive]=useState(null); const [input,setInput]=useState(''); const [output,setOutput]=useState(''); const [loading,setLoading]=useState(false)
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session)router.push('/login') }) },[])
  const run = async () => {
    if(!input.trim()||!active)return; setLoading(true); setOutput('')
    try { const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:`${active.p}\n\nAufgabe: ${input}`}]})}); const data=await res.json(); setOutput(data.content?.[0]?.text||'Fehler') } catch(e){setOutput('Fehler: '+e.message)}
    setLoading(false)
  }
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">AI Center</span></div><div className="topbar-right"><span className="badge badge-blue">Beta</span></div></div>
        <div className="page">
          <div className="g2" style={{marginBottom:16}}>
            {features.map(f=><div key={f.id} className="card" style={{cursor:'pointer',border:active?.id===f.id?'2px solid #1565c0':'1px solid #e1e4e8',transition:'all .15s'}} onClick={()=>{setActive(f);setOutput('')}} onMouseOver={e=>active?.id!==f.id&&(e.currentTarget.style.borderColor='#c5d8fd')} onMouseOut={e=>active?.id!==f.id&&(e.currentTarget.style.borderColor='#e1e4e8')}>
              <div className="card-body" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><div style={{fontSize:14,fontWeight:600,marginBottom:3}}>{f.n}</div><div style={{fontSize:12.5,color:'#5c6370'}}>{f.d}</div></div>
                {active?.id===f.id&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>)}
          </div>
          {active&&<div className="card"><div className="card-header"><div className="card-title">{active.n}</div></div><div className="card-body">
            <div className="fg"><label className="fl">Deine Anfrage</label><textarea className="fta" value={input} onChange={e=>setInput(e.target.value)} rows={4} placeholder={`Was soll die KI fuer "${active.n}" tun?`}/></div>
            <button className="btn-primary" onClick={run} disabled={loading}>{loading?'KI arbeitet...':'Ausfuehren'}</button>
            {output&&<div style={{marginTop:16,background:'#f4f6f8',borderRadius:8,padding:18,border:'1px solid #e1e4e8'}}><div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Ergebnis</div><div style={{fontSize:13.5,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{output}</div></div>}
          </div></div>}
        </div>
      </div>
    </div>
  )
}
