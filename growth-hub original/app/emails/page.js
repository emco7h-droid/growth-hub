'use client'
import Sidebar from '../../components/Sidebar'

const sequence = [
  { day: 1, subject: "Willkommen. Du hast den ersten Schritt gemacht.", preview: "Was ist ein Growth Operator und wie kann ich dir wirklich helfen..." },
  { day: 2, subject: "Das Problem das die meisten haben.", preview: "Die meisten Menschen wissen was sie wollen aber handeln nicht..." },
  { day: 3, subject: "Wie ich einem Coaching Business in 30 Tagen geholfen habe.", preview: "Konkrete Fallstudie: Von 0 auf 5 zahlende Kunden in einem Monat..." },
  { day: 4, subject: "Der groesste Fehler den Coaches machen.", preview: "90% aller Coaches machen denselben Fehler. Er kostet Kunden, Geld und Zeit..." },
  { day: 5, subject: "Was du in 90 Tagen erreichen kannst.", preview: "Ich zeige dir konkret was in 90 Tagen moeglich ist wenn wir zusammenarbeiten..." },
  { day: 6, subject: "Eine Frage die ich dir stellen will.", preview: "Was haelt dich gerade davon ab dein Business auf das naechste Level zu bringen..." },
  { day: 7, subject: "Letzte Chance: Kostenloser Discovery Call.", preview: "Das ist die letzte Email dieser Sequenz. Wenn du bereit bist hier ist dein Link..." },
]

export default function Emails() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Email Sequenz</h1><p className="page-sub">7-Tage automatische Sequenz via Klaviyo</p></div>
          <span className="badge badge-green">Alle aktiv</span>
        </div>
        <div className="section-card">
          <div className="section-header"><span className="section-title">7-Tage Sequenz</span></div>
          {sequence.map((e, i) => (
            <div key={i} style={{padding:'18px 24px', borderBottom: i < sequence.length-1 ? '1px solid var(--border)' : 'none', display:'flex', alignItems:'center', gap:'16px'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(59,130,246,0.12)', color:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, flexShrink:0, fontFamily:'Syne'}}>T{e.day}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px', fontWeight:600}}>{e.subject}</div>
                <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'3px'}}>{e.preview}</div>
              </div>
              <span className="badge badge-green">Aktiv</span>
            </div>
          ))}
        </div>
        <div className="section-card">
          <div style={{padding:'24px'}}>
            <div style={{fontSize:'14px', color:'var(--text-muted)', marginBottom:'8px'}}>Verbunden mit Klaviyo</div>
            <div style={{fontSize:'13px', color:'var(--text-dim)'}}>Die Sequenz wird automatisch gestartet wenn ein neuer Subscriber in die Liste <strong style={{color:'var(--text)'}}>7-Tage Sequenz</strong> in Klaviyo eingetragen wird.</div>
          </div>
        </div>
      </main>
    </div>
  )
}
