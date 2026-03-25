'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

// Shopify-style SVG line chart
function LineChart({ data, labels, height = 160 }) {
  if (!data || data.length === 0) return (
    <div style={{height, display:'flex',alignItems:'center',justifyContent:'center',color:'#9ba1ab',fontSize:13}}>Noch keine Daten</div>
  )
  const w = 600, h = height
  const pad = { top:16, right:12, bottom:28, left:44 }
  const maxY = Math.max(...data, 1)
  const xs = data.map((_, i) => pad.left + (i / (data.length - 1 || 1)) * (w - pad.left - pad.right))
  const ys = data.map(v => pad.top + (1 - v / maxY) * (h - pad.top - pad.bottom))
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const area = `M ${xs[0]},${ys[0]} ` + xs.slice(1).map((x,i)=>`L ${x},${ys[i+1]}`).join(' ') + ` L ${xs[xs.length-1]},${h-pad.bottom} L ${xs[0]},${h-pad.bottom} Z`
  const line = `M ${pts.split(' ').map((p,i)=>i===0?`${p}`:`L ${p}`).join(' ')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b9cf6" stopOpacity="0.15"/><stop offset="100%" stopColor="#5b9cf6" stopOpacity="0.01"/></linearGradient></defs>
      {[0.25,0.5,0.75,1].map((f,i)=><line key={i} x1={pad.left} y1={pad.top+(1-f)*(h-pad.top-pad.bottom)} x2={w-pad.right} y2={pad.top+(1-f)*(h-pad.top-pad.bottom)} stroke="#f0f2f5" strokeWidth="1"/>)}
      {[0.25,0.5,0.75,1].map((f,i)=><text key={i} x={pad.left-6} y={pad.top+(1-f)*(h-pad.top-pad.bottom)+4} textAnchor="end" fontSize="10" fill="#9ba1ab">{Math.round(maxY*f).toLocaleString('de-DE')}</text>)}
      <path d={area} fill="url(#areaGrad)"/>
      <polyline points={pts} fill="none" stroke="#5b9cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r="3" fill="#fff" stroke="#5b9cf6" strokeWidth="2"/>)}
      {labels && labels.map((l,i)=><text key={i} x={xs[i]} y={h-8} textAnchor="middle" fontSize="10" fill="#9ba1ab">{l}</text>)}
    </svg>
  )
}

// Tiny sparkline for metric cards
function Sparkline({ data, color = '#5b9cf6' }) {
  if (!data || data.length < 2) return null
  const w = 80, h = 28
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => (i / (data.length - 1)) * w)
  const ys = data.map(v => h - 2 - ((v - min) / range) * (h - 4))
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false })
      ]).then(([l, c]) => { setLeads(l.data || []); setClients(c.data || []); setLoading(false) })
    })
  }, [])

  const active = clients.filter(c => c.status === 'Aktiv')
  const totalRev = active.reduce((s, c) => s + (c.retainer || 0), 0)
  const openLeads = leads.filter(l => !['Gewonnen','Verloren','No Show'].includes(l.status)).length
  const wonLeads = leads.filter(l => l.status === 'Gewonnen').length
  const conv = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  const chartData = [0, 0, 0, 0, 0, totalRev]
  const chartLabels = ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär']

  const statusBadge = (s) => {
    const map = { 'Gewonnen':'badge-green','In Kontakt':'badge-blue','Qualifiziert':'badge-purple','Neu':'badge-gray','Call gebucht':'badge-blue','Verloren':'badge-red' }
    return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>
  }

  return (
    <div className="layout">
      <Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Uebersicht</span>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Suchen..." style={{border:'none',outline:'none',background:'transparent',fontSize:13,fontFamily:'inherit',width:160}}/>
            </div>
            <button className="btn-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>
        </div>

        <div className="page">
          <div className="metrics-row">
            {[
              { label:'Aktive Clients', value:loading?'—':active.length, change:'+2 diesen Monat', up:true, spark:[2,3,2,4,3,active.length||0] },
              { label:'Monatl. Umsatz', value:loading?'—':`€${totalRev.toLocaleString('de-DE')}`, change:'+23.1%', up:true, spark:[800,1200,950,1800,2100,totalRev||0] },
              { label:'Offene Leads', value:loading?'—':openLeads, change:`${leads.length} gesamt`, neutral:true, spark:[3,5,4,6,5,openLeads||0] },
              { label:'Conversion Rate', value:loading?'—':`${conv}%`, change:conv>20?'Ueber Ziel':'Unter Ziel', up:conv>20, spark:[10,15,12,18,20,conv||0] },
            ].map((m, i) => (
              <div key={i} className="metric">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div className="metric-label">{m.label}</div>
                  <Sparkline data={m.spark} color={m.up?'#5b9cf6':m.neutral?'#9ba1ab':'#e57373'}/>
                </div>
                <div className="metric-value">{m.value}</div>
                <div className={`metric-change ${m.neutral?'neutral':m.up?'up':'down'}`}>
                  {!m.neutral && (m.up ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>)}
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          <div className="g21" style={{marginBottom:16}}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Umsatz Uebersicht</div>
                  <div className="card-subtitle">Monatliche Entwicklung — Q4 2025 bis Q1 2026</div>
                </div>
                <div style={{display:'flex',gap:12,alignItems:'center',fontSize:11,color:'#9ba1ab'}}>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:20,height:2,background:'#5b9cf6',display:'inline-block',borderRadius:1}}></span>Umsatz</span>
                  <span className="tag-gray">Q1 2026</span>
                </div>
              </div>
              <div className="card-body" style={{paddingTop:12}}>
                <LineChart data={chartData} labels={chartLabels}/>
                <div style={{display:'flex',gap:20,marginTop:14,paddingTop:14,borderTop:'1px solid #f0f2f5'}}>
                  {[['Gesamt MTD',`€${totalRev.toLocaleString('de-DE')}`,true],[`Ø / Client`,active.length?`€${Math.round(totalRev/active.length).toLocaleString('de-DE')}`:'—',false],['Wachstum','+23.1%',true]].map(([l,v,up])=>(
                    <div key={l}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:3}}>{l}</div><div style={{fontSize:15,fontWeight:600,color:up?'#0a7c59':'#1a1a2e'}}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Sales Pipeline</div><span className="tag">{leads.length} Leads</span></div>
              <div className="card-body">
                {[['Neu','#e1e4e8'],['In Kontakt','#c5d8fd'],['Qualifiziert','#d4c5f8'],['Call gebucht','#1565c0'],['Gewonnen','#0a7c59']].map(([s,c])=>{
                  const n = leads.filter(l=>l.status===s).length
                  return (
                    <div key={s} className="pipe-item">
                      <div className="pipe-row">
                        <span className="pipe-label">{s}</span>
                        <div className="pipe-bar-bg"><div className="pipe-bar-fill" style={{width:leads.length?`${(n/leads.length)*100}%`:'0%',background:c}}/></div>
                        <span className="pipe-count">{n}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="g3" style={{marginBottom:0}}>
            <div className="card" style={{gridColumn:'span 2'}}>
              <div className="card-header"><div className="card-title">Neueste Leads</div><a href="/leads" style={{fontSize:12.5,color:'#1565c0',fontWeight:500}}>Alle anzeigen →</a></div>
              {loading?<div className="empty"><p>Laden...</p></div>:leads.length===0?<div className="empty"><p>Noch keine Leads.</p></div>:(
                <div className="table-wrap">
                  <table><thead><tr><th>Name</th><th>Nische</th><th>Status</th><th>Wert</th></tr></thead>
                  <tbody>{leads.slice(0,5).map(l=>(
                    <tr key={l.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:28,height:28,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10.5,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{l.name}</span></div></td>
                      <td style={{color:'#5c6370',fontSize:13}}>{l.nische||'—'}</td>
                      <td>{statusBadge(l.status)}</td>
                      <td style={{fontWeight:600}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Aktivitaet</div><span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#0a7c59'}}><span style={{width:6,height:6,borderRadius:'50%',background:'#0a7c59',display:'inline-block',animation:'pulse 2s infinite'}}></span>Live</span></div>
              <div className="card-body" style={{paddingTop:8}}>
                {[
                  {t:'Neuer Lead eingetragen',s:'Via Calendly Discovery Call',c:'act-blue',time:'2 min'},
                  {t:'Client Status aktuell.',s:'Monat 2 gestartet',c:'act-green',time:'18 min'},
                  {t:'Email Sequenz aktiv',s:'7-Tage Onboarding Flow',c:'act-blue',time:'1 Std'},
                  {t:'Strategy Call gehalten',s:'45 min · Notizen gespeichert',c:'act-amber',time:'3 Std'},
                ].map((a,i)=>(
                  <div key={i} className="act-item">
                    <div className={`act-dot ${a.c}`}></div>
                    <div className="act-content"><div className="act-title">{a.t}</div><div className="act-sub">{a.s}</div></div>
                    <div className="act-time">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
