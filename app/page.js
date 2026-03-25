'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.push(session ? '/dashboard' : '/login')
    })
  }, [])
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f6f6f7'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,background:'#2c6ecb',borderRadius:8,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        </div>
        <div style={{fontSize:14,fontWeight:600,color:'#1a1a1a'}}>Growth Hub</div>
      </div>
    </div>
  )
}
