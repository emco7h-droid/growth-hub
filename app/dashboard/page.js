'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

// PayPal-style clean SVG line chart
function LineChart({ data=[], labels=[], height=160, color='#5b9cf6', showArea=true }) {
  if (!data.length) return <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#9ba1ab'}}>Noch keine Daten — wachsendes Business braucht Geduld</div>
  const W=600, H=height, pad={t:12,r:8,b:28,l:48}
  const maxY=Math.max(...data,1), minY=0
  const range=maxY-minY||1
  const xs=data.map((_,i)=>pad.l+(i/(data.length-1||1))*(W-pad.l-pad.r))
  const ys=data.map(v=>pad.t+(1-(v-minY)/range)*(H-pad.t-pad.b))
  const linePts=xs.map((x,i)=>`${i===0?'M':'L'}${x},${ys[i]}`).join(' ')
  const area=`${linePts} L${xs[xs.length-1]},${H-pad.b} L${xs[0]},${H-pad.b} Z`
  const id=`g${Math.random().toString(36).slice(2,7)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      {[0,.25,.5,.75,1].map((f,i)=>{
        const y=pad.t+(1-f)*(H-pad.t-pad.b)
        return <g key={i}><line x1={pad.l} y1={y} x2={W-pad.r} y2={y} stroke="#f0f2f5" strokeWidth="1"/><text x={pad.l-6} y={y+4} textAnchor="end" fontSize="10" fill="#9ba1ab">{Math.round(maxY*f).toLocaleString('de-DE')}</text></g>
      })}
      {showArea&&<path d={area} fill={`url(#${id})`}/>}
      <path d={linePts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>)}
      {labels.map((l,i)=><text key={i} x={xs[i]} y={H-8} textAnchor="middle" fontSize="10" fill="#9ba1ab">{l}</text>)}
    </svg>
  )
}

