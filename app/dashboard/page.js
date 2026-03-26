'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

function ShopifyChart({ data=[], compare=[], labels=[], height=160, color='#5b9cf6' }) {
  const W=600,H=height,pad={t:12,r:8,b:28,l:48}
  const allVals=[...data,...compare].filter(n=>typeof n==='number')
  const maxY=Math.max(...allVals,1),fw=W-pad.l-pad.r,fh=H-pad.t-pad.b
  const x=(i,len)=>pad.l+(i/(Math.max(len-1,1)))*fw
  const y=(v)=>pad.t+(1-v/maxY)*fh
  const line=data.map((v,i)=>`${i===0?'M':'L'}${x(i,data.length)},${y(v)}`).join(' ')
  const area=data.length>1?`${line} L${x(data.length-1,data.length)},${H-pad.b} L${x(0,data.length)},${H-pad.b} Z`:''
  const comp=compare.map((v,i)=>`${i===0?'M':'L'}${x(i,compare.length)},${y(v)}`).join(' ')
  const id=`c${Math.random().toString(36).slice(2,5)}`
  if(!data.length||data.every(v=>v===0)) return <div style={{height,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#9ba1ab'}}>Noch keine Daten</div>
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height}} preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".14"/><stop offset="100%" stopColor={color} stopOpacity=".01"/></linearGradient></defs>
      {[0,.25,.5,.75,1].map((f,i)=>{const yp=pad.t+(1-f)*fh;return <g key={i}><line x1={pad.l} y1={yp} x2={W-pad.r} y2={yp} stroke="#e8ecf0" strokeWidth="1"/><text x={pad.l-6} y={yp+4} textAnchor="end" fontSize="10" fill="#9ba1ab">{Math.round(maxY*f).toLocaleString('de-DE')}</text></g>})}
      {labels.map((l,i)=><text key={i} x={x(i,labels.length)} y={H-8} textAnchor="middle" fontSize="10" fill="#9ba1ab">{l}</text>)}
      <path d={area} fill={`url(#${id})`}/>
      {compare.length>1&&<path d={comp} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity=".35"/>}
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v,i)=><circle key={i} cx={x(i,data.length)} cy={y(v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"/>)}
    </svg>
  )
}

