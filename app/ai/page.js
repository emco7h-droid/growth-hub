'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

const features = [
  {icon:'✍️',name:'AI Copywriter',desc:'E-Mails und Ads automatisch generieren',color:'var(--blue-4)',bg:'var(--blue-1)'},
  {icon:'🎯',name:'Lead Scoring',desc:'KI bewertet und priorisiert deine Leads',color:'var(--purple)',bg:'#f3e8ff'},
  {icon:'📞',name:'Call Analyse',desc:'Transkription und Insights aus Calls',color:'var(--green)',bg:'#dcfce7'},
  {icon:'📊',name:'Prognose Engine',desc:'Revenue Forecast mit KI',color:'var(--amber)',bg:'#fef9c3'},
]

export default function AI() {
  const [active, setActive] = useState(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!input.trim() || !active) return
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{role:'user', content: `Du bist ein Growth Operator AI Assistent. Feature: ${active.name}. Aufgabe: ${input}`}]
        })
      })
      const data = await res.json()
      setOutput(data.content?.[0]?.text || 'Fehler aufgetreten')
    } catch(e) { setOutput('Fehler: ' + e.message) }
    setLoading(false)
  }

  return (
    <div style={{display:'flex'}}><Sidebar/>
      <div className="mc">
        <div className="tb"><div><div className="tb-title">AI Center</div><div style={{fontSize:12,color:'var(--text-m)'}}>KI-gestuetzte Tools fuer Growth Operatoren</div></div><span className="bdg bg-b">BETA</span></div>
        <div className="ct">
          <div className="g2" style={{marginBottom:24}}>
            {features.map((f,i)=>(
              <div key={i} className="sc" style={{cursor:'pointer',border:active?.name===f.name?'2px solid var(--blue-4)':'1px solid var(--border)',transition:'all .2s'}} onClick={()=>setActive(f)}>
                <div className="cb" style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:48,height:48,borderRadius:14,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{f.icon}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:'Syne'}}>{f.name}</div>
                    <div style={{fontSize:13,color:'var(--text-m)',marginTop:4}}>{f.desc}</div>
                  </div>
                  {active?.name===f.name&&<span style={{marginLeft:'auto',fontSize:20}}>✓</span>}
                </div>
              </div>
            ))}
          </div>
          {active && (
            <div className="sc">
              <div className="ch"><span className="ct-t">{active.icon} {active.name}</span></div>
              <div className="cb">
                <div className="fg">
                  <label className="fl">Deine Anfrage</label>
                  <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} placeholder={`Was soll die KI fuer "${active.name}" tun?`}/>
                </div>
                <button className="btn-p" onClick={run} disabled={loading}>{loading?'KI arbeitet...':'KI starten →'}</button>
                {output && (
                  <div style={{marginTop:20,background:'var(--bg)',borderRadius:12,padding:20,border:'1px solid var(--border)'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--text-m)',marginBottom:10,fontFamily:'Syne',textTransform:'uppercase',letterSpacing:'.06em'}}>AI Ergebnis</div>
                    <div style={{fontSize:14,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{output}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
