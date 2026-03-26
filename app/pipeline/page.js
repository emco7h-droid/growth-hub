'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const COLS = [
  {s:'Neu',c:'#9ba1ab',bg:'#f4f6f8'},
  {s:'In Kontakt',c:'#5b9cf6',bg:'#e8f4fd'},
  {s:'Qualifiziert',c:'#a78bfa',bg:'#f0ebfd'},
  {s:'Call gebucht',c:'#1565c0',bg:'#dbeafe'},
  {s:'Gewonnen',c:'#0a7c59',bg:'#dcfce7'},
  {s:'Verloren',c:'#c0392b',bg:'#fee2e2'},
]

export default function Pipeline() {
  const [leads,setLeads]=useState([]);const [loading,setLoading]=useState(true);const [dragging,setDragging]=useState(null);const [over,setOver]=useState(null)
  const router=useRouter()
  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session){router.push('/login');return};load()});},[])
  const load=async()=>{const {data}=await supabase.from('leads').select('*').order('created_at',{ascending:false});setLeads(data||[]);setLoading(false)}
  const move=async(id,status)=>{await supabase.from('leads').update({status}).eq('id',id);load()}
  const totalVal=leads.reduce((s,l)=>s+(l.wert||0),0)

  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar">
          <div className="tb-l"><span className="tb-title">Pipeline</span><span style={{fontSize:12,color:'#9ba1ab'}}>{leads.length} Leads · €{totalVal.toLocaleString('de-DE')} gesamt</span></div>
          <div className="tb-r"><a href="/leads" className="btn-p">+ Lead hinzufuegen</a></div>
        </div>
        <div className="page" style={{overflow:'auto'}}>
          {/* Summary bar */}
          <div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto',paddingBottom:4}}>
            {COLS.map(col=>{
              const colLeads=leads.filter(l=>l.status===col.s)
              const val=colLeads.reduce((s,l)=>s+(l.wert||0),0)
              return <div key={col.s} style={{flex:'0 0 auto',background:'#fff',border:'1px solid #e1e4e8',borderRadius:8,padding:'8px 14px',display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:col.c,flexShrink:0}}></div>
                <span style={{fontSize:12.5,fontWeight:500,whiteSpace:'nowrap'}}>{col.s}</span>
                <span style={{fontSize:12,color:'#9ba1ab'}}>{colLeads.length}</span>
                {val>0&&<span style={{fontSize:11,color:'#0a7c59',fontWeight:600}}>€{val.toLocaleString('de-DE')}</span>}
              </div>
            })}
          </div>
          {loading?<div style={{textAlign:'center',paddingTop:60,color:'#9ba1ab'}}>Laden...</div>:(
            <div style={{display:'flex',gap:12,overflow:'auto',paddingBottom:16,minHeight:400}}>
              {COLS.map(col=>{
                const colLeads=leads.filter(l=>l.status===col.s)
                const val=colLeads.reduce((s,l)=>s+(l.wert||0),0)
                return (
                  <div key={col.s} style={{minWidth:200,maxWidth:200,flexShrink:0,background:over===col.s?col.bg:'#f4f6f8',borderRadius:10,padding:12,transition:'background .15s',border:`2px solid ${over===col.s?col.c:'transparent'}`}}
                    onDragOver={e=>{e.preventDefault();setOver(col.s)}}
                    onDragLeave={()=>setOver(null)}
                    onDrop={e=>{e.preventDefault();setOver(null);if(dragging)move(dragging,col.s)}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <span style={{fontSize:11,fontWeight:700,color:col.c,textTransform:'uppercase',letterSpacing:'.06em',display:'flex',alignItems:'center',gap:5}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:col.c,display:'inline-block'}}></span>
                        {col.s}
                      </span>
                      <span style={{background:'#fff',color:col.c,fontSize:10.5,padding:'1px 7px',borderRadius:10,fontWeight:700,border:`1px solid ${col.c}30`}}>{colLeads.length}</span>
                    </div>
                    {val>0&&<div style={{fontSize:11,color:'#0a7c59',fontWeight:600,marginBottom:8,paddingLeft:12}}>€{val.toLocaleString('de-DE')}</div>}
                    {colLeads.map(l=>(
                      <div key={l.id} className="kcard" draggable onDragStart={()=>setDragging(l.id)} onDragEnd={()=>setDragging(null)}
                        style={{borderLeft:`3px solid ${col.c}`,userSelect:'none'}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                          <div style={{width:22,height:22,borderRadius:'50%',background:col.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:col.c,flexShrink:0,border:`1px solid ${col.c}30`}}>{l.name?.slice(0,2).toUpperCase()}</div>
                          <span style={{fontSize:13,fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</span>
                        </div>
                        {l.nische&&<div style={{fontSize:11,color:'#9ba1ab',marginBottom:4}}>{l.nische}</div>}
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
                          {l.wert>0?<span style={{fontSize:12,fontWeight:700,color:'#0a7c59'}}>€{l.wert.toLocaleString('de-DE')}</span>:<span/>}
                          {l.quelle&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:20,background:'#f0f2f5',color:'#9ba1ab'}}>{l.quelle}</span>}
                        </div>
                      </div>
                    ))}
                    {colLeads.length===0&&<div style={{padding:'16px 0',textAlign:'center',fontSize:12,color:'#c5ccd4'}}>Leer — hierher ziehen</div>}
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
