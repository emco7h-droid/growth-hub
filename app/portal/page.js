'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Portal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientData, setClientData] = useState(null)
  const [kpis, setKpis] = useState([])

  const login = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    if (!profile || profile.role !== 'client') {
      setError('Kein Client-Zugang fuer dieses Konto.')
      await supabase.auth.signOut(); setLoading(false); return
    }
    const [c, k] = await Promise.all([
      supabase.from('clients').select('*').eq('id', profile.client_id).single(),
      supabase.from('kpis').select('*').eq('client_id', profile.client_id).order('monat'),
    ])
    setClientData(c.data); setKpis(k.data||[]); setLoading(false)
  }

  if (clientData) return (
    <div style={{minHeight:'100vh',background:'#f6f6f7',fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{background:'#1a1a1a',padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{color:'#fff',fontWeight:600,fontSize:13}}>Growth Hub — Client Portal</span>
        <button onClick={()=>{supabase.auth.signOut();setClientData(null)}} style={{background:'none',border:'none',color:'#808080',cursor:'pointer',fontSize:12}}>Abmelden</button>
      </div>
      <div style={{maxWidth:900,margin:'32px auto',padding:'0 24px'}}>
        <h1 style={{fontSize:20,fontWeight:600,marginBottom:4}}>{clientData.name}</h1>
        <p style={{fontSize:13,color:'#6b6b6b',marginBottom:24}}>Monat {clientData.monat||1} von 3 · <span style={{color:'#008060',fontWeight:500}}>Aktiv</span></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[['Retainer',`€${(clientData.retainer||0).toLocaleString('de-DE')}/Mo`],['Fortschritt',`Monat ${clientData.monat||1} / 3`],['Status','Aktiv']].map(([l,v])=>(
            <div key={l} style={{background:'#fff',borderRadius:8,padding:'16px 18px',border:'1px solid #e3e3e3'}}>
              <div style={{fontSize:11,color:'#9b9b9b',marginBottom:6}}>{l}</div>
              <div style={{fontSize:18,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        {clientData.ziel_1 && <div style={{background:'#fff',borderRadius:8,border:'1px solid #e3e3e3',padding:'16px 18px',marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:600,color:'#6b6b6b',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px'}}>Deine 90-Tage Ziele</div>
          {[clientData.ziel_1,clientData.ziel_2,clientData.ziel_3].filter(Boolean).map((z,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8}}><div style={{width:20,height:20,borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,flexShrink:0}}>{i+1}</div><span style={{fontSize:13}}>{z}</span></div>
          ))}
        </div>}
        {kpis.length > 0 && <div style={{background:'#fff',borderRadius:8,border:'1px solid #e3e3e3',overflow:'hidden'}}>
          <div style={{padding:'12px 18px',borderBottom:'1px solid #f0f0f0',fontSize:12,fontWeight:600,color:'#6b6b6b',textTransform:'uppercase',letterSpacing:'0.5px'}}>KPI Entwicklung</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Kennzahl',...kpis.map(k=>`Monat ${k.monat}`)].map(h=><th key={h} style={{padding:'8px 14px',fontSize:11,color:'#9b9b9b',textAlign:'left',borderBottom:'1px solid #f0f0f0'}}>{h}</th>)}</tr></thead>
              <tbody>{[['Instagram',kpis.map(k=>k.follower_ig||'—')],['TikTok',kpis.map(k=>k.follower_tt||'—')],['Umsatz',kpis.map(k=>k.umsatz?`€${k.umsatz}`:'—')],['Neue Kunden',kpis.map(k=>k.neue_kunden||'—')]].map(([l,vals])=>(
                <tr key={l}><td style={{padding:'10px 14px',fontSize:13,color:'#6b6b6b',borderBottom:'1px solid #f0f0f0'}}>{l}</td>{vals.map((v,i)=><td key={i} style={{padding:'10px 14px',fontSize:13,fontWeight:600,borderBottom:'1px solid #f0f0f0'}}>{v}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        </div>}
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f6f6f7',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{width:'100%',maxWidth:380}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{width:36,height:36,background:'#1a1a1a',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          </div>
          <h1 style={{fontSize:20,fontWeight:600}}>Client Portal</h1>
          <p style={{color:'#6b6b6b',marginTop:4,fontSize:13}}>Dein persoenliches Dashboard</p>
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',border:'1px solid #e3e3e3'}}>
          <form onSubmit={login}>
            {error && <div style={{background:'#fce8e6',color:'#d72c0d',padding:'10px 14px',borderRadius:6,fontSize:13,marginBottom:14}}>{error}</div>}
            <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12.5,fontWeight:500,marginBottom:4}}>E-Mail</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:'100%',height:36,padding:'0 12px',border:'1px solid #e3e3e3',borderRadius:6,fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div style={{marginBottom:20}}><label style={{display:'block',fontSize:12.5,fontWeight:500,marginBottom:4}}>Passwort</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{width:'100%',height:36,padding:'0 12px',border:'1px solid #e3e3e3',borderRadius:6,fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <button type="submit" disabled={loading} style={{width:'100%',height:36,background:'#1a1a1a',color:'#fff',border:'none',borderRadius:6,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>{loading?'Anmelden...':'Anmelden'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
