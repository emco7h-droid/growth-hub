'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false })
      ]).then(([l, c]) => {
        setLeads(l.data || [])
        setClients(c.data || [])
        setLoading(false)
      })
    })
  }, [])

  const active = clients.filter(c => c.status === 'Aktiv')
  const totalRev = active.reduce((s, c) => s + (c.retainer || 0), 0)
  const openLeads = leads.filter(l => l.status === 'Neu' || l.status === 'In Kontakt').length
  const wonLeads = leads.filter(l => l.status === 'Gewonnen').length
  const conv = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  const statusBadge = (s) => {
    const map = { 'Gewonnen': 'badge-green', 'In Kontakt': 'badge-blue', 'Neu': 'badge-gray', 'Qualifiziert': 'badge-purple', 'Verloren': 'badge-red', 'Ausstehend': 'badge-amber' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  const months = ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär']
  const chartData = [68, 82, 75, 94, 108, 122]
  const maxVal = Math.max(...chartData)

  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Uebersicht</span>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Suchen</span>
            </div>
            <button className="btn-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>
        </div>

        <div className="page">
          <div className="metrics-row">
            {[
              { label: 'Aktive Clients', value: loading ? '—' : active.length, change: '+2 diesen Monat', up: true },
              { label: 'Monatl. Umsatz', value: loading ? '—' : `€${totalRev.toLocaleString('de-DE')}`, change: '+23.1% Wachstum', up: true },
              { label: 'Offene Leads', value: loading ? '—' : openLeads, change: `${leads.length} gesamt`, neutral: true },
              { label: 'Conversion Rate', value: loading ? '—' : `${conv}%`, change: conv > 20 ? 'Ueber Ziel' : 'Unter Ziel', up: conv > 20 },
            ].map((m, i) => (
              <div key={i} className="metric">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">{m.value}</div>
                <div className={`metric-change ${m.neutral ? 'neutral' : m.up ? 'up' : 'down'}`}>
                  {!m.neutral && (m.up ?
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> :
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  )}
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Umsatz Uebersicht</div>
                  <div className="card-subtitle">Monatlich — Q4 2025 bis Q1 2026</div>
                </div>
                <span style={{ fontSize: 12, color: '#6b6b6b', background: '#f0f0f0', padding: '3px 8px', borderRadius: 6 }}>Q1 2026</span>
              </div>
              <div className="card-body">
                <div className="chart-bars">
                  {chartData.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', height: `${(v / maxVal) * 110}px`, background: i === chartData.length - 1 ? '#1a1a1a' : '#e3e3e3', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                      <span style={{ fontSize: 11, color: '#9b9b9b' }}>{months[i]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                  {[['Umsatz gesamt', `€${totalRev.toLocaleString('de-DE')}`, '#1a1a1a'], ['Ø pro Client', active.length ? `€${Math.round(totalRev / active.length).toLocaleString('de-DE')}` : '—', '#6b6b6b'], ['Clients', active.length, '#6b6b6b']].map(([l, v, c]) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: '#9b9b9b' }}>{l}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: c, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Sales Pipeline</div>
                <div className="card-subtitle">{leads.length} Leads gesamt</div>
              </div>
              <div className="card-body">
                {[
                  ['Neu', leads.filter(l=>l.status==='Neu').length, '#e3e3e3'],
                  ['In Kontakt', leads.filter(l=>l.status==='In Kontakt').length, '#c5d8fd'],
                  ['Qualifiziert', leads.filter(l=>l.status==='Qualifiziert').length, '#d5c5f8'],
                  ['Call gebucht', leads.filter(l=>l.status==='Call gebucht').length, '#2c6ecb'],
                  ['Gewonnen', leads.filter(l=>l.status==='Gewonnen').length, '#008060'],
                ].map(([label, count, color]) => (
                  <div key={label} className="pipeline-item">
                    <div className="pipeline-bar-row">
                      <span className="pipeline-label" style={{ fontSize: 12 }}>{label}</span>
                      <div className="pipeline-bar-wrap">
                        <div className="pipeline-bar-fill" style={{ width: leads.length > 0 ? `${(count / leads.length) * 100}%` : '0%', background: color }} />
                      </div>
                      <span className="pipeline-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Neueste Leads</div>
                <a href="/leads" style={{ fontSize: 13, color: '#2c6ecb', fontWeight: 500 }}>Alle anzeigen</a>
              </div>
              {loading ? <div className="empty-state"><p>Laden...</p></div> :
                leads.length === 0 ? <div className="empty-state"><p>Noch keine Leads vorhanden.</p></div> : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Nische</th><th>Status</th><th>Wert</th></tr></thead>
                      <tbody>
                        {leads.slice(0, 5).map(l => (
                          <tr key={l.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6b6b6b', flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div>
                                <span className="font-medium">{l.name}</span>
                              </div>
                            </td>
                            <td className="text-muted text-sm">{l.nische || '—'}</td>
                            <td>{statusBadge(l.status)}</td>
                            <td className="font-medium">{l.wert ? `€${l.wert.toLocaleString('de-DE')}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Aktive Clients</div>
                <a href="/clients" style={{ fontSize: 13, color: '#2c6ecb', fontWeight: 500 }}>Alle anzeigen</a>
              </div>
              {loading ? <div className="empty-state"><p>Laden...</p></div> :
                active.length === 0 ? <div className="empty-state"><p>Noch keine aktiven Clients.</p></div> : (
                  <div>
                    {active.slice(0, 5).map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{c.name?.slice(0, 2).toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-medium" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#9b9b9b', marginTop: 1 }}>Monat {c.monat || 1} / 3</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#008060' }}>€{(c.retainer || 0).toLocaleString('de-DE')}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
