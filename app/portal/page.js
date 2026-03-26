'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Portal() {
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [data,setData]=useState(null);const [kpis,setKpis]=useState([])
  const login=async(e)=>{
    e.preventDefault();setLoading(true);setError('')
    const {data:auth,error:err}=await supabase.auth.signInWithPassword({email,password})
    if(err){setError(err.message);setLoading(false);return}
    const {data:profile}=await supabase.from('profiles').select('*').eq('id',auth.user.id).single()
    if(!profile||profile.role!=='client'){setError('Kein Client-Zugang.');await supabase.auth.signOut();setLoading(false);return}
    const [{data:c},{data:k}]=await Promise.all([supabase.from('clients').select('*').eq('id',profile.client_id).single(),supabase.from('kpis').select('*').eq('client_id',profile.client_id).order('monat')])
    setData(c);setKpis(k||[]);setLoading(false)
  }
  if(data) return (
    <div style={{minHeight:'100vh',background:'#f4f6f8',fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:'#1565c0',padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{color:'#fff',fontWeight:600,fontSize:13}}>Growth Hub — Client Portal</span>
        <button onClick={()=>{supabase.auth.signOut();setData(null)}} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:12}}>Abmelden</button>
      </div>
      <div style={{maxWidth:860,margin:'28px auto',padding:'0 20px'}}>
        <h1 style={{fontSize:20,fontWeight:600,marginBottom:4}}>{data.name}</h1>
        <p style={{fontSize:13,color:'#5c6370',marginBottom:20}}>Monat {data.monat||1} / 3 · <span style={{color:'#0a7c59',fontWeight:500}}>Aktiv</span></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
          {[['Retainer',`€${(data.retainer||0).toLocaleString('de-DE')}/Mo`],['Monat',`${data.monat||1} / 3`],['Status','Aktiv']].map(([l,v])=>(
            <div key={l} style={{background:'#fff',borderRadius:8,padding:'14px 16px',border:'1px solid #e1e4e8'}}><div style={{fontSize:11,color:'#9ba1ab',marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:600}}>{v}</div></div>
          ))}
        </div>
        {data.ziel_1&&<div style={{background:'#fff',borderRadius:8,border:'1px solid #e1e4e8',padding:16,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Deine 90-Tage Ziele</div>{[data.ziel_1,data.ziel_2,data.ziel_3].filter(Boolean).map((z,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:7}}><div style={{width:18,height:18,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#1565c0',flexShrink:0}}>{i+1}</div><span style={{fontSize:13}}>{z}</span></div>)}</div>}
        {kpis.length>0&&<div style={{background:'#fff',borderRadius:8,border:'1px solid #e1e4e8',overflow:'hidden'}}><div style={{padding:'12px 16px',borderBottom:'1px solid #f0f2f5',fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase'}}>KPI Entwicklung</div><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Kennzahl',...kpis.map(k=>`Monat ${k.monat}`)].map(h=><th key={h} style={{padding:'8px 12px',fontSize:11,color:'#9ba1ab',textAlign:'left',borderBottom:'1px solid #f0f2f5'}}>{h}</th>)}</tr></thead><tbody>{[['Instagram',kpis.map(k=>k.follower_ig||'—')],['TikTok',kpis.map(k=>k.follower_tt||'—')],['Umsatz',kpis.map(k=>k.umsatz?`€${k.umsatz}`:'—')]].map(([l,vals])=><tr key={l}><td style={{padding:'9px 12px',fontSize:13,color:'#5c6370'}}>{l}</td>{vals.map((v,i)=><td key={i} style={{padding:'9px 12px',fontSize:13,fontWeight:600}}>{v}</td>)}</tr>)}</tbody></table></div></div>}
      </div>
    </div>
  )
  return (
    <div style={{minHeight:'100vh',background:'#f4f6f8',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{textAlign:'center',marginBottom:24}}><div style={{width:40,height:40,background:'#1565c0',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div><h1 style={{fontSize:20,fontWeight:600}}>Client Portal</h1><p style={{color:'#9ba1ab',marginTop:4,fontSize:13}}>Dein persoenliches Dashboard</p></div>
        <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #e1e4e8'}}>
          <form onSubmit={login}>
            {error&&<div style={{background:'#fce8e6',color:'#c0392b',padding:'10px 14px',borderRadius:6,fontSize:13,marginBottom:12}}>{error}</div>}
            <div className="fg"><label className="fl">E-Mail</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div className="fg" style={{marginBottom:18}}><label className="fl">Passwort</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
            <button type="submit" disabled={loading} style={{width:'100%',height:34,background:'#1565c0',color:'#fff',border:'none',borderRadius:6,fontSize:13.5,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>{loading?'Anmelden...':'Anmelden'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
