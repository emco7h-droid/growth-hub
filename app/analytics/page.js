'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'
import { supabase } from '@/lib/supabase'

function ShopifyChart({ data=[], compare=[], labels=[], height=100, color='#5b9cf6' }) {
  const W=600,H=height,pad={t:10,r:8,b:22,l:44}
  const allVals=[...data,...compare].filter(n=>typeof n==='number')
  const maxY=Math.max(...allVals,1),fw=W-pad.l-pad.r,fh=H-pad.t-pad.b
  const x=(i,len)=>pad.l+(i/(Math.max(len-1,1)))*fw
  const y=(v)=>pad.t+(1-v/maxY)*fh
  const linePts=data.map((v,i)=>`${i===0?'M':'L'}${x(i,data.length)},${y(v)}`).join(' ')
  const areaPath=data.length>1?`${linePts} L${x(data.length-1,data.length)},${H-pad.b} L${x(0,data.length)},${H-pad.b} Z`:''
  const comparePts=compare.map((v,i)=>`${i===0?'M':'L'}${x(i,compare.length)},${y(v)}`).join(' ')
  const id=`ac${Math.random().toString(36).slice(2,5)}`
  if(data.length<2) return <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#9ba1ab'}}>Keine Daten</div>
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".12"/><stop offset="100%" stopColor={color} stopOpacity=".01"/></linearGradient></defs>
      {[0,.5,1].map((f,i)=>{const yp=pad.t+(1-f)*fh;return <g key={i}><line x1={pad.l} y1={yp} x2={W-pad.r} y2={yp} stroke="#e8ecf0" strokeWidth="1"/><text x={pad.l-5} y={yp+3} textAnchor="end" fontSize="9" fill="#9ba1ab">{Math.round(maxY*f).toLocaleString('de-DE')}</text></g>})}
      {labels.map((l,i)=><text key={i} x={x(i,labels.length)} y={H-4} textAnchor="middle" fontSize="9" fill="#9ba1ab">{l}</text>)}
      <path d={areaPath} fill={`url(#${id})`}/>
      {compare.length>1&&<path d={comparePts} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity=".35"/>}
      <path d={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v,i)=><circle key={i} cx={x(i,data.length)} cy={y(v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>)}
    </svg>
  )
}

