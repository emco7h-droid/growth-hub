'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const fields = ['follower_instagram','follower_tiktok','umsatz','neue_kunden','email_subscriber','email_oeffnungsrate','conversion_rate','engagement_rate']
const labels = {follower_instagram:'Instagram',follower_tiktok:'TikTok',umsatz:'Umsatz (€)',neue_kunden:'Neue Kunden',email_subscriber:'Email Subscriber',email_oeffnungsrate:'Open Rate %',conversion_rate:'Conversion %',engagement_rate:'Engagement %'}

export default function KPIs() {
  const [clients, setClients] = useState([])
  const [kpis, setKpis] = useState([])
  const [sel, setSel] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({monat:1,follower_instagram:0,follower_tiktok:0,umsatz:0,neue_kunden:0,email_subscriber:0,email_oeffnungsrate:0,conversion_rate:0,engagement_rate:0})
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; supabase.from('clients').select('id,name').then(({data})=>setClients(data||[])) }) },[])
  useEffect(()=>{ if(!sel)return; supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data})=>setKpis(data||[])) },[sel])
  const save = async()=>{ await supabase.from('kpis').insert([{...form,client_id:sel}]); setModal(false); supabase.from('kpis').select('*').eq('client_id',sel).order('monat').then(({data})=>setKpis(data||[])) }
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div className="mc">
        <div className="tb"><div className="tb-title">KPI Tracker</div>{sel&&<button className="btn-p" onClick={()=>setModal(true)}>＋ KPIs eintragen</button>}</div>
        <div className="ct">
          <div className="sc" style={{marginBottom:20}}><div className="cb"><label className="fl">Client</label><select value={sel} onChange={e=>setSel(e.target.value)} style={{maxWidth:300}}><option value="">— Client auswaehlen —</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
          {sel&&<div className="sc"><div className="ch"><span className="ct-t">Monatliche Kennzahlen</span></div>{kpis.length===0?<div className="empty">Noch keine KPIs. Klick auf + KPIs eintragen.</div>:<table><thead><tr><th>Kennzahl</th>{kpis.map(k=><th key={k.id}>Monat {k.monat}</th>)}</tr></thead><tbody>{fields.map(f=><tr key={f}><td style={{fontWeight:500,color:'var(--text-s)'}}>{labels[f]}</td>{kpis.map(k=><td key={k.id} style={{fontWeight:600}}>{k[f]||0}</td>)}</tr>)}</tbody></table>}</div>}
        </div>
        {modal&&<div className="overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2>KPIs eintragen</h2>
          <div className="fg"><label className="fl">Monat</label><select value={form.monat} onChange={e=>setForm({...form,monat:parseInt(e.target.value)})}><option value={1}>Monat 1</option><option value={2}>Monat 2</option><option value={3}>Monat 3</option></select></div>
          {fields.map(f=><div className="fg" key={f}><label className="fl">{labels[f]}</label><input type="number" value={form[f]} onChange={e=>setForm({...form,[f]:parseFloat(e.target.value)||0})}/></div>)}
          <div className="ma"><button className="btn-g" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={save}>Speichern</button></div>
        </div></div>}
      </div>
    </div>
  )
}
