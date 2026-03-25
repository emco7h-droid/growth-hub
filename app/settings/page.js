'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [clients, setClients] = useState([])
  const router = useRouter()
  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ if(!session){router.push('/login');return}; setUser(session.user); supabase.from('clients').select('id,name').then(({data})=>setClients(data||[])) }) },[])

  return (
    <div className="layout">
      <Sidebar user={user}/>
      <div className="main">
        <div className="topbar"><div className="topbar-left"><span className="topbar-title">Einstellungen</span></div></div>
        <div className="page">
          <div className="card" style={{marginBottom:16}}>
            <div className="card-header"><div className="card-title">Account</div></div>
            <div className="card-body">
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:600,color:'#fff'}}>AH</div>
                <div><div style={{fontWeight:600,fontSize:14}}>Alex Heidrich</div><div style={{fontSize:12,color:'#6b6b6b',marginTop:2}}>{user?.email}</div></div>
                <span className="badge badge-blue" style={{marginLeft:'auto'}}>Admin</span>
              </div>
            </div>
          </div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-header"><div className="card-title">Client Portal Zugaenge</div></div>
            <div className="card-body">
              <div style={{background:'#f6f6f7',borderRadius:8,padding:'14px 16px',fontSize:13,color:'#6b6b6b',lineHeight:1.7}}>
                <strong style={{color:'#1a1a1a'}}>So erstellst du einen Client-Zugang:</strong><br/>
                1. Gehe zu Supabase Dashboard → Authentication → Users → "Invite user"<br/>
                2. Trage die E-Mail des Clients ein<br/>
                3. Gehe zu Supabase → Table Editor → profiles<br/>
                4. Erstelle einen Eintrag: id = User-ID des Clients, role = "client", client_id = ID des zugehoerigen Clients<br/>
                5. Der Client kann sich jetzt unter /portal anmelden und sieht nur seine eigenen Daten
              </div>
              {clients.length > 0 && <div style={{marginTop:14}}>
                <div style={{fontSize:12,fontWeight:600,color:'#6b6b6b',marginBottom:8}}>Deine Clients und deren IDs:</div>
                {clients.map(c=><div key={c.id} style={{fontSize:12,padding:'4px 0',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between'}}><span>{c.name}</span><code style={{background:'#f0f0f0',padding:'1px 6px',borderRadius:3,fontSize:11}}>{c.id}</code></div>)}
              </div>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Integrationen</div></div>
            <div className="card-body">
              {[['Calendly','Verbunden','calendly.com/emco7h'],['Klaviyo','Verbunden','Account: Y4pMFg'],['Make.com','Verbunden','Org: 6899832'],['Supabase','Verbunden','pzrqyhqereieruwyekfr']].map(([n,s,d],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
                  <div style={{width:32,height:32,borderRadius:6,background:'#f6f6f7',border:'1px solid #e3e3e3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#6b6b6b'}}>{n[0]}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{n}</div><div style={{fontSize:11,color:'#9b9b9b'}}>{d}</div></div>
                  <span className="badge badge-green" style={{fontSize:11}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
