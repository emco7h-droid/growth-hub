'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      Promise.all([
        supabase.from('leads').select('*').order('created_at',{ascending:false}),
        supabase.from('clients').select('*').order('created_at',{ascending:false})
      ]).then(([l,c]) => { setLeads(l.data||[]); setClients(c.data||[]); setLoading(false) })
    })
  }, [])

  const active = clients.filter(c=>c.status==='Aktiv')
  const rev = active.reduce((s,c)=>s+(c.retainer||0),0)
  const open = leads.filter(l=>l.status==='Ausstehend').length
  const won = leads.filter(l=>l.status==='Gewonnen').length
  const conv = leads.length>0?Math.round((won/leads.length)*100):0

  const metrics = [
    { label:'Gesamt Leads', value: loading?'—':leads.length, sub:'Alle Leads', color:'var(--blue-4)', icon:'🎯', bg:'var(--blue-1)' },
    { label:'Umsatz (MTD)', value: loading?'—':`€${rev.toLocaleString('de-DE')}`, sub:'Monatlich wiederkehrend', color:'var(--green)', icon:'💰', bg:'#dcfce7' },
    { label:'Aktive Clients', value: loading?'—':active.length, sub:'Laufende Projekte', color:'var(--purple)', icon:'👥', bg:'#f3e8ff' },
    { label:'Conversion Rate', value: loading?'—':`${conv}%`, sub:'Lead zu Client', color:'var(--amber)', icon:'📈', bg:'#fef9c3' },
  ]

  const recentLeads = leads.slice(0,4)
  const statusBadge = (s) => {
    const map = { 'Gewonnen':'bg-g','Interessiert':'bg-b','Ausstehend':'bg-a','Verloren':'bg-r','No Show':'bg-gray' }
    return <span className={`bdg ${map[s]||'bg-gray'}`}>{s}</span>
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div className="mc">
        <div className="tb">
          <div className="tb-title">Dashboard</div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div className="sb-bar">🔍 Suchen...</div>
            <div className="ic-btn">🔔<span style={{position:'absolute',top:6,right:6,width:7,height:7,background:'var(--red)',borderRadius:'50%',border:'1.5px solid #fff'}}></span></div>
            <div className="ic-btn">👤</div>
            <button className="btn-p">＋ Neuer Lead</button>
          </div>
        </div>
        <div className="ct">
          <div className="mg">
            {metrics.map((m,i) => (
              <div key={i} className="m-card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div className="m-lbl">{m.label}</div>
                  <div style={{width:40,height:40,borderRadius:10,background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{m.icon}</div>
                </div>
                <div className="m-val" style={{color:m.color}}>{m.value}</div>
                <div className="m-sub" style={{color:'var(--green)'}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="g3">
            <div className="sc" style={{gridColumn:'span 2'}}>
              <div className="ch">
                <span className="ct-t">📊 Umsatz Uebersicht</span>
                <span className="tag">Q1 2026</span>
              </div>
              <div className="cb">
                <div style={{display:'flex',alignItems:'flex-end',gap:'12px',height:'120px',padding:'0 8px'}}>
                  {['Okt','Nov','Dez','Jan','Feb','Mär'].map((m,i) => (
                    <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <div style={{width:'100%',display:'flex',gap:'3px',alignItems:'flex-end',height:'100px'}}>
                        <div style={{flex:1,borderRadius:'4px 4px 0 0',background:'var(--blue-2)',height:`${[68,85,72,95,110,118][i]}px`}}></div>
                        <div style={{flex:1,borderRadius:'4px 4px 0 0',background:'linear-gradient(135deg,var(--blue-4),var(--accent2))',height:`${[80,90,85,88,100,105][i]}px`}}></div>
                      </div>
                      <div style={{fontSize:11,color:'var(--text-m)',fontWeight:600}}>{m}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sc">
              <div className="ch"><span className="ct-t">🔀 Sales Pipeline</span><span className="tag">€248k</span></div>
              <div className="cb">
                {[['Kontaktiert',88],['Qualifiziert',65],['Demo',41],['Proposal',28],['Abschluss',18]].map(([n,v]) => (
                  <div key={n} style={{marginBottom:'10px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12.5px',marginBottom:'4px'}}>
                      <span style={{color:'var(--text-s)',fontWeight:500}}>{n}</span>
                      <span style={{fontWeight:700,color:'var(--text)'}}>{v}</span>
                    </div>
                    <div className="pb"><div className="pf" style={{width:`${v}%`}}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="g3">
            <div className="sc">
              <div className="ch"><span className="ct-t">🎯 Neueste Leads</span><a href="/leads" style={{fontSize:12,color:'var(--blue-4)',fontWeight:700}}>Alle →</a></div>
              {loading?<div className="empty">Laden...</div>:recentLeads.length===0?<div className="empty">Noch keine Leads</div>:
              <table><thead><tr><th>Name</th><th>Status</th><th>Wert</th></tr></thead>
              <tbody>{recentLeads.map(l=><tr key={l.id}>
                <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,var(--blue-4),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div>
                  <span style={{fontWeight:600}}>{l.name}</span>
                </div></td>
                <td>{statusBadge(l.status)}</td>
                <td style={{fontWeight:700,color:'var(--text)'}}>{l.retainer_wert?`€${l.retainer_wert.toLocaleString('de-DE')}`:'—'}</td>
              </tr>)}</tbody></table>}
            </div>
            <div className="sc">
              <div className="ch"><span className="ct-t">⚡ Aktivität</span><div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--green)'}}><span className="ld"></span>Live</div></div>
              <div className="cb" style={{paddingTop:8}}>
                {[
                  {icon:'🎯',main:'Neuer Lead eingetragen',sub:'Aus Calendly · Discovery Call',t:'2 min'},
                  {icon:'💰',main:'Client Status aktualisiert',sub:'Monat 2 begonnen',t:'18 min'},
                  {icon:'📧',main:'Email Sequenz gestartet',sub:'7-Tage Onboarding Flow',t:'1 Std'},
                  {icon:'📞',main:'Strategy Call abgehalten',sub:'45 min · Notizen gespeichert',t:'3 Std'},
                ].map((a,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:i<3?'1px solid var(--border)':'none'}}>
                    <div style={{width:34,height:34,borderRadius:10,background:'var(--blue-1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{a.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{a.main}</div>
                      <div style={{fontSize:11.5,color:'var(--text-m)',marginTop:2}}>{a.sub}</div>
                    </div>
                    <div style={{fontSize:11,color:'var(--text-m)',whiteSpace:'nowrap'}}>{a.t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sc" style={{background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)',border:'none'}}>
              <div className="ch" style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                <span className="ct-t" style={{color:'#fff'}}>🤖 AI Center</span>
                <span style={{background:'var(--blue-3)',color:'#fff',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:700}}>BETA</span>
              </div>
              <div className="cb">
                <p style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:16}}>Automatisiere deine Workflows mit KI</p>
                {[
                  {icon:'✍️',name:'AI Copywriter',sub:'E-Mails & Ads generieren'},
                  {icon:'🎯',name:'Lead Scoring',sub:'KI bewertet deine Leads'},
                  {icon:'📞',name:'Call Analyse',sub:'Transkription & Insights'},
                  {icon:'📊',name:'Prognose Engine',sub:'Revenue Forecast KI'},
                ].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'8px 10px',borderRadius:10,marginBottom:6,background:'rgba(255,255,255,0.07)',cursor:'pointer',transition:'background .15s'}}>
                    <span style={{fontSize:18}}>{f.icon}</span>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:600,color:'#fff'}}>{f.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>{f.sub}</div>
                    </div>
                    <span style={{marginLeft:'auto',color:'rgba(255,255,255,0.3)',fontSize:12}}>→</span>
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
