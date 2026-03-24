'use client'
import Sidebar from '@/components/Sidebar'
const seq=[{day:1,s:"Willkommen. Du hast den ersten Schritt gemacht.",p:"Was ist ein Growth Operator und wie kann ich dir helfen..."},{day:2,s:"Das Problem das die meisten haben.",p:"Die meisten wissen was sie wollen aber handeln nicht..."},{day:3,s:"Wie ich einem Coaching Business in 30 Tagen geholfen habe.",p:"Konkrete Fallstudie: Von 0 auf 5 zahlende Kunden..."},{day:4,s:"Der groesste Fehler den Coaches machen.",p:"90% aller Coaches machen denselben Fehler..."},{day:5,s:"Was du in 90 Tagen erreichen kannst.",p:"Ich zeige dir konkret was in 90 Tagen moeglich ist..."},{day:6,s:"Eine Frage die ich dir stellen will.",p:"Was haelt dich gerade davon ab dein Business zu wachsen..."},{day:7,s:"Letzte Chance: Kostenloser Discovery Call.",p:"Das ist die letzte Email. Wenn du bereit bist hier ist dein Link..."}]
export default function Emails() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <main className="mc">
        <div className="ph"><div><h1 className="pt">Email Sequenz</h1><p className="ps">7-Tage automatische Sequenz via Klaviyo</p></div><span className="badge b-green">Alle aktiv</span></div>
        <div className="sc">{seq.map((e,i)=><div key={i} style={{padding:'18px 24px',borderBottom:i<seq.length-1?'1px solid var(--border)':'none',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(59,130,246,.12)',color:'var(--blue-l)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,flexShrink:0,fontFamily:'Syne'}}>T{e.day}</div>
          <div style={{flex:1}}><div style={{fontSize:'14px',fontWeight:600}}>{e.s}</div><div style={{fontSize:'12px',color:'var(--muted)',marginTop:'3px'}}>{e.p}</div></div>
          <span className="badge b-green">Aktiv</span>
        </div>)}</div>
        <div className="sc" style={{marginTop:'0'}}><div style={{padding:'24px'}}><div style={{fontSize:'14px',color:'var(--muted)',marginBottom:'8px'}}>Verbunden mit Klaviyo</div><div style={{fontSize:'13px',color:'var(--dim)'}}>Die Sequenz startet automatisch wenn ein neuer Subscriber in die Liste <strong style={{color:'var(--text)'}}>7-Tage Sequenz</strong> eingetragen wird.</div></div></div>
      </main>
    </div>
  )
}
