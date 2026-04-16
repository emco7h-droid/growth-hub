'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

const PLACEHOLDER = [
  { key: 'leads', label: 'Leads', emoji: '👥' },
  { key: 'pipeline', label: 'Pipeline', emoji: '📊' },
  { key: 'tasks', label: 'Aufgaben', emoji: '✓' },
  { key: 'calendar', label: 'Kalender', emoji: '📅' },
  { key: 'goals', label: 'Ziele & Fortschritt', emoji: '🎯' },
  { key: 'emails', label: 'Email Sequenzen', emoji: '✉' },
  { key: 'settings', label: 'Einstellungen', emoji: '⚙' },
]

export default function ClientLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const pathname = usePathname()
  const [client, setClient] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.from('workspaces').select('*').eq('id', params.id).single().then(({ data }) => { if (data) setClient(data) })
    // eslint-disable-next-line
  }, [params.id])

  const color = client?.color || '#6366f1'
  const isPersonal = client?.is_personal
  const NAV = isPersonal ? NAV_PERSONAL : NAV_CLIENT
  const activeKey = pathname?.split('/').pop()

  const SidebarContent = () => (
    <>
      <div style={{ padding: '14px 14px 0' }}>
        <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#bbb', marginBottom: 14, textDecoration: 'none' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          ${isPersonal ? 'Dashboard' : 'Alle Clients'}
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
            <Link key={item.key} href={`/client/${params.id}/${item.key}`} onClick={() => setMobileOpen(false)} style={{
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
      <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>AH</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>Alex Heidrich</div>
            <div style={{ fontSize: 10, color: '#bbb' }}>Growth Operator</div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f7f5' }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop" style={{ width: 220, background: '#fff', borderRight: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 240, background: '#fff', display: 'flex', flexDirection: 'column' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: '1px solid #eaeaea', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, gap: 12 }}>
          {/* Mobile hamburger */}
          <button className="mobile-nav" onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none', alignItems: 'center', gap: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {client && <span className="mobile-nav" style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', display: 'none' }}>{client.name}</span>}
          <div style={{ flex: 1 }} />
          {client && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: 99, background: (!client.status || client.status === 'Aktiv') ? '#22c55e' : '#f59e0b' }} />
              <span style={{ fontSize: 11.5, color: '#bbb' }}>{client.status || 'Aktiv'}</span>
              {client.retainer ? <><span style={{ color: '#e0e0e0' }}>·</span><span style={{ fontSize: 11.5, color: '#bbb', fontWeight: 600 }}>€{Number(client.retainer).toLocaleString('de')} / Mo.</span></> : null}
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eaeaea', display: 'none', zIndex: 100, padding: '6px 0 env(safe-area-inset-bottom)' }}>
          {NAV.slice(0, 5).map(item => {
            const active = activeKey === item.key
            return (
              <Link key={item.key} href={`/client/${params.id}/${item.key}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', textDecoration: 'none', color: active ? color : '#aaa' }}>
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 600 : 400 }}>{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
