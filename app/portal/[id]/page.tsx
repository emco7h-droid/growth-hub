'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PortalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'leads' | 'goals'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [params.id])

  async function load() {
    const [wr, lr, gr, sr] = await Promise.all([
      supabase.from('workspaces').select('*').eq('id', params.id).single(),
      supabase.from('leads').select('*').eq('workspace_id', params.id).order('created_at', { ascending: false }),
      supabase.from('client_goals').select('*').eq('workspace_id', params.id).order('created_at'),
      supabase.from('pipeline_stages').select('*').eq('workspace_id', params.id).order('reihenfolge'),
    ])
    setWorkspace(wr.data)
    setLeads(lr.data || [])
    setGoals(gr.data || [])
    setStages(sr.data || [])
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const color = workspace?.color || '#6366f1'
  const wonLeads = leads.filter(l => l.status === 'Gewonnen').length
  const totalValue = leads.reduce((s, l) => s + (Number(l.deal_wert) || 0), 0)

  const statusColors: any = {
    Neu: { bg: '#f0f9ff', c: '#0ea5e9' },
    Gewonnen: { bg: '#f0fdf4', c: '#16a34a' },
    Verloren: { bg: '#fef2f2', c: '#dc2626' },
    'In Bearbeitung': { bg: '#fefce8', c: '#ca8a04' }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: '#aaa' }}>Laden...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eaeaea', height: 54, display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color }}>
            {workspace?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.2px' }}>{workspace?.name}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>Client Portal</div>
          </div>
        </div>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#666' }}>
          Abmelden
        </button>
      </div>

      <div style={{ padding: '28px', maxWidth: 900, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', marginBottom: 4 }}>
            Willkommen zurück 👋
          </h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>Hier siehst du deine aktuellen Statistiken und Fortschritte.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Leads insgesamt', value: leads.length, icon: '👥', color: '#6366f1' },
            { label: 'Gewonnene Leads', value: wonLeads, icon: '🏆', color: '#22c55e' },
            { label: 'Pipeline Wert', value: totalValue ? `€${totalValue.toLocaleString('de')}` : '—', icon: '💰', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 10.5, color: '#bbb', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f0f0ee', padding: 4, borderRadius: 9, width: 'fit-content' }}>
          {([['overview', '📊 Übersicht'], ['leads', '👥 Leads'], ['goals', '🎯 Ziele']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === key ? '#fff' : 'transparent', color: tab === key ? '#1a1a1a' : '#888', boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Lead Status */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Lead Status</h3>
              {[
                { label: 'Neu', count: leads.filter(l => l.status === 'Neu').length },
                { label: 'In Bearbeitung', count: leads.filter(l => l.status === 'In Bearbeitung').length },
                { label: 'Gewonnen', count: leads.filter(l => l.status === 'Gewonnen').length },
                { label: 'Verloren', count: leads.filter(l => l.status === 'Verloren').length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: statusColors[s.label]?.c || '#ddd' }} />
                    <span style={{ fontSize: 13, color: '#555' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', padding: '2px 10px', borderRadius: 99, background: statusColors[s.label]?.bg || '#f5f5f5', color: statusColors[s.label]?.c || '#888' }}>{s.count}</span>
                </div>
              ))}
            </div>

            {/* Goals summary */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Projektziele</h3>
              {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#ccc', fontSize: 13 }}>Noch keine Ziele definiert</div>
              ) : goals.slice(0, 3).map(g => {
                const pct = g.ziel_wert > 0 ? Math.min(100, Math.round((g.aktuell_wert / g.ziel_wert) * 100)) : 0
                return (
                  <div key={g.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a1a' }}>{g.titel}</span>
                      <span style={{ fontSize: 12, color: '#aaa' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f0f0ee', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: pct >= 100 ? '#22c55e' : (g.farbe || color), borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Leads */}
        {tab === 'leads' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', overflow: 'hidden' }}>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 56, color: '#aaa', fontSize: 13 }}>Noch keine Leads</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                    {['Name', 'Kontakt', 'Quelle', 'Status'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => {
                    const sc = statusColors[lead.status] || { bg: '#f5f5f5', c: '#888' }
                    return (
                      <tr key={lead.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 99, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                              {lead.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{lead.name}</div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#777' }}>{lead.email || '—'}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#f5f5f5', color: '#777' }}>{lead.quelle}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600, background: sc.bg, color: sc.c }}>{lead.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Goals */}
        {tab === 'goals' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 56, color: '#aaa', fontSize: 13, gridColumn: '1/-1', background: '#fff', borderRadius: 14, border: '1px solid #eaeaea' }}>Noch keine Projektziele</div>
            ) : goals.map(g => {
              const pct = g.ziel_wert > 0 ? Math.min(100, Math.round((g.aktuell_wert / g.ziel_wert) * 100)) : 0
              return (
                <div key={g.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 99, background: g.farbe || color }} />
                    <span style={{ fontSize: 11, color: '#bbb' }}>{g.kategorie}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{g.titel}</div>
                  {g.beschreibung && <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>{g.beschreibung}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: pct >= 100 ? '#22c55e' : '#1a1a1a', letterSpacing: '-0.5px' }}>{pct}%</span>
                    <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'flex-end' }}>{Number(g.aktuell_wert).toLocaleString('de')} / {Number(g.ziel_wert).toLocaleString('de')} {g.einheit}</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f0ee', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: pct >= 100 ? '#22c55e' : (g.farbe || color), borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
                  </div>
                  {g.faellig && <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>Deadline: {new Date(g.faellig).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
