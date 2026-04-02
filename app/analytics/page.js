'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

function AnalyticsContent() {
  const { current } = useWorkspace()
  const [kpis, setKpis] = useState([])
  const [leads, setLeads] = useState([])
  const [invoices, setInvoices] = useState([])
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])
  useEffect(()=>{ if(current) load() },[current?.id])

  const load = async () => {
    const [k,l,i] = await Promise.all([
      supabase.from('kpis').select('*').eq('workspace_id',current.id).order('monat'),
      supabase.from('leads').select('*').eq('workspace_id',current.id),
      supabase.from('invoices').select('*').eq('workspace_id',current.id),
    ])
    setKpis(k.data||[]); setLeads(l.data||[]); setInvoices(i.data||[])
  }

  if(!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  const totalUmsatz = kpis.reduce((s,k)=>s+(k.umsatz||0),0)
  const totalKunden = kpis.reduce((s,k)=>s+(k.neue_kunden||0),0)
  const bezahlt = invoices.filter(i=>i.status==='Bezahlt').reduce((s,i)=>s+(i.betrag||0),0)
  const ausstehend = invoices.filter(i=>i.status==='Ausstehend').reduce((s,i)=>s+(i.betrag||0),0)
  const gewonneneLeads = leads.filter(l=>l.status==='Gewonnen').length
  const gesamtLeads = leads.length
  const convRate = gesamtLeads>0?Math.round(gewonneneLeads/gesamtLeads*100):0

  const wsColor = current.color||'#1565c0'

  return (
    <div className="page">
      {kpis.length===0 && leads.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:40,marginBottom:12}}>📊</div>
          <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Noch keine Daten fuer {current.name}</div>
          <div style={{fontSize:13.5,color:'#5c6370',marginBottom:20}}>Trage Leads, KPIs und Rechnungen ein um hier echte Statistiken zu sehen.</div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <a href="/kpis" className="btn-p" style={{textDecoration:'none',background:wsColor}}>KPIs eintragen</a>
            <a href="/leads" className="btn-s" style={{textDecoration:'none'}}>Lead hinzufuegen</a>
          </div>
        </div>
      ) : (<>
        {/* Summary cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          {[
            ['Gesamt Umsatz',`€${totalUmsatz.toLocaleString('de-DE')}`,wsColor],
            ['Neue Kunden',totalKunden,'#0a7c59'],
            ['Bezahlte Rechnungen',`€${bezahlt.toLocaleString('de-DE')}`,'#0a7c59'],
            ['Conversion Rate',`${convRate}%`,convRate>=20?'#0a7c59':'#f59e0b'],
          ].map(([l,v,c])=>(
            <div key={l} className="card" style={{borderTop:`3px solid ${c}`}}>
              <div className="cb">
                <div style={{fontSize:11.5,color:'#9ba1ab',marginBottom:6}}>{l}</div>
                <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* KPI Table */}
        {kpis.length>0 && (
          <div className="card" style={{marginBottom:14}}>
            <div className="ch"><div className="ct">KPI Verlauf</div><a href="/kpis" style={{fontSize:12,color:wsColor,textDecoration:'none'}}>Bearbeiten →</a></div>
            <div className="tw"><table>
              <thead><tr><th>Monat</th><th>Umsatz</th><th>Neue Kunden</th><th>Instagram</th><th>Email Sub</th><th>Conv. Rate</th></tr></thead>
              <tbody>{kpis.map(k=>(
                <tr key={k.id}>
                  <td style={{fontWeight:500}}>Monat {k.monat}</td>
                  <td style={{color:'#0a7c59',fontWeight:600}}>{k.umsatz>0?('€'+k.umsatz.toLocaleString('de-DE')):'—'}</td>
                  <td>{k.neue_kunden>0?k.neue_kunden:'—'}</td>
                  <td>{k.follower_ig>0?k.follower_ig.toLocaleString('de-DE'):'—'}</td>
                  <td>{k.email_sub>0?k.email_sub:'—'}</td>
                  <td>{k.conv_rate>0?(k.conv_rate+'%'):'—'}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        )}

        {/* Lead funnel */}
        {leads.length>0 && (
          <div className="card">
            <div className="ch"><div className="ct">Lead Funnel</div><a href="/pipeline" style={{fontSize:12,color:wsColor,textDecoration:'none'}}>Pipeline →</a></div>
            <div className="cb">
              {[['Neu','#9ba1ab'],['In Kontakt','#5b9cf6'],['Qualifiziert','#a78bfa'],['Call gebucht','#1565c0'],['Gewonnen','#0a7c59'],['Verloren','#c0392b']].map(([s,c])=>{
                const n = leads.filter(l=>l.status===s).length
                const pct = gesamtLeads>0?Math.round(n/gesamtLeads*100):0
                return <div key={s} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                  <div style={{width:100,fontSize:12.5,color:'#5c6370',flexShrink:0}}>{s}</div>
                  <div style={{flex:1,height:8,background:'#f0f2f5',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:4,transition:'width .3s'}}/>
                  </div>
                  <div style={{width:50,fontSize:12,fontWeight:600,color:c,flexShrink:0,textAlign:'right'}}>{n} ({pct}%)</div>
                </div>
              })}
            </div>
          </div>
        )}
      </>)}
    </div>
  )
}

export default function Analytics() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar/>
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">Statistiken</span><WsBadge/></div>
          </div>
          <AnalyticsContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function WsBadge() { const {current}=useWorkspace(); return current?<span className="tb-ws-badge">{current.name}</span>:null }
