'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty={name:'',email:'',phone:'',nische:'',quelle:'Organisch',status:'Neu',wert:0,tags:'',notizen:''}
const STATI=['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren','No Show']
const QUELLEN=['Organisch','Instagram DM','TikTok','Calendly','Empfehlung','Werbung','Website','Sonstiges']

function LeadsContent() {
  const { current } = useWorkspace()
  const [leads,setLeads]=useState([]);const [modal,setModal]=useState(false);const [form,setForm]=useState(empty);const [search,setSearch]=useState('');const [filterStatus,setFilterStatus]=useState('Alle');const [loading,setLoading]=useState(true)
  const router=useRouter()

  useEffect(()=>{if(current)load()},[current?.id])
  const load=async()=>{setLoading(true);const{data}=await supabase.from('leads').select('*').eq('workspace_id',current.id).order('created_at',{ascending:false});setLeads(data||[]);setLoading(false)}
  const add=async()=>{if(!form.name.trim()||!current)return;await supabase.from('leads').insert([{...form,workspace_id:current.id,wert:parseFloat(form.wert)||0}]);setModal(false);setForm(empty);load()}
  const del=async(id)=>{await supabase.from('leads').delete().eq('id',id);load()}
  const upd=async(id,status)=>{await supabase.from('leads').update({status}).eq('id',id);load()}

  const filtered=leads.filter(l=>{
    if(filterStatus!=='Alle'&&l.status!==filterStatus)return false
    if(search&&!l.name?.toLowerCase().includes(search.toLowerCase())&&!l.email?.toLowerCase().includes(search.toLowerCase()))return false
    return true
  })

  const SBadge=s=>{const m={'Gewonnen':'badge bg','In Kontakt':'badge bb','Qualifiziert':'badge bp','Neu':'badge bgr','Call gebucht':'badge bb','Verloren':'badge br','No Show':'badge ba'};return <span className={m[s]||'badge bgr'}>{s}</span>}

  if(!current) return <div className="page"><div className="empty"><p>Workspace auswaehlen</p></div></div>

  return (
    <div className="page">
      <div className="g4" style={{marginBottom:16}}>
        {['Alle','Neu','In Kontakt','Qualifiziert','Gewonnen'].map(s=>{
          const n=s==='Alle'?leads.length:leads.filter(l=>l.status===s).length
          return <div key={s} className="metric" style={{padding:'12px 16px',cursor:'pointer',border:filterStatus===s?'2px solid #1565c0':undefined}} onClick={()=>setFilterStatus(s)}>
            <div className="m-lbl">{s}</div><div className="m-val" style={{fontSize:22}}>{n}</div>
          </div>
        })}
      </div>
      <div className="filter-row">
        <div className="fsearch" style={{flex:'0 0 260px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Lead suchen..."/></div>
        {STATI.map(s=><button key={s} onClick={()=>setFilterStatus(s)} style={{height:28,padding:'0 10px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',fontFamily:'inherit',background:filterStatus===s?'#1565c0':'#fff',color:filterStatus===s?'#fff':'#5c6370',borderColor:filterStatus===s?'#1565c0':'#e1e4e8'}}>{s}</button>)}
      </div>
      <div className="card">
        {loading?<div className="empty"><p>Laden...</p></div>:filtered.length===0?<div className="empty"><p>Keine Leads gefunden.</p></div>:(
          <div className="tw"><table>
            <thead><tr><th>Name</th><th>Nische</th><th>Quelle</th><th>Status</th><th>Wert</th><th>Notiz</th><th></th></tr></thead>
            <tbody>{filtered.map(l=>(
              <tr key={l.id}>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:28,height:28,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500,fontSize:13}}>{l.name}</div><div style={{fontSize:11,color:'#9ba1ab'}}>{l.email}</div></div></div></td>
                <td style={{fontSize:12,color:'#5c6370'}}>{l.nische||'—'}</td>
                <td><span className="tag-g" style={{fontSize:11}}>{l.quelle||'—'}</span></td>
                <td>
                  <select value={l.status} onChange={e=>upd(l.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,fontFamily:'inherit',cursor:'pointer',outline:'none',color:'#1a1a2e',fontWeight:500}}>
                    {STATI.map(s=><option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{fontWeight:600,fontSize:13,color:'#0a7c59'}}>{l.wert?`€${parseFloat(l.wert).toLocaleString('de-DE')}`:'—'}</td>
                <td style={{fontSize:12,color:'#9ba1ab',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.notizen||'—'}</td>
                <td><button onClick={()=>del(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:16}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#c5ccd4'}>×</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Lead — {current.name}</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Max Mustermann"/></div><div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Fitness, Trading..."/></div><div className="fg"><label className="fl">Telefon</label><input className="fi" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Quelle</label><select className="fsel" value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}>{QUELLEN.map(q=><option key={q}>{q}</option>)}</select></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATI.map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Potential Wert (€)</label><input className="fi" type="number" value={form.wert} onChange={e=>setForm({...form,wert:e.target.value})}/></div><div className="fg"><label className="fl">Tags</label><input className="fi" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="hot, warm..."/></div></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3} placeholder="Erste Einschaetzung, Bedarf..."/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={add}>Lead speichern</button></div>
      </div></div>}
    </div>
  )
}

export default function Leads() {
  return <WorkspaceProvider><div className="layout"><Sidebar/><div className="main"><LeadsTopbar/><LeadsContent/></div></div></WorkspaceProvider>
}
function LeadsTopbar(){
  const {current}=useWorkspace()
  return <div className="topbar"><div className="tb-l"><span className="tb-title">Leads</span>{current&&<span className="tb-ws-badge">{current.name}</span>}</div><div className="tb-r"><LeadsAddBtn/></div></div>
}
function LeadsAddBtn(){
  const [modal,setModal]=useState(false)
  const {current}=useWorkspace()
  return <><button className="btn-p" onClick={()=>setModal(true)}>+ Lead hinzufuegen</button></>
}
