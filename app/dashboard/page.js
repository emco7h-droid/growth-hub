'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

// Shopify-Stil Sparkline
function Sparkline({ data = [], color = '#1565c0', height = 40 }) {
  if (!data || data.length < 2) return <div style={{ height }} />
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 120, H = height
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts.join(' L ')} L ${W},${H} L 0,${H} Z`} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// KPI Metric Card — Shopify style
function MetricCard({ label, value, sub, trend, sparkData, color = '#1565c0', icon, onClick }) {
  const [hover, setHover] = useState(false)
  const trendPositive = trend >= 0
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: '#fff', border: `1px solid ${hover ? color + '40' : '#e1e4e8'}`, borderRadius: 12, padding: '18px 20px', cursor: onClick ? 'pointer' : 'default', transition: 'all .2s', boxShadow: hover ? `0 4px 20px ${color}20` : '0 1px 3px rgba(0,0,0,.04)', transform: hover ? 'translateY(-2px)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#9ba1ab', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#9ba1ab', marginTop: 5 }}>{sub}</div>}
        </div>
        {icon && <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: trendPositive ? '#059669' : '#dc2626', background: trendPositive ? '#d1fae5' : '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
              {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span style={{ fontSize: 11, color: '#c5ccd4' }}>vs letzten Monat</span>
          </div>
        )}
        {sparkData && <Sparkline data={sparkData} color={color} height={32} />}
      </div>
    </div>
  )
}

function DashContent() {
  const { current, workspaces } = useWorkspace()
  const [leads, setLeads] = useState([])
  const [tasks, setTasks] = useState([])
  const [kpis, setKpis] = useState([])
  const [invoices, setInvoices] = useState([])
  const [reports, setReports] = useState([])
  const [goals, setGoals] = useState([])
  const [tab, setTab] = useState('overview')
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) load() }, [current?.id])

  const load = async () => {
    const [l, t, k, i, r, g] = await Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }),
      supabase.from('kpis').select('*').eq('workspace_id', current.id).order('monat'),
      supabase.from('invoices').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }),
      supabase.from('weekly_reports').select('*').eq('workspace_id', current.id).order('woche_nr', { ascending: false }).limit(4),
      supabase.from('workspace_goals').select('*').eq('workspace_id', current.id).eq('status', 'Aktiv').order('prioritaet').limit(3),
    ])
    setLeads(l.data || []); setTasks(t.data || []); setKpis(k.data || [])
    setInvoices(i.data || []); setReports(r.data || []); setGoals(g.data || [])
  }

  const wsColor = current?.color || '#1565c0'
  const totalRetainer = workspaces.filter(w => w.status === 'Aktiv').reduce((s, w) => s + (w.retainer || 0), 0)
  const activeClients = workspaces.filter(w => w.status === 'Aktiv').length
  const latest = kpis[kpis.length - 1]
  const prev = kpis[kpis.length - 2]
  const umsatzTrend = latest?.umsatz > 0 && prev?.umsatz > 0 ? Math.round(((latest.umsatz - prev.umsatz) / prev.umsatz) * 100) : undefined
  const openTasks = tasks.filter(t => t.status === 'Offen').length
  const highPrio = tasks.filter(t => t.prioritaet === 'Hoch' && t.status === 'Offen').length
  const gewonnene = leads.filter(l => l.status === 'Gewonnen').length
  const conv = leads.length > 0 ? Math.round(gewonnene / leads.length * 100) : 0
  const bezahlt = invoices.filter(i => i.status === 'Bezahlt').reduce((s, i) => s + (i.betrag || 0), 0)
  const ausstehend = invoices.filter(i => i.status === 'Ausstehend').reduce((s, i) => s + (i.betrag || 0), 0)
  const umsatzVerlauf = kpis.map(k => k.umsatz || 0)
  const leadVerlauf = kpis.map(k => k.leads_gesamt || 0)

  const LEAD_COLS = [
    { s: 'Neu', c: '#94a3b8' }, { s: 'In Kontakt', c: '#60a5fa' }, { s: 'Qualifiziert', c: '#a78bfa' },
    { s: 'Call gebucht', c: wsColor }, { s: 'Gewonnen', c: '#059669' }, { s: 'Verloren', c: '#dc2626' }
  ]

  if (!current) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      
      <div style={{ fontSize: 15, fontWeight: 600 }}>Workspace auswaehlen</div>
      <div style={{ fontSize: 13, color: '#9ba1ab' }}>Klick oben links auf den Workspace-Switcher</div>
    </div>
  )

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* TAB NAV */}
      <div style={{ display: 'flex', gap: 2, padding: '16px 24px 0', borderBottom: '1px solid #e1e4e8', background: '#fff', position: 'sticky', top: 52, zIndex: 10 }}>
        {[['overview', 'Uebersicht'], ['clients', 'Alle Clients'], ['tasks', 'Aufgaben'], ['finance', 'Finanzen']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ height: 36, padding: '0 16px', border: 'none', borderBottom: tab === k ? `2px solid ${wsColor}` : '2px solid transparent', background: 'transparent', fontSize: 13.5, fontWeight: tab === k ? 600 : 400, color: tab === k ? wsColor : '#5c6370', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && <>
          {/* Hero Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <MetricCard label="Aktive Clients" value={activeClients} sub={workspaces.length + ' gesamt'} icon={null} color={wsColor} trend={undefined} sparkData={undefined} onClick={() => router.push('/workspaces')} />
            <MetricCard label="Monatlicher MRR" value={`€${totalRetainer.toLocaleString('de-DE')}`} sub="Alle Clients" icon={null} color="#059669" trend={undefined} sparkData={umsatzVerlauf.length >= 2 ? umsatzVerlauf : undefined} />
            <MetricCard label="Offene Leads" value={leads.filter(l => l.status !== 'Gewonnen' && l.status !== 'Verloren').length} sub={`${leads.length} gesamt · ${conv}% Conv.`} icon={null} color="#6366f1" trend={undefined} sparkData={leadVerlauf.length >= 2 ? leadVerlauf : undefined} onClick={() => router.push('/pipeline')} />
            <MetricCard label="Offene Aufgaben" value={openTasks} sub={highPrio > 0 ? `${highPrio} hoch priorisiert` : 'Keine kritischen'} icon={null} color={highPrio > 0 ? '#dc2626' : '#059669'} trend={undefined} onClick={() => router.push('/tasks')} />
          </div>

          {/* Current Workspace + Goals */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Workspace Overview */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg, ${wsColor}, ${wsColor}cc)`, padding: '20px 24px', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: .7, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Aktiver Workspace</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{current.name}</div>
                    <div style={{ fontSize: 13, opacity: .8, marginTop: 2 }}>{current.nische || '—'} · {current.modell}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>Retainer</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>€{(current.retainer || 0).toLocaleString('de-DE')}</div>
                    <div style={{ fontSize: 11, opacity: .6 }}>pro Monat</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px' }}>
                {/* KPI Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    ['Leads', leads.length, '#6366f1'],
                    ['Offen', openTasks, highPrio > 0 ? '#dc2626' : '#059669'],
                    ['Gewonnen', gewonnene, '#059669'],
                    ['Conv.', conv + '%', wsColor],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ textAlign: 'center', padding: '10px 0', background: '#f8fafc', borderRadius: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#9ba1ab', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Lead Funnel Mini */}
                {leads.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Lead Funnel</div>
                    {LEAD_COLS.map(col => {
                      const n = leads.filter(l => l.status === col.s).length
                      const pct = leads.length > 0 ? Math.round(n / leads.length * 100) : 0
                      return (
                        <div key={col.s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <div style={{ width: 70, fontSize: 11.5, color: '#5c6370', textAlign: 'right', flexShrink: 0 }}>{col.s}</div>
                          <div style={{ flex: 1, height: 6, background: '#f0f2f5', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: pct + '%', height: '100%', background: col.c, borderRadius: 3, transition: 'width .5s' }} />
                          </div>
                          <div style={{ width: 24, fontSize: 11, color: col.c, fontWeight: 700, flexShrink: 0 }}>{n}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {leads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#c5ccd4', fontSize: 13 }}>
                    Noch keine Leads. <button onClick={() => router.push('/leads')} style={{ color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Lead hinzufuegen →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Goals */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Ziele</div>
                <button onClick={() => router.push('/goals')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Alle →</button>
              </div>
              <div style={{ padding: '12px 20px' }}>
                {goals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#c5ccd4', fontSize: 13 }}>
                    Noch keine Ziele. <button onClick={() => router.push('/goals')} style={{ color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Erstellen →</button>
                  </div>
                ) : goals.map(g => {
                  const pct = Math.min(100, g.ziel_wert > 0 ? Math.round(g.aktuell_wert / g.ziel_wert * 100) : 0)
                  return (
                    <div key={g.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{g.titel}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? '#059669' : wsColor }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f0f2f5', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: pct + '%', height: '100%', background: pct >= 100 ? '#059669' : wsColor, borderRadius: 3, transition: 'width .5s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#9ba1ab', marginTop: 3 }}>{g.aktuell_wert}{g.einheit} / {g.ziel_wert}{g.einheit}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row: Leads + Tasks + Reports */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {/* Recent Leads */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Letzte Leads</div>
                <button onClick={() => router.push('/leads')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Alle →</button>
              </div>
              <div style={{ padding: '8px 18px 14px' }}>
                {leads.length === 0 ? <div style={{ padding: '16px 0', fontSize: 13, color: '#c5ccd4', textAlign: 'center' }}>Keine Leads</div> :
                  leads.slice(0, 5).map((l, i) => {
                    const col = LEAD_COLS.find(c => c.s === l.status)
                    return (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid #f8fafc' : 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: (col?.c || '#94a3b8') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: col?.c || '#94a3b8', flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: '#9ba1ab' }}>{l.nische || '—'}</div>
                        </div>
                        <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 4, background: (col?.c || '#94a3b8') + '20', color: col?.c || '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{l.status}</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Tasks */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Offene Aufgaben</div>
                <button onClick={() => router.push('/tasks')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Alle →</button>
              </div>
              <div style={{ padding: '8px 18px 14px' }}>
                {tasks.filter(t => t.status === 'Offen').length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#c5ccd4', fontSize: 13 }}>
                    
                    Alles erledigt!
                  </div>
                ) : tasks.filter(t => t.status === 'Offen').slice(0, 5).map((t, i, arr) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.prioritaet === 'Hoch' ? '#dc2626' : t.prioritaet === 'Mittel' ? '#f59e0b' : '#94a3b8', flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titel}</div>
                      <div style={{ fontSize: 11, color: '#9ba1ab', marginTop: 1 }}>{t.kategorie} {t.faellig ? `· ${new Date(t.faellig).toLocaleDateString('de-DE')}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Reports */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Wochen Reports</div>
                <button onClick={() => router.push('/reports')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Alle →</button>
              </div>
              <div style={{ padding: '8px 18px 14px' }}>
                {reports.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#c5ccd4', fontSize: 13 }}>
                    Noch keine Reports. <button onClick={() => router.push('/reports')} style={{ color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Erstellen →</button>
                  </div>
                ) : reports.map((r, i) => (
                  <div key={r.id} style={{ padding: '10px 0', borderBottom: i < reports.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>KW {r.woche_nr}</span>
                      {r.umsatz_woche > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>€{r.umsatz_woche?.toLocaleString('de-DE')}</span>}
                    </div>
                    {r.was_lief_gut && <div style={{ fontSize: 12, color: '#5c6370', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.was_lief_gut}</div>}
                    {r.plan_naechste_woche && <div style={{ fontSize: 12, color: wsColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {r.plan_naechste_woche}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>}

        {/* CLIENTS TAB */}
        {tab === 'clients' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {workspaces.map(ws => {
              const isActive = current?.id === ws.id
              return (
                <div key={ws.id} onClick={() => router.push('/workspaces')}
                  style={{ background: '#fff', border: isActive ? `2px solid ${ws.color || wsColor}` : '1px solid #e1e4e8', borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all .2s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = ws.color || wsColor; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e1e4e8'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ws.color || '#1565c0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, marginTop: 4 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: ws.color || '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {ws.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isActive && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: ws.color + '20', color: ws.color, fontWeight: 700 }}>AKTIV</span>}
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: ws.status === 'Aktiv' ? '#d1fae5' : '#f3f4f6', color: ws.status === 'Aktiv' ? '#059669' : '#9ba1ab', fontWeight: 600 }}>{ws.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{ws.name}</div>
                  <div style={{ fontSize: 12.5, color: '#9ba1ab', marginBottom: 12 }}>{ws.nische || '—'} · {ws.modell}</div>
                  {ws.retainer > 0 && <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>€{ws.retainer?.toLocaleString('de-DE')}<span style={{ fontSize: 11, color: '#9ba1ab', fontWeight: 400 }}>/Mo</span></div>}
                </div>
              )
            })}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Offen', '#f59e0b'], ['In Bearbeitung', '#6366f1'], ['Erledigt', '#059669']].map(([status, color]) => {
              const filtered = tasks.filter(t => t.status === status)
              return (
                <div key={status} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{status}</span>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: color + '20', color, fontWeight: 700, marginLeft: 'auto' }}>{filtered.length}</span>
                  </div>
                  <div style={{ padding: '8px 18px 14px', maxHeight: 300, overflowY: 'auto' }}>
                    {filtered.length === 0 ? <div style={{ padding: '16px 0', color: '#c5ccd4', fontSize: 13, textAlign: 'center' }}>Keine Aufgaben</div> :
                      filtered.map((t, i) => (
                        <div key={t.id} style={{ padding: '8px 0', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.prioritaet === 'Hoch' ? '#dc2626' : t.prioritaet === 'Mittel' ? '#f59e0b' : '#94a3b8', marginTop: 5, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.titel}</div>
                              <div style={{ fontSize: 11, color: '#9ba1ab' }}>{t.kategorie}{t.faellig ? ` · ${new Date(t.faellig).toLocaleDateString('de-DE')}` : ''}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
            <button onClick={() => router.push('/tasks')} style={{ background: '#fff', border: '2px dashed #e1e4e8', borderRadius: 12, padding: '24px', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#9ba1ab', fontFamily: 'inherit', transition: 'all .2s' }}
              onMouseEnter={e => { e.target.style.borderColor = wsColor; e.target.style.color = wsColor; e.target.style.background = wsColor + '08' }}
              onMouseLeave={e => { e.target.style.borderColor = '#e1e4e8'; e.target.style.color = '#9ba1ab'; e.target.style.background = '#fff' }}>
              + Aufgabe erstellen
            </button>
          </div>
        )}

        {/* FINANCE TAB */}
        {tab === 'finance' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              <MetricCard label="Gesamt MRR" value={`€${totalRetainer.toLocaleString('de-DE')}`} icon={null} color="#059669" />
              <MetricCard label="Bezahlte Rechnungen" value={`€${bezahlt.toLocaleString('de-DE')}`} icon={null} color="#059669" />
              <MetricCard label="Ausstehend" value={`€${ausstehend.toLocaleString('de-DE')}`} icon={null} color={ausstehend > 0 ? '#f59e0b' : '#059669'} />
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e1e4e8', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Alle Rechnungen</div>
                <button onClick={() => router.push('/invoices')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Verwalten →</button>
              </div>
              {invoices.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#c5ccd4', fontSize: 13 }}>
                  Noch keine Rechnungen. <button onClick={() => router.push('/invoices')} style={{ color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Erstellen →</button>
                </div>
              ) : (
                <div style={{ padding: '0 20px' }}>
                  {invoices.slice(0, 6).map((inv, i) => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < Math.min(invoices.length, 6) - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: inv.status === 'Bezahlt' ? '#d1fae5' : '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        ""
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{inv.beschreibung || 'Retainer'}</div>
                        <div style={{ fontSize: 11.5, color: '#9ba1ab' }}>{inv.nummer} · {inv.faellig ? new Date(inv.faellig).toLocaleDateString('de-DE') : '—'}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>€{inv.betrag?.toLocaleString('de-DE')}</div>
                      <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: inv.status === 'Bezahlt' ? '#d1fae5' : inv.status === 'Ueberfaellig' ? '#fee2e2' : '#fef3c7', color: inv.status === 'Bezahlt' ? '#059669' : inv.status === 'Ueberfaellig' ? '#dc2626' : '#b45309', fontWeight: 600 }}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
  const { current, workspaces } = useWorkspace()
  const router = useRouter()
  const d = new Date()
  const greet = d.getHours() < 12 ? 'Guten Morgen' : d.getHours() < 18 ? 'Guten Tag' : 'Guten Abend'
  const aktive = workspaces.filter(w => w.status === 'Aktiv').length
  const mrr = workspaces.filter(w => w.status === 'Aktiv').reduce((s, w) => s + (w.retainer || 0), 0)

  return (
    <div className="topbar" style={{ height: 'auto', padding: '10px 24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{greet}, Alex 👋</span>
          {current && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: current.color + '20', color: current.color, fontWeight: 600 }}>{current.name}</span>}
        </div>
        <div style={{ fontSize: 12, color: '#9ba1ab', marginTop: 1 }}>
          {d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · {aktive} aktive Clients · MRR €{mrr.toLocaleString('de-DE')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => router.push('/leads')} className="btn-s" style={{ fontSize: 12 }}>+ Lead</button>
        <button onClick={() => router.push('/tasks')} className="btn-s" style={{ fontSize: 12 }}>+ Aufgabe</button>
        <button onClick={() => router.push('/reports')} className="btn-p" style={{ fontSize: 12 }}>+ Weekly Report</button>
      </div>
    </div>
  )
}


