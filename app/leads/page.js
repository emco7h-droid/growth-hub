'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const empty = {name:'',email:'',nische:'',call_datum:'',status:'Ausstehend',notizen:''}
export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const load = () => supabase.from('leads').select('*').order('created_at',{ascending:false}).then(({data})=>{setLeads(data||[]);setLoading(false)})
  useEffect(()=>{load()},[])
  const save = async()=>{ if(!form.name.trim())return; await supabase.from('leads').insert([form]); setModal(false); setForm(empty); load() }
  const upd = async(id,status)=>{ await supabase.from('leads').update({status}).eq('id',id); load() }
  const del = async(id)=>{ await supabase.from('leads').delete().eq('id',id); load() }
  const badge = s=>{ const m={Gewonnen:'green',Interessiert:'blue',Ausstehend:'amber',Verloren:'red'}; return <span className={`badge b-${m[s]||'gray'}`}>{s}</span> }
  return (
    <div style={{display:'flex'}}>
      <Sidebar/>
      <main className="mc">
        <div className="ph"><div><h1 className="pt">Leads</h1><p className="ps">Discovery Call Interessenten</p></div><button className="btn btn-p" onClick={()=>setModal(true)}>+ Lead</button></div>
        <div className="sc">
          <div className="sh"><span className="st">Alle Leads ({leads.length})</span></div>
          {loading?<div className="es">Laden...</div>:leads.length===0?<div className="es">Noch keine Leads.</div>:
          <table><thead><tr><th>Name</th><th>Email</th><th>Nische</th><th>Datum</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>{leads.map(l=><tr key={l.id}><td style={{fontWeight:500}}>{l.name}</td><td style={{color:'var(--muted)'}}>{l.email||'—'}</td><td>{l.nische||'—'}</td><td style={{color:'var(--muted)'}}>{l.call_datum?new Date(l.call_datum).toLocaleDateString('de-DE'):'—'}</td><td>{badge(l.status)}</td>
          <td><div style={{display:'flex',gap:'8px'}}><select value={l.status} onChange={e=>upd(l.id,e.target.value)} style={{width:'130px',padding:'6px 10px',fontSize:'12px'}}><option>Ausstehend</option><option>Interessiert</option><option>Gewonnen</option><option>Verloren</option></select><button className="btn btn-g" style={{padding:'6px 10px',fontSize:'12px'}} onClick={()=>del(l.id)}>×</button></div></td></tr>)}</tbody></table>}
        </div>
        {modal&&<div className="overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
          <h2>Neuer Lead</h2>
          <div className="fr"><div className="fg"><label className="fl">Name*</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Max Mustermann"/></div><div className="fg"><label className="fl">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Trading, Fitness..."/></div><div className="fg"><label className="fl">Call Datum</label><input type="date" value={form.call_datum} onChange={e=>setForm({...form,call_datum:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Ausstehend</option><option>Interessiert</option><option>Gewonnen</option><option>Verloren</option></select></div>
          <div className="fg"><label className="fl">Notizen</label><textarea value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
          <div className="ma"><button className="btn btn-g" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn btn-p" onClick={save}>Speichern</button></div>
        </div></div>}
      </main>
    </div>
  )
}
