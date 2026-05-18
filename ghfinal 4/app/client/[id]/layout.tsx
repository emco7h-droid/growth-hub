'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClientProvider, useClientData } from '@/lib/clientContext'

const NAV_CLIENT = [
  { key: 'leads', label: 'Leads', emoji: '👥' },
  { key: 'pipeline', label: 'Pipeline', emoji: '📊' },
  { key: 'tasks', label: 'Aufgaben', emoji: '✓' },
  { key: 'calendar', label: 'Kalender', emoji: '📅' },
  { key: 'goals', label: 'Ziele & Fortschritt', emoji: '🎯' },
  { key: 'emails', label: 'Email Sequenzen', emoji: '✉' },
  { key: 'settings', label: 'Einstellungen', emoji: '⚙' },
]

const NAV_PERSONAL = [
  { key: 'leads', label: 'Meine Leads', emoji: '🎯' },
  { key: 'pipeline', label: 'Pipeline', emoji: '📊' },
  { key: 'tasks', label: 'Aufgaben', emoji: '✓' },
  { key: 'calendar', label: 'Kalender', emoji: '📅' },
  { key: 'settings', label: 'Einstellungen', emoji: '⚙' },
]

function Sidebar({ id }: { id: string }) {
  const pathname = usePathname()
  const { client } = useClientData()
  const [mobileOpen, setMobileOpen] = useState(false)

  const color = client?.color || '#6366f1'
  const isPersonal = client?.is_personal
  const NAV = isPersonal ? NAV_PERSONAL : NAV_CLIENT
  const activeKey = pathname?.split('/').pop()

  const SidebarContent = () => (
    <>
      <div style={{ padding: '14px 14px 0' }}>
        <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#bbb', marginBottom: 14, textDecoration: 'none' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {isPersonal ? 'Dashboard' : 'Alle Clients'}
        </Link>
        {client && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: `${color}08`, borderRadius: 10, border: `1px solid ${color}20`, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
              {client.name?.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
              <div style={{ fontSize: 10.5, color: '#bbb', marginTop: 1 }}>{isPersonal ? 'Mein Workspace' : (client.nische || 'Growth Hub')}</div>
            </div>
          </div>
        )}
      </div>
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = activeKey === item.key
          return (
            <Link key={item.key} href={`/client/${id}/${item.key}`} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
              background: active ? `${color}12` : 'transparent', color: active ? color : '#555',
              transition: 'background 0.1s, color 0.1s',
            }}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center', opacity: active ? 1 : 0.5 }}>{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }} className="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile header */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 16px', height: 52, alignItems: 'center', justifyContent: 'space-between' }} className="mobile-header">
        <Link href="/" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}>← Alle Clients</Link>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{client?.name || ''}</span>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555' }}>☰</button>
      </div>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.1)' }}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}

export default function ClientLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  return (
    <ClientProvider id={params.id}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f5' }}>
        <Sidebar id={params.id} />
        <main style={{ flex: 1, minWidth: 0, paddingTop: 0 }} className="client-main">
          {children}
        </main>
      </div>
    </ClientProvider>
  )
}
