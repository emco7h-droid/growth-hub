'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/Layout'

export default function Dashboard() {
  const ws = useWorkspace()
  const [stats, setStats] = useState({ leads: 0, neue: 0, mrr: 0, tasks: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (ws) loadData()
  }, [ws])

  async function loadData() {
    const [leadsRes, kpiRes, tasksRes, notifRes, recentRes] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('workspace_id', ws!.id),
      supabase.from('kpis').select('mrr').eq('workspace_id', ws!.id).order('monat', { ascending: false }).limit(1),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', ws!.id).eq('status', 'Offen'),
      supabase.from('notifications').select('*').eq('workspace_id', ws!.id).eq('gelesen', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('leads').select('*').eq('workspace_id', ws!.id).order('created_at', { ascending: false }).limit(5),
    ])
    const neueLeads = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('workspace_id', ws!.id).eq('status', 'Neu')

    setStats({
      leads: leadsRes.count || 0,
      neue: neueLeads.count || 0,
      mrr: kpiRes.data?.[0]?.mrr || ws!.retainer || 0,
      tasks: tasksRes.count || 0,
    })
    setRecentLeads(recentRes.data || [])
    setNotifications(notifRes.data || [])
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ gelesen: true }).eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const day = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>
          {greeting}, Alex 👋
        </h1>
        <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>{day} · {ws?.name}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Gesamt Leads', value: stats.leads, sub: `${stats.neue} neue`, color: ws?.color || '#6366f1' },
          { label: 'MRR', value: `€${stats.mrr.toLocaleString()}`, sub: 'Monatlich', color: '#22c55e' },
          { label: 'Offene Tasks', value: stats.tasks, sub: 'Zu erledigen', color: '#f59e0b' },
          { label: 'Conversion', value: stats.leads > 0 ? `${Math.round((stats.leads - stats.neue) / stats.leads * 100)}%` : '—', sub: 'Rate', color: '#3b82f6' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 12, padding: '20px',
            border: '1px solid #f0f0f0',
          }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: stat.color, marginTop: 6, fontWeight: 500 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Recent Leads */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Neueste Leads</span>
            <a href="/leads" style={{ fontSize: 11, color: ws?.color || '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Alle →</a>
          </div>
          {recentLeads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
              Noch keine Leads. Erstelle einen oder verbinde OnePage.io.
            </div>
          ) : recentLeads.map(lead => (
            <div key={lead.id} style={{
              padding: '12px 20px', borderBottom: '1px solid #f5f5f5',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 99,
                background: `${ws?.color || '#6366f1'}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: ws?.color || '#6366f1',
              }}>
                {lead.name?.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{lead.email} · {lead.quelle}</div>
              </div>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 500,
                background: lead.status === 'Neu' ? '#f0f9ff' : lead.status === 'Gewonnen' ? '#f0fdf4' : '#fef9f0',
                color: lead.status === 'Neu' ? '#0ea5e9' : lead.status === 'Gewonnen' ? '#22c55e' : '#f59e0b',
              }}>{lead.status}</span>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
              Benachrichtigungen {notifications.length > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: 9, padding: '2px 6px', marginLeft: 4 }}>{notifications.length}</span>}
            </span>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 13 }}>
              Alles erledigt 🎉
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: 99,
                background: n.typ === 'lead' ? '#22c55e' : n.typ === 'followup' ? '#f59e0b' : '#6366f1',
                marginTop: 5, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{n.titel}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{n.nachricht}</div>
              </div>
              <button onClick={() => markRead(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
