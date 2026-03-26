'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

// Shopify-EXACT line chart: solid current line + dotted comparison line + grid
function ShopifyChart({ data=[], compare=[], labels=[], height=180, color='#5b9cf6' }) {
  const W=600, H=height, pad={t:16,r:12,b:30,l:52}
  const allVals=[...data,...compare].filter(n=>typeof n==='number')
  const maxY=Math.max(...allVals,1)
  const fw=W-pad.l-pad.r, fh=H-pad.t-pad.b
  const x=(i,len)=>pad.l+(i/(Math.max(len-1,1)))*fw
  const y=(v)=>pad.t+(1-v/maxY)*fh
  
  const linePts=data.map((v,i)=>`${i===0?'M':'L'}${x(i,data.length)},${y(v)}`).join(' ')
  const areaPath=data.length>0?`${linePts} L${x(data.length-1,data.length)},${H-pad.b} L${x(0,data.length)},${H-pad.b} Z`:''
  const comparePts=compare.map((v,i)=>`${i===0?'M':'L'}${x(i,compare.length)},${y(v)}`).join(' ')
  
  const gridLines=[0,0.25,0.5,0.75,1]
  const id=`sg${Math.random().toString(36).slice(2,6)}`
  
  if(data.length<2) return (
    <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#9ba1ab'}}>
      Noch keine Daten — Umsatz wächst mit deinen ersten Clients
    </div>
  )
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {gridLines.map((f,i)=>{
        const yp=pad.t+(1-f)*fh
        const val=Math.round(maxY*f)
        return <g key={i}>
          <line x1={pad.l} y1={yp} x2={W-pad.r} y2={yp} stroke="#e8ecf0" strokeWidth="1"/>
          <text x={pad.l-6} y={yp+4} textAnchor="end" fontSize="10" fill="#9ba1ab" fontFamily="Inter,sans-serif">
            {val>=1000?`${(val/1000).toFixed(1)}k`:val}
          </text>
        </g>
      })}
      {/* X labels */}
      {labels.map((l,i)=><text key={i} x={x(i,labels.length)} y={H-8} textAnchor="middle" fontSize="10" fill="#9ba1ab" fontFamily="Inter,sans-serif">{l}</text>)}
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${id})`}/>
      {/* Comparison dotted line */}
      {compare.length>1&&<path d={comparePts} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" strokeLinecap="round"/>}
      {/* Main solid line */}
      <path d={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots */}
      {data.map((v,i)=><circle key={i} cx={x(i,data.length)} cy={y(v)} r="4" fill="#fff" stroke={color} strokeWidth="2"/>)}
    </svg>
  )
}

function Spark({ data=[], color='#5b9cf6' }) {
  if(data.length<2) return null
  const W=72,H=28,max=Math.max(...data),min=Math.min(...data),range=max-min||1
  const pts=data.map((v,i)=>`${i===0?'M':'L'}${(i/(data.length-1))*W},${H-2-((v-min)/range)*(H-4)}`).join(' ')
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
  const months=['Sep','Okt','Nov','Dez','Jan','Feb','Mär']
  // Simulated growth data — last 7 months, current + comparison (previous period dotted)
  const revData=[0,0,0,0,0,0,rev]
  const revCompare=[0,0,0,0,0,rev*0.8,rev*0.9] // dotted comparison line
  const leadsData=[0,1,2,1,3,openLeads,openLeads+1]
  const SBadge=s=>{const m={'Gewonnen':'badge bg','In Kontakt':'badge bb','Qualifiziert':'badge bp','Neu':'badge bgr','Call gebucht':'badge bb','Verloren':'badge br'};return <span className={m[s]||'badge bgr'}>{s}</span>}
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Uebersicht</span></div>
          <div className="tb-r">
            <div className="search-box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Suchen..."/></div>
            <div className="btn-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          </div>
        </div>
        <div className="page">
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
          {/* Shopify-style main chart */}
          <div className="g21" style={{marginBottom:16}}>
            <div className="card">
              <div className="ch">
                <div><div className="ct">Gesamtumsatz</div><div className="csub">Monatliche Entwicklung</div></div>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#5c6370'}}>
                    <span style={{width:18,height:2,background:'#5b9cf6',display:'inline-block',borderRadius:1}}></span>
                    Mär 2026
                  </span>
                  <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#9ba1ab'}}>
                    <span style={{width:18,height:2,background:'#5b9cf6',display:'inline-block',borderRadius:1,opacity:.4,borderBottom:'2px dashed #5b9cf6'}}></span>
                    Vorperiode
                  </span>
                  <span className="tag-g" style={{fontSize:11}}>Q1 2026</span>
                </div>
              </div>
              <div className="cb" style={{paddingTop:8}}>
                <div style={{fontSize:28,fontWeight:600,letterSpacing:'-.5px',marginBottom:4}}>€{rev.toLocaleString('de-DE')}</div>
                <ShopifyChart data={revData} compare={revCompare} labels={months} height={160}/>
                <div style={{display:'flex',gap:24,marginTop:12,paddingTop:12,borderTop:'1px solid #f0f2f5'}}>
                  {[['Gesamt MTD',`€${rev.toLocaleString('de-DE')}`,true],['Ø / Client',active.length?`€${Math.round(rev/active.length).toLocaleString('de-DE')}`:'—',false],['Wachstum','+23.1%',true],['Ziel','€5.000',null]].map(([l,v,g])=>(
                    <div key={l}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:2}}>{l}</div><div style={{fontSize:16,fontWeight:600,color:g===true?'#0a7c59':g===false?'#1a1a2e':'#1565c0'}}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="ch"><div className="ct">Sales Pipeline</div><span className="tag" style={{fontSize:11}}>{leads.length} Leads</span></div>
              <div className="cb" style={{paddingTop:8}}>
                <div style={{fontSize:22,fontWeight:600,letterSpacing:'-.5px',marginBottom:10,color:'#1565c0'}}>€{leads.filter(l=>l.wert).reduce((s,l)=>s+(l.wert||0),0).toLocaleString('de-DE')}</div>
                {[['Neu','#c5ccd4'],['In Kontakt','#93c5fd'],['Qualifiziert','#c4b5fd'],['Call gebucht','#1565c0'],['Gewonnen','#0a7c59']].map(([s,c])=>{
                  const n=leads.filter(l=>l.status===s).length
                  return <div key={s} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}><span style={{color:'#5c6370'}}>{s}</span><span style={{fontWeight:600}}>{n}</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:leads.length?`${(n/leads.length)*100}%`:'0%',background:c,transition:'width .5s'}}/></div>
                  </div>
                })}
              </div>
            </div>
          </div>
          {/* Bottom row */}
          <div className="g3">
            <div className="card">
              <div className="ch">
                <div><div className="ct">Leads Uebersicht</div><div className="csub">Verglichen mit: Vormonat</div></div>
                <span style={{fontSize:11,color:'#0a7c59',fontWeight:600}}>↑ +{leads.length}</span>
              </div>
              <div className="cb" style={{paddingTop:8}}>
                <div style={{fontSize:22,fontWeight:600,letterSpacing:'-.5px',marginBottom:6}}>{leads.length}</div>
                <ShopifyChart data={leadsData} compare={[0,0,1,1,2,2,3]} labels={months} height={90} color='#34d399'/>
              </div>
            </div>
            <div className="card">
              <div className="ch"><div className="ct">Neueste Leads</div><a href="/leads" style={{fontSize:12,color:'#1565c0',fontWeight:500}}>Alle →</a></div>
              {loading?<div className="empty"><p>Laden...</p></div>:leads.length===0?<div className="empty"><p>Noch keine Leads.</p></div>:(
                <div className="tw"><table><thead><tr><th>Name</th><th>Status</th><th>Wert</th></tr></thead>
                <tbody>{leads.slice(0,5).map(l=>(
                  <tr key={l.id}>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:26,height:26,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500,fontSize:13}}>{l.name}</span></div></td>
                    <td>{SBadge(l.status)}</td>
                    <td style={{fontWeight:600,fontSize:13}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
                  </tr>
                ))}</tbody></table></div>
              )}
            </div>
            <div className="card">
              <div className="ch"><div className="ct">Aktivitaet</div><span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#0a7c59'}}><span className="live-dot"></span>Live</span></div>
              <div className="cb" style={{paddingTop:4}}>
                {[{t:'Neuer Lead eingetragen',s:'Via Calendly',c:'#5b9cf6',tm:'2 min'},{t:'Client Status update',s:'Monat 2 gestartet',c:'#34d399',tm:'18 min'},{t:'Email Sequenz aktiv',s:'7-Tage Flow',c:'#5b9cf6',tm:'1 Std'},{t:'Strategy Call',s:'45 Min · KI Notizen',c:'#f59e0b',tm:'3 Std'},{t:'Report generiert',s:'Monatsreport Mär',c:'#a78bfa',tm:'5 Std'}].map((a,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderBottom:i<4?'1px solid #f0f2f5':'none'}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:a.c,marginTop:5,flexShrink:0}}></div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{a.t}</div><div style={{fontSize:11,color:'#9ba1ab',marginTop:1}}>{a.s}</div></div>
                    <div style={{fontSize:11,color:'#9ba1ab',whiteSpace:'nowrap'}}>{a.tm}</div>
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
