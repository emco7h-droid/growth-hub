'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const features = [
  { id:'copy', icon:'✍️', name:'AI Copywriter', desc:'E-Mails, Ads und Content automatisch erstellen', color:'#1565c0', bg:'#e3f0ff',
    examples:['Discovery Call Follow-up Email schreiben','Instagram Werbeanzeige fuer Coaching erstellen','Cold Outreach DM Vorlage erstellen'],
    system:'Du bist ein erfahrener Growth Operator Copywriter. Erstelle professionellen, hochkonvertierenden Marketing-Content auf Deutsch. Sei konkret und praxisnah.' },
  { id:'score', icon:'🎯', name:'Lead Scoring', desc:'KI analysiert und bewertet Leads mit 1-10 Punktzahl', color:'#6b4bc8', bg:'#f0ebfd',
    examples:['Lead analysieren: Max Mustermann, Fitness Coaching, Budget 2k','Welche Leads soll ich heute priorisieren?','Top Leads diese Woche bewerten'],
    system:'Du bist ein Lead-Scoring Experte. Analysiere den Lead und gib eine Bewertung 1-10 mit konkreter Begruendung und naechsten Schritten auf Deutsch.' },
  { id:'call', icon:'📞', name:'Call Vorbereitung', desc:'Strukturierte Gesprächsleitfäden und Fragen erstellen', color:'#0a7c59', bg:'#e0f5ee',
    examples:['Discovery Call Leitfaden erstellen','Einwand-Handling fuer zu teuer','Strategy Call Agenda fuer Monat 2'],
    system:'Du bist ein Sales-Coach. Erstelle einen strukturierten Gesprächsleitfaden mit Fragen und moeglichen Einwaenden auf Deutsch.' },
  { id:'forecast', icon:'📊', name:'Prognose Engine', desc:'Revenue-Forecasts und Wachstumsszenarien erstellen', color:'#b7860b', bg:'#fff8e1',
    examples:['Revenue Forecast fuer naechste 3 Monate','Was waere wenn ich 2 neue Clients gewinne?','Breakeven-Analyse berechnen'],
    system:'Du bist ein Business-Analyst. Erstelle eine detaillierte, realistische Prognose mit konkreten Zahlen und Szenarien auf Deutsch.' },
  { id:'content', icon:'📱', name:'Content Strategie', desc:'Social Media Strategie und Content-Ideen', color:'#c0392b', bg:'#fce8e6',
    examples:['30-Tage Content Plan erstellen','5 virale Hook-Ideen fuer LinkedIn','TikTok Skript fuer Angebot erstellen'],
    system:'Du bist ein Social Media Stratege fuer Growth Operatoren. Erstelle konkrete, umsetzbare Content-Ideen auf Deutsch.' },
  { id:'onboard', icon:'🚀', name:'Onboarding Assistent', desc:'Onboarding-Materialien und Welcome-Dokumente', color:'#1565c0', bg:'#e3f0ff',
    examples:['Welcome Email fuer neuen Client schreiben','90-Tage Onboarding Plan erstellen','Fragebogen fuer Discovery-Phase'],
    system:'Du bist ein Onboarding-Experte. Erstelle professionelle, strukturierte Materialien auf Deutsch.' },
]

function AIContent() {
  const [active, setActive] = useState(null)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])

  const run = async () => {
    if (!input.trim() || !active) return
    setLoading(true); setOutput('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `${active.system}\n\nAufgabe: ${input}` }]
        })
      })
      const data = await res.json()
      if (data.error) { setOutput(`Fehler: ${data.error}`); setLoading(false); return }
      setOutput(data.text || '')
      setHistory(h => [{ feature: active.name, input, output: data.text, time: new Date().toLocaleTimeString('de-DE') }, ...h.slice(0, 4)])
    } catch (e) { setOutput('Netzwerkfehler: ' + e.message) }
    setLoading(false)
  }

  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {features.map(f => (
          <div key={f.id} onClick={() => { setActive(f); setInput(''); setOutput('') }}
            style={{ background: '#fff', border: active?.id === f.id ? `2px solid ${f.color}` : '1px solid #e1e4e8', borderRadius: 10, padding: 18, cursor: 'pointer', transition: 'all .15s', boxShadow: active?.id === f.id ? `0 0 0 3px ${f.bg}` : undefined }}
            onMouseOver={e => { if (active?.id !== f.id) e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { if (active?.id !== f.id) e.currentTarget.style.borderColor = '#e1e4e8'; e.currentTarget.style.transform = '' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
              {active?.id === f.id && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: '#5c6370', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {active && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="ch" style={{ background: active.bg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{active.icon}</span>
                <div><div className="ct">{active.name}</div><div className="csub">{active.desc}</div></div>
              </div>
            </div>
            <div className="cb">
              <div className="fg">
                <label className="fl">Deine Anfrage</label>
                <textarea className="fta" value={input} onChange={e => setInput(e.target.value)} rows={5} placeholder={`Was soll die KI tun?`} style={{ minHeight: 120 }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Beispiele:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {active.examples.map((ex, i) => (
                    <button key={i} onClick={() => setInput(ex)}
                      style={{ fontSize: 11.5, padding: '4px 10px', background: '#f4f6f8', border: '1px solid #e1e4e8', borderRadius: 20, cursor: 'pointer', color: '#5c6370', transition: 'all .12s', fontFamily: 'inherit' }}
                      onMouseOver={e => { e.target.style.background = active.bg; e.target.style.borderColor = active.color; e.target.style.color = active.color }}
                      onMouseOut={e => { e.target.style.background = '#f4f6f8'; e.target.style.borderColor = '#e1e4e8'; e.target.style.color = '#5c6370' }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-p" onClick={run} disabled={loading} style={{ background: active.color }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    KI arbeitet...
                  </span>
                ) : 'Ausfuehren →'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="ch">
              <div className="ct">Ergebnis</div>
              {output && <button className="btn-s" style={{ fontSize: 11, height: 26, padding: '0 10px' }} onClick={() => navigator.clipboard?.writeText(output)}>Kopieren</button>}
            </div>
            <div className="cb">
              {loading ? <div style={{ color: '#9ba1ab', padding: '20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #e1e4e8', borderTopColor: active.color, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                KI generiert Antwort...
              </div> :
                output ? <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{output}</div> :
                  <div style={{ color: '#9ba1ab', fontSize: 13, padding: '20px 0' }}>Ergebnis erscheint hier.</div>}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function AI() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">AI Center</span><span style={{ fontSize: 12, color: '#9ba1ab' }}>6 KI-Tools</span></div>
            <div className="tb-r"><span className="badge bb">Powered by Claude</span></div>
          </div>
          <AIContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
