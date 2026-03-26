'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const STATUSES = ['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen','Verloren','No Show']
const QUELLEN = ['Organisch','Instagram DM','TikTok','YouTube','Calendly','Empfehlung','Kalt Akquise','Werbung']
const S_BADGE = { 'Gewonnen':'badge-green','In Kontakt':'badge-blue','Qualifiziert':'badge-purple','Neu':'badge-gray','Call gebucht':'badge-blue','Verloren':'badge-red','No Show':'badge-amber' }
const empty = { name:'',email:'',phone:'',nische:'',quelle:'Organisch',status:'Neu',wert:0,tags:'',notizen:'' }

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) { router.push('/login'); return }; load() }) }, [])
  const load = async () => { const { data } = await supabase.from('leads').select('*').order('created_at',{ascending:false}); setLeads(data||[]); setLoading(false) }
  const save = async () => { if (!form.name.trim()) return; await supabase.from('leads').insert([{...form,wert:parseFloat(form.wert)||0}]); setModal(false); setForm(empty); load() }
  const upd = async (id, status) => { await supabase.from('leads').update({status}).eq('id',id); load() }
  const del = async (id) => { if (!confirm('Loeschen?')) return; await supabase.from('leads').delete().eq('id',id); load() }

  const filtered = leads.filter(l => {
    const s = search.toLowerCase()
    return (!s || l.name?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s)) && (!filterStatus || l.status === filterStatus)
  })

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="topbar-left"><span className="topbar-title">Leads</span><span style={{fontSize:12.5,color:'#9ba1ab'}}>{leads.length} gesamt</span></div>
          <div className="topbar-right">
            <button className="btn-primary" onClick={()=>setModal(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Lead hinzufuegen
            </button>
          </div>
        </div>
        <div className="page">
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
            {STATUSES.slice(0,5).map(s=>(
              <div key={s} className="metric" style={{cursor:'pointer'}} onClick={()=>setFilterStatus(filterStatus===s?'':s)}>
                <div className="metric-label">{s}</div>
                <div className="metric-value" style={{fontSize:24}}>{leads.filter(l=>l.status===s).length}</div>
              </div>
            ))}
          </div>
          <div className="filter-row">
            <div className="filter-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen..."/></div>
            <select className="fsel" style={{width:150,height:32}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">Alle Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            <select className="fsel" style={{width:150,height:32}}><option>Alle Quellen</option>{QUELLEN.map(q=><option key={q}>{q}</option>)}</select>
            {(search||filterStatus)&&<button className="btn-secondary" style={{height:32}} onClick={()=>{setSearch('');setFilterStatus('')}}>Zuruecksetzen</button>}
          </div>
          <div className="card">
            {loading?<div className="empty"><p>Laden...</p></div>:filtered.length===0?<div className="empty"><p>Keine Leads gefunden.</p></div>:(
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Nische</th><th>Quelle</th><th>Wert</th><th>Tags</th><th>Status</th><th></th></tr></thead>
                  <tbody>{filtered.map(l=>(
                    <tr key={l.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:28,height:28,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10.5,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500,fontSize:13}}>{l.name}</div>{l.phone&&<div style={{fontSize:11,color:'#9ba1ab'}}>{l.phone}</div>}</div></div></td>
                      <td style={{fontSize:12.5,color:'#5c6370'}}>{l.email||'—'}</td>
                      <td style={{fontSize:12.5}}>{l.nische||'—'}</td>
                      <td><span className="badge-gray badge" style={{fontSize:11}}>{l.quelle||'—'}</span></td>
                      <td style={{fontWeight:600}}>{l.wert?`€${l.wert.toLocaleString('de-DE')}`:'—'}</td>
                      <td style={{fontSize:12,color:'#9ba1ab'}}>{l.tags||'—'}</td>
                      <td><select value={l.status} onChange={e=>upd(l.id,e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,fontFamily:'inherit',cursor:'pointer',outline:'none',color:'#1a1a2e'}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
                      <td><button onClick={()=>del(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ba1ab',fontSize:16,padding:'2px 6px'}} onMouseOver={e=>e.target.style.color='#c0392b'} onMouseOut={e=>e.target.style.color='#9ba1ab'}>×</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuer Lead</span><span className="mc-x" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Max Mustermann"/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Trading, Fitness..."/></div><div className="fg"><label className="fl">Quelle</label><select className="fsel" value={form.quelle} onChange={e=>setForm({...form,quelle:e.target.value})}>{QUELLEN.map(q=><option key={q}>{q}</option>)}</select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Wert (€)</label><input className="fi" type="number" value={form.wert} onChange={e=>setForm({...form,wert:e.target.value})}/></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div></div>
          <div className="fg"><label className="fl">Tags</label><input className="fi" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Follow Up, VIP..."/></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
        </div>
        <div className="mf"><button className="btn-secondary" onClick={()=>{setModal(false);setForm(empty)}}>Abbrechen</button><button className="btn-primary" onClick={save}>Speichern</button></div>
      </div></div>}
    </div>
  )
}
