'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/leads', label: 'Leads', icon: '◎' },
  { href: '/clients', label: 'Clients', icon: '◈' },
  { href: '/kpis', label: 'KPI Tracker', icon: '◫' },
  { href: '/emails', label: 'Email Sequenz', icon: '◧' },
  { href: '/calls', label: 'Calls', icon: '◉' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Growth<span>Hub</span></div>
      {nav.map(n => (
        <Link key={n.href} href={n.href} className={`nav-item${path === n.href ? ' active' : ''}`}>
          <span style={{fontSize: '16px'}}>{n.icon}</span>
          {n.label}
        </Link>
      ))}
      <div style={{marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px'}}>
        <div style={{fontSize: '12px', color: 'var(--text-dim)'}}>Alex Heidrich</div>
        <div style={{fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px'}}>Growth Operator</div>
      </div>
    </div>
  )
}
