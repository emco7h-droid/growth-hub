'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const features = [
  { id:'copy', name:'AI Copywriter', desc:'E-Mails, Ads und Content generieren', prompt:'Du bist ein erfahrener Growth Operator Copywriter. Erstelle professionellen Marketing-Content auf Deutsch.' },
  { id:'score', name:'Lead Scoring', desc:'KI bewertet und priorisiert Leads', prompt:'Du bist ein Lead-Scoring Experte. Analysiere diesen Lead und gib eine Bewertung von 1-10 mit Begruendung.' },
  { id:'call', name:'Call Vorbereitung', desc:'Gesprächsleitfaden erstellen', prompt:'Du bist ein Sales-Coach. Erstelle einen strukturierten Gesprächsleitfaden fuer einen Discovery Call.' },
  { id:'forecast', name:'Prognose Engine', desc:'Revenue Forecast erstellen', prompt:'Du bist ein Business-Analyst. Erstelle eine realistische Umsatzprognose basierend auf den angegebenen Daten.' },
]

export default function AI() {
  const [active, setActive] = useState(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; setUser(session.user) }) },[])

  const run = async () => {
    if (!input.trim() || !active) return
    setLoading(true); setOutput('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:`${active.prompt}\n\nAufgabe: ${input}`}] })
      })
      const data = await res.json()
      setOutput(data.content?.[0]?.text || 'Fehler aufgetreten')
    } catch(e) { setOutput('Fehler: '+e.message) }
    setLoading(false)
  }

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left"><span className="topbar-title">AI Center</span></div>
          <div className="topbar-right"><span className="badge badge-blue">Beta</span></div>
        </div>
        <div className="page">
          <div className="grid-2" style={{marginBottom:20}}>
            {features.map(f=>(
              <div key={f.id} className="card" style={{cursor:'pointer',border:active?.id===f.id?'2px solid #1a1a1a':'1px solid #e3e3e3'}} onClick={()=>{setActive(f);setOutput('')}}>
                <div className="card-body" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{f.name}</div><div style={{fontSize:12,color:'#6b6b6b'}}>{f.desc}</div></div>
                  {active?.id===f.id && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
            ))}
          </div>
          {active && (
            <div className="card">
              <div className="card-header"><div className="card-title">{active.name}</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Deine Anfrage</label>
                  <textarea className="form-textarea" value={input} onChange={e=>setInput(e.target.value)} rows={4} placeholder={`Was soll die KI fuer "${active.name}" tun?`}/>
                </div>
                <button className="topbar-btn btn-primary" onClick={run} disabled={loading}>{loading?'KI arbeitet...':'Ausfuehren'}</button>
                {output && <div style={{marginTop:20,background:'#f6f6f7',borderRadius:8,padding:20,border:'1px solid #e3e3e3'}}>
                  <div style={{fontSize:11,fontWeight:600,color:'#9b9b9b',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:10}}>Ergebnis</div>
                  <div style={{fontSize:14,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{output}</div>
                </div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
