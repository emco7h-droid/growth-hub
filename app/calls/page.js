'use client'
import Sidebar from '@/components/Sidebar'
const links=[{name:'Discovery Call',dur:'30 Min',url:'https://calendly.com/emco7h/discovery-call',c:'var(--blue)'},{name:'Onboarding Call',dur:'60 Min',url:'https://calendly.com/emco7h/onboarding-call',c:'#6366F1'},{name:'Strategy Call',dur:'60 Min',url:'https://calendly.com/emco7h/strategy-call',c:'var(--green)'},{name:'Monthly Review',dur:'45 Min',url:'https://calendly.com/emco7h/monthly-review',c:'var(--amber)'},{name:'Quick Call',dur:'15 Min',url:'https://calendly.com/emco7h/quick-call',c:'var(--muted)'}]
export default function Calls() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <main className="mc">
        <div className="ph"><div><h1 className="pt">Calls</h1><p className="ps">Alle Calendly Links</p></div></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          {links.map((l,i)=><div key={i} className="sc" style={{cursor:'pointer'}} onClick={()=>window.open(l.url,'_blank')}>
            <div style={{padding:'24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:l.c}}></div><span className="badge b-green">Aktiv</span></div>
              <div style={{fontSize:'18px',fontWeight:700,fontFamily:'Syne',marginBottom:'4px'}}>{l.name}</div>
              <div style={{fontSize:'13px',color:'var(--muted)',marginBottom:'16px'}}>{l.dur}</div>
              <div style={{fontSize:'12px',color:'var(--blue-l)',wordBreak:'break-all'}}>{l.url}</div>
            </div>
          </div>)}
        </div>
      </main>
    </div>
  )
}