function Spark({ data=[], color='#5b9cf6' }) {
  if(data.length<2)return null
  const W=72,H=28,max=Math.max(...data),min=Math.min(...data),range=max-min||1
  const pts=data.map((v,i)=>`${i===0?'M':'L'}${(i/(data.length-1))*W},${H-2-((v-min)/range)*(H-4)}`).join(' ')
  return <svg width={W} height={H}><path d={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".8"/></svg>
}

function DashboardContent() {
  const { current } = useWorkspace()
  const [leads, setLeads] = useState([])
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') })
  }, [])

  useEffect(() => {
    if (!current) return
    setLoading(true)
    Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }),
      supabase.from('kpis').select('*').eq('workspace_id', current.id).order('monat'),
    ]).then(([l, k]) => { setLeads(l.data || []); setKpis(k.data || []); setLoading(false) })
  }, [current?.id])

  const won = leads.filter(l => l.status === 'Gewonnen').length
  const open = leads.filter(l => !['Gewonnen','Verloren','No Show'].includes(l.status)).length
  const conv = leads.length ? Math.round((won / leads.length) * 100) : 0
  const latestKpi = kpis[kpis.length - 1]
  const months = ['Sep','Okt','Nov','Dez','Jan','Feb','Mär']
  const revData = [0,0,0,0,0,0,latestKpi?.umsatz||0]
  const leadData = [0,1,2,1,3,open,open+1]

  const SBadge = s => {
    const m = {'Gewonnen':'badge bg','In Kontakt':'badge bb','Qualifiziert':'badge bp','Neu':'badge bgr','Call gebucht':'badge bb','Verloren':'badge br'}
    return <span className={m[s]||'badge bgr'}>{s}</span>
  }

  if (!current) return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>🏢</div>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>Kein Workspace ausgewaehlt</div>
        <div style={{fontSize:13,color:'#9ba1ab'}}>Klick oben links um einen Workspace zu erstellen oder auszuwaehlen.</div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="g4" style={{marginBottom:20}}>
        {[
          {l:'Aktive Leads',v:loading?'—':open,chg:`${leads.length} gesamt`,neu:true,spark:[3,5,4,6,5,open||0]},
          {l:'Umsatz',v:loading?'—':`€${(latestKpi?.umsatz||0).toLocaleString('de-DE')}`,chg:'Letzter Monat',neu:true,spark:[0,0,500,800,1200,latestKpi?.umsatz||0]},
          {l:'Conversion Rate',v:loading?'—':`${conv}%`,chg:conv>20?'Ueber Ziel':'Unter Ziel',up:conv>20,spark:[10,15,12,18,20,conv||0]},
          {l:'Neue Kunden',v:loading?'—':(latestKpi?.neue_kunden||0),chg:'Letzter Monat',up:true,spark:[0,1,1,2,1,latestKpi?.neue_kunden||0]},
        ].map((m,i)=>(
          <div key={i} className="metric">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <span className="m-lbl">{m.l}</span>
              <Spark data={m.spark} color={m.up?'#5b9cf6':m.neu?'#9ba1ab':'#ef4444'}/>
            </div>
            <div className="m-val">{m.v}</div>
            <div className={`m-chg ${m.neu?'neu':m.up?'up':'dn'}`}>{m.chg}</div>
          </div>
        ))}
      </div>

      <div className="g21" style={{marginBottom:16}}>
        <div className="card">
          <div className="ch">
            <div><div className="ct">Umsatz Uebersicht</div><div className="csub">Verglichen mit: Vormonat</div></div>
            <div style={{display:'flex',gap:10,fontSize:11,color:'#9ba1ab'}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:16,height:2,background:'#5b9cf6',display:'inline-block'}}></span>Aktuell</span>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:16,borderTop:'2px dashed #5b9cf6',display:'inline-block',opacity:.4}}></span>Vorperiode</span>
            </div>
          </div>
          <div className="cb" style={{paddingTop:8}}>
            <div style={{fontSize:26,fontWeight:600,letterSpacing:'-.5px',marginBottom:8}}>€{(latestKpi?.umsatz||0).toLocaleString('de-DE')}</div>
            <ShopifyChart data={revData} compare={[0,0,0,0,0,latestKpi?.umsatz*0.8||0,latestKpi?.umsatz*0.9||0]} labels={months} height={140}/>
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ct">Lead Pipeline</div><span className="tag" style={{fontSize:11}}>{leads.length} gesamt</span></div>
          <div className="cb" style={{paddingTop:8}}>
            {[['Neu','#c5ccd4'],['In Kontakt','#93c5fd'],['Qualifiziert','#c4b5fd'],['Call gebucht','#1565c0'],['Gewonnen','#0a7c59']].map(([s,c])=>{
              const n=leads.filter(l=>l.status===s).length
              return <div key={s} className="pb-row"><span className="pb-lbl" style={{fontSize:12}}>{s}</span><div className="pb-bg"><div className="pb-fill" style={{width:leads.length?`${(n/leads.length)*100}%`:'0%',background:c}}/></div><span className="pb-n">{n}</span></div>
            })}
          </div>
        </div>
      </div>

      <div className="g3">
        <div className="card" style={{gridColumn:'span 2'}}>
          <div className="ch"><div className="ct">Neueste Leads</div><a href="/leads" style={{fontSize:12,color:'var(--blue)',fontWeight:500}}>Alle →</a></div>
          {loading?<div className="empty"><p>Laden...</p></div>:leads.length===0?<div className="empty"><p>Noch keine Leads in diesem Workspace. Klick auf "Leads" um anzufangen.</p></div>:(
            <div className="tw"><table><thead><tr><th>Name</th><th>Nische</th><th>Status</th><th>Wert</th></tr></thead>
            <tbody>{leads.slice(0,5).map(l=>(
              <tr key={l.id}>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:26,height:26,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9.5,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500,fontSize:13}}>{l.name}</span></div></td>
                <td style={{fontSize:12,color:'#5c6370'}}>{l.nische||'—'}</td>
                <td>{SBadge(l.status)}</td>
                <td style={{fontWeight:600,fontSize:13}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
              </tr>
            ))}</tbody></table></div>
          )}
        </div>

        <div className="card">
          <div className="ch"><div className="ct">Workspace Info</div><a href="/settings" style={{fontSize:12,color:'var(--blue)',fontWeight:500}}>Bearbeiten</a></div>
          <div className="cb">
            {[['Nische',current.nische],['Modell',current.modell],['Retainer',`€${(current.retainer||0).toLocaleString('de-DE')}/Mo`],['Monat',`${current.monat||1} / 3`],['Status',current.status]].map(([l,v])=>(
              <div key={l} className="row-info"><span style={{fontSize:12.5,color:'#5c6370'}}>{l}</span><span style={{fontSize:12.5,fontWeight:500}}>{v||'—'}</span></div>
            ))}
            {current.ziel_1&&<div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>90-Tage Ziele</div>
              {[current.ziel_1,current.ziel_2,current.ziel_3].filter(Boolean).map((z,i)=>(
                <div key={i} style={{display:'flex',gap:7,marginBottom:5}}><div style={{width:16,height:16,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8.5,fontWeight:700,color:'#1565c0',flexShrink:0}}>{i+1}</div><span style={{fontSize:12}}>{z}</span></div>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  return (
    <WorkspaceProvider>
      <div className="layout">
        <Sidebar/>
        <div className="main">
          <DashboardTopbar/>
          <DashboardContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}

function DashboardTopbar() {
  const { current } = useWorkspace()
  return (
    <div className="topbar">
      <div className="tb-l">
        <span className="tb-title">Uebersicht</span>
        {current && <span className="tb-ws-badge">{current.name}</span>}
      </div>
      <div className="tb-r">
        <div className="search-box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Suchen..."/></div>
        <div className="btn-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
      </div>
    </div>
  )
}
