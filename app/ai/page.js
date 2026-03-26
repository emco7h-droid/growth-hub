'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const features = [
  { id:'copy', icon:'✍️', name:'AI Copywriter', desc:'Erstelle hochkonvertierende E-Mails, Ads und Content automatisch', color:'#1565c0', bg:'#e3f0ff',
    examples:['Discovery Call Follow-up Email','Instagram Werbeanzeige fuer Coaching','Cold Outreach DM Vorlage'],
    prompt:'Du bist ein erfahrener Growth Operator Copywriter. Erstelle professionellen, hochkonvertierenden Marketing-Content auf Deutsch. Sei konkret und praxisnah.' },
  { id:'score', icon:'🎯', name:'Lead Scoring', desc:'KI analysiert und bewertet jeden Lead mit einer 1-10 Punktzahl', color:'#6b4bc8', bg:'#f0ebfd',
    examples:['Lead analysieren: Name, Nische, Budget, Interesse','Welche Leads soll ich heute priorisieren?','Top 3 Leads diese Woche bewerten'],
    prompt:'Du bist ein Lead-Scoring Experte fuer Growth Operatoren. Analysiere diesen Lead und gib eine Bewertung von 1-10 mit konkreter Begruendung und naechsten Schritten.' },
  { id:'call', icon:'📞', name:'Call Vorbereitung', desc:'Strukturierte Gesprächsleitfäden und Fragen fuer jeden Call-Typ', color:'#0a7c59', bg:'#e0f5ee',
    examples:['Discovery Call Leitfaden erstellen','Einwand-Handling fuer "zu teuer"','Strategy Call Agenda fuer Monat 2'],
    prompt:'Du bist ein Sales-Coach spezialisiert auf Coaching Businesses. Erstelle einen strukturierten Gesprächsleitfaden mit konkreten Fragen und moeglichen Einwaenden.' },
  { id:'forecast', icon:'📊', name:'Prognose Engine', desc:'KI-gestuetzte Revenue-Forecasts und Wachstumsszenarien', color:'#b7860b', bg:'#fff8e1',
    examples:['Revenue Forecast fuer naechste 3 Monate','Was waere wenn ich 2 neue Clients gewinne?','Breakeven-Analyse berechnen'],
    prompt:'Du bist ein Business-Analyst spezialisiert auf Growth Operator Agenturen. Erstelle eine detaillierte, realistische Prognose mit konkreten Zahlen und Szenarien.' },
  { id:'content', icon:'📱', name:'Content Strategie', desc:'Social Media Strategie und Content-Ideen fuer deine Nische', color:'#c0392b', bg:'#fce8e6',
    examples:['30-Tage Content Plan erstellen','5 virale Hook-Ideen fuer LinkedIn','TikTok Skript fuer Discovery Call Angebot'],
    prompt:'Du bist ein Social Media Stratege fuer Growth Operatoren. Erstelle konkrete, umsetzbare Content-Ideen die Leads generieren.' },
  { id:'onboard', icon:'🚀', name:'Onboarding Assistent', desc:'Perfekte Onboarding-Materialien und Welcome-Dokumente erstellen', color:'#1565c0', bg:'#e3f0ff',
    examples:['Welcome Email fuer neuen Client','90-Tage Onboarding Plan erstellen','Fragebogen fuer Discovery-Phase'],
    prompt:'Du bist ein Onboarding-Experte fuer Coaching Agenturen. Erstelle professionelle, strukturierte Onboarding-Materialien die Clients begeistern.' },
]

