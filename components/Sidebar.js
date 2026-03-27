'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/context/WorkspaceContext'

const S = (d) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>

const NAV = [
  { g: null, items: [{ href:'/dashboard', l:'Uebersicht', icon:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }]},
  { g: 'CRM', items: [
    { href:'/leads', l:'Leads', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { href:'/contacts', l:'Kontakte', icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/pipeline', l:'Pipeline', icon:'M22 12h-4l-3 9L9 3l-3 9H2' },
    { href:'/tasks', l:'Aufgaben', icon:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  ]},
  { g: 'Berichte', items: [
    { href:'/analytics', l:'Statistiken', icon:'M18 20V10M12 20V4M6 20v-6', badge:'LIVE' },
    { href:'/kpis', l:'KPI Tracker', icon:'M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href:'/invoices', l:'Rechnungen', icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6' },
  ]},
  { g: 'Kommunikation', items: [
    { href:'/calls', l:'Calls', icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z' },
    { href:'/emails', l:'Email Sequenz', icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
    { href:'/calendar', l:'Kalender', icon:'M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zM16 2v4M8 2v4M3 10h18' },
    { href:'/chat', l:'Team Chat', icon:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', badge:'NEU' },
  ]},
  { g: 'Tools', items: [
    { href:'/ai', l:'AI Center', icon:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', badge:'KI' },
    { href:'/settings', l:'Einstellungen', icon:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const { workspaces, current, switchWorkspace, addWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [newWs, setNewWs] = useState({ name:'', nische:'', retainer:0, modell:'1 zu 1' })

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'GH'

  const handleAdd = async () => {
    if (!newWs.name.trim()) return
    const slug = newWs.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'')
    await addWorkspace({ ...newWs, slug, retainer: parseFloat(newWs.retainer)||0 })
    setAddModal(false)
    setNewWs({ name:'', nische:'', retainer:0, modell:'1 zu 1' })
  }

  return (
    <>
      <div className="sidebar">
        {/* WORKSPACE SWITCHER */}
        <div className="ws-switcher" onClick={()=>setOpen(!open)}>
          <div className="ws-switcher-inner">
            <div className="ws-logo">{current ? initials(current.name) : 'GH'}</div>
            <div className="ws-name">
              <div className="ws-name-text">{current?.name || 'Growth Hub'}</div>
              <div className="ws-name-sub">{current?.nische || 'Workspace'}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" className={`ws-chevron${open?' open':''}`}><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {open && (
            <div className="ws-dropdown" onClick={e=>e.stopPropagation()}>
              <div className="ws-dropdown-header">Workspaces</div>
              {workspaces.map(ws=>(
                <div key={ws.id} className={`ws-option${current?.id===ws.id?' active':''}`} onClick={()=>{switchWorkspace(ws);setOpen(false);router.push('/dashboard')}}>
                  <div className="ws-option-logo" style={{background:ws.id===current?.id?'#1565c0':'#6b7280'}}>{initials(ws.name)}</div>
                  <div>
                    <div className="ws-option-name">{ws.name}</div>
                    <div className="ws-option-sub">{ws.nische || ws.modell} · {ws.status}</div>
                  </div>
                  {current?.id===ws.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round" style={{marginLeft:'auto'}}><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              ))}
              <div className="ws-add" onClick={()=>{setAddModal(true);setOpen(false)}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Neuen Client anlegen
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}>
          {NAV.map((s,si)=>(
            <div key={si} className="sb-sec">
              {s.g && <div className="sb-lbl">{s.g}</div>}
              {s.items.map(item=>(
                <Link key={item.href} href={item.href} className={`si${path===item.href||path.startsWith(item.href+'/')?' act':''}`}>
                  {S(item.icon)}<span style={{flex:1}}>{item.l}</span>
                  {item.badge && <span className={`si-badge${item.badge==='LIVE'?' red':''}`}>{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* USER */}
        <div className="sb-footer">
          <div className="sb-user" onClick={logout} title="Abmelden">
            <div className="sb-avt">AH</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.9)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Alex Heidrich</div>
              <div style={{fontSize:10.5,color:'rgba(255,255,255,0.4)'}}>Growth Operator</div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
        </div>
      </div>

      {/* ADD WORKSPACE MODAL */}
      {addModal && (
        <div className="mo" onClick={()=>setAddModal(false)}>
          <div className="md" onClick={e=>e.stopPropagation()}>
            <div className="mh">
              <span className="mt">Neuen Client / Workspace anlegen</span>
              <span className="mx" onClick={()=>setAddModal(false)}>×</span>
            </div>
            <div className="mb">
              <p style={{fontSize:13,color:'#5c6370',marginBottom:16,lineHeight:1.6}}>Fuer jeden Client wird ein eigener Workspace erstellt. Alle Leads, Kontakte, KPIs und Daten sind voneinander getrennt — wie bei GoHighLevel.</p>
              <div className="fg"><label className="fl">Client / Workspace Name *</label><input className="fi" value={newWs.name} onChange={e=>setNewWs({...newWs,name:e.target.value})} placeholder="z.B. Max Muster Coaching, TechFlow AG..."/></div>
              <div className="fr">
                <div className="fg"><label className="fl">Nische</label><input className="fi" value={newWs.nische} onChange={e=>setNewWs({...newWs,nische:e.target.value})} placeholder="Trading, Fitness, Business..."/></div>
                <div className="fg"><label className="fl">Coaching Modell</label><select className="fsel" value={newWs.modell} onChange={e=>setNewWs({...newWs,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option><option>Agency</option></select></div>
              </div>
              <div className="fg"><label className="fl">Monatlicher Retainer (€)</label><input className="fi" type="number" value={newWs.retainer} onChange={e=>setNewWs({...newWs,retainer:e.target.value})} placeholder="1500"/></div>
            </div>
            <div className="mf">
              <button className="btn-s" onClick={()=>setAddModal(false)}>Abbrechen</button>
              <button className="btn-p" onClick={handleAdd}>Workspace erstellen</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
