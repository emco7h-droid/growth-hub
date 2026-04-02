'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const KATEGORIEN = ['Revenue','Leads','Kunden','Social Media','Email','Calls','Sonstiges']
const empty = { titel:'', beschreibung:'', ziel_wert:0, aktuell_wert:0, einheit:'€', kategorie:'Revenue', faellig:'', status:'Aktiv', prioritaet:1 }

function GoalsContent() {
  const { current } = useWorkspace()
  const [goals, setGoals] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])
  useEffect(()=>{ if(current) load() },[current?.id])

  const load = async () => {
    const { data } = await supabase.from('workspace_goals').select('*').eq('workspace_id',current.id).order('prioritaet')
    setGoals(data||[])
  }

  const save = async () => {
    if(!form.titel.trim())return
    const payload = {...form, workspace_id:current.id, ziel_wert:parseFloat(form.ziel_wert)||0, aktuell_wert:parseFloat(form.aktuell_wert)||0 }
    if(editId) await supabase.from('workspace_goals').update(payload).eq('id',editId)
    else await supabase.from('workspace_goals').insert([payload])
    setModal(false); setEditId(null); setForm(empty); load()
  }

  const del = async (id) => { if(!confirm('Ziel löschen?'))return; await supabase.from('workspace_goals').delete().eq('id',id); load() }
  const updateProgress = async (id, val) => { await supabase.from('workspace_goals').update({aktuell_wert:val}).eq('id',id); load() }
  const openEdit = (g) => { setEditId(g.id); setForm({titel:g.titel,beschreibung:g.beschreibung||'',ziel_wert:g.ziel_wert,aktuell_wert:g.aktuell_wert,einheit:g.einheit,kategorie:g.kategorie,faellig:g.faellig||'',status:g.status,prioritaet:g.prioritaet}); setModal(true) }

  const wsColor = current?.color||'#1565c0'
  const pct = (g) => Math.min(100, g.ziel_wert>0?Math.round(g.aktuell_wert/g.ziel_wert*100):0)
  const catColors = {'Revenue':'#0a7c59','Leads':'#1565c0','Kunden':'#6b4bc8','Social Media':'#be185d','Email':'#b7860b','Calls':'#0891b2','Sonstiges':'#9ba1ab'}

  if(!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      {/* Goals from onboarding */}
      {(current.ziel_1||current.ziel_2||current.ziel_3) && goals.length===0 && (
        <div style={{background:'#fff8e1',border:'1px solid #fdd835',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#5c6370',lineHeight:1.7}}>
          <strong>Ziele aus Onboarding:</strong> {[current.ziel_1,current.ziel_2,current.ziel_3].filter(Boolean).join(' · ')} — Füge sie als messbare Goals hinzu!
        </div>
      )}

      {goals.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:'50px 20px'}}>
          <div style={{fontSize:40,marginBottom:12}}>🎯</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Noch keine Ziele für {current.name}</div>
          <div style={{fontSize:13,color:'#9ba1ab',marginBottom:20}}>Definiere messbare Ziele die du mit diesem Client erreichen willst.</div>
          <button className="btn-p" onClick={()=>setModal(true)} style={{background:wsColor}}>+ Erstes Ziel erstellen</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {goals.map(g => {
            const p = pct(g)
            const catColor = catColors[g.kategorie]||'#9ba1ab'
            return (
              <div key={g.id} className="card" style={{borderLeft:`4px solid ${catColor}`}}>
                <div className="cb">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:11,padding:'1px 7px',borderRadius:4,background:`${catColor}20`,color:catColor,fontWeight:600}}>{g.kategorie}</span>
                        {g.faellig && <span style={{fontSize:11,color:'#9ba1ab'}}>bis {new Date(g.faellig).toLocaleDateString('de-DE')}</span>}
                      </div>
                      <div style={{fontSize:15,fontWeight:600}}>{g.titel}</div>
                      {g.beschreibung&&<div style={{fontSize:12.5,color:'#5c6370',marginTop:2}}>{g.beschreibung}</div>}
                    </div>
                    <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:10}}>
                      <button onClick={()=>openEdit(g)} className="btn-s" style={{height:26,padding:'0 8px',fontSize:11}}>✏️</button>
                      <button onClick={()=>del(g.id)} className="btn-s" style={{height:26,padding:'0 8px',fontSize:11}}>×</button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:p>=100?'#0a7c59':p>=50?wsColor:'#5c6370'}}>{g.aktuell_wert}{g.einheit} / {g.ziel_wert}{g.einheit}</span>
                      <span style={{fontSize:13,fontWeight:700,color:p>=100?'#0a7c59':p>=50?wsColor:'#9ba1ab'}}>{p}%</span>
                    </div>
                    <div style={{height:8,background:'#f0f2f5',borderRadius:4,overflow:'hidden'}}>
                      <div style={{width:`${p}%`,height:'100%',background:p>=100?'#0a7c59':p>=50?wsColor:`${wsColor}80`,borderRadius:4,transition:'width .5s'}}/>
                    </div>
                  </div>

                  {/* Quick update */}
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:12,color:'#9ba1ab',whiteSpace:'nowrap'}}>Aktuell:</span>
                    <input type="number" value={g.aktuell_wert} onChange={e=>updateProgress(g.id,parseFloat(e.target.value)||0)}
                      style={{flex:1,height:28,padding:'0 8px',border:'1px solid #e1e4e8',borderRadius:6,fontSize:12.5,fontFamily:'inherit',outline:'none'}}/>
                    <span style={{fontSize:12.5,color:'#5c6370'}}>{g.einheit}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal&&<div className="mo" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>
        <div className="md" onClick={e=>e.stopPropagation()}>
          <div className="mh"><span className="mt">{editId?'Ziel bearbeiten':'Neues Ziel'} — {current.name}</span><span className="mx" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>×</span></div>
          <div className="mb">
            <div className="fg"><label className="fl">Ziel Titel *</label><input className="fi" value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})} placeholder="z.B. €10.000 MRR erreichen"/></div>
            <div className="fr">
              <div className="fg"><label className="fl">Kategorie</label><select className="fsel" value={form.kategorie} onChange={e=>setForm({...form,kategorie:e.target.value})}>{KATEGORIEN.map(k=><option key={k}>{k}</option>)}</select></div>
              <div className="fg"><label className="fl">Einheit</label><select className="fsel" value={form.einheit} onChange={e=>setForm({...form,einheit:e.target.value})}><option>€</option><option>%</option><option>Kunden</option><option>Leads</option><option>Follower</option><option>Calls</option><option>Posts</option></select></div>
            </div>
            <div className="fr">
              <div className="fg"><label className="fl">Zielwert</label><input className="fi" type="number" value={form.ziel_wert} onChange={e=>setForm({...form,ziel_wert:e.target.value})} placeholder="10000"/></div>
              <div className="fg"><label className="fl">Aktueller Wert</label><input className="fi" type="number" value={form.aktuell_wert} onChange={e=>setForm({...form,aktuell_wert:e.target.value})} placeholder="0"/></div>
            </div>
            <div className="fr">
              <div className="fg"><label className="fl">Fällig bis</label><input className="fi" type="date" value={form.faellig} onChange={e=>setForm({...form,faellig:e.target.value})}/></div>
              <div className="fg"><label className="fl">Priorität</label><select className="fsel" value={form.prioritaet} onChange={e=>setForm({...form,prioritaet:parseInt(e.target.value)})}><option value={1}>Hoch</option><option value={2}>Mittel</option><option value={3}>Niedrig</option></select></div>
            </div>
            <div className="fg"><label className="fl">Beschreibung</label><textarea className="fta" value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})} rows={2}/></div>
          </div>
          <div className="mf"><button className="btn-s" onClick={()=>{setModal(false);setEditId(null);setForm(empty)}}>Abbrechen</button><button className="btn-p" onClick={save} style={{background:wsColor}}>Speichern</button></div>
        </div>
      </div>}
    </div>
  )
}

export default function Goals() {
  return <WorkspaceProvider><div className="layout"><Sidebar/>
    <div className="main">
      <GoalsTopbar/>
      <GoalsContent/>
    </div>
  </div></WorkspaceProvider>
}
function GoalsTopbar() {
  const { current } = useWorkspace()
  const [modal,setModal]=useState(false)
  return <div className="topbar">
    <div className="tb-l"><span className="tb-title">Ziele & OKRs</span>{current&&<span className="tb-ws-badge">{current.name}</span>}</div>
    <div className="tb-r"><button className="btn-p" onClick={()=>setModal(true)}>+ Ziel erstellen</button></div>
  </div>
}
