'use client'
import Sidebar from '@/components/Sidebar'
const links=[{name:'Discovery Call',dur:'30 Min',url:'https://calendly.com/emco7h/discovery-call',color:'var(--blue-4)'},{name:'Onboarding Call',dur:'60 Min',url:'https://calendly.com/emco7h/onboarding-call',color:'var(--purple)'},{name:'Strategy Call',dur:'60 Min',url:'https://calendly.com/emco7h/strategy-call',color:'var(--green)'},{name:'Monthly Review',dur:'45 Min',url:'https://calendly.com/emco7h/monthly-review',color:'var(--amber)'},{name:'Quick Call',dur:'15 Min',url:'https://calendly.com/emco7h/quick-call',color:'var(--text-m)'}]
export default function Calls() {
  return (
    <div style={{display:'flex'}}><Sidebar/>
      <div className="mc">
        <div className="tb"><div className="tb-title">Calls</div><div style={{fontSize:12,color:'var(--text-m)'}}>Alle Calendly Links auf einen Blick</div></div>
        <div className="ct">
          <div className="g2">
            {links.map((l,i)=>(
              <div key={i} className="sc" style={{cursor:'pointer',transition:'all .2s'}} onClick={()=>window.open(l.url,'_blank')}>
                <div className="cb">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <div style={{width:12,height:12,borderRadius:'50%',background:l.color}}></div>
                    <span className="bdg bg-g">Aktiv</span>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,fontFamily:'Syne',marginBottom:4}}>{l.name}</div>
                  <div style={{fontSize:13,color:'var(--text-m)',marginBottom:16}}>{l.dur}</div>
                  <div style={{fontSize:12,color:'var(--blue-4)',wordBreak:'break-all'}}>{l.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