export default function Analytics() {
  const [leads,setLeads]=useState([]);const [clients,setClients]=useState([]);const [period,setPeriod]=useState('30 Tage')
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};Promise.all([supabase.from('leads').select('*'),supabase.from('clients').select('*')]).then(([l,c])=>{setLeads(l.data||[]);setClients(c.data||[])})});},[])
  const active=clients.filter(c=>c.status==='Aktiv')
  const rev=active.reduce((s,c)=>s+(c.retainer||0),0)
  const won=leads.filter(l=>l.status==='Gewonnen').length
  const months=['Sep','Okt','Nov','Dez','Jan','Feb','Mär']
  const charts=[
    {t:'Gesamtumsatz',sub:'Verglichen mit: Vormonat',v:`€${rev.toLocaleString('de-DE')}`,chg:'+23.1%',up:true,color:'#5b9cf6',data:[0,0,0,0,0,0,rev],compare:[0,0,0,0,0,rev*0.7,rev*0.9]},
    {t:'Onlineshop-Sitzungen',sub:'Unique Website Besucher',v:Math.max(0,leads.length*8),chg:'+35%',up:true,color:'#34d399',data:[0,2,5,8,12,18,leads.length*8],compare:[0,1,3,5,8,12,leads.length*6]},
    {t:'Conversion Rate',sub:'Lead zu Client',v:`${leads.length?Math.round((won/leads.length)*100):0}%`,chg:'+2.1%',up:true,color:'#a78bfa',data:[0,5,8,10,12,16,leads.length?Math.round((won/leads.length)*100):0],compare:[0,3,6,8,10,13,12]},
    {t:'Neue Leads',sub:'Discovery Calls gebucht',v:leads.length,chg:`+${leads.length}`,up:true,color:'#fb923c',data:[0,2,1,3,2,4,leads.length],compare:[0,1,1,2,1,3,leads.length-1]},
    {t:'Aktive Clients',sub:'Laufende Zusammenarbeiten',v:active.length,chg:'+2',up:true,color:'#5b9cf6',data:[0,1,1,2,2,3,active.length],compare:[0,0,1,1,2,2,active.length-1]},
    {t:'Ø Bestellwert',sub:'Durchschnittlicher Retainer',v:active.length?`€${Math.round(rev/active.length).toLocaleString('de-DE')}`:'—',chg:'+12%',up:true,color:'#34d399',data:[0,1000,1200,1500,1800,2000,active.length?Math.round(rev/active.length):0],compare:[0,800,1000,1200,1500,1700,1800]},
  ]
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Statistiken</span></div>
          <div className="tb-r">
            <div style={{display:'flex',alignItems:'center',gap:10,fontSize:12,color:'#9ba1ab'}}>
              <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:16,height:2,background:'#5b9cf6',display:'inline-block'}}></span>Aktuell</span>
              <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:16,borderTop:'2px dashed #5b9cf6',display:'inline-block',opacity:.4}}></span>Vorperiode</span>
            </div>
            {['Heute','7 Tage','30 Tage','Alles'].map(t=><button key={t} onClick={()=>setPeriod(t)} className={period===t?'btn-p':'btn-s'} style={{height:28,padding:'0 10px',fontSize:12}}>{t}</button>)}
            <button className="btn-s" style={{height:28,padding:'0 10px',fontSize:12}}>Anpassen</button>
          </div>
        </div>
        <div className="page">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {charts.map((c,i)=>(
              <div key={i} className="card" style={{transition:'box-shadow .15s'}} onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'} onMouseOut={e=>e.currentTarget.style.boxShadow=''}>
                <div className="ch" style={{padding:'12px 16px'}}>
                  <div>
                    <div className="ct" style={{fontSize:12.5}}>{c.t}</div>
                    <div className="csub" style={{fontSize:11}}>{c.sub}</div>
                  </div>
                  <span style={{fontSize:11.5,color:c.up?'#0a7c59':'#c0392b',fontWeight:600,display:'flex',alignItems:'center',gap:2}}>
                    {c.up?'↑':'↓'} {c.chg}
                  </span>
                </div>
                <div className="cb" style={{paddingTop:6,paddingBottom:12}}>
                  <div style={{fontSize:22,fontWeight:600,letterSpacing:'-.5px',marginBottom:8}}>{c.v}</div>
                  <ShopifyChart data={c.data} compare={c.compare} labels={months.slice(-c.data.length)} height={80} color={c.color}/>
                </div>
              </div>
            ))}
          </div>
          <div className="g21">
            <div className="card">
              <div className="ch"><div className="ct">Lead Quellen</div></div>
              <div className="cb">
                {['Organisch','Instagram DM','Calendly','TikTok','Empfehlung','Werbung'].map((q,i)=>{
                  const n=leads.filter(l=>l.quelle===q).length
                  const pct=leads.length?Math.round((n/leads.length)*100):0
                  const colors=['#5b9cf6','#34d399','#a78bfa','#fb923c','#f59e0b','#6b7280']
                  return <div key={q} style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:'#5c6370'}}>{q}</span><span style={{fontWeight:600}}>{n} ({pct}%)</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:colors[i]}}/></div>
                  </div>
                })}
              </div>
            </div>
            <div>
              <div className="card" style={{marginBottom:14}}>
                <div className="ch"><div className="ct">Status Verteilung</div></div>
                <div className="cb">
                  {['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren'].map((s,i)=>{
                    const n=leads.filter(l=>l.status===s).length
                    const colors=['#9ba1ab','#5b9cf6','#a78bfa','#1565c0','#0a7c59','#c0392b']
                    return <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f0f2f5'}}>
                      <span style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}><span style={{width:8,height:8,borderRadius:'50%',background:colors[i],display:'inline-block'}}></span>{s}</span>
                      <span style={{fontWeight:600,fontSize:13}}>{n}</span>
                    </div>
                  })}
                </div>
              </div>
              <div className="card">
                <div className="ch"><div className="ct">Monats Ziele</div></div>
                <div className="cb">
                  {[['Neue Leads',leads.length,10],['Neue Clients',active.length,3],['Umsatz (€)',rev,5000]].map(([l,v,z])=>(
                    <div key={l} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:'#5c6370'}}>{l}</span><span style={{fontWeight:600}}>{v} / {z} ({Math.min(100,Math.round((v/z)*100))}%)</span></div>
                      <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,Math.round((v/z)*100))}%`,background:v>=z?'#0a7c59':'#1565c0'}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
