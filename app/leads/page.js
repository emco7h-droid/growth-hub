'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const STATUSES = ['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren','No Show']
const QUELLEN = ['Organisch','Instagram DM','TikTok','YouTube','Calendly','Empfehlung','Kalt Akquise','Werbung']
const S_COLORS = {'Gewonnen':['#e0f5ee','#0a7c59'],'In Kontakt':['#e3f0ff','#1565c0'],'Qualifiziert':['#f0ebfd','#6b4bc8'],'Neu':['#f4f6f8','#5c6370'],'Call gebucht':['#dbeafe','#1565c0'],'Verloren':['#fce8e6','#c0392b'],'No Show':['#fff8e1','#b7860b']}
const empty = {name:'',email:'',phone:'',nische:'',quelle:'Organisch',status:'Neu',wert:0,tags:'',notizen:''}

export default function Leads() {
  const [leads,setLeads]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(false)
  const [form,setForm]=useState(empty);const [search,setSearch]=useState('');const [filterStatus,setFilterStatus]=useState('');const [sel,setSel]=useState(null)
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};load()});},[])
  const load=async()=>{const {data}=await supabase.from('leads').select('*').order('created_at',{ascending:false});setLeads(data||[]);setLoading(false)}
  const save=async()=>{if(!form.name.trim())return;await supabase.from('leads').insert([{...form,wert:parseFloat(form.wert)||0}]);setModal(false);setForm(empty);load()}
  const upd=async(id,status)=>{await supabase.from('leads').update({status}).eq('id',id);load()}
  const del=async(id)=>{if(!confirm('Loeschen?'))return;await supabase.from('leads').delete().eq('id',id);load()}

  const filtered=leads.filter(l=>{
    const s=search.toLowerCase()
    return(!s||l.name?.toLowerCase().includes(s)||l.email?.toLowerCase().includes(s)||l.nische?.toLowerCase().includes(s))&&(!filterStatus||l.status===filterStatus)
  })

  const SBadge=s=>{const [bg,c]=S_COLORS[s]||['#f4f6f8','#9ba1ab'];return <span style={{background:bg,color:c,padding:'3px 9px',borderRadius:20,fontSize:11.5,fontWeight:600,whiteSpace:'nowrap'}}>{s}</span>}

  const totalWert=leads.reduce((s,l)=>s+(l.wert||0),0)
  const wonWert=leads.filter(l=>l.status==='Gewonnen').reduce((s,l)=>s+(l.wert||0),0)
  const conv=leads.length?Math.round((leads.filter(l=>l.status==='Gewonnen').length/leads.length)*100):0

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Leads</span><span style={{fontSize:12,color:'#9ba1ab'}}>{leads.length} gesamt</span></div>
          <div className="tb-r"><button className="btn-p" onClick={()=>setModal(true)}>+ Lead hinzufuegen</button></div>
        </div>
        <div className="page">
          {/* Rich stat cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
            {STATUSES.slice(0,5).map(s=>{
              const n=leads.filter(l=>l.status===s).length
              const [bg,c]=S_COLORS[s]||['#f4f6f8','#9ba1ab']
              return <div key={s} onClick={()=>setFilterStatus(filterStatus===s?'':s)} style={{background:filterStatus===s?bg:'#fff',border:`1.5px solid ${filterStatus===s?c:'#e1e4e8'}`,borderRadius:8,padding:'14px 16px',cursor:'pointer',transition:'all .15s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <span style={{fontSize:12,color:'#5c6370'}}>{s}</span>
                  <div style={{width:8,height:8,borderRadius:'50%',background:c,marginTop:3}}/>
                </div>
                <div style={{fontSize:28,fontWeight:700,color:c,letterSpacing:'-.5px',lineHeight:1}}>{n}</div>
              </div>
            })}
          </div>

          {/* Revenue summary */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
            {[['Pipeline Wert gesamt',`€${totalWert.toLocaleString('de-DE')}`,'#1565c0'],['Gewonnener Wert',`€${wonWert.toLocaleString('de-DE')}`,'#0a7c59'],['Conversion Rate',`${conv}%`,conv>20?'#0a7c59':'#b7860b']].map(([l,v,c])=>(
              <div key={l} className="card" style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:12.5,color:'#5c6370'}}>{l}</span>
                <span style={{fontSize:22,fontWeight:700,color:c,letterSpacing:'-.5px'}}>{v}</span>
              </div>
            ))}
          </div>

          <div className="filter-row">
            <div className="fsearch" style={{flex:'0 0 240px'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, Email, Nische..." style={{width:'100%'}}/>
            </div>
            <select className="fsel" style={{width:150,height:32,fontSize:13}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">Alle Status</option>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="fsel" style={{width:150,height:32,fontSize:13}}>
              <option>Alle Quellen</option>
              {QUELLEN.map(q=><option key={q}>{q}</option>)}
            </select>
            {(search||filterStatus)&&<button className="btn-s" style={{height:32,fontSize:12}} onClick={()=>{setSearch('');setFilterStatus('')}}>Zuruecksetzen</button>}
            <span style={{marginLeft:'auto',fontSize:12,color:'#9ba1ab'}}>{filtered.length} Ergebnisse</span>
          </div>

          <div className="card">
            {loading?<div className="empty"><p>Laden...</p></div>:filtered.length===0?
            <div style={{padding:'60px 20px',textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:10}}>🎯</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Keine Leads gefunden</div>
              <div style={{fontSize:13,color:'#9ba1ab',marginBottom:16}}>Passe deine Filter an oder fuege einen neuen Lead hinzu</div>
              <button className="btn-p" onClick={()=>setModal(true)}>+ Ersten Lead hinzufuegen</button>
            </div>:(
              <div className="tw"><table>
                <thead><tr><th>Lead</th><th>Nische</th><th>Quelle</th><th>Wert</th><th>Tags</th><th>Status</th><th></th></tr></thead>
                <tbody>{filtered.map(l=>(
                  <tr key={l.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11.5,fontWeight:700,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13.5}}>{l.name}</div>
                          <div style={{fontSize:11,color:'#9ba1ab'}}>{l.email||l.phone||''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:12.5,color:'#5c6370'}}>{l.nische||'—'}</td>
                    <td><span style={{background:'#f4f6f8',color:'#5c6370',padding:'2px 8px',borderRadius:20,fontSize:11}}>{l.quelle||'—'}</span></td>
                    <td style={{fontWeight:700,fontSize:14,color:l.wert>0?'#0a7c59':'#9ba1ab'}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
                    <td style={{fontSize:11,color:'#9ba1ab',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.tags||'—'}</td>
                    <td>
                      <select value={l.status} onChange={e=>upd(l.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,fontFamily:'inherit',cursor:'pointer',outline:'none',color:'#1a1a2e',fontWeight:500}}>
                        {STATUSES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button onClick={()=>del(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:16,padding:'2px 6px'}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#c5ccd4'}>×</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Lead</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Max Mustermann"/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Trading, Fitness..."/></div><div className="fg"><label className="fl">Quelle</label><select className="fsel" value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}>{QUELLEN.map(q=><option key={q}>{q}</option>)}</select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Wert (€)</label><input className="fi" type="number" value={form.wert} onChange={e=>setForm({...form,wert:e.target.value})}/></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div className="fg"><label className="fl">Tags</label><input className="fi" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Follow Up, VIP, Calendly..."/></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button><button className="btn-p" onClick={save}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
