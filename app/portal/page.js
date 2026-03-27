'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Portal() {
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [data,setData]=useState(null);const [leads,setLeads]=useState([]);const [kpis,setKpis]=useState([])
  const login=async(e)=>{
    e.preventDefault();setLoading(true);setError('')
    const{data:auth,error:err}=await supabase.auth.signInWithPassword({email,password})
    if(err){setError(err.message);setLoading(false);return}
    const{data:profile}=await supabase.from('profiles').select('*').eq('id',auth.user.id).single()
    if(!profile||profile.role!=='client'){setError('Kein Client-Zugang.');await supabase.auth.signOut();setLoading(false);return}
    const[{data:ws},{data:l},{data:k}]=await Promise.all([supabase.from('workspaces').select('*').eq('id',profile.workspace_id).single(),supabase.from('leads').select('*').eq('workspace_id',profile.workspace_id).order('created_at',{ascending:false}).limit(10),supabase.from('kpis').select('*').eq('workspace_id',profile.workspace_id).order('monat')])
    setData(ws);setLeads(l||[]);setKpis(k||[]);setLoading(false)
  }
  if(data) return (
    <div style={{minHeight:'100vh',background:'#f4f6f8',fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:'#1565c0',padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{color:'#fff',fontWeight:600,fontSize:13}}>Growth Hub · Client Portal · {data.name}</span>
        <button onClick={()=>{supabase.auth.signOut();setData(null)}} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:12}}>Abmelden</button>
      </div>
      <div style={{maxWidth:900,margin:'28px auto',padding:'0 20px'}}>
        <div style={{marginBottom:24}}><h1 style={{fontSize:22,fontWeight:600}}>{data.name}</h1><p style={{fontSize:13,color:'#5c6370',marginTop:2}}>Dein persoenliches Dashboard — Read Only</p></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[['Monat',`${data.monat||1} / 3`],['Status',data.status],['Retainer',`€${(data.retainer||0).toLocaleString('de-DE')}/Mo`]].map(([l,v])=>(
            <div key={l} style={{background:'#fff',borderRadius:8,padding:'14px 18px',border:'1px solid #e1e4e8'}}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:600}}>{v}</div></div>
          ))}
        </div>
        {data.ziel_1&&<div style={{background:'#fff',borderRadius:8,border:'1px solid #e1e4e8',padding:16,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Deine 90-Tage Ziele</div>
          {[data.ziel_1,data.ziel_2,data.ziel_3].filter(Boolean).map((z,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:6}}><div style={{width:18,height:18,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#1565c0',flexShrink:0}}>{i+1}</div><span style={{fontSize:13}}>{z}</span></div>)}
        </div>}
        {leads.length>0&&<div style={{background:'#fff',borderRadius:8,border:'1px solid #e1e4e8',overflow:'hidden',marginBottom:16}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f2f5',fontSize:13.5,fontWeight:600}}>Neueste Leads ({leads.length})</div>
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Name','Status','Quelle'].map(h=><th key={h} style={{padding:'8px 14px',fontSize:11,color:'#9ba1ab',textAlign:'left',borderBottom:'1px solid #f0f2f5'}}>{h}</th>)}</tr></thead>
          <tbody>{leads.slice(0,8).map(l=><tr key={l.id}><td style={{padding:'9px 14px',fontSize:13,fontWeight:500}}>{l.name}</td><td style={{padding:'9px 14px'}}><span style={{fontSize:11.5,padding:'2px 8px',borderRadius:20,background:'#e3f0ff',color:'#1565c0'}}>{l.status}</span></td><td style={{padding:'9px 14px',fontSize:12,color:'#9ba1ab'}}>{l.quelle}</td></tr>)}</tbody></table></div>
        </div>}
      </div>
    </div>
  )
  return (
    <div style={{minHeight:'100vh',background:'#f4f6f8',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{textAlign:'center',marginBottom:24}}><div style={{width:44,height:44,background:'#1565c0',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div><h1 style={{fontSize:20,fontWeight:600}}>Client Portal</h1><p style={{color:'#9ba1ab',marginTop:4,fontSize:13}}>Dein persoenliches Dashboard</p></div>
        <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #e1e4e8'}}>
          <form onSubmit={login}>
            {error&&<div style={{background:'#fce8e6',color:'#c0392b',padding:'10px 14px',borderRadius:6,fontSize:13,marginBottom:12}}>{error}</div>}
            <div className="fg"><label className="fl">E-Mail</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="fg" style={{marginBottom:18}}><label className="fl">Passwort</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
            <button type="submit" disabled={loading} style={{width:'100%',height:36,background:'#1565c0',color:'#fff',border:'none',borderRadius:7,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>{loading?'Anmelden...':'Anmelden →'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
