'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'
import { supabase } from '@/lib/supabase'
const fields = [{k:'follower_ig',l:'Instagram'},{k:'follower_tt',l:'TikTok'},{k:'umsatz',l:'Umsatz (€)'},{k:'neue_kunden',l:'Neue Kunden'},{k:'email_sub',l:'Email Sub.'},{k:'open_rate',l:'Open Rate %'},{k:'conv_rate',l:'Conversion %'}]
export default function KPIs() {
  const [clients,setClients]=useState([]); const [kpis,setKpis]=useState([]); const [sel,setSel]=useState(''); const [modal,setModal]=useState(false)
  const [form,setForm]=useState({monat:1,follower_ig:0,follower_tt:0,umsatz:0,neue_kunden:0,email_sub:0,open_rate:0,conv_rate:0,engage_rate:0})
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; supabase.from('clients').select('id,name').then(({data})=>setClients(data||[])) }) },[])
  useEffect(()=>{ if(!sel)return; supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data})=>setKpis(data||[])) },[sel])
  const save = async () => { await supabase.from('kpis').insert([{...form,client_id:sel}]); setModal(false); supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data})=>setKpis(data||[])) }
  const trend = (k) => { if(kpis.length<2)return null; const d=(kpis[kpis.length-1][k]||0)-(kpis[kpis.length-2][k]||0); if(!d)return null; return <span style={{fontSize:11,color:d>0?'#0a7c59':'#c0392b',fontWeight:600,marginLeft:6}}>{d>0?'+':''}{d}</span> }
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">KPI Tracker</span></div><div className="topbar-right">{sel&&<button className="btn-primary" onClick={()=>setModal(true)}>+ KPIs eintragen</button>}</div></div>
        <div className="page">
          <div className="card" style={{marginBottom:16,padding:16}}><label className="fl">Client auswaehlen</label><select className="fsel" style={{maxWidth:300}} value={sel} onChange={e=>setSel(e.target.value)}><option value="">— Waehlen —</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          {sel&&(kpis.length===0?<div className="card"><div className="empty"><p>Noch keine KPIs. Klick auf "+ KPIs eintragen".</p></div></div>:
          <div className="card"><div className="table-wrap"><table>
            <thead><tr><th>Kennzahl</th>{kpis.map(k=><th key={k.id}>Monat {k.monat}</th>)}{kpis.length>1&&<th>Trend</th>}</tr></thead>
            <tbody>{fields.map(f=><tr key={f.k}><td style={{fontWeight:500,color:'#5c6370'}}>{f.l}</td>{kpis.map(k=><td key={k.id} style={{fontWeight:600}}>{k[f.k]||0}</td>)}{kpis.length>1&&<td>{trend(f.k)||<span style={{color:'#9ba1ab'}}>—</span>}</td>}</tr>)}</tbody>
          </table></div></div>)}
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">KPIs eintragen</span><span className="mc-x" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb"><div className="fg"><label className="fl">Monat</label><select className="fsel" value={form.monat} onChange={e=>setForm({...form,monat:parseInt(e.target.value)})}><option value={1}>Monat 1</option><option value={2}>Monat 2</option><option value={3}>Monat 3</option></select></div>{fields.map(f=><div className="fg" key={f.k}><label className="fl">{f.l}</label><input className="fi" type="number" value={form[f.k]} onChange={e=>setForm({...form,[f.k]:parseFloat(e.target.value)||0})}/></div>)}</div>
        <div className="mf"><button className="btn-secondary" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-primary" onClick={save}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
