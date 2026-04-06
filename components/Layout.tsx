'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase, type Workspace } from '@/lib/supabase'

const NAV = [
  {
    label: 'Agency CRM',
    icon: '⬡',
    children: [
      { href: '/leads', label: 'Leads', icon: '○' },
      { href: '/pipeline', label: 'Pipeline', icon: '◈' },
      { href: '/contacts', label: 'Kontakte', icon: '◎' },
    ]
  },
  {
    label: 'Operations',
    icon: '⬡',
    children: [
      { href: '/content', label: 'Content Kalender', icon: '○' },
      { href: '/tasks', label: 'Aufgaben', icon: '○' },
      { href: '/calls', label: 'Calls', icon: '○' },
    ]
  },
  {
    label: 'Berichte',
    icon: '⬡',
    children: [
      { href: '/dashboard', label: 'Übersicht', icon: '○' },
      { href: '/kpis', label: 'KPIs', icon: '○' },
      { href: '/reports', label: 'Reports', icon: '○' },
      { href: '/invoices', label: 'Rechnungen', icon: '○' },
    ]
  },
  {
    label: 'Einstellungen',
    icon: '⬡',
    children: [
      { href: '/settings', label: 'Workspace', icon: '○' },
      { href: '/automations', label: 'Automationen', icon: '○' },
    ]
  },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWs, setActiveWs] = useState<Workspace | null>(null)
  const [wsOpen, setWsOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['Agency CRM'])
  const [notifications, setNotifications] = useState(0)

  const isPortal = pathname.startsWith('/portal')

  useEffect(() => {
    loadWorkspaces()
    loadNotifications()
  }, [])

  async function loadWorkspaces() {
    const { data } = await supabase.from('workspaces').select('*').order('created_at')
    if (data) {
      setWorkspaces(data)
      const saved = localStorage.getItem('activeWorkspace')
      const found = saved ? data.find(w => w.id === saved) : null
      setActiveWs(found || data[0] || null)
    }
  }

  async function loadNotifications() {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('gelesen', false)
    setNotifications(count || 0)
  }

  function switchWorkspace(ws: Workspace) {
    setActiveWs(ws)
    localStorage.setItem('activeWorkspace', ws.id)
    setWsOpen(false)
    window.location.reload()
  }

  function toggleSection(label: string) {
    setOpenSections(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    )
  }

  if (isPortal) return <>{children}</>

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fafafa', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Workspace Switcher */}
        <div style={{ padding: '16px 16px 0' }}>
          <button
            onClick={() => setWsOpen(!wsOpen)}
            style={{
              width: '100%',
              background: activeWs ? `${activeWs.color}10` : '#f5f5f5',
              border: `1px solid ${activeWs?.color || '#e5e5e5'}30`,
              borderRadius: 10,
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: activeWs?.color || '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {activeWs?.name?.substring(0, 2).toUpperCase() || 'GH'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeWs?.name || 'Kein Workspace'}
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>{activeWs?.nische || 'Growth Hub'}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Workspace Dropdown */}
          {wsOpen && (
            <div style={{
              position: 'absolute', left: 16, top: 76, width: 188,
              background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 100, overflow: 'hidden',
            }}>
              {workspaces.map(ws => (
                <button key={ws.id} onClick={() => switchWorkspace(ws)} style={{
                  width: '100%', padding: '10px 12px', border: 'none',
                  background: ws.id === activeWs?.id ? '#f5f5f5' : '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: ws.color || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                  }}>
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>{ws.name}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid #f0f0f0' }}>
                <Link href="/workspaces/new" onClick={() => setWsOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', fontSize: 12, color: '#6366f1',
                  fontWeight: 500, textDecoration: 'none',
                }}>
                  + Neuer Client
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV.map(section => (
            <div key={section.label} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleSection(section.label)}
                style={{
                  width: '100%', border: 'none', background: 'none',
                  padding: '6px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {section.label}
                </span>
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="#bbb" strokeWidth="2"
                  style={{ transform: openSections.includes(section.label) ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {openSections.includes(section.label) && (
                <div style={{ marginTop: 2 }}>
                  {section.children.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8, marginBottom: 1,
                        textDecoration: 'none',
                        background: active ? `${activeWs?.color || '#6366f1'}12` : 'transparent',
                        color: active ? (activeWs?.color || '#6366f1') : '#555',
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        transition: 'all 0.1s',
                      }}>
                        <span style={{ fontSize: 10, opacity: 0.6 }}>{item.icon}</span>
                        {item.label}
                        {item.href === '/notifications' && notifications > 0 && (
                          <span style={{
                            marginLeft: 'auto', background: '#ef4444',
                            color: '#fff', borderRadius: 99, fontSize: 9,
                            padding: '1px 5px', fontWeight: 700,
                          }}>{notifications}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          <Link href="/portal" target="_blank" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: '#aaa', textDecoration: 'none', marginBottom: 8,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Client Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 99,
              background: '#111', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>AH</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>Alex Heidrich</div>
              <div style={{ fontSize: 10, color: '#aaa' }}>Growth Operator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{
          height: 52, borderBottom: '1px solid #f0f0f0',
          background: '#fff', display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1 }} />
          {activeWs && (
            <div style={{
              fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: activeWs.status === 'Aktiv' ? '#22c55e' : '#f59e0b' }} />
              {activeWs.name} · {activeWs.status}
            </div>
          )}
          <Link href="/leads/new" style={{
            background: '#111', color: '#fff', borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 600,
            textDecoration: 'none',
          }}>
            + Lead
          </Link>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeWs ? (
            <WorkspaceContext.Provider value={activeWs}>
              {children}
            </WorkspaceContext.Provider>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 40 }}>⬡</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>Kein Workspace gefunden</div>
              <p style={{ fontSize: 13, color: '#999', textAlign: 'center', maxWidth: 300 }}>
                Erstelle deinen ersten Client Workspace um loszulegen.
              </p>
              <Link href="/workspaces/new" style={{
                background: '#111', color: '#fff', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                Ersten Client anlegen
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { createContext, useContext } from 'react'
export const WorkspaceContext = createContext<Workspace | null>(null)
export const useWorkspace = () => useContext(WorkspaceContext)
