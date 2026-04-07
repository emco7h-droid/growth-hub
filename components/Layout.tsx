'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase, type Workspace } from '@/lib/supabase'

export const WorkspaceContext = createContext<Workspace | null>(null)
export const useWorkspace = () => useContext(WorkspaceContext)

const NAV = [
  { label: 'Agency CRM', children: [{ href: '/leads', label: 'Leads' }, { href: '/pipeline', label: 'Pipeline' }, { href: '/contacts', label: 'Kontakte' }] },
  { label: 'Operations', children: [{ href: '/content', label: 'Content Kalender' }, { href: '/tasks', label: 'Aufgaben' }, { href: '/calls', label: 'Calls' }] },
  { label: 'Berichte', children: [{ href: '/dashboard', label: 'Übersicht' }, { href: '/kpis', label: 'KPIs' }, { href: '/reports', label: 'Reports' }, { href: '/invoices', label: 'Rechnungen' }] },
  { label: 'Einstellungen', children: [{ href: '/settings', label: 'Workspace' }, { href: '/automations', label: 'Automationen' }] },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWs, setActiveWs] = useState<Workspace | null>(null)
  const [wsOpen, setWsOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Agency CRM', 'Berichte'])
  const [notifications, setNotifications] = useState(0)
  const isPortal = pathname?.startsWith('/portal')

  useEffect(() => { loadWorkspaces(); loadNotifications() }, [])

  async function loadWorkspaces() {
    const { data } = await supabase.from('workspaces').select('*').order('created_at')
    if (data && data.length > 0) {
      setWorkspaces(data)
      const saved = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspace') : null
      const found = saved ? data.find((w: Workspace) => w.id === saved) : null
      setActiveWs(found || data[0])
    }
  }

  async function loadNotifications() {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('gelesen', false)
    setNotifications(count || 0)
  }

  function switchWorkspace(ws: Workspace) {
    setActiveWs(ws)
    if (typeof window !== 'undefined') localStorage.setItem('activeWorkspace', ws.id)
    setWsOpen(false)
  }

  function toggleSection(label: string) {
    setOpenSections(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label])
  }

  if (isPortal) return <>{children}</>

  const color = activeWs?.color || '#6366f1'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fafafa', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <aside style={{ width: 216, background: '#fff', borderRight: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Workspace Switcher */}
        <div style={{ padding: '14px 12px 0', position: 'relative' }}>
          <button onClick={() => setWsOpen(!wsOpen)} style={{ width: '100%', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 10, padding: '9px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {activeWs?.name?.substring(0, 2).toUpperCase() || 'GH'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeWs?.name || 'Kein Workspace'}</div>
              <div style={{ fontSize: 10, color: '#aaa' }}>{activeWs?.nische || 'Growth Hub'}</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {wsOpen && (
            <div style={{ position: 'absolute', left: 12, top: 66, width: 192, background: '#fff', borderRadius: 10, border: '1px solid #ebebeb', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 100, overflow: 'hidden' }}>
              {workspaces.map(ws => (
                <button key={ws.id} onClick={() => switchWorkspace(ws)} style={{ width: '100%', padding: '9px 11px', border: 'none', background: ws.id === activeWs?.id ? '#f7f7f7' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: ws.color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 700 }}>{ws.name.substring(0, 2).toUpperCase()}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>{ws.name}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid #f0f0f0' }}>
                <Link href="/workspaces/new" onClick={() => setWsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 11px', fontSize: 12, color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>+ Neuer Client</Link>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto' }}>
          {NAV.map(section => (
            <div key={section.label} style={{ marginBottom: 2 }}>
              <button onClick={() => toggleSection(section.label)} style={{ width: '100%', border: 'none', background: 'none', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#bbb', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{section.label}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" style={{ transform: openSections.includes(section.label) ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openSections.includes(section.label) && section.children.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 7, marginBottom: 1, textDecoration: 'none', background: active ? `${color}12` : 'transparent', color: active ? color : '#555', fontSize: 13, fontWeight: active ? 600 : 400 }}>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f0f0f0' }}>
          <Link href="/portal" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#bbb', textDecoration: 'none', marginBottom: 8 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Client Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 99, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>AH</div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#111' }}>Alex Heidrich</div>
              <div style={{ fontSize: 10, color: '#bbb' }}>Growth Operator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 50, borderBottom: '1px solid #ebebeb', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }} />
          {activeWs && <div style={{ fontSize: 11.5, color: '#bbb', display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: 99, background: activeWs.status === 'Aktiv' ? '#22c55e' : '#f59e0b' }} />{activeWs.name}</div>}
          {notifications > 0 && <div style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: 10, padding: '2px 7px', fontWeight: 700 }}>{notifications}</div>}
          <Link href="/leads" style={{ background: '#111', color: '#fff', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>+ Lead</Link>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeWs ? (
            <WorkspaceContext.Provider value={activeWs}>{children}</WorkspaceContext.Provider>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 36 }}>◈</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Kein Workspace gefunden</div>
              <p style={{ fontSize: 13, color: '#999', textAlign: 'center', maxWidth: 280 }}>Erstelle deinen ersten Client Workspace.</p>
              <Link href="/workspaces/new" style={{ background: '#111', color: '#fff', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Ersten Client anlegen</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
