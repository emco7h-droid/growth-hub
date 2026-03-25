'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const login = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',background:'#f6f6f7',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{width:40,height:40,background:'#1a1a1a',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'600',color:'#1a1a1a',letterSpacing:'-0.3px'}}>Growth Hub</h1>
          <p style={{color:'#6b6b6b',marginTop:'4px',fontSize:'14px'}}>Anmelden um fortzufahren</p>
        </div>

        <div style={{background:'#fff',borderRadius:'12px',padding:'28px',boxShadow:'0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.04)',border:'1px solid #e3e3e3'}}>
          <form onSubmit={login}>
            {error && (
              <div style={{background:'#fce8e6',color:'#d72c0d',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px',border:'1px solid #f0c0b8'}}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" required />
            </div>
            <div className="form-group" style={{marginBottom:'20px'}}>
              <label className="form-label">Passwort</label>
              <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{width:'100%',height:'38px',background:'#1a1a1a',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit',transition:'background .15s'}} disabled={loading} onMouseOver={e=>!loading&&(e.target.style.background='#333')} onMouseOut={e=>!loading&&(e.target.style.background='#1a1a1a')}>
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',marginTop:'16px',fontSize:'12px',color:'#9b9b9b'}}>
          Growth Hub — Professionelles Agency OS
        </p>
      </div>
    </div>
  )
}
