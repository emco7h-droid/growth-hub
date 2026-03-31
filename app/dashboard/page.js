'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

// Shopify-style SVG Line Chart
function LineChart({ data, label, color, format = 'number' }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5ccd4', fontSize: 12 }}>Nicht genug Daten</div>
  )
  const vals = data.map(d => d.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 280, H = 80
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - min) / range) * (H - 10) - 5}`)
  const pathD = `M ${pts.join(' L ')}`
  const areaD = `M ${pts[0]} L ${pts.join(' L ')} L ${W},${H} L 0,${H} Z`
  const lastVal = vals[vals.length - 1]
  const prevVal = vals[vals.length - 2]
  const trend = lastVal >= prevVal ? '+' : ''
  const fmt = (v) => format === 'euro' ? `€${v.toLocaleString('de-DE')}` : v.toLocaleString('de-DE')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11.5, color: '#9ba1ab', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{fmt(lastVal)}</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: lastVal >= prevVal ? '#0a7c59' : '#c0392b', background: lastVal >= prevVal ? '#e0f5ee' : '#fce8e6', padding: '2px 8px', borderRadius: 5 }}>
          {trend}{Math.round(((lastVal - prevVal) / (prevVal || 1)) * 100)}%
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${label})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="4" fill={color} />
      </svg>
    </div>
  )
}

function DashContent() {
  const { current, workspaces } = useWorkspace()
  const [leads, setLeads] = useState([])
  const [tasks, setTasks] = useState([])
  const [kpis, setKpis] = useState([])
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) load() }, [current?.id])

  const load = async () => {
    const [l, t, k] = await Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('tasks').select('*').eq('workspace_id', current.id).eq('status', 'Offen').order('created_at', { ascending: false }).limit(5),
      supabase.from('kpis').select('*').eq('workspace_id', current.id).order('monat').limit(12),
    ])
    setLeads(l.data || []); setTasks(t.data || []); setKpis(k.data || [])
  }

  const wsColor = current?.color || '#1565c0'
  const totalRetainer = workspaces.filter(w => w.status === 'Aktiv').reduce((s, w) => s + (w.retainer || 0), 0)
  const activeClients = workspaces.filter(w => w.status === 'Aktiv').length
  const umsatzData = kpis.filter(k => k.umsatz > 0).map(k => ({ month: k.monat, value: k.umsatz }))
  const leadsData = kpis.filter(k => k.leads_gesamt > 0).map(k => ({ month: k.monat, value: k.leads_gesamt }))

  if (!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          ['Aktive Clients', activeClients, '📋', wsColor],
          ['Monatlicher MRR', `€${totalRetainer.toLocaleString('de-DE')}`, '💰', '#0a7c59'],
          ['Offene Leads', leads.filter(l => l.status === 'Neu' || l.status === 'In Kontakt').length, '🎯', '#6b4bc8'],
          ['Offene Tasks', tasks.length, '✅', '#b7860b'],
        ].map(([l, v, ic, c]) => (
          <div key={l} className="card" style={{ borderTop: `3px solid ${c}` }}>
            <div className="cb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11.5, color: '#9ba1ab', marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
              </div>
              <span style={{ fontSize: 22 }}>{ic}</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Charts */}
      {kpis.length >= 2 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          <div className="card"><div className="cb"><LineChart data={umsatzData.length >= 2 ? umsatzData : null} label="Umsatz Verlauf" color={wsColor} format="euro" /></div></div>
          <div className="card"><div className="cb"><LineChart data={leadsData.length >= 2 ? leadsData : null} label="Leads Verlauf" color="#6b4bc8" /></div></div>
          <div className="card"><div className="cb"><LineChart data={kpis.filter(k => k.neue_kunden > 0).length >= 2 ? kpis.filter(k => k.neue_kunden > 0).map(k => ({ value: k.neue_kunden })) : null} label="Neue Kunden" color="#0a7c59" /></div></div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: 13, color: '#9ba1ab' }}>KPI Charts erscheinen hier sobald du mindestens 2 Monate Daten eingetragen hast. <a href="/kpis" style={{ color: wsColor }}>KPIs eintragen →</a></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Leads */}
        <div className="card">
          <div className="ch"><div className="ct">Letzte Leads — {current.name}</div><a href="/leads" style={{ fontSize: 12, color: wsColor, textDecoration: 'none' }}>Alle →</a></div>
          <div className="cb">
            {leads.length === 0 ? <div style={{ padding: '10px 0', fontSize: 13, color: '#9ba1ab', textAlign: 'center' }}>Noch keine Leads. <a href="/leads" style={{ color: wsColor }}>Hinzufuegen →</a></div> :
              leads.map((l, i) => {
                const col = { 'Neu': '#9ba1ab', 'In Kontakt': '#5b9cf6', 'Qualifiziert': '#a78bfa', 'Call gebucht': '#1565c0', 'Gewonnen': '#0a7c59', 'Verloren': '#c0392b' }[l.status] || '#9ba1ab'
                return <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < leads.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${col}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: col, flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div><div style={{ fontSize: 11, color: '#9ba1ab' }}>{l.nische || '—'}</div></div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: `${col}20`, color: col, fontWeight: 600, flexShrink: 0 }}>{l.status}</span>
                </div>
              })}
          </div>
        </div>

        {/* Tasks + All clients */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="ch"><div className="ct">Offene Aufgaben</div><a href="/tasks" style={{ fontSize: 12, color: wsColor, textDecoration: 'none' }}>Alle →</a></div>
            <div className="cb">
              {tasks.length === 0 ? <div style={{ fontSize: 13, color: '#9ba1ab' }}>Keine offenen Aufgaben. <a href="/tasks" style={{ color: wsColor }}>Erstellen →</a></div> :
                tasks.slice(0, 3).map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.prioritaet === 'Hoch' ? '#c0392b' : t.prioritaet === 'Mittel' ? '#f59e0b' : '#9ba1ab', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titel}</span>
                    <span className="tag-g" style={{ fontSize: 10.5, flexShrink: 0 }}>{t.kategorie}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="ch"><div className="ct">Alle Clients</div><a href="/workspaces" style={{ fontSize: 12, color: wsColor, textDecoration: 'none' }}>Alle →</a></div>
            <div className="cb">
              {workspaces.slice(0, 4).map((ws, i) => (
                <div key={ws.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < Math.min(workspaces.length, 4) - 1 ? '1px solid #f0f2f5' : 'none' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: ws.color || '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{ws.name?.slice(0, 2).toUpperCase()}</div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                  {ws.retainer > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#0a7c59' }}>€{ws.retainer?.toLocaleString('de-DE')}</span>}
                  <span className={`badge ${ws.status === 'Aktiv' ? 'bg' : 'bgr'}`} style={{ fontSize: 10 }}>{ws.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <DashTopbar />
          <DashContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function DashTopbar() {
  const { current } = useWorkspace()
  const d = new Date()
  const greet = d.getHours() < 12 ? 'Guten Morgen' : d.getHours() < 18 ? 'Guten Tag' : 'Guten Abend'
  return (
    <div className="topbar">
      <div className="tb-l"><span className="tb-title">{greet}, Alex 👋</span>{current && <span className="tb-ws-badge">{current.name}</span>}</div>
      <div className="tb-r"><span style={{ fontSize: 12, color: '#9ba1ab' }}>{d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
    </div>
  )
}
