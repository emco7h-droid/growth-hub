'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const COLORS = ['#1565c0','#0a7c59','#6b4bc8','#b7860b','#c0392b','#0891b2','#be185d','#1a1a2e']

function SettingsContent() {
  const { current, updateWorkspace } = useWorkspace()
  const [tab, setTab] = useState('workspace')
  const [form, setForm] = useState({})
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{if(!session)router.push('/login')})},[])
  useEffect(()=>{ if(current) setForm({ name:current.name||'', nische:current.nische||'', modell:current.modell||'1 zu 1', retainer:current.retainer||0, status:current.status||'Aktiv', color:current.color||'#1565c0', calendly_url:current.calendly_url||'', client_email:current.client_email||'', notizen:current.notizen||'' }) },[current?.id])

  const save = async () => {
    await updateWorkspace(current.id, form)
    setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  if(!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[['workspace','Workspace'],['account','Account'],['automations','Automations']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{height:32,padding:'0 14px',border:tab===k?`2px solid ${current.color||'#1565c0'}`:'1px solid #e1e4e8',borderRadius:7,cursor:'pointer',background:tab===k?`${current.color||'#1565c0'}10`:'#fff',fontSize:13,fontWeight:tab===k?600:400,color:tab===k?current.color||'#1565c0':'#5c6370',fontFamily:'inherit'}}>{l}</button>
        ))}
      </div>

      {tab==='workspace' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="card">
            <div className="ch"><div className="ct">Workspace Einstellungen</div><div className="csub">{current.name}</div></div>
            <div className="cb">
              <div className="fg"><label className="fl">Name</label><input className="fi" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div className="fr">
                <div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische||''} onChange={e=>setForm({...form,nische:e.target.value})}/></div>
                <div className="fg"><label className="fl">Modell</label><select className="fsel" value={form.modell||'1 zu 1'} onChange={e=>setForm({...form,modell:e.target.value})}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option><option>Agency</option></select></div>
              </div>
              <div className="fr">
                <div className="fg"><label className="fl">Retainer (€/Mo)</label><input className="fi" type="number" value={form.retainer||0} onChange={e=>setForm({...form,retainer:parseFloat(e.target.value)||0})}/></div>
                <div className="fg"><label className="fl">Status</label><select className="fsel" value={form.status||'Aktiv'} onChange={e=>setForm({...form,status:e.target.value})}><option>Aktiv</option><option>Onboarding</option><option>Pause</option><option>Abgeschlossen</option></select></div>
              </div>
              <div className="fg">
                <label className="fl">Workspace Farbe</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {COLORS.map(c=><div key={c} onClick={()=>setForm({...form,color:c})} style={{width:28,height:28,borderRadius:7,background:c,cursor:'pointer',border:form.color===c?'3px solid #fff':'3px solid transparent',boxShadow:form.color===c?`0 0 0 2px ${c}`:'none',transition:'all .12s'}}/>)}
                </div>
              </div>
              <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen||''} onChange={e=>setForm({...form,notizen:e.target.value})} rows={3}/></div>
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Integrationen</div></div>
            <div className="cb">
              <div className="fg">
                <label className="fl">Calendly URL (fuer diesen Client)</label>
                <input className="fi" value={form.calendly_url||''} onChange={e=>setForm({...form,calendly_url:e.target.value})} placeholder="https://calendly.com/..."/>
                <div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>Jeder Workspace hat seinen eigenen Calendly Link — nicht deiner!</div>
              </div>
              <div className="fg">
                <label className="fl">Client Email (fuer Portal Login)</label>
                <input className="fi" type="email" value={form.client_email||''} onChange={e=>setForm({...form,client_email:e.target.value})} placeholder="client@beispiel.de"/>
                <div style={{fontSize:11.5,color:'#9ba1ab',marginTop:4}}>Der Client kann sich damit im Portal anmelden und seine Daten sehen</div>
              </div>
            </div>
            <div className="mf" style={{padding:'0 16px 16px',justifyContent:'flex-end'}}>
              <button className="btn-p" onClick={save} style={{background:current.color||'#1565c0'}}>{saved?'Gespeichert ✓':'Speichern'}</button>
            </div>
          </div>
        </div>
      )}

      {tab==='account' && (
        <div className="card">
          <div className="ch"><div className="ct">Account Einstellungen</div></div>
          <div className="cb">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="fg"><label className="fl">Name</label><input className="fi" value="Alex Heidrich" readOnly style={{background:'#f4f6f8'}}/></div>
              <div className="fg"><label className="fl">Email</label><input className="fi" value="emco7h@gmail.com" readOnly style={{background:'#f4f6f8'}}/></div>
            </div>
            <div style={{background:'#f4f6f8',borderRadius:8,padding:'12px 14px',fontSize:13,color:'#5c6370',lineHeight:1.6}}>
              Account-Aenderungen koennen direkt in Supabase unter Authentication → Users gemacht werden.
            </div>
          </div>
        </div>
      )}

      {tab==='automations' && (
        <div className="card">
          <div className="ch"><div className="ct">Make.com Automations</div><a href="https://make.com" target="_blank" className="btn-s" style={{fontSize:12}}>Make oeffnen</a></div>
          <div className="cb">
            {[['Calendly → Lead Capture','Webhook aktiv — Leads werden automatisch erfasst','#0a7c59','https://hook.eu1.make.com/9i1wd8ivbovdi26im1spuzbg6yhsh8wt'],
              ['Post-Call → Klaviyo','Startet Email Sequenz nach erfolgreichem Call','#0a7c59','https://hook.eu1.make.com/ar6pwvrhr4di4ndwv5yr05099hczynrd']].map(([n,d,c,u])=>(
              <div key={n} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 0',borderBottom:'1px solid #f0f2f5'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:c,marginTop:5,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:500,marginBottom:3}}>{n}</div>
                  <div style={{fontSize:12,color:'#5c6370'}}>{d}</div>
                  <div style={{fontSize:11,color:'#9ba1ab',marginTop:3,wordBreak:'break-all'}}>{u}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:12,padding:'12px 0',borderTop:'1px solid #f0f2f5'}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Calendly Webhook eintragen</div>
              <div style={{fontSize:12.5,color:'#5c6370',lineHeight:1.6,marginBottom:10}}>Damit Calendly Buchungen automatisch als Leads gespeichert werden, musst du einmalig den Webhook in Calendly eintragen:</div>
              <div style={{background:'#f4f6f8',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12,color:'#1565c0',wordBreak:'break-all',marginBottom:10}}>
                https://hook.eu1.make.com/9i1wd8ivbovdi26im1spuzbg6yhsh8wt
              </div>
              <a href="https://calendly.com/integrations/webhooks" target="_blank" className="btn-p" style={{textDecoration:'none',background:'#1565c0',display:'inline-flex'}}>Calendly Webhooks oeffnen →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar/>
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">Einstellungen</span><WsBadge/></div>
          </div>
          <SettingsContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function WsBadge() { const {current}=useWorkspace(); return current?<span className="tb-ws-badge">{current.name}</span>:null }
