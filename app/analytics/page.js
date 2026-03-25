'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

function LineChart({ data=[], labels=[], height=120, color='#5b9cf6' }) {
  if(!data.length||data.every(v=>v===0)) return <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#9ba1ab'}}>Noch keine Daten</div>
  const W=600,H=height,pad={t:10,r:8,b:24,l:44}
  const max=Math.max(...data,1)
  const xs=data.map((_,i)=>pad.l+(i/(data.length-1||1))*(W-pad.l-pad.r))
  const ys=data.map(v=>pad.t+(1-v/max)*(H-pad.t-pad.b))
  const line=xs.map((x,i)=>`${i===0?'M':'L'}${x},${ys[i]}`).join(' ')
  const area=`${line} L${xs[xs.length-1]},${H-pad.b} L${xs[0]},${H-pad.b} Z`
  const id=`c${Math.random().toString(36).slice(2,7)}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".15"/><stop offset="100%" stopColor={color} stopOpacity=".01"/></linearGradient></defs>
      {[0,.5,1].map((f,i)=>{const y=pad.t+(1-f)*(H-pad.t-pad.b);return <g key={i}><line x1={pad.l} y1={y} x2={W-pad.r} y2={y} stroke="#f0f2f5" strokeWidth="1"/><text x={pad.l-5} y={y+3} textAnchor="end" fontSize="9" fill="#9ba1ab">{Math.round(max*f)}</text></g>})}
      <path d={area} fill={`url(#${id})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r="3" fill="#fff" stroke={color} strokeWidth="1.5"/>)}
      {labels.map((l,i)=><text key={i} x={xs[i]} y={H-6} textAnchor="middle" fontSize="9" fill="#9ba1ab">{l}</text>)}
    </svg>
  )
}

export default function Analytics() {
  const [leads,setLeads]=useState([]);const [clients,setClients]=useState([])
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};Promise.all([supabase.from('leads').select('*'),supabase.from('clients').select('*')]).then(([l,c])=>{setLeads(l.data||[]);setClients(c.data||[])})});},[])

  const active=clients.filter(c=>c.status==='Aktiv')
  const rev=active.reduce((s,c)=>s+(c.retainer||0),0)
  const won=leads.filter(l=>l.status==='Gewonnen').length
  const months=['Sep','Okt','Nov','Dez','Jan','Feb','Mär']
  const charts=[
    {t:'Gesamtumsatz',sub:'Vergelchen mit: Vormonat',v:`€${rev.toLocaleString('de-DE')}`,chg:'+23%',up:true,color:'#5b9cf6',data:[0,0,0,0,0,0,rev]},
    {t:'Conversion Rate',sub:'Lead zu Client',v:`${leads.length?Math.round((won/leads.length)*100):0}%`,chg:'+2.1%',up:true,color:'#34d399',data:[0,5,8,10,12,16,leads.length?Math.round((won/leads.length)*100):0]},
    {t:'Neue Leads',sub:'Sitzungen gesamt',v:leads.length,chg:`+${leads.length}`,up:true,color:'#a78bfa',data:[0,2,1,3,2,4,leads.length]},
    {t:'Aktive Clients',sub:'Laufende Zusammenarbeiten',v:active.length,chg:'+2',up:true,color:'#fb923c',data:[0,1,1,2,2,3,active.length]},
    {t:'Ø Retainer',sub:'Pro aktivem Client',v:active.length?`€${Math.round(rev/active.length).toLocaleString('de-DE')}`:'—',chg:'',up:true,color:'#5b9cf6',data:[0,1000,1200,1500,1800,2000,active.length?Math.round(rev/active.length):0]},
    {t:'Calls gebucht',sub:'Alle Calendly Events',v:'—',chg:'',neu:true,color:'#34d399',data:[0,1,2,1,3,2,0]},
  ]

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Statistiken</span><span style={{fontSize:12,color:'#9ba1ab'}}>Live Uebersicht</span></div>
          <div className="tb-r">
            {['Heute','7 Tage','30 Tage','Alles'].map((t,i)=><button key={t} className={i===2?'btn-p':'btn-s'} style={{height:28,padding:'0 10px',fontSize:12}}>{t}</button>)}
          </div>
        </div>
        <div className="page">
          <div className="g3" style={{marginBottom:16}}>
            {charts.map((c,i)=>(
              <div key={i} className="card">
                <div className="ch" style={{padding:'12px 16px'}}>
                  <div><div className="ct" style={{fontSize:12.5}}>{c.t}</div><div className="csub">{c.sub}</div></div>
                  {c.chg&&<span style={{fontSize:11,color:c.up?'#0a7c59':'#c0392b',fontWeight:600}}>{c.up?'↑':'↓'} {c.chg}</span>}
                </div>
                <div className="cb" style={{paddingTop:8,paddingBottom:12}}>
                  <div style={{fontSize:24,fontWeight:600,letterSpacing:'-.5px',marginBottom:10}}>{c.v}</div>
                  <LineChart data={c.data} labels={months.slice(-c.data.length)} height={80} color={c.color}/>
                </div>
              </div>
            ))}
          </div>

          <div className="g21">
            <div className="card">
              <div className="ch"><div className="ct">Lead Quellen Verteilung</div></div>
              <div className="cb">
                {['Organisch','Instagram DM','Calendly','TikTok','Empfehlung','Werbung'].map((q,i)=>{
                  const n=leads.filter(l=>l.quelle===q).length
                  const pct=leads.length?Math.round((n/leads.length)*100):0
                  return <div key={q} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:'#5c6370'}}>{q}</span><span style={{fontWeight:600}}>{n} ({pct}%)</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
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
                  {[['Neue Leads',leads.length,10],['Neue Clients',active.length,3],['Umsatz (€)',rev,5000]].map(([l,v,z],i)=>(
                    <div key={l} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}><span style={{color:'#5c6370'}}>{l}</span><span style={{fontWeight:600}}>{v}/{z}</span></div>
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
