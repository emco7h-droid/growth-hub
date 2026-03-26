'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
export default function Settings() {
  const [user,setUser]=useState(null); const [clients,setClients]=useState([])
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; setUser(session.user); supabase.from('clients').select('id,name').then(({data})=>setClients(data||[])) }) },[])
  const integrations=[['Calendly','calendly.com/emco7h'],['Klaviyo','Account: Y4pMFg'],['Make.com','Org: 6899832'],['Supabase','pzrqyhqereieruwyekfr']]
  return (
    <div className="layout"><Sidebar/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">Einstellungen</span></div></div>
        <div className="page">
          <div className="card" style={{marginBottom:14}}><div className="card-header"><div className="card-title">Account</div></div><div className="card-body"><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',background:'#e3f0ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'#1565c0'}}>AH</div><div><div style={{fontWeight:600}}>Alex Heidrich</div><div style={{fontSize:12,color:'#9ba1ab',marginTop:2}}>{user?.email}</div></div><span className="badge badge-blue" style={{marginLeft:'auto'}}>Admin</span></div></div></div>
          <div className="card" style={{marginBottom:14}}><div className="card-header"><div className="card-title">Client Portal</div></div><div className="card-body"><div style={{background:'#f4f6f8',borderRadius:6,padding:'12px 14px',fontSize:13,color:'#5c6370',lineHeight:1.7}}><strong style={{color:'#1a1a2e'}}>Client-Zugang erstellen:</strong><br/>1. Supabase → Authentication → Users → Invite user<br/>2. E-Mail des Clients eintragen<br/>3. profiles Tabelle: id=User-ID, role="client", client_id=Client-ID<br/>4. Client loggt sich unter /portal ein und sieht nur eigene Daten</div>{clients.length>0&&<div style={{marginTop:12}}>{clients.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #f0f2f5',fontSize:12}}><span>{c.name}</span><code style={{background:'#f0f2f5',padding:'1px 6px',borderRadius:3,fontSize:10.5}}>{c.id}</code></div>)}</div>}</div></div>
          <div className="card"><div className="card-header"><div className="card-title">Integrationen</div></div><div className="card-body">{integrations.map(([n,d],i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid #f0f2f5'}}><div style={{width:28,height:28,borderRadius:5,background:'#f4f6f8',border:'1px solid #e1e4e8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#5c6370'}}>{n[0]}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{n}</div><div style={{fontSize:11,color:'#9ba1ab'}}>{d}</div></div><span className="badge badge-green" style={{fontSize:11}}>Verbunden</span></div>)}</div></div>
        </div>
      </div>
    </div>
  )
}
