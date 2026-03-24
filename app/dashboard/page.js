'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').order('created_at',{ascending:false}),
      supabase.from('clients').select('*').order('created_at',{ascending:false})
    ]).then(([l,c]) => { setLeads(l.data||[]); setClients(c.data||[]); setLoading(false) })
  }, [])
  const active = clients.filter(c=>c.status==='Aktiv')
  const rev = active.reduce((s,c)=>s+(c.retainer||0),0)
  const open = leads.filter(l=>l.status==='Ausstehend').length
  const conv = leads.length>0?Math.round((leads.filter(l=>l.status==='Gewonnen').length/leads.length)*100):0
  const badge = s => { const m={Aktiv:'green',Interessiert:'blue',Gewonnen:'green',Ausstehend:'amber',Verloren:'red'}; return <span className={`badge b-${m[s]||'gray'}`}>{s}</span> }
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <main className="mc">
        <div className="ph">
          <div><h1 className="pt">Dashboard</h1><p className="ps">Willkommen zurueck, Alex</p></div>
          <div style={{fontSize:'13px',color:'var(--dim)'}}>{new Date().toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})}</div>
        </div>
        <div className="mg">
          <div className="mc-card"><div className="ml">Aktive Clients</div><div className="mv">{loading?'—':active.length}</div><div className="ms">Zusammenarbeiten</div></div>
          <div className="mc-card"><div className="ml">Monatl. Umsatz</div><div className="mv" style={{color:'var(--green)'}}>{loading?'—':`€${rev.toLocaleString('de-DE')}`}</div><div className="ms">Recurring Revenue</div></div>
          <div className="mc-card"><div className="ml">Offene Leads</div><div className="mv" style={{color:'var(--amber)'}}>{loading?'—':open}</div><div className="ms">Warten auf Entscheidung</div></div>
          <div className="mc-card"><div className="ml">Conversion Rate</div><div className="mv" style={{color:'var(--blue-l)'}}>{loading?'—':`${conv}%`}</div><div className="ms">Lead zu Client</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
          <div className="sc">
            <div className="sh"><span className="st">Neueste Leads</span><a href="/leads" style={{fontSize:'13px',color:'var(--blue-l)'}}>Alle →</a></div>
            {loading?<div className="es">Laden...</div>:leads.length===0?<div className="es">Noch keine Leads</div>:<table><thead><tr><th>Name</th><th>Nische</th><th>Status</th></tr></thead><tbody>{leads.slice(0,5).map(l=><tr key={l.id}><td style={{fontWeight:500}}>{l.name}</td><td style={{color:'var(--muted)'}}>{l.nische||'—'}</td><td>{badge(l.status)}</td></tr>)}</tbody></table>}
          </div>
          <div className="sc">
            <div className="sh"><span className="st">Aktive Clients</span><a href="/clients" style={{fontSize:'13px',color:'var(--blue-l)'}}>Alle →</a></div>
            {loading?<div className="es">Laden...</div>:active.length===0?<div className="es">Noch keine Clients</div>:<table><thead><tr><th>Name</th><th>Retainer</th><th>Monat</th></tr></thead><tbody>{active.slice(0,5).map(c=><tr key={c.id}><td style={{fontWeight:500}}>{c.name}</td><td style={{color:'var(--green)'}}>€{(c.retainer||0).toLocaleString('de-DE')}</td><td><div>{c.aktueller_monat||1}/3</div><div className="pb"><div className="pf" style={{width:`${Math.min(100,((c.aktueller_monat||1)/3)*100)}%`}}></div></div></td></tr>)}</tbody></table>}
          </div>
        </div>
      </main>
    </div>
  )
}
