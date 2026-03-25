'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const COLS = ['Neu','In Kontakt','Qualifiziert','Call gebucht','Gewonnen']
const COLORS = { 'Neu':'#9ba1ab','In Kontakt':'#5b9cf6','Qualifiziert':'#9b8cf6','Call gebucht':'#1565c0','Gewonnen':'#0a7c59' }

export default function Pipeline() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(null)
  const router = useRouter()

  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; load() }) },[])
  const load = async () => { const {data}=await supabase.from('leads').select('*').order('created_at',{ascending:false}); setLeads(data||[]); setLoading(false) }
  const move = async (id, status) => { await supabase.from('leads').update({status}).eq('id',id); load() }

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">Pipeline</span><span style={{fontSize:12.5,color:'#9ba1ab'}}>Kanban Uebersicht</span></div></div>
        <div className="page">
          {loading?<div style={{textAlign:'center',paddingTop:60,color:'#9ba1ab'}}>Laden...</div>:(
            <div className="kanban">
              {COLS.map(col=>{
                const colLeads = leads.filter(l=>l.status===col)
                const val = colLeads.reduce((s,l)=>s+(l.wert||0),0)
                return (
                  <div key={col} className="kanban-col"
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.background='#e3f0ff'}}
                    onDragLeave={e=>{e.currentTarget.style.background=''}}
                    onDrop={e=>{e.currentTarget.style.background='';if(dragging)move(dragging,col)}}>
                    <div className="kanban-col-header">
                      <span style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:8,height:8,borderRadius:'50%',background:COLORS[col],display:'inline-block'}}></span>
                        {col}
                      </span>
                      <span className="kanban-col-count">{colLeads.length}</span>
                    </div>
                    {val>0&&<div style={{fontSize:11,color:'#9ba1ab',marginBottom:8,paddingLeft:14}}>€{val.toLocaleString('de-DE')}</div>}
                    {colLeads.map(l=>(
                      <div key={l.id} className="kanban-card" draggable onDragStart={()=>setDragging(l.id)} onDragEnd={()=>setDragging(null)}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          <div style={{width:22,height:22,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#1565c0',flexShrink:0}}>{l.name?.slice(0,2).toUpperCase()}</div>
                          <div className="kanban-card-name">{l.name}</div>
                        </div>
                        {l.nische&&<div className="kanban-card-sub">{l.nische}</div>}
                        {l.wert>0&&<div style={{fontSize:11,fontWeight:600,color:'#0a7c59',marginTop:4}}>€{l.wert.toLocaleString('de-DE')}</div>}
                      </div>
                    ))}
                    {colLeads.length===0&&<div style={{fontSize:12,color:'#c5ccd4',textAlign:'center',padding:'12px 0'}}>Leer</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
