'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const empty = {name:'',email:'',phone:'',nische:'',modell:'1 zu 1',retainer:0,startdatum:'',monat:1,status:'Aktiv',ziel_1:'',ziel_2:'',ziel_3:'',bottleneck:'',quick_win:'',notizen:''}
export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState(empty)
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; load() }) },[])
  const load = async () => { const {data}=await supabase.from('clients').select('*').order('created_at',{ascending:false}); setClients(data||[]); setLoading(false) }
  const save = async () => { if(!form.name.trim())return; await supabase.from('clients').insert([{...form,retainer:parseFloat(form.retainer)||0}]); setModal(false); setForm(empty); load() }
  const del = async (id) => { if(!confirm('Loeschen?'))return; await supabase.from('clients').delete().eq('id',id); load() }
  const active = clients.filter(c=>c.status==='Aktiv')
  const totalRev = active.reduce((s,c)=>s+(c.retainer||0),0)
  const R = ({l,v}) => <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f0f2f5'}}><span style={{fontSize:13,color:'#5c6370'}}>{l}</span><span style={{fontSize:13,fontWeight:500}}>{v||'—'}</span></div>
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">{sel?sel.name:'Clients'}</span>{sel&&<button className="btn-secondary" onClick={()=>setSel(null)}>← Zurueck</button>}</div><div className="topbar-right">{!sel&&<button className="btn-primary" onClick={()=>setModal(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Client hinzufuegen</button>}</div></div>
        <div className="page">
          {!sel?<>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
              {[['Aktive Clients',active.length],['Monatl. Umsatz',`€${totalRev.toLocaleString('de-DE')}`],['Ø Retainer',active.length?`€${Math.round(totalRev/active.length).toLocaleString('de-DE')}`:'—']].map(([l,v])=>(
                <div key={l} className="metric"><div className="metric-label">{l}</div><div className="metric-value">{v}</div></div>
              ))}
            </div>
            <div className="card">{loading?<div className="empty"><p>Laden...</p></div>:clients.length===0?<div className="empty"><p>Noch keine Clients.</p></div>:(
              <div className="table-wrap"><table>
                <thead><tr><th>Name</th><th>Nische</th><th>Modell</th><th>Retainer</th><th>Fortschritt</th><th>Status</th><th></th></tr></thead>
                <tbody>{clients.map(c=>(
                  <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setSel(c)}>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:30,height:30,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#1565c0',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:'#9ba1ab'}}>{c.email}</div></div></div></td>
                    <td style={{fontSize:12.5,color:'#5c6370'}}>{c.nische||'—'}</td>
                    <td><span className="badge badge-gray" style={{fontSize:11}}>{c.modell}</span></td>
                    <td style={{fontWeight:600,color:'#0a7c59'}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
                    <td style={{minWidth:120}}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:3}}>Monat {c.monat||1} / 3</div><div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,((c.monat||1)/3)*100)}%`}}/></div></td>
                    <td><span className={`badge ${c.status==='Aktiv'?'badge-green':'badge-gray'}`}>{c.status}</span></td>
                    <td onClick={e=>e.stopPropagation()}><button onClick={()=>del(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ba1ab',fontSize:16,padding:'2px 6px'}}>×</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}</div>
          </>:(
            <div className="g2">
              <div><div className="card" style={{marginBottom:14}}><div className="card-header"><div className="card-title">Client Info</div><span className={`badge ${sel.status==='Aktiv'?'badge-green':'badge-gray'}`}>{sel.status}</span></div><div className="card-body"><R l="Email" v={sel.email}/><R l="Telefon" v={sel.phone}/><R l="Nische" v={sel.nische}/><R l="Modell" v={sel.modell}/><R l="Retainer" v={`€${(sel.retainer||0).toLocaleString('de-DE')}/Mo`}/><R l="Start" v={sel.startdatum?new Date(sel.startdatum).toLocaleDateString('de-DE'):'—'}/><R l="Monat" v={`${sel.monat||1} / 3`}/></div></div><div className="card"><div className="card-header"><div className="card-title">Notizen</div></div><div className="card-body"><p style={{fontSize:13,color:sel.notizen?'#1a1a2e':'#9ba1ab'}}>{sel.notizen||'Keine Notizen.'}</p></div></div></div>
              <div><div className="card" style={{marginBottom:14}}><div className="card-header"><div className="card-title">90-Tage Ziele</div></div><div className="card-body">{[sel.ziel_1,sel.ziel_2,sel.ziel_3].filter(Boolean).map((z,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:10}}><div style={{width:20,height:20,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#1565c0',flexShrink:0}}>{i+1}</div><span style={{fontSize:13}}>{z}</span></div>)}{!sel.ziel_1&&<p style={{fontSize:13,color:'#9ba1ab'}}>Keine Ziele.</p>}</div></div><div className="card"><div className="card-header"><div className="card-title">Bottleneck & Quick Win</div></div><div className="card-body"><div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>Bottleneck</div><p style={{fontSize:13}}>{sel.bottleneck||'—'}</p></div><div><div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>Quick Win</div><p style={{fontSize:13}}>{sel.quick_win||'—'}</p></div></div></div></div>
            </div>
          )}
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Client</span><span className="mc-x" onClick={()=>{setModal(false);setForm(empty)}}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div><div className="fg"><label className="fl">Modell</label><select className="fsel" value={form.modell} onChange={e=>setForm({...form,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Kurs</option></select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Retainer (€/Mo)</label><input className="fi" type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:e.target.value})}/></div><div className="fg"><label className="fl">Startdatum</label><input className="fi" type="date" value={form.startdatum} onChange={e=>setForm({...form,startdatum:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Ziel 1</label><input className="fi" value={form.ziel_1} onChange={e=>setForm({...form,ziel_1:e.target.value})}/></div>
          <div className="fg"><label className="fl">Ziel 2</label><input className="fi" value={form.ziel_2} onChange={e=>setForm({...form,ziel_2:e.target.value})}/></div>
          <div className="fg"><label className="fl">Ziel 3</label><input className="fi" value={form.ziel_3} onChange={e=>setForm({...form,ziel_3:e.target.value})}/></div>
          <div className="fr"><div className="fg"><label className="fl">Bottleneck</label><input className="fi" value={form.bottleneck} onChange={e=>setForm({...form,bottleneck:e.target.value})}/></div><div className="fg"><label className="fl">Quick Win</label><input className="fi" value={form.quick_win} onChange={e=>setForm({...form,quick_win:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
        </div>
        <div className="mf"><button className="btn-secondary" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button><button className="btn-primary" onClick={save}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
