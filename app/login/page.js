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
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#e8f0fe 0%,#f0f5ff 50%,#e0f2fe 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'52px',height:'52px',background:'linear-gradient(135deg,#2563eb,#0ea5e9)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(37,99,235,0.3)'}}>📈</div>
          <h1 style={{fontFamily:'Syne',fontSize:'26px',fontWeight:'800',letterSpacing:'-.5px',color:'var(--text)'}}>Growth<span style={{color:'var(--blue-4)'}}>Hub</span></h1>
          <p style={{color:'var(--text-m)',marginTop:'6px',fontSize:'14px'}}>Melde dich an um fortzufahren</p>
        </div>
        <div style={{background:'#fff',borderRadius:'20px',padding:'32px',boxShadow:'0 8px 32px rgba(37,99,235,0.12)',border:'1px solid var(--border)'}}>
          <form onSubmit={login}>
            {error && <div style={{background:'#fee2e2',color:'#b91c1c',padding:'10px 14px',borderRadius:'10px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
            <div className="fg">
              <label className="fl">E-Mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.de" required />
            </div>
            <div className="fg" style={{marginBottom:'24px'}}>
              <label className="fl">Passwort</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-p" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
              {loading ? 'Anmelden...' : 'Anmelden →'}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',marginTop:'20px',fontSize:'12px',color:'var(--text-m)'}}>Growth Hub — dein professionelles Agency OS</p>
      </div>
    </div>
  )
}
