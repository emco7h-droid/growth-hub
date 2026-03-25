'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export default function Home() {
  const router = useRouter()
  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => router.push(session ? '/dashboard' : '/login')) }, [])
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f4f6f8'}}><div style={{textAlign:'center',color:'#9ba1ab',fontSize:13}}>Laden...</div></div>
}
