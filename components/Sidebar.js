'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const I = (d) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>

const nav = [
  { g:null, items:[
    { href:'/dashboard', label:'Uebersicht', icon:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  ]},
  { g:'CRM', items:[
    { href:'/clients', label:'Clients', icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/leads', label:'Leads', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { href:'/pipeline', label:'Pipeline', icon:'M3 6h18M3 12h18M3 18h11' },
    { href:'/tasks', label:'Aufgaben', icon:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  ]},
  { g:'Berichte', items:[
    { href:'/kpis', label:'KPI Tracker', icon:'M18 20V10M12 20V4M6 20v-6' },
  ]},
  { g:'Kommunikation', items:[
    { href:'/calls', label:'Calls', icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' },
    { href:'/emails', label:'Email Sequenz', icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
  ]},
  { g:'Tools', items:[
    { href:'/ai', label:'AI Center', icon:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', badge:'NEU' },
    { href:'/settings', label:'Einstellungen', icon:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <span className="sidebar-logo-text">Growth Hub</span>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}>
        {nav.map((s,si)=>(
          <div key={si} className="sidebar-section">
            {s.g && <div className="sidebar-section-label">{s.g}</div>}
            {s.items.map(item=>(
              <Link key={item.href} href={item.href} className={`sidebar-item${path===item.href||path.startsWith(item.href+'/')?' active':''}`}>
                {I(item.icon)}
                <span style={{flex:1}}>{item.label}</span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Abmelden">
          <div className="sidebar-avatar">AH</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:500,color:'rgba(255,255,255,0.9)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Alex Heidrich</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>Growth Operator</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
    </div>
  )
}
