'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export function NotificationBell() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function load() {
    const { data } = await supabase
      .from('leads')
      .select('id, name, quelle, created_at, workspace_id, workspaces(name, color)')
      .order('created_at', { ascending: false })
      .limit(12)
    setNotifs(data || [])
    const cutoff = localStorage.getItem('gh_notif_seen') || '1970-01-01'
    setUnread((data || []).filter((n: any) => n.created_at > cutoff).length)
  }

  useEffect(() => {
    load()
    // Realtime subscription for new leads
    const channel = supabase.channel('leads-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openPanel() {
    setOpen(o => !o)
    if (!open) {
      localStorage.setItem('gh_notif_seen', new Date().toISOString())
      setUnread(0)
    }
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Gerade eben'
    if (m < 60) return `vor ${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `vor ${h}h`
    return `vor ${Math.floor(h / 24)}d`
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={openPanel} style={{ position: 'relative', background: 'none', border: '1px solid #eaeaea', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        🔔
        {unread > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 99, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 44, width: 320, background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Neueste Leads</span>
            <span style={{ fontSize: 11, color: '#bbb' }}>{notifs.length} gesamt</span>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#bbb', fontSize: 13 }}>Noch keine Leads</div>
            ) : notifs.map((n: any) => {
              const color = n.workspaces?.color || '#6366f1'
              return (
                <Link key={n.id} href={`/client/${n.workspace_id}/leads`} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f9f9f9', textDecoration: 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9f9f9'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 99, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                    {n.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{n.workspaces?.name} · {n.quelle || 'Unbekannt'}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#bbb', flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
