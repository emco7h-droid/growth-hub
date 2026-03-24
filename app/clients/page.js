'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const empty = {name:'',email:'',nische:'',coaching_modell:'1 zu 1',retainer:0,startdatum:'',aktueller_monat:1,status:'Aktiv',ziel_1:'',ziel_2:'',ziel_3:'',bottleneck:'',notizen:''}
export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState(empty)
  const load = () => supabase.from('clients').select('*').order('created_at',{ascending:false}).then(({data})=>{setClients(data||[]);setLoading(false)})
  useEffect(()=>{load()},[])
  const save = async()=>{ if(!form.name.trim())return; await supabase.from('clients').insert([{...form,retainer:parseFloat(form.retainer)||0}]); setModal(false); setForm(empty); load() }
  const del = async(id)=>{ await supabase.from('clients').delete().eq('id',id); load() }
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <main className="mc">
        <div className="ph"><div><h1 className="pt">Clients</h1><p className="ps">Aktive Zusammenarbeiten</p></div><button className="btn btn-p" onClick={()=>setModal(true)}>+ Client</button></div>
        {!sel?<div className="sc">
          <div className="sh"><span className="st">Alle Clients ({clients.length})</span></div>
          {loading?<div className="es">Laden...</div>:clients.length===0?<div className="es">Noch keine Clients.</div>:
          <table><thead><tr><th>Name</th><th>Nische</th><th>Retainer</th><th>Start</th><th>Monat</th><th>Status</th><th></th></tr></thead>
          <tbody>{clients.map(c=><tr key={c.id} style={{cursor:'pointer'}} onClick={()=>setSel(c)}>
            <td style={{fontWeight:600}}>{c.name}</td><td style={{color:'var(--muted)'}}>{c.nische||'—'}</td>
            <td style={{color:'var(--green)',fontWeight:600}}>€{(c.retainer||0).toLocaleString('de-DE')}</td>
            <td style={{color:'var(--muted)'}}>{c.startdatum?new Date(c.startdatum).toLocaleDateString('de-DE'):'—'}</td>
            <td><div style={{fontSize:'12px'}}>Monat {c.aktueller_monat||1}/3</div><div className="pb" style={{width:'80px'}}><div className="pf" style={{width:`${Math.min(100,((c.aktueller_monat||1)/3)*100)}%`}}></div></div></td>
            <td><span className={`badge ${c.status==='Aktiv'?'b-green':'b-gray'}`}>{c.status}</span></td>
            <td onClick={e=>e.stopPropagation()}><button className="btn btn-g" style={{padding:'6px 10px',fontSize:'12px'}} onClick={()=>del(c.id)}>×</button></td>
          </tr>)}</tbody></table>}
        </div>:
        <div>
          <button className="btn btn-g" style={{marginBottom:'20px'}} onClick={()=>setSel(null)}>← Zurueck</button>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
            <div className="sc"><div className="sh"><span className="st">Client Info</span></div><div style={{padding:'20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {[['Name',sel.name],['Email',sel.email],['Nische',sel.nische],['Modell',sel.coaching_modell],['Retainer',`€${(sel.retainer||0).toLocaleString('de-DE')}/Mo`],['Start',sel.startdatum?new Date(sel.startdatum).toLocaleDateString('de-DE'):'—']].map(([k,v])=><div key={k}><div style={{fontSize:'11px',color:'var(--dim)',textTransform:'uppercase',fontWeight:600,marginBottom:'4px',fontFamily:'Syne'}}>{k}</div><div style={{fontSize:'14px'}}>{v||'—'}</div></div>)}
            </div></div>
            <div className="sc"><div className="sh"><span className="st">Ziele (90 Tage)</span></div><div style={{padding:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
              {[sel.ziel_1,sel.ziel_2,sel.ziel_3].map((z,i)=>z&&<div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}><div style={{width:'24px',height:'24px',borderRadius:'50%',background:'rgba(59,130,246,.15)',color:'var(--blue-l)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,flexShrink:0}}>{i+1}</div><div style={{fontSize:'14px'}}>{z}</div></div>)}
              {!sel.ziel_1&&<div style={{color:'var(--dim)',fontSize:'13px'}}>Keine Ziele eingetragen</div>}
            </div></div>
          </div>
        </div>}
        {modal&&<div className="overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2>Neuer Client</h2>
          <div className="fr"><div className="fg"><label className="fl">Name*</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="fg"><label className="fl">Nische</label><input value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Retainer (€/Mo)</label><input type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:e.target.value})}/></div><div className="fg"><label className="fl">Startdatum</label><input type="date" value={form.startdatum} onChange={e=>setForm({...form,startdatum:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Ziel 1</label><input value={form.ziel_1} onChange={e=>setForm({...form,ziel_1:e.target.value})} placeholder="Konkretes Ziel..."/></div>
          <div className="fg"><label className="fl">Ziel 2</label><input value={form.ziel_2} onChange={e=>setForm({...form,ziel_2:e.target.value})}/></div>
          <div className="fg"><label className="fl">Ziel 3</label><input value={form.ziel_3} onChange={e=>setForm({...form,ziel_3:e.target.value})}/></div>
          <div className="fg"><label className="fl">Notizen</label><textarea value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
          <div className="ma"><button className="btn btn-g" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button><button className="btn btn-p" onClick={save}>Speichern</button></div>
        </div></div>}
      </main>
    </div>
  )
}