function Spark({ data=[], color='#5b9cf6' }) {
  if(data.length<2) return null
  const W=72,H=28,max=Math.max(...data),min=Math.min(...data),range=max-min||1
  const xs=data.map((_,i)=>(i/(data.length-1))*W)
  const ys=data.map(v=>H-2-((v-min)/range)*(H-4))
  const pts=xs.map((x,i)=>`${i===0?'M':'L'}${x},${ys[i]}`).join(' ')
  return <svg width={W} height={H}><path d={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".8"/></svg>
}

export default function Dashboard() {
  const [leads,setLeads]=useState([]);const [clients,setClients]=useState([]);const [loading,setLoading]=useState(true)
  const router=useRouter()
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(!session){router.push('/login');return}
      Promise.all([supabase.from('leads').select('*').order('created_at',{ascending:false}),supabase.from('clients').select('*').order('created_at',{ascending:false})])
      .then(([l,c])=>{setLeads(l.data||[]);setClients(c.data||[]);setLoading(false)})
    })
  },[])

  const active=clients.filter(c=>c.status==='Aktiv')
  const rev=active.reduce((s,c)=>s+(c.retainer||0),0)
  const openLeads=leads.filter(l=>!['Gewonnen','Verloren','No Show'].includes(l.status)).length
  const won=leads.filter(l=>l.status==='Gewonnen').length
  const conv=leads.length>0?Math.round((won/leads.length)*100):0

  const months=['Okt','Nov','Dez','Jan','Feb','Mär']
  const revData=[0,0,0,0,0,rev]
  const leadsData=[0,2,1,3,openLeads,openLeads]
  const convData=[0,5,8,12,18,conv]

  const SBadge=s=>{const m={'Gewonnen':'badge bg','In Kontakt':'badge bb','Qualifiziert':'badge bp','Neu':'badge bgr','Call gebucht':'badge bb','Verloren':'badge br'};return <span className={m[s]||'badge bgr'}>{s}</span>}

  return (
    <div className="layout">
      <Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Uebersicht</span></div>
          <div className="tb-r">
            <div className="search-box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Suchen..."/></div>
            <div className="btn-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
        </div>

        <div className="page">
          {/* Metrics */}
          <div className="g4" style={{marginBottom:20}}>
            {[
              {l:'Aktive Clients',v:loading?'—':active.length,chg:'+2 diesen Monat',up:true,spark:[2,3,2,4,3,active.length||0]},
              {l:'Monatl. Umsatz',v:loading?'—':`€${rev.toLocaleString('de-DE')}`,chg:'+23.1%',up:true,spark:[800,1200,950,1800,2100,rev||0]},
              {l:'Offene Leads',v:loading?'—':openLeads,chg:`${leads.length} gesamt`,neu:true,spark:[3,5,4,6,5,openLeads||0]},
              {l:'Conversion Rate',v:loading?'—':`${conv}%`,chg:conv>20?'Ueber Ziel':'Unter Ziel',up:conv>20,spark:[10,15,12,18,20,conv||0]},
            ].map((m,i)=>(
              <div key={i} className="metric">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <span className="m-lbl">{m.l}</span>
                  <Spark data={m.spark} color={m.up?'#5b9cf6':m.neu?'#9ba1ab':'#ef4444'}/>
                </div>
                <div className="m-val">{m.v}</div>
                <div className={`m-chg ${m.neu?'neu':m.up?'up':'dn'}`}>
                  {!m.neu&&(m.up?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>)}
                  {m.chg}
                </div>
              </div>
            ))}
          </div>

          {/* Main Charts Row - PayPal style 3 charts */}
          <div className="g3" style={{marginBottom:16}}>
            <div className="card" style={{gridColumn:'span 2'}}>
              <div className="ch">
                <div><div className="ct">Umsatz Uebersicht</div><div className="csub">Monatliche Entwicklung</div></div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#9ba1ab'}}><span style={{width:16,height:2,background:'#5b9cf6',display:'inline-block',borderRadius:1}}></span>Umsatz</span>
                  <span className="tag-g" style={{fontSize:11}}>Q1 2026</span>
                </div>
              </div>
              <div className="cb" style={{paddingTop:10}}>
                <LineChart data={revData} labels={months} height={150}/>
                <div style={{display:'flex',gap:20,marginTop:12,paddingTop:12,borderTop:'1px solid #f0f2f5'}}>
                  {[['Gesamt MTD',`€${rev.toLocaleString('de-DE')}`,true],['Ø/Client',active.length?`€${Math.round(rev/active.length).toLocaleString('de-DE')}`:'—',false],['Wachstum','+23.1%',true]].map(([l,v,green])=>(
                    <div key={l}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:2}}>{l}</div><div style={{fontSize:16,fontWeight:600,color:green?'#0a7c59':'#1a1a2e'}}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="ch"><div className="ct">Leads</div><span className="tag" style={{fontSize:11}}>{leads.length} ges.</span></div>
              <div className="cb" style={{paddingTop:10}}>
                <LineChart data={leadsData} labels={months} height={100} color='#34d399'/>
                <div style={{marginTop:12}}>
                  {[['Neu','#e1e4e8'],['In Kontakt','#c5d8fd'],['Qualifiziert','#d4c5f8'],['Gewonnen','#0a7c59']].map(([s,c])=>{
                    const n=leads.filter(l=>l.status===s).length
                    return <div key={s} className="pb-item" style={{marginBottom:6}}>
                      <div className="pb-row">
                        <span className="pb-lbl" style={{fontSize:11}}>{s}</span>
                        <div className="pb-bg"><div className="pb-fill" style={{width:leads.length?`${(n/leads.length)*100}%`:'0%',background:c}}/></div>
                        <span className="pb-n" style={{fontSize:11}}>{n}</span>
                      </div>
                    </div>
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="g3" style={{marginBottom:16}}>
            <div className="card">
              <div className="ch"><div className="ct">Conversion Rate</div></div>
              <div className="cb" style={{paddingTop:10}}>
                <LineChart data={convData} labels={months} height={100} color='#a78bfa'/>
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #f0f2f5',display:'flex',justifyContent:'space-between'}}>
                  <div><div style={{fontSize:11,color:'#9ba1ab'}}>Aktuell</div><div style={{fontSize:18,fontWeight:600,color:'#6b4bc8'}}>{conv}%</div></div>
                  <div><div style={{fontSize:11,color:'#9ba1ab'}}>Ziel</div><div style={{fontSize:18,fontWeight:600,color:'#1a1a2e'}}>25%</div></div>
                  <div><div style={{fontSize:11,color:'#9ba1ab'}}>Won</div><div style={{fontSize:18,fontWeight:600,color:'#0a7c59'}}>{won}</div></div>
                </div>
              </div>
            </div>

            <div className="card" style={{gridColumn:'span 2'}}>
              <div className="ch"><div className="ct">Neueste Leads</div><a href="/leads" style={{fontSize:12.5,color:'#1565c0',fontWeight:500}}>Alle →</a></div>
              {loading?<div className="empty"><p>Laden...</p></div>:leads.length===0?<div className="empty"><p>Noch keine Leads.</p></div>:(
                <div className="tw">
                  <table><thead><tr><th>Name</th><th>Nische</th><th>Status</th><th>Wert</th></tr></thead>
                  <tbody>{leads.slice(0,5).map(l=>(
                    <tr key={l.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:26,height:26,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500,fontSize:13}}>{l.name}</span></div></td>
                      <td style={{fontSize:12,color:'#5c6370'}}>{l.nische||'—'}</td>
                      <td>{SBadge(l.status)}</td>
                      <td style={{fontWeight:600,fontSize:13}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
              )}
            </div>
          </div>

          {/* Third row */}
          <div className="g3">
            <div className="card">
              <div className="ch"><div className="ct">Aktive Clients</div><a href="/clients" style={{fontSize:12.5,color:'#1565c0',fontWeight:500}}>Alle →</a></div>
              {active.length===0?<div className="empty"><p>Keine aktiven Clients.</p></div>:active.slice(0,5).map(c=>(
                <div key={c.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 18px',borderBottom:'1px solid #f0f2f5'}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:'#1565c0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10.5,fontWeight:600,color:'#fff',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:'#9ba1ab'}}>Mo {c.monat||1}/3</div></div>
                  <span style={{fontWeight:600,fontSize:13,color:'#0a7c59'}}>€{(c.retainer||0).toLocaleString('de-DE')}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="ch">
                <div className="ct">Aktivitaet</div>
                <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#0a7c59'}}><span className="live-dot"></span>Live</span>
              </div>
              <div className="cb" style={{paddingTop:4}}>
                {[{t:'Neuer Lead eingetragen',s:'Via Calendly',c:'#5b9cf6',tm:'2 min'},{t:'Client Status update',s:'Monat 2 gestartet',c:'#34d399',tm:'18 min'},{t:'Email Sequenz aktiv',s:'7-Tage Flow',c:'#5b9cf6',tm:'1 Std'},{t:'Strategy Call',s:'45 Min · Notizen gespeichert',c:'#f59e0b',tm:'3 Std'}].map((a,i)=>(
                  <div key={i} className="ai-item">
                    <div className="a-dot" style={{background:a.c}}></div>
                    <div className="a-content"><div className="a-title">{a.t}</div><div className="a-sub">{a.s}</div></div>
                    <div className="a-time">{a.tm}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="ch"><div className="ct">Schnellzugriff</div></div>
              <div className="cb" style={{paddingTop:4}}>
                {[
                  ['Neuer Lead','/leads','#5b9cf6'],
                  ['Neuer Client','/clients','#34d399'],
                  ['Aufgabe erstellen','/tasks','#f59e0b'],
                  ['AI Copywriter','/ai','#a78bfa'],
                  ['Calendly oeffnen','https://calendly.com/emco7h','#1565c0'],
                  ['Klaviyo oeffnen','https://klaviyo.com','#fb923c'],
                ].map(([l,href,c],i)=>(
                  <a key={i} href={href} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<5?'1px solid #f0f2f5':'none',cursor:'pointer',transition:'color .12s',color:'var(--text)',textDecoration:'none'}}
                    onMouseOver={e=>e.currentTarget.style.color=c} onMouseOut={e=>e.currentTarget.style.color='var(--text)'}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:c,flexShrink:0}}></div>
                    <span style={{fontSize:13,fontWeight:500}}>{l}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginLeft:'auto',opacity:.3}}><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
