'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const COLORS = ['#1565c0','#0a7c59','#6b4bc8','#b7860b','#c0392b','#0891b2','#be185d','#7c3aed']
const empty = {name:'',nische:'',website:'',email:'',status:'Aktiv',notizen:'',color:'#1565c0',retainer:0,modell:'1 zu 1'}

function WorkspacesContent() {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const { workspaces, current, switchWorkspace, addWorkspace, deleteWorkspace } = useWorkspace()
  const router = useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])

  const save = async () => {
    if (!form.name.trim()) return
    const slug = form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    await addWorkspace({...form, slug, retainer: parseFloat(form.retainer)||0})
    setModal(false); setForm(empty)
  }
  const del = async (id) => { if(!confirm('Workspace loeschen?'))return; await deleteWorkspace(id) }
  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="page">
      <div style={{background:'#e3f0ff',border:'1px solid #c5d8fd',borderRadius:8,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#1565c0',lineHeight:1.6}}>
        <strong>Workspace = Client.</strong> Jeder Client bekommt seinen eigenen Workspace. Alle Leads, Kontakte, KPIs sind komplett getrennt. Oben links wechseln.
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {workspaces.map(ws=>(
          <div key={ws.id} className="card" style={{cursor:'pointer',border:current?.id===ws.id?`2px solid ${ws.color||'#1565c0'}`:'1px solid #e1e4e8',transition:'all .15s'}}
            onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseOut={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}>
            <div className="cb">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:10,background:ws.color||'#1565c0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'#fff'}}>{initials(ws.name)}</div>
                <div style={{display:'flex',gap:6}}>
                  {current?.id===ws.id&&<span className="badge bg" style={{fontSize:10.5}}>Aktiv</span>}
                  <span className={`badge ${ws.status==='Aktiv'?'bg':'bgr'}`} style={{fontSize:10.5}}>{ws.status}</span>
                </div>
              </div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{ws.name}</div>
              <div style={{fontSize:12.5,color:'#5c6370',marginBottom:4}}>{ws.nische||'—'} · {ws.modell}</div>
              {ws.retainer>0&&<div style={{fontSize:13,fontWeight:600,color:'#0a7c59',marginBottom:10}}>€{ws.retainer.toLocaleString('de-DE')}/Mo</div>}
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button className="btn-p" style={{flex:1,justifyContent:'center',height:30,fontSize:12,background:ws.color||'#1565c0'}} onClick={()=>{switchWorkspace(ws);router.push('/dashboard')}}>
                  {current?.id===ws.id?'Aktiv ✓':'Oeffnen'}
                </button>
                <button className="btn-s" style={{height:30,padding:'0 10px',fontSize:12}} onClick={()=>del(ws.id)}>×</button>
              </div>
            </div>
          </div>
        ))}
        <div onClick={()=>setModal(true)} className="card" style={{cursor:'pointer',border:'2px dashed #e1e4e8',display:'flex',alignItems:'center',justifyContent:'center',minHeight:180,transition:'all .15s'}}
          onMouseOver={e=>{e.currentTarget.style.borderColor='#1565c0';e.currentTarget.style.background='#f0f7ff'}}
          onMouseOut={e=>{e.currentTarget.style.borderColor='#e1e4e8';e.currentTarget.style.background='#fff'}}>
          <div style={{textAlign:'center',color:'#9ba1ab'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 8px',display:'block'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <div style={{fontSize:13,fontWeight:500}}>Neuen Client anlegen</div>
          </div>
        </div>
      </div>
      {modal&&<div className="mo" onClick={()=>setModal(false)}><div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh"><span className="mt">Neuen Client anlegen</span><span className="mx" onClick={()=>setModal(false)}>×</span></div>
        <div className="mb">
          <div className="fg"><label className="fl">Client Name *</label><input className="fi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="z.B. Max Coaching, TechFlow GmbH..."/></div>
          <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e=>setForm({...form,nische:e.target.value})} placeholder="Trading, Fitness..."/></div><div className="fg"><label className="fl">Modell</label><select className="fsel" value={form.modell} onChange={e=>setForm({...form,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Online Kurs</option><option>Agency</option></select></div></div>
          <div className="fr"><div className="fg"><label className="fl">Retainer (€/Mo)</label><input className="fi" type="number" value={form.retainer} onChange={e=>setForm({...form,retainer:e.target.value})}/></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Aktiv</option><option>Onboarding</option><option>Pause</option></select></div></div>
          <div className="fg"><label className="fl">Workspace Farbe</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{COLORS.map(c=>(<div key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:7,background:c,cursor:'pointer',border:form.color===c?'3px solid #fff':'3px solid transparent',boxShadow:form.color===c?`0 0 0 2px ${c}`:'none',transition:'all .12s'}}/>))}</div></div>
          <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e=>setForm({...form,notizen:e.target.value})} rows={2}/></div>
        </div>
        <div className="mf"><button className="btn-s" onClick={()=>setModal(false)}>Abbrechen</button><button className="btn-p" onClick={save} style={{background:form.color}}>Client anlegen</button></div>
      </div></div>}
    </div>
  )
}

export default function Workspaces() {
  return <WorkspaceProvider><div className="layout"><Sidebar/><div className="main">
    <div className="topbar"><div className="tb-l"><span className="tb-title">Alle Workspaces</span></div><div className="tb-r"><button className="btn-p" onClick={()=>{}}>+ Neuer Client</button></div></div>
    <WorkspacesContent/>
  </div></div></WorkspaceProvider>
}
