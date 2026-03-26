'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

import { supabase } from '@/lib/supabase'

const TYPES = ['Potentieller Lead','Bestehender Client','Partner','Influencer','Empfehlung','Sonstiges']
const empty = {name:'',email:'',phone:'',unternehmen:'',nische:'',quelle:'',typ:'Potentieller Lead',instagram:'',notizen:''}

export default function Contacts() {
  const [contacts,setContacts]=useState([]);const [modal,setModal]=useState(false);const [form,setForm]=useState(empty);const [search,setSearch]=useState('');const [sel,setSel]=useState(null)
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};const s=localStorage.getItem('gh_contacts');if(s)setContacts(JSON.parse(s))});},[])
  const save=(c)=>{setContacts(c);localStorage.setItem('gh_contacts',JSON.stringify(c))}
  const add=()=>{if(!form.name.trim())return;const n=[{...form,id:Date.now()},...contacts];save(n);setModal(false);setForm(empty)}
  const del=(id)=>save(contacts.filter(c=>c.id!==id))
  const filtered=contacts.filter(c=>!search||c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase())||c.unternehmen?.toLowerCase().includes(search.toLowerCase()))
  const TYPE_C={'Potentieller Lead':'#e3f0ff','Bestehender Client':'#e0f5ee','Partner':'#f0ebfd','Influencer':'#fff8e1','Empfehlung':'#fce8e6','Sonstiges':'#f4f6f8'}
  const TYPE_T={'Potentieller Lead':'#1565c0','Bestehender Client':'#0a7c59','Partner':'#6b4bc8','Influencer':'#b7860b','Empfehlung':'#c0392b','Sonstiges':'#5c6370'}

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">{sel?sel.name:'Kontakte'}</span>{sel&&<button className="btn-s" style={{height:28,padding:'0 10px',fontSize:12}} onClick={()=>setSel(null)}>← Alle</button>}</div>
          <div className="tb-r">{!sel&&<button className="btn-p" onClick={()=>setModal(true)}>+ Kontakt</button>}</div>
        </div>
        <div className="page">
          {!sel?(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
                {[['Gesamt Kontakte',contacts.length,'#1565c0'],['Potentielle Leads',contacts.filter(c=>c.typ==='Potentieller Lead').length,'#6b4bc8'],['Partner & Empfehlungen',contacts.filter(c=>['Partner','Empfehlung'].includes(c.typ)).length,'#0a7c59']].map(([l,v,c])=>(
                  <div key={l} className="metric" style={{padding:'16px 20px'}}><div className="m-lbl">{l}</div><div className="m-val" style={{color:c,fontSize:28}}>{v}</div></div>
                ))}
              </div>
              <div className="filter-row">
                <div className="fsearch" style={{flex:'0 0 260px'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, Email, Unternehmen..." style={{width:'100%'}}/></div>
              </div>
              {filtered.length===0?(
                <div className="card" style={{padding:'60px 20px',textAlign:'center'}}>
                  <div style={{fontSize:40,marginBottom:10}}>📇</div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Noch keine Kontakte</div>
                  <div style={{fontSize:13,color:'#9ba1ab',marginBottom:16}}>Speichere Kontakte die noch keine Leads oder Clients sind</div>
                  <button className="btn-p" onClick={()=>setModal(true)}>+ Ersten Kontakt hinzufuegen</button>
                </div>
              ):(
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                  {filtered.map(c=>(
                    <div key={c.id} className="card" style={{cursor:'pointer',transition:'all .15s'}} onClick={()=>setSel(c)}
                      onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,.08)'}}
                      onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                      <div style={{padding:'16px 18px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                          <div style={{width:42,height:42,borderRadius:'50%',background:TYPE_C[c.typ]||'#f4f6f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:TYPE_T[c.typ]||'#9ba1ab',flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                            <div style={{fontSize:11.5,color:'#9ba1ab',marginTop:2}}>{c.unternehmen||c.nische||''}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{background:TYPE_C[c.typ]||'#f4f6f8',color:TYPE_T[c.typ]||'#9ba1ab',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{c.typ}</span>
                          <span style={{fontSize:11,color:'#9ba1ab'}}>{c.quelle||''}</span>
                        </div>
                        {c.email&&<div style={{fontSize:11.5,color:'#5c6370',marginTop:8}}>{c.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ):(
            <div className="g2">
              <div className="card">
                <div className="ch"><div className="ct">Kontakt Info</div><span style={{background:TYPE_C[sel.typ],color:TYPE_T[sel.typ],padding:'3px 10px',borderRadius:20,fontSize:11.5,fontWeight:600}}>{sel.typ}</span></div>
                <div style={{padding:'0 20px'}}>
                  {[['Name',sel.name],['Email',sel.email],['Telefon',sel.phone],['Instagram',sel.instagram],['Unternehmen',sel.unternehmen],['Nische',sel.nische],['Quelle',sel.quelle]].map(([l,v])=>(
                    v&&<div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f0f2f5'}}>
                      <span style={{fontSize:12.5,color:'#5c6370'}}>{l}</span>
                      <span style={{fontSize:13,fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="card" style={{marginBottom:14}}>
                  <div className="ch"><div className="ct">Notizen</div></div>
                  <div className="cb"><p style={{fontSize:13,color:sel.notizen?'#1a1a2e':'#9ba1ab'}}>{sel.notizen||'Keine Notizen.'}</p></div>
                </div>
                <div className="card">
                  <div className="cb">
                    <a href={`/leads`} className="btn-p" style={{display:'flex',justifyContent:'center',marginBottom:8,textDecoration:'none'}}>Als Lead uebernehmen</a>
                    <button className="btn-s" style={{width:'100%',justifyContent:'center'}} onClick={()=>del(sel.id)||setSel(null)}>Kontakt loeschen</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Kontakt</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="fg"><label className="fl">Typ</label><select className="fsel" value={form.typ} onChange={e=>setForm({...form,typ:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div className="fg"><label className="fl">Telefon</label><input className="fi" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Instagram</label><input className="fi" value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})}/></div><div className="fg"><label className="fl">Unternehmen</label><input className="fi" value={form.unternehmen} onChange={e=>setForm({...form,unternehmen:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})}/></div><div className="fg"><label className="fl">Quelle</label><input className="fi" value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}/></div></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={2}/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={add}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
