'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
const empty={name:'',email:'',phone:'',unternehmen:'',nische:'',quelle:'',notizen:''}
export default function Contacts() {
  const [contacts,setContacts]=useState([]);const [modal,setModal]=useState(false);const [form,setForm]=useState(empty);const [search,setSearch]=useState('')
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};const s=localStorage.getItem('gh_contacts');if(s)setContacts(JSON.parse(s))});},[])
  const save=(c)=>{setContacts(c);localStorage.setItem('gh_contacts',JSON.stringify(c))}
  const add=()=>{if(!form.name.trim())return;save([{...form,id:Date.now()},...contacts]);setModal(false);setForm(empty)}
  const del=(id)=>save(contacts.filter(c=>c.id!==id))
  const filtered=contacts.filter(c=>!search||c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="tb-l"><span className="tb-title">Kontakte</span><span style={{fontSize:12,color:'#9ba1ab'}}>{contacts.length} gesamt</span></div><div className="tb-r"><button className="btn-p" onClick={()=>setModal(true)}>+ Kontakt</button></div></div>
        <div className="page">
          <div className="filter-row"><div className="fsearch" style={{flex:'0 0 260px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kontakt suchen..."/></div></div>
          <div className="card">
            {filtered.length===0?<div className="empty"><p>Keine Kontakte. Erstelle deinen ersten!</p></div>:(
              <div className="tw"><table>
                <thead><tr><th>Name</th><th>Email</th><th>Telefon</th><th>Unternehmen</th><th>Nische</th><th>Quelle</th><th></th></tr></thead>
                <tbody>{filtered.map(c=>(
                  <tr key={c.id}>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:28,height:28,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#1565c0',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{c.name}</span></div></td>
                    <td style={{fontSize:12,color:'#5c6370'}}>{c.email||'—'}</td>
                    <td style={{fontSize:12,color:'#5c6370'}}>{c.phone||'—'}</td>
                    <td style={{fontSize:12}}>{c.unternehmen||'—'}</td>
                    <td style={{fontSize:12}}>{c.nische||'—'}</td>
                    <td><span className="tag-g" style={{fontSize:11}}>{c.quelle||'—'}</span></td>
                    <td><button onClick={()=>del(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#c5ccd4',fontSize:15}}>×</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Kontakt</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Telefon</label><input className="fi" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="fg"><label className="fl">Unternehmen</label><input className="fi" value={form.unternehmen} onChange={e=>setForm({...form,unternehmen:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div><div className="fg"><label className="fl">Quelle</label><input className="fi" value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={2}/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={add}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
