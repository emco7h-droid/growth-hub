'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const nav = [
  { section: 'MAIN', items: [
    { href:'/dashboard', label:'Dashboard', icon:'📊' },
    { href:'/clients', label:'Clients', icon:'👥', badge:'12', badgeClass:'bl' },
    { href:'/leads', label:'Leads', icon:'🎯', badge:'5', badgeClass:'' },
    { href:'/kpis', label:'KPI Tracker', icon:'📈' },
    { href:'/pipeline', label:'Pipeline', icon:'🔀' },
  ]},
  { section: 'KOMMUNIKATION', items: [
    { href:'/chat', label:'Chat', icon:'💬', badge:'3', badgeClass:'' },
    { href:'/calls', label:'Calls', icon:'📞' },
    { href:'/emails', label:'E-Mail Sequenz', icon:'📧' },
  ]},
  { section: 'AI & TOOLS', items: [
    { href:'/ai', label:'AI Center', icon:'🤖', badge:'NEU', badgeClass:'bl' },
    { href:'/automations', label:'Automations', icon:'⚡' },
    { href:'/reports', label:'Reports', icon:'📋' },
  ]},
  { section: 'SYSTEM', items: [
    { href:'/settings', label:'Settings', icon:'⚙️' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <div className="sb">
      <div className="logo-w">
        <div className="logo-ic">📈</div>
        <div className="logo-tx">Growth<span>Hub</span></div>
      </div>
      <div style={{flex:1,overflowY:'auto',paddingBottom:'8px'}}>
        {nav.map(s => (
          <div key={s.section} className="ns">
            <div className="nl">{s.section}</div>
            {s.items.map(item => (
              <Link key={item.href} href={item.href} className={`ni${path===item.href?' act':''}`}>
                <span className="ni-ic">{item.icon}</span>
                {item.label}
                {item.badge && <span className={`ni-bd ${item.badgeClass||''}`}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-ft">
        <div className="u-card" onClick={logout}>
          <div className="avt">AH</div>
          <div>
            <div style={{fontSize:'12.5px',fontWeight:600,color:'var(--text)'}}>Alex Heidrich</div>
            <div style={{fontSize:'11px',color:'var(--text-m)'}}>Growth Operator</div>
          </div>
          <div style={{marginLeft:'auto',fontSize:'12px',color:'var(--text-m)'}}>↩</div>
        </div>
      </div>
    </div>
  )
}
