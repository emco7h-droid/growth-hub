'use client'
import { useState } from 'react'
import { useWorkspace } from './WorkspaceContext'
import { useRouter } from 'next/navigation'

export default function WorkspaceSwitcher() {
  const { workspaces, current, switchWorkspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (!current) return null

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{position:'relative'}}>
      <div onClick={()=>setOpen(!open)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.15)',transition:'background .12s'}}
        onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.25)'}
        onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0.15)'}>
        <div style={{width:28,height:28,borderRadius:7,background:current.color||'#1565c0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0,border:'1.5px solid rgba(255,255,255,0.2)'}}>
          {initials(current.name)}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{current.name}</div>
          <div style={{fontSize:10.5,color:'rgba(255,255,255,0.45)'}}>{current.nische||'Workspace'}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0,transform:open?'rotate(180deg)':'none',transition:'transform .15s'}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <>
          <div style={{position:'fixed',inset:0,zIndex:199}} onClick={()=>setOpen(false)}/>
          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',borderRadius:'0 0 10px 10px',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:200,overflow:'hidden',border:'1px solid #e1e4e8',maxHeight:320,overflowY:'auto'}}>
            <div style={{padding:'8px 12px 4px',fontSize:10,fontWeight:700,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.8px'}}>Workspaces</div>
            {workspaces.map(ws=>(
              <div key={ws.id} onClick={()=>{switchWorkspace(ws);setOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',cursor:'pointer',background:current.id===ws.id?'#f0f7ff':'transparent',transition:'background .1s'}}
                onMouseOver={e=>e.currentTarget.style.background=current.id===ws.id?'#e3f0ff':'#f4f6f8'}
                onMouseOut={e=>e.currentTarget.style.background=current.id===ws.id?'#f0f7ff':'transparent'}>
                <div style={{width:28,height:28,borderRadius:7,background:ws.color||'#1565c0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>
                  {initials(ws.name)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:'#1a1a2e'}}>{ws.name}</div>
                  <div style={{fontSize:11,color:'#9ba1ab'}}>{ws.nische||'—'}</div>
                </div>
                {current.id===ws.id&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            ))}
            <div style={{borderTop:'1px solid #f0f2f5',padding:'6px 0'}}>
              <div onClick={()=>{setOpen(false);router.push('/workspaces')}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',cursor:'pointer',fontSize:12.5,color:'#1565c0',fontWeight:500,transition:'background .1s'}}
                onMouseOver={e=>e.currentTarget.style.background='#f4f6f8'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Neuen Client anlegen
              </div>
              <div onClick={()=>{setOpen(false);router.push('/settings')}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',cursor:'pointer',fontSize:12.5,color:'#5c6370',transition:'background .1s'}}
                onMouseOver={e=>e.currentTarget.style.background='#f4f6f8'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Einstellungen
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
