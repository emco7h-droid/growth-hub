'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Reports() {
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('kpis').select('*'),
      ]).then(([l,c,k]) => { setLeads(l.data||[]); setClients(c.data||[]); setKpis(k.data||[]); setLoading(false) })
    })
  }, [])

  const wonLeads = leads.filter(l=>l.status==='Gewonnen')
  const lostLeads = leads.filter(l=>l.status==='Verloren')
  const conv = leads.length > 0 ? (wonLeads.length/leads.length*100).toFixed(1) : 0
  const totalRev = clients.filter(c=>c.status==='Aktiv').reduce((s,c)=>s+(c.retainer||0),0)
  const totalPipeVal = leads.filter(l=>!['Gewonnen','Verloren'].includes(l.status)).reduce((s,l)=>s+(l.wert||0),0)
  const avgDeal = wonLeads.length > 0 ? Math.round(wonLeads.reduce((s,l)=>s+(l.wert||0),0)/wonLeads.length) : 0

  const byStatus = ['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren'].map(s => ({
    status: s, count: leads.filter(l=>l.status===s).length
  }))
  const maxCount = Math.max(...byStatus.map(s=>s.count), 1)

  const bySource = ['Instagram DM','TikTok','YouTube','Calendly','Empfehlung','Kalt Akquise','Organisch','Werbung'].map(q => ({
    quelle: q, count: leads.filter(l=>l.quelle===q).length
  })).filter(q=>q.count>0).sort((a,b)=>b.count-a.count)

  const byNische = [...new Set(leads.filter(l=>l.nische).map(l=>l.nische))].map(n => ({
    nische: n, count: leads.filter(l=>l.nische===n).length
  })).sort((a,b)=>b.count-a.count).slice(0,6)

  const Stat = ({label, value, sub, color}) => (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{color:color||'#1a1a1a'}}>{value}</div>
      {sub && <div className="metric-change neutral">{sub}</div>}
    </div>
  )

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left"><span className="topbar-title">Reports & Statistiken</span></div>
          <div className="topbar-right"><span style={{fontSize:12,color:'#9b9b9b'}}>Alle Zeitraeume</span></div>
        </div>
        <div className="page">
          {loading ? <div style={{textAlign:'center',padding:48,color:'#9b9b9b'}}>Laden...</div> : <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              <Stat label="Monatl. Umsatz" value={`€${totalRev.toLocaleString('de-DE')}`} sub="Aktive Clients" color="#008060"/>
              <Stat label="Pipeline Wert" value={`€${totalPipeVal.toLocaleString('de-DE')}`} sub="Offene Deals"/>
              <Stat label="Ø Deal Groesse" value={avgDeal?`€${avgDeal.toLocaleString('de-DE')}`:'—'} sub="Bei Abschluss"/>
              <Stat label="Conversion Rate" value={`${conv}%`} sub={`${wonLeads.length} von ${leads.length} Leads`} color={conv>20?'#008060':'#b98900'}/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div className="card">
                <div className="card-header"><div className="card-title">Lead Status Verteilung</div></div>
                <div className="card-body">
                  {byStatus.map(s => (
                    <div key={s.status} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
                        <span style={{color:'#6b6b6b'}}>{s.status}</span>
                        <span style={{fontWeight:600}}>{s.count}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width:`${(s.count/maxCount)*100}%`,background:s.status==='Gewonnen'?'#008060':s.status==='Verloren'?'#d72c0d':'#2c6ecb'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Umsatz nach Client</div></div>
                <div className="card-body">
                  {clients.filter(c=>c.status==='Aktiv').sort((a,b)=>(b.retainer||0)-(a.retainer||0)).map((c,i) => (
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid #f0f0f0'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#fff',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500}}>{c.name}</div>
                        <div style={{fontSize:11,color:'#9b9b9b'}}>{c.nische||'—'} · Monat {c.monat||1}</div>
                      </div>
                      <div style={{fontWeight:600,color:'#008060',fontSize:13}}>€{(c.retainer||0).toLocaleString('de-DE')}</div>
                    </div>
                  ))}
                  {clients.filter(c=>c.status==='Aktiv').length===0 && <div style={{color:'#9b9b9b',fontSize:13}}>Noch keine aktiven Clients.</div>}
                </div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div className="card">
                <div className="card-header"><div className="card-title">Leads nach Quelle</div></div>
                <div className="card-body">
                  {bySource.length === 0 ? <div style={{color:'#9b9b9b',fontSize:13}}>Keine Daten.</div> : bySource.map(s => (
                    <div key={s.quelle} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <span style={{fontSize:13,color:'#6b6b6b',width:120,flexShrink:0}}>{s.quelle}</span>
                      <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',background:'#2c6ecb',borderRadius:4,width:`${(s.count/leads.length)*100}%`}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:600,width:20,textAlign:'right'}}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Leads nach Nische</div></div>
                <div className="card-body">
                  {byNische.length === 0 ? <div style={{color:'#9b9b9b',fontSize:13}}>Keine Daten.</div> : byNische.map(n => (
                    <div key={n.nische} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <span style={{fontSize:13,color:'#6b6b6b',width:130,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.nische}</span>
                      <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',background:'#6b4bc8',borderRadius:4,width:`${(n.count/leads.length)*100}%`}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:600,width:20,textAlign:'right'}}>{n.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Win / Loss Analyse</div></div>
              <div className="card-body" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
                {[
                  ['Gewonnen',wonLeads.length,'#008060','badge-green'],
                  ['Verloren',lostLeads.length,'#d72c0d','badge-red'],
                  ['Gewonnen Wert',`€${wonLeads.reduce((s,l)=>s+(l.wert||0),0).toLocaleString('de-DE')}`,'#008060'],
                  ['Verloren Wert',`€${lostLeads.reduce((s,l)=>s+(l.wert||0),0).toLocaleString('de-DE')}`,'#d72c0d'],
                ].map(([l,v,c])=>(
                  <div key={l}>
                    <div style={{fontSize:11,color:'#9b9b9b',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>{l}</div>
                    <div style={{fontSize:22,fontWeight:600,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
