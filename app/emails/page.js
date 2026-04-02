'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const TAGE_DEFAULTS = [
  { tag: 1, betreff: 'Willkommen! Das erwartet dich in den naechsten 7 Tagen', inhalt: 'Hallo {{name}},\n\nwillkommen! Ich freue mich, dass du dabei bist.\n\nIn den naechsten 7 Tagen bekommst du jeden Tag eine Email mit konkreten Tipps und Strategien.\n\nBis morgen,\n{{absender}}' },
  { tag: 2, betreff: 'Die groesste Herausforderung fuer [Nische] - und wie du sie loest', inhalt: 'Hallo {{name}},\n\nheute geht es um die groesste Herausforderung...\n\nViele meiner Kunden haben dieses Problem...\n\nBis morgen,\n{{absender}}' },
  { tag: 3, betreff: 'Fallstudie: Wie [Kunde] in 90 Tagen X erreicht hat', inhalt: 'Hallo {{name}},\n\nich moechte dir heute eine Fallstudie zeigen...' },
  { tag: 4, betreff: 'Der Fehler, den fast alle machen (und wie du ihn vermeidest)', inhalt: 'Hallo {{name}},\n\nheute zeige ich dir den haeufigsten Fehler...' },
  { tag: 5, betreff: 'Die 3 Schritte zu [gewuenschtes Ergebnis]', inhalt: 'Hallo {{name}},\n\nheute bekommst du mein 3-Schritte-System...' },
  { tag: 6, betreff: 'Bist du bereit fuer den naechsten Schritt?', inhalt: 'Hallo {{name}},\n\nmorgenwird die letzte Email kommen...' },
  { tag: 7, betreff: 'Letzte Chance: Kostenloser Discovery Call', inhalt: 'Hallo {{name}},\n\ndas ist die letzte Email in unserer Sequenz. Wenn du bereit bist, den naechsten Schritt zu gehen, dann buche jetzt deinen kostenlosen Discovery Call:\n\n{{calendly_link}}\n\nBis bald,\n{{absender}}' },
]