export default function AI() {
  const [active,setActive]=useState(null);const [input,setInput]=useState('');const [output,setOutput]=useState('');const [loading,setLoading]=useState(false);const [history,setHistory]=useState([])
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')});},[])

  const run = async () => {
    if(!input.trim()||!active)return;setLoading(true);setOutput('')
    try {
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:`${active.prompt}\n\nAufgabe: ${input}`}]})})
      const data=await res.json();const text=data.content?.[0]?.text||'Fehler'
      setOutput(text);setHistory(h=>[{feature:active.name,input,output:text,time:new Date().toLocaleTimeString('de-DE')},...h.slice(0,4)])
    } catch(e){setOutput('Fehler: '+e.message)}
    setLoading(false)
  }

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">AI Center</span><span style={{fontSize:12,color:'#9ba1ab'}}>6 KI-Tools fuer Growth Operatoren</span></div>
          <div className="tb-r"><span className="badge bb">Beta · Powered by Claude</span></div>
        </div>
        <div className="page">
          {/* Feature Cards Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {features.map(f=>(
              <div key={f.id} onClick={()=>{setActive(f);setInput('');setOutput('')}} style={{background:'#fff',border:active?.id===f.id?`2px solid ${f.color}`:'1px solid #e1e4e8',borderRadius:10,padding:18,cursor:'pointer',transition:'all .15s',boxShadow:active?.id===f.id?`0 0 0 3px ${f.bg}`:undefined}}
                onMouseOver={e=>{if(active?.id!==f.id)e.currentTarget.style.borderColor=f.color;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}}
                onMouseOut={e=>{if(active?.id!==f.id)e.currentTarget.style.borderColor='#e1e4e8';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:10,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{f.icon}</div>
                  {active?.id===f.id&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4,color:'#1a1a2e'}}>{f.name}</div>
                <div style={{fontSize:12,color:'#5c6370',lineHeight:1.5}}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Active Tool Panel */}
          {active && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="card">
                <div className="ch" style={{background:active.bg,borderBottom:`1px solid ${active.color}20`}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>{active.icon}</span>
                    <div><div className="ct">{active.name}</div><div className="csub">{active.desc}</div></div>
                  </div>
                </div>
                <div className="cb">
                  <div className="fg">
                    <label className="fl">Deine Anfrage</label>
                    <textarea className="fta" value={input} onChange={e=>setInput(e.target.value)} rows={5} placeholder={`Was soll die KI fuer "${active.name}" tun?`} style={{minHeight:120}}/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Beispiele zum Klicken:</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {active.examples.map((ex,i)=>(
                        <button key={i} onClick={()=>setInput(ex)} style={{fontSize:11.5,padding:'4px 10px',background:'#f4f6f8',border:'1px solid #e1e4e8',borderRadius:20,cursor:'pointer',color:'#5c6370',transition:'all .12s',fontFamily:'inherit'}}
                          onMouseOver={e=>{e.target.style.background=active.bg;e.target.style.borderColor=active.color;e.target.style.color=active.color}}
                          onMouseOut={e=>{e.target.style.background='#f4f6f8';e.target.style.borderColor='#e1e4e8';e.target.style.color='#5c6370'}}>
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="btn-p" onClick={run} disabled={loading} style={{background:active.color}}>
                    {loading?'KI arbeitet...':'Ausfuehren →'}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="ch"><div className="ct">Ergebnis</div>{output&&<button className="btn-s" style={{fontSize:11,height:26,padding:'0 10px'}} onClick={()=>{navigator.clipboard?.writeText(output)}}>Kopieren</button>}</div>
                <div className="cb">
                  {loading?<div style={{display:'flex',alignItems:'center',gap:10,color:'#9ba1ab',padding:'20px 0'}}><div style={{width:16,height:16,border:'2px solid #e1e4e8',borderTopColor:active.color,borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>KI generiert Antwort...</div>:
                  output?<div style={{fontSize:13.5,lineHeight:1.8,whiteSpace:'pre-wrap',color:'#1a1a2e'}}>{output}</div>:
                  <div style={{color:'#9ba1ab',fontSize:13,padding:'20px 0'}}>Ergebnis erscheint hier — waehle eine Vorlage oder schreibe deine eigene Anfrage.</div>}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {history.length>0&&!active&&(
            <div className="card" style={{marginTop:16}}>
              <div className="ch"><div className="ct">Zuletzt verwendet</div></div>
              {history.map((h,i)=>(
                <div key={i} style={{padding:'12px 18px',borderBottom:'1px solid #f0f2f5',cursor:'pointer'}} onClick={()=>{const f=features.find(f=>f.name===h.feature);if(f){setActive(f);setInput(h.input);setOutput(h.output)}}}>
                  <div style={{fontSize:13,fontWeight:500}}>{h.feature} · <span style={{fontWeight:400,color:'#9ba1ab'}}>{h.time}</span></div>
                  <div style={{fontSize:12,color:'#5c6370',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.input}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
