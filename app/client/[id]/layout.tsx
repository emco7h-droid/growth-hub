'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ClientLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const pathname = usePathname()
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      supabase.from('workspaces').select('*').eq('id', params.id).single().then(({ data }) => {
        if (data) setClient(data)
      })
    }
  }, [params.id])

  const color = client?.color || '#6366f1'

  const NAV = [
    { href: `/client/${params.id}/leads`, label: 'Leads', icon: '○' },
    { href: `/client/${params.id}/pipeline`, label: 'Pipeline', icon: '◈' },
    { href: `/client/${params.id}/content`, label: 'Content Kalender', icon: '□' },
    { href: `/client/${params.id}/settings`, label: 'Einstellungen', icon: '⚙' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f7f5' }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: '#fff', borderRight: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Back + Client */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid #f5f5f5' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#bbb', marginBottom: 12, textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Alle Clients
          </Link>
          {client && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
                {client.name?.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                <div style={{ fontSize: 10.5, color: '#bbb' }}>{client.nische || 'Growth Hub'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', fontSize: 13,
                background: active ? `${color}12` : 'transparent',
                color: active ? color : '#555',
                fontWeight: active ? 600 : 400,
              }}>
                <span style={{ fontSize: 11, opacity: 0.5, width: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid #f5f5f5' }}>
          <Link href="/portal" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#bbb', textDecoration: 'none', marginBottom: 10 }}>
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
        {/* Topbar */}
        <div style={{ height: 50, borderBottom: '1px solid #ebebeb', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }} />
          {client && (
            <div style={{ fontSize: 11.5, color: '#bbb', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: client.status === 'Aktiv' ? '#22c55e' : '#f59e0b' }} />
              {client.status || 'Aktiv'}
              {client.retainer ? ` · MRR €${Number(client.retainer).toLocaleString()}` : ''}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      </main>
    </div>
  )
}
