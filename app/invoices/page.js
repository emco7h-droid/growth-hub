'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

import { supabase } from '@/lib/supabase'
const empty={client:'',beschreibung:'Growth Operator Retainer',betrag:0,datum:new Date().toISOString().split('T')[0],faellig:'',status:'Ausstehend'}
export default function Invoices() {
  const [invs,setInvs]=useState([]);const [modal,setModal]=useState(false);const [form,setForm]=useState(empty)
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};const s=localStorage.getItem('gh_invoices');if(s)setInvs(JSON.parse(s))});},[])
  const save=(i)=>{setInvs(i);localStorage.setItem('gh_invoices',JSON.stringify(i))}
  const add=()=>{if(!form.client.trim())return;save([{...form,id:Date.now(),nr:`RE-${Date.now().toString().slice(-5)}`},...invs]);setModal(false);setForm(empty)}
  const upd=(id,status)=>save(invs.map(i=>i.id===id?{...i,status}:i))
  const del=(id)=>save(invs.filter(i=>i.id!==id))
  const total=invs.reduce((s,i)=>s+parseFloat(i.betrag||0),0)
  const paid=invs.filter(i=>i.status==='Bezahlt').reduce((s,i)=>s+parseFloat(i.betrag||0),0)
  const statusMap={'Bezahlt':'badge bg','Ausstehend':'badge ba','Ueberfaellig':'badge br','Entwurf':'badge bgr'}
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="tb-l"><span className="tb-title">Rechnungen</span></div><div className="tb-r"><button className="btn-p" onClick={()=>setModal(true)}>+ Rechnung</button></div></div>
        <div className="page">
          <div className="g3" style={{marginBottom:16}}>
            {[['Gesamt',`€${total.toLocaleString('de-DE')}`],['Bezahlt',`€${paid.toLocaleString('de-DE')}`],['Ausstehend',`€${(total-paid).toLocaleString('de-DE')}`]].map(([l,v])=>(
              <div key={l} className="metric"><div className="m-lbl">{l}</div><div className="m-val">{v}</div></div>
            ))}
          </div>
          <div className="card">
            {invs.length===0?<div className="empty"><p>Noch keine Rechnungen. Erstelle deine erste!</p></div>:(
              <div className="tw"><table>
                <thead><tr><th>Nr.</th><th>Client</th><th>Beschreibung</th><th>Betrag</th><th>Datum</th><th>Faellig</th><th>Status</th><th></th></tr></thead>
                <tbody>{invs.map(i=>(
                  <tr key={i.id}>
                    <td style={{fontWeight:600,fontSize:12}}>{i.nr}</td>
                    <td style={{fontWeight:500}}>{i.client}</td>
                    <td style={{fontSize:12,color:'#5c6370'}}>{i.beschreibung}</td>
                    <td style={{fontWeight:700,color:'#0a7c59'}}>€{parseFloat(i.betrag||0).toLocaleString('de-DE')}</td>
                    <td style={{fontSize:12,color:'#9ba1ab'}}>{i.datum}</td>
                    <td style={{fontSize:12,color:'#9ba1ab'}}>{i.faellig||'—'}</td>
                    <td><select value={i.status} onChange={e=>upd(i.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12,fontFamily:'inherit',cursor:'pointer',outline:'none'}}>{['Entwurf','Ausstehend','Bezahlt','Ueberfaellig'].map(s=><option key={s}>{s}</option>)}</select></td>
                    <td><button onClick={()=>del(i.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:15}}>×</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neue Rechnung</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fg"><label className="fl">Client *</label><input className="fi" value={form.client} onChange={e=>setForm({...form,client:e.target.value})}/></div>
          <div className="fg"><label className="fl">Beschreibung</label><input className="fi" value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})}/></div>
          <div className="fr"><div className="fg"><label className="fl">Betrag (€)</label><input className="fi" type="number" value={form.betrag} onChange={e=>setForm({...form,betrag:e.target.value})}/></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Entwurf</option><option>Ausstehend</option><option>Bezahlt</option></select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Datum</label><input className="fi" type="date" value={form.datum} onChange={e=>setForm({...form,datum:e.target.value})}/></div><div className="fg"><label className="fl">Faellig am</label><input className="fi" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={add}>Erstellen</button></div>
      </div></div>}
    </div>
  )
}
