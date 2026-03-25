'use client'
import Sidebar from '@/components/Sidebar'
const seq=[{day:1,s:"Willkommen. Du hast den ersten Schritt gemacht.",p:"Was ist ein Growth Operator und wie kann ich dir helfen..."},{day:2,s:"Das Problem das die meisten haben.",p:"Die meisten wissen was sie wollen aber handeln nicht..."},{day:3,s:"Wie ich einem Coaching Business in 30 Tagen geholfen habe.",p:"Konkrete Fallstudie: Von 0 auf 5 zahlende Kunden..."},{day:4,s:"Der groesste Fehler den Coaches machen.",p:"90% aller Coaches machen denselben Fehler..."},{day:5,s:"Was du in 90 Tagen erreichen kannst.",p:"Ich zeige dir konkret was moeglich ist..."},{day:6,s:"Eine Frage die ich dir stellen will.",p:"Was haelt dich davon ab dein Business zu wachsen..."},{day:7,s:"Letzte Chance: Kostenloser Discovery Call.",p:"Wenn du bereit bist hier ist dein Link..."}]
export default function Emails() {
  return (
    <div style={{display:'flex'}}><Sidebar/>
      <div className="mc">
        <div className="tb"><div className="tb-title">E-Mail Sequenz</div><span className="bdg bg-g">7 aktiv</span></div>
        <div className="ct">
          <div className="sc">
            <div className="ch"><span className="ct-t">7-Tage Sequenz</span><div style={{fontSize:12,color:'var(--text-m)'}}>Verbunden mit Klaviyo</div></div>
            {seq.map((e,i)=>(
              <div key={i} style={{padding:'16px 20px',borderBottom:i<seq.length-1?'1px solid var(--border)':'none',display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'var(--blue-1)',color:'var(--blue-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0,fontFamily:'Syne'}}>T{e.day}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600}}>{e.s}</div>
                  <div style={{fontSize:12,color:'var(--text-m)',marginTop:3}}>{e.p}</div>
                </div>
                <span className="bdg bg-g">Aktiv</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
