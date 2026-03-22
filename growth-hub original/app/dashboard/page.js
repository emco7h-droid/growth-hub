'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [l, c] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false })
      ])
      setLeads(l.data || [])
      setClients(c.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const activeClients = clients.filter(c => c.status === 'Aktiv')
  const totalRetainer = activeClients.reduce((s, c) => s + (c.retainer || 0), 0)
  const openLeads = leads.filter(l => l.status === 'Ausstehend').length
  const wonLeads = leads.filter(l => l.status === 'Gewonnen').length
  const convRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  const statusBadge = (s) => {
    const map = { 'Aktiv': 'green', 'Interessiert': 'blue', 'Gewonnen': 'green', 'Ausstehend': 'amber', 'Verloren': 'red' }
    return <span className={`badge badge-${map[s] || 'gray'}`}>{s}</span>
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Willkommen zurueck, Alex</p>
          </div>
          <div style={{fontSize:'13px', color:'var(--text-dim)'}}>
            {new Date().toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'})}
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Aktive Clients</div>
            <div className="metric-value">{loading ? '—' : activeClients.length}</div>
            <div className="metric-sub">Laufende Zusammenarbeiten</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Monatl. Umsatz</div>
            <div className="metric-value" style={{color:'var(--green)'}}>
              {loading ? '—' : `€${totalRetainer.toLocaleString('de-DE')}`}
            </div>
            <div className="metric-sub">Recurring Revenue</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Offene Leads</div>
            <div className="metric-value" style={{color:'var(--amber)'}}>
              {loading ? '—' : openLeads}
            </div>
            <div className="metric-sub">Warten auf Entscheidung</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Conversion Rate</div>
            <div className="metric-value" style={{color:'var(--blue-light)'}}>
              {loading ? '—' : `${convRate}%`}
            </div>
            <div className="metric-sub">Lead zu Client</div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Neueste Leads</span>
              <a href="/leads" style={{fontSize:'13px', color:'var(--blue-light)'}}>Alle anzeigen →</a>
            </div>
            {loading ? (
              <div className="empty-state">Laden...</div>
            ) : leads.length === 0 ? (
              <div className="empty-state">Noch keine Leads</div>
            ) : (
              <table>
                <thead><tr><th>Name</th><th>Nische</th><th>Status</th></tr></thead>
                <tbody>
                  {leads.slice(0,5).map(l => (
                    <tr key={l.id}>
                      <td style={{fontWeight:500}}>{l.name}</td>
                      <td style={{color:'var(--text-muted)'}}>{l.nische || '—'}</td>
                      <td>{statusBadge(l.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Aktive Clients</span>
              <a href="/clients" style={{fontSize:'13px', color:'var(--blue-light)'}}>Alle anzeigen →</a>
            </div>
            {loading ? (
              <div className="empty-state">Laden...</div>
            ) : activeClients.length === 0 ? (
              <div className="empty-state">Noch keine Clients</div>
            ) : (
              <table>
                <thead><tr><th>Name</th><th>Retainer</th><th>Monat</th></tr></thead>
                <tbody>
                  {activeClients.slice(0,5).map(c => (
                    <tr key={c.id}>
                      <td style={{fontWeight:500}}>{c.name}</td>
                      <td style={{color:'var(--green)'}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
                      <td>
                        <div>{c.aktueller_monat || 1} / 3</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${Math.min(100, ((c.aktueller_monat||1)/3)*100)}%`}}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
