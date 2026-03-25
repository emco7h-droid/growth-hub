'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const nav = [
  { group: null, items: [
    { href:'/dashboard', label:'Uebersicht', d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  ]},
  { group: 'CRM', items: [
    { href:'/clients', label:'Clients', d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/leads', label:'Leads', d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { href:'/pipeline', label:'Pipeline', d:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { href:'/kpis', label:'KPI Tracker', d:'M18 20V10M12 20V4M6 20v-6' },
  ]},
  { group: 'Arbeit', items: [
    { href:'/tasks', label:'Aufgaben', d:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { href:'/calls', label:'Calls', d:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' },
    { href:'/emails', label:'Email Sequenz', d:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
    { href:'/planner', label:'Content Planer', d:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  ]},
  { group: 'Analyse', items: [
    { href:'/reports', label:'Reports', d:'M18 20V10M12 20V4M6 20v-6' },
    { href:'/ai', label:'AI Center', d:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', badge:'NEU' },
  ]},
  { group: 'System', items: [
    { href:'/settings', label:'Einstellungen', d:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33h-.15a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ]},
]

export default function Sidebar({ user }) {
  const path = usePathname()
  const router = useRouter()
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div className="sidebar-logo-text">Growth Hub</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'6px 0'}}>
        {nav.map((section,si) => (
          <div key={si} className="sidebar-section">
            {section.group && <div className="sidebar-section-label">{section.group}</div>}
            {section.items.map(item => (
              <Link key={item.href} href={item.href} className={`sidebar-item${path===item.href||path.startsWith(item.href+'/')?' active':''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.d}/>
                </svg>
                <span>{item.label}</span>
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
            <div style={{fontSize:12.5,fontWeight:500,color:'#d0d0d0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Alex Heidrich</div>
            <div style={{fontSize:11,color:'#606060'}}>Growth Operator</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
      </div>
    </div>
  )
}
