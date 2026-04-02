'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty = { monat:1, umsatz:0, neue_kunden:0, email_sub:0, follower_ig:0, follower_tt:0, follower_yt:0, show_up_rate:0, close_rate:0, avg_deal_value:0, churn_rate:0, mrr:0, leads_gesamt:0, calls_gesamt:0, ad_spend:0, roas:0, notizen:'' }

function KPIContent() {
  const { current } = useWorkspace()
  const [kpis, setKpis] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [tab, setTab] = useState('revenue') // revenue, social, sales, ads
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])
  useEffect(()=>{ if(current) load() },[current?.id])

  const load = async () => {
    const { data } = await supabase.from('kpis').select('*').eq('workspace_id',current.id).order('monat',{ascending:false})
    setKpis(data||[])
  }

  const save = async () => {
    const n = {...form}
    Object.keys(n).forEach(k=>{ if(k!=='notizen'&&n[k]!==''&&n[k]!==null) n[k]=parseFloat(n[k])||0 })
    const payload = {...n, workspace_id:current.id}
    if(editId) await supabase.from('kpis').update(payload).eq('id',editId)
    else await supabase.from('kpis').insert([payload])
    setModal(false); setEditId(null); setForm(empty); load()
  }

  const del = async (id) => { if(!confirm('Loeschen?'))return; await supabase.from('kpis').delete().eq('id',id); load() }
  const openEdit = (k) => { setEditId(k.id); setForm({...empty,...k}); setModal(true) }

  const wsColor = current?.color||'#1565c0'
  const latest = kpis[0]
  const prev = kpis[1]
  const trend = (curr,prev) => { if(!curr||!prev||prev===0)return null; const d=((curr-prev)/prev)*100; return {val:Math.abs(d).toFixed(1),up:d>=0} }

  if(!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      {/* Latest KPI Overview */}
      {latest && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            ['MRR',latest.mrr||latest.umsatz,'€','#0a7c59',prev?.mrr||prev?.umsatz],
            ['Neue Kunden',latest.neue_kunden,'',wsColor,prev?.neue_kunden],
            ['Close Rate',latest.close_rate,'%','#6b4bc8',prev?.close_rate],
            ['Show-Up Rate',latest.show_up_rate,'%','#b7860b',prev?.show_up_rate],
          ].map(([l,v,u,c,pv])=>{
            const t = trend(v,pv)
            return <div key={l} className="card" style={{borderTop:`3px solid ${c}`}}>
              <div className="cb">
                <div style={{fontSize:11.5,color:'#9ba1ab',marginBottom:4}}>{l}</div>
                <div style={{fontSize:22,fontWeight:700,color:c}}>{u==='€'?('€'+(v||0).toLocaleString('de-DE')):v||0}{u!=='€'?u:''}</div>
                {t&&<div style={{fontSize:11,marginTop:3,color:t.up?'#0a7c59':'#c0392b',fontWeight:600}}>{t.up?'↑':'↓'} {t.val}% vs Vormonat</div>}
              </div>
            </div>
          })}
        </div>
      )}

      {/* Tab selector */}
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {[['revenue','Revenue & Kunden'],['sales','Sales Metrics'],['social','Social Media'],['ads','Ads']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{height:30,padding:'0 14px',border:tab===k?`2px solid ${wsColor}`:'1px solid #e1e4e8',borderRadius:7,cursor:'pointer',background:tab===k?`${wsColor}10`:'#fff',fontSize:12.5,fontWeight:tab===k?600:400,color:tab===k?wsColor:'#5c6370',fontFamily:'inherit'}}>{l}</button>
        ))}
      </div>

      {/* KPI Table */}
      {kpis.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:'50px 20px'}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Noch keine KPI-Daten</div>
          <div style={{fontSize:13,color:'#9ba1ab',marginBottom:20}}>Trage die monatlichen Kennzahlen deines Clients ein.</div>
          <button className="btn-p" onClick={()=>{setForm({...empty,monat:new Date().getMonth()+1});setModal(true)}} style={{background:wsColor}}>+ Monat eintragen</button>
        </div>
      ) : (
        <div className="card">
          <div className="tw"><table>
            <thead><tr>
              <th>Monat</th>
              {tab==='revenue'&&<><th>MRR / Umsatz</th><th>Neue Kunden</th><th>Churn</th><th>ARPU</th></>}
              {tab==='sales'&&<><th>Leads</th><th>Calls</th><th>Show-Up %</th><th>Close %</th><th>Ø Deal</th></>}
              {tab==='social'&&<><th>Instagram</th><th>TikTok</th><th>YouTube</th><th>Email Subs</th><th>Conv. %</th></>}
              {tab==='ads'&&<><th>Ad Spend</th><th>ROAS</th><th>Leads</th><th>CPL</th></>}
              <th></th>
            </tr></thead>
            <tbody>{kpis.map(k=>(
              <tr key={k.id}>
                <td style={{fontWeight:600}}>Monat {k.monat}</td>
                {tab==='revenue'&&<>
                  <td style={{color:'#0a7c59',fontWeight:700}}>{(k.mrr||k.umsatz)>0?('€'+(k.mrr||k.umsatz).toLocaleString('de-DE')):'—'}</td>
                  <td>{k.neue_kunden||'—'}</td>
                  <td style={{color:k.churn_rate>5?'#c0392b':'#5c6370'}}>{k.churn_rate>0?(k.churn_rate+'%'):'—'}</td>
                  <td>{k.arpu>0?`€${k.arpu}`:'—'}</td>
                </>}
                {tab==='sales'&&<>
                  <td>{k.leads_gesamt||'—'}</td>
                  <td>{k.calls_gesamt||'—'}</td>
                  <td style={{color:k.show_up_rate>=70?'#0a7c59':'#c0392b',fontWeight:k.show_up_rate>0?600:400}}>{k.show_up_rate>0?(k.show_up_rate+'%'):'—'}</td>
                  <td style={{color:k.close_rate>=20?'#0a7c59':'#c0392b',fontWeight:k.close_rate>0?600:400}}>{k.close_rate>0?(k.close_rate+'%'):'—'}</td>
                  <td>{k.avg_deal_value>0?`€${k.avg_deal_value.toLocaleString('de-DE')}`:'—'}</td>
                </>}
                {tab==='social'&&<>
                  <td>{k.follower_ig>0?k.follower_ig.toLocaleString('de-DE'):'—'}</td>
                  <td>{k.follower_tt>0?k.follower_tt.toLocaleString('de-DE'):'—'}</td>
                  <td>{k.follower_yt>0?k.follower_yt.toLocaleString('de-DE'):'—'}</td>
                  <td>{k.email_sub>0?k.email_sub.toLocaleString('de-DE'):'—'}</td>
                  <td>{k.conv_rate>0?`${k.conv_rate}%`:'—'}</td>
                </>}
                {tab==='ads'&&<>
                  <td>{k.ad_spend>0?`€${k.ad_spend}`:'—'}</td>
                  <td style={{color:k.roas>=3?'#0a7c59':'#c0392b',fontWeight:k.roas>0?600:400}}>{k.roas>0?(k.roas+'x'):'—'}</td>
                  <td>{k.leads_gesamt||'—'}</td>
                  <td>{k.ad_spend>0&&k.leads_gesamt>0?`€${(k.ad_spend/k.leads_gesamt).toFixed(2)}`:'—'}</td>
                </>}
                <td>
                  <div style={{display:'flex',gap:4}}>
                    <button onClick={()=>openEdit(k)} className="btn-s" style={{height:24,padding:'0 8px',fontSize:11}}>Bearbeiten</button>
                    <button onClick={()=>del(k.id)} className="btn-s" style={{height:24,padding:'0 8px',fontSize:11}}>×</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {modal&&<div className="mo" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>
        <div className="md" style={{maxWidth:600}} onClick={e=>e.stopPropagation()}>
          <div className="mh"><span className="mt">{editId?'KPI bearbeiten':'Neuer Monat'} — {current.name}</span><span className="mx" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>×</span></div>
          <div className="mb">
            <div className="fg"><label className="fl">Monat</label><select className="fsel" value={form.monat} onChange={e=>setForm({...form,monat:parseInt(e.target.value)})}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>Monat {i+1}</option>)}</select></div>
            <div style={{fontSize:12,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8,marginTop:4}}>Revenue & Kunden</div>
            <div className="fr">
              <div className="fg"><label className="fl">MRR / Umsatz (€)</label><input className="fi" type="number" value={form.mrr||form.umsatz} onChange={e=>setForm({...form,mrr:e.target.value,umsatz:e.target.value})}/></div>
              <div className="fg"><label className="fl">Neue Kunden</label><input className="fi" type="number" value={form.neue_kunden} onChange={e=>setForm({...form,neue_kunden:e.target.value})}/></div>
              <div className="fg"><label className="fl">Churn Rate %</label><input className="fi" type="number" value={form.churn_rate} onChange={e=>setForm({...form,churn_rate:e.target.value})}/></div>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8,marginTop:8}}>Sales Metriken</div>
            <div className="fr">
              <div className="fg"><label className="fl">Leads gesamt</label><input className="fi" type="number" value={form.leads_gesamt} onChange={e=>setForm({...form,leads_gesamt:e.target.value})}/></div>
              <div className="fg"><label className="fl">Calls gesamt</label><input className="fi" type="number" value={form.calls_gesamt} onChange={e=>setForm({...form,calls_gesamt:e.target.value})}/></div>
            </div>
            <div className="fr">
              <div className="fg"><label className="fl">Show-Up Rate %</label><input className="fi" type="number" value={form.show_up_rate} onChange={e=>setForm({...form,show_up_rate:e.target.value})} placeholder="z.B. 75"/></div>
              <div className="fg"><label className="fl">Close Rate %</label><input className="fi" type="number" value={form.close_rate} onChange={e=>setForm({...form,close_rate:e.target.value})} placeholder="z.B. 25"/></div>
              <div className="fg"><label className="fl">Ø Deal Wert €</label><input className="fi" type="number" value={form.avg_deal_value} onChange={e=>setForm({...form,avg_deal_value:e.target.value})}/></div>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8,marginTop:8}}>Social Media</div>
            <div className="fr">
              <div className="fg"><label className="fl">Instagram</label><input className="fi" type="number" value={form.follower_ig} onChange={e=>setForm({...form,follower_ig:e.target.value})}/></div>
              <div className="fg"><label className="fl">TikTok</label><input className="fi" type="number" value={form.follower_tt} onChange={e=>setForm({...form,follower_tt:e.target.value})}/></div>
              <div className="fg"><label className="fl">Email Subs</label><input className="fi" type="number" value={form.email_sub} onChange={e=>setForm({...form,email_sub:e.target.value})}/></div>
            </div>
            <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={2}/></div>
          </div>
          <div className="mf"><button className="btn-s" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>Abbrechen</button><button className="btn-p" onClick={save} style={{background:wsColor}}>Speichern</button></div>
        </div>
      </div>}
    </div>
  )
}

export default function KPIs(){return <WorkspaceProvider><div className="layout"><Sidebar/>
  <div className="main">
    <KPIsTopbar/>
    <KPIContent/>
  </div>
</div></WorkspaceProvider>}
function KPIsTopbar(){const {current}=useWorkspace();const [m,setM]=useState(false);return <div className="topbar"><div className="tb-l"><span className="tb-title">KPI Tracker</span>{current&&<span className="tb-ws-badge">{current.name}</span>}</div><div className="tb-r"><button className="btn-p" onClick={()=>setM(true)}>+ Monat eintragen</button></div></div>}
