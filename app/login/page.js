'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export default function Login() {
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('')
  const router = useRouter()
  const login = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) } else router.push('/dashboard')
  }
  return (
    <div style={{minHeight:'100vh',background:'#f4f6f8',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter',sans-serif"}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:44,height:44,background:'#1565c0',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 4px 14px rgba(21,101,192,0.3)'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <h1 style={{fontSize:22,fontWeight:600,color:'#1a1a2e',letterSpacing:'-.3px'}}>Growth Hub</h1>
          <p style={{color:'#9ba1ab',marginTop:4,fontSize:13}}>Agency OS — Anmelden</p>
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:'28px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e1e4e8'}}>
          <form onSubmit={login}>
            {error&&<div style={{background:'#fce8e6',color:'#c0392b',padding:'10px 14px',borderRadius:7,fontSize:13,marginBottom:14}}>{error}</div>}
            <div className="fg"><label className="fl">E-Mail</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" required/></div>
            <div className="fg" style={{marginBottom:22}}><label className="fl">Passwort</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></div>
            <button type="submit" disabled={loading} style={{width:'100%',height:36,background:'#1565c0',color:'#fff',border:'none',borderRadius:7,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'background .15s'}}
              onMouseOver={e=>e.target.style.background='#1976d2'} onMouseOut={e=>e.target.style.background='#1565c0'}>
              {loading?'Anmelden...':'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
