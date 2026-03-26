'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const S = (d) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>

const NAV = [
  { g: null, items: [
    { href:'/dashboard', l:'Uebersicht', icon:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  ]},
  { g: 'CRM', items: [
    { href:'/clients', l:'Clients', icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/leads', l:'Leads', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { href:'/contacts', l:'Kontakte', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/pipeline', l:'Pipeline', icon:'M22 12h-4l-3 9L9 3l-3 9H2' },
    { href:'/tasks', l:'Aufgaben', icon:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  ]},
  { g: 'Berichte', items: [
    { href:'/analytics', l:'Statistiken', icon:'M18 20V10M12 20V4M6 20v-6', badge:'LIVE' },
    { href:'/kpis', l:'KPI Tracker', icon:'M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/reports', l:'Reports', icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  ]},
  { g: 'Kommunikation', items: [
    { href:'/calls', l:'Calls', icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' },
    { href:'/emails', l:'Email Sequenz', icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
    { href:'/calendar', l:'Kalender', icon:'M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM16 2v4M8 2v4M3 10h18' },
  ]},
  { g: 'Finanzen', items: [
    { href:'/invoices', l:'Rechnungen', icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6' },
  ]},
  { g: 'Tools', items: [
    { href:'/ai', l:'AI Center', icon:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', badge:'NEU' },
    { href:'/automations', l:'Automations', icon:'M13 2L3 14h9l-1 8 10-12h-9l1-8' },
    { href:'/settings', l:'Einstellungen', icon:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
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
        {NAV.map((s,si)=>(
          <div key={si} className="sb-sec">
            {s.g && <div className="sb-lbl">{s.g}</div>}
            {s.items.map(item=>(
              <Link key={item.href} href={item.href} className={`si${path===item.href||path.startsWith(item.href+'/')?' act':''}`}>
                {S(item.icon)}
                <span style={{flex:1}}>{item.l}</span>
                {item.badge && <span className={`si-badge${item.badge==='LIVE'?' red':''}`}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-footer">
        <div className="sb-user" onClick={logout} title="Abmelden">
          <div className="sb-avt">AH</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.9)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Alex Heidrich</div>
            <div style={{fontSize:10.5,color:'rgba(255,255,255,0.4)'}}>Growth Operator</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
    </div>
  )
}
