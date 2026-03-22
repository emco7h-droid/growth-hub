'use client'
import Sidebar from '../../components/Sidebar'

const callLinks = [
  { name: 'Discovery Call', duration: '30 Min', link: 'https://calendly.com/emco7h/discovery-call', color: 'var(--blue)' },
  { name: 'Onboarding Call', duration: '60 Min', link: 'https://calendly.com/emco7h/onboarding-call', color: 'var(--accent)' },
  { name: 'Strategy Call', duration: '60 Min', link: 'https://calendly.com/emco7h/strategy-call', color: 'var(--green)' },
  { name: 'Monthly Review', duration: '45 Min', link: 'https://calendly.com/emco7h/monthly-review', color: 'var(--amber)' },
  { name: 'Quick Call', duration: '15 Min', link: 'https://calendly.com/emco7h/quick-call', color: 'var(--text-muted)' },
]

export default function Calls() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div><h1 className="page-title">Calls</h1><p className="page-sub">Alle Calendly Links auf einen Blick</p></div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
          {callLinks.map((c, i) => (
            <div key={i} className="section-card" style={{cursor:'pointer'}} onClick={() => window.open(c.link, '_blank')}>
              <div style={{padding:'24px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                  <div style={{width:'12px', height:'12px', borderRadius:'50%', background:c.color}}></div>
                  <span className="badge badge-green">Aktiv</span>
                </div>
                <div style={{fontSize:'18px', fontWeight:700, fontFamily:'Syne', marginBottom:'4px'}}>{c.name}</div>
                <div style={{fontSize:'13px', color:'var(--text-muted)', marginBottom:'16px'}}>{c.duration}</div>
                <div style={{fontSize:'12px', color:'var(--blue-light)', wordBreak:'break-all'}}>{c.link}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