function EmailContent() {
  const { current } = useWorkspace()
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) loadEmails() }, [current?.id])

  const loadEmails = async () => {
    setLoading(true)
    const { data } = await supabase.from('workspace_emails').select('*').eq('workspace_id', current.id).order('tag')
    if (data && data.length > 0) {
      setEmails(data)
    } else {
      // Create default 7-day sequence for this workspace
      const defaults = TAGE_DEFAULTS.map(e => ({ ...e, workspace_id: current.id, aktiv: true }))
      const { data: created } = await supabase.from('workspace_emails').insert(defaults).select()
      setEmails(created || defaults)
    }
    setLoading(false)
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('workspace_emails').update({ betreff: editing.betreff, inhalt: editing.inhalt, aktiv: editing.aktiv }).eq('id', editing.id)
    setSaving(false)
    setSelected(editing)
    loadEmails()
  }

  const toggleActive = async (email) => {
    await supabase.from('workspace_emails').update({ aktiv: !email.aktiv }).eq('id', email.id)
    loadEmails()
  }

  if (!current) return <div className="page"><div className="empty"><p>Workspace auswaehlen</p></div></div>

  return (
    <div className="page">
      <div style={{background:'#e3f0ff',border:'1px solid #c5d8fd',borderRadius:8,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#1565c0',lineHeight:1.6}}>
        <strong>7-Tage Email Sequenz fuer: {current.name}</strong> — Diese Emails gehen an die Interessenten deines Clients. Jeder Workspace hat seine eigene Sequenz die du individuell anpassen kannst. Variablen: {'{{name}}'}, {'{{absender}}'}, {'{{calendly_link}}'}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
        {/* Email List */}
        <div>
          <div style={{fontSize:11,fontWeight:600,color:'#9ba1ab',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>7 Emails</div>
          {loading ? <div className="card"><div className="empty"><p>Laden...</p></div></div> :
          emails.map((e,i)=>(
            <div key={e.id} onClick={()=>{ setSelected(e); setEditing({...e}) }}
              style={{background:selected?.id===e.id?'#fff':'#fff',border:selected?.id===e.id?`2px solid ${current.color||'#1565c0'}`:'1px solid #e1e4e8',borderRadius:8,padding:'12px 14px',marginBottom:8,cursor:'pointer',transition:'all .12s',opacity:e.aktiv?1:0.5}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:current.color||'#1565c0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>
                  {e.tag}
                </div>
                <span style={{fontSize:12,fontWeight:600,color:'#1a1a2e'}}>Tag {e.tag}</span>
                <div onClick={ev=>{ev.stopPropagation();toggleActive(e)}} style={{marginLeft:'auto',width:20,height:12,borderRadius:6,background:e.aktiv?(current.color||'#1565c0'):'#c5ccd4',cursor:'pointer',flexShrink:0,transition:'background .2s'}}/>
              </div>
              <div style={{fontSize:11.5,color:'#5c6370',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.betreff}</div>
            </div>
          ))}

          {/* Stats */}
          <div className="card" style={{marginTop:12}}>
            <div className="ch"><div className="ct">Sequenz Stats</div></div>
            <div className="cb">
              {[['Aktive Emails',emails.filter(e=>e.aktiv).length],['Inaktiv',emails.filter(e=>!e.aktiv).length],['Klaviyo Liste','Vk9jR2']].map(([l,v])=>(
                <div key={l} className="row-info"><span style={{fontSize:12,color:'#5c6370'}}>{l}</span><span style={{fontSize:12.5,fontWeight:600}}>{v}</span></div>
              ))}
              <div style={{marginTop:12}}>
                <a href="https://www.klaviyo.com" target="_blank" className="btn-s" style={{width:'100%',justifyContent:'center',fontSize:12,height:30,textDecoration:'none'}}>Klaviyo oeffnen →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Email Editor */}
        {editing ? (
          <div className="card">
            <div className="ch">
              <div>
                <div className="ct">Tag {editing.tag} bearbeiten</div>
                <div className="csub">{current.name}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                {saving && <span style={{fontSize:12,color:'#9ba1ab',display:'flex',alignItems:'center'}}>Speichern...</span>}
                <button className="btn-s" onClick={()=>{setEditing(null);setSelected(null)}}>Abbrechen</button>
                <button className="btn-p" onClick={save} style={{background:current.color||'#1565c0'}}>Speichern</button>
              </div>
            </div>
            <div className="cb">
              <div className="fg"><label className="fl">Betreff</label><input className="fi" value={editing.betreff} onChange={e=>setEditing({...editing,betreff:e.target.value})}/></div>
              <div className="fg">
                <label className="fl">Email Inhalt</label>
                <textarea className="fta" value={editing.inhalt} onChange={e=>setEditing({...editing,inhalt:e.target.value})} rows={14} style={{minHeight:280,fontFamily:'monospace',fontSize:13}}/>
              </div>
              <div style={{background:'#f4f6f8',borderRadius:6,padding:'10px 14px',fontSize:12,color:'#5c6370'}}>
                <strong>Variablen:</strong> {'{{name}}'} = Empfaengername, {'{{absender}}'} = dein Name, {'{{calendly_link}}'} = Buchungslink
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{textAlign:'center',color:'#9ba1ab'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{margin:'0 auto 12px',display:'block',opacity:.3}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/></svg>
              <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>Email auswaehlen</div>
              <div style={{fontSize:12}}>Klick links auf eine Email um sie zu bearbeiten</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Emails() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar/>
        <div className="main">
          <div className="topbar">
            <div className="tb-l">
              <span className="tb-title">Email Sequenz</span>
              <EmailBadge/>
            </div>
            <div className="tb-r">
              <a href="https://www.klaviyo.com/flows" target="_blank" className="btn-s" style={{fontSize:12}}>Klaviyo Flows</a>
            </div>
          </div>
          <EmailContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function EmailBadge() {
  const { current } = useWorkspace()
  return current ? <span className="tb-ws-badge">{current.name}</span> : null
}
