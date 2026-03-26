'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

function SettingsContent() {
  const { current, workspaces, updateWorkspace, deleteWorkspace, addWorkspace } = useWorkspace()
  const [tab, setTab] = useState('profil')
  const [profile, setProfile] = useState({ full_name: 'Alex Heidrich', email: 'emco7h@gmail.com', bio: 'Growth Operator — Ich helfe Coaches und Mentoren ihr Business zu skalieren.', phone: '', avatar_url: '' })
  const [wsForm, setWsForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [team, setTeam] = useState([])
  const router = useRouter()

  useEffect(() => { if (current) setWsForm({ ...current }) }, [current?.id])

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').upsert({ id: user.id, ...profile })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const saveWorkspace = async () => {
    if (!current || !wsForm) return
    await updateWorkspace(current.id, wsForm)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profil', label: 'Mein Profil', icon: '👤' },
    { id: 'workspace', label: 'Workspace', icon: '🏢' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'clients', label: 'Client Zugang', icon: '🔐' },
    { id: 'integrationen', label: 'Integrationen', icon: '🔗' },
    { id: 'gefahrenzone', label: 'Gefahrenzone', icon: '⚠️' },
  ]

  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Settings Nav - Notion style left sidebar */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 8, overflow: 'hidden' }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', cursor: 'pointer', background: tab === t.id ? '#e3f0ff' : 'transparent', color: tab === t.id ? '#1565c0' : '#5c6370', fontSize: 13, fontWeight: tab === t.id ? 500 : 400, transition: 'all .12s', borderBottom: '1px solid #f0f2f5' }}
                onMouseOver={e => { if (tab !== t.id) e.currentTarget.style.background = '#f4f6f8' }}
                onMouseOut={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {tab === 'profil' && (
            <div className="card">
              <div className="ch"><div className="ct">Mein Profil</div>{saved && <span className="badge bg">Gespeichert ✓</span>}</div>
              <div className="cb">
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f0f2f5' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AH</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{profile.full_name}</div>
                    <div style={{ fontSize: 13, color: '#9ba1ab', marginTop: 2 }}>Growth Operator</div>
                    <button className="btn-s" style={{ height: 26, padding: '0 10px', fontSize: 11.5, marginTop: 8 }}>Profilbild aendern</button>
                  </div>
                </div>
                <div className="fr"><div className="fg"><label className="fl">Name</label><input className="fi" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div><div className="fg"><label className="fl">Email</label><input className="fi" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div></div>
                <div className="fr"><div className="fg"><label className="fl">Telefon</label><input className="fi" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+49 123 456789" /></div><div className="fg"><label className="fl">Rolle</label><input className="fi" value="Growth Operator" disabled style={{ background: '#f4f6f8', color: '#9ba1ab' }} /></div></div>
                <div className="fg"><label className="fl">Bio / Beschreibung</label><textarea className="fta" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} /></div>
                <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #f0f2f5' }}>
                  <button className="btn-p" onClick={saveProfile}>Profil speichern</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'workspace' && wsForm && (
            <div className="card">
              <div className="ch"><div className="ct">Workspace: {current?.name}</div>{saved && <span className="badge bg">Gespeichert ✓</span>}</div>
              <div className="cb">
                <div className="fr"><div className="fg"><label className="fl">Workspace Name</label><input className="fi" value={wsForm.name || ''} onChange={e => setWsForm({ ...wsForm, name: e.target.value })} /></div><div className="fg"><label className="fl">Nische</label><input className="fi" value={wsForm.nische || ''} onChange={e => setWsForm({ ...wsForm, nische: e.target.value })} /></div></div>
                <div className="fr"><div className="fg"><label className="fl">Coaching Modell</label><select className="fsel" value={wsForm.modell || '1 zu 1'} onChange={e => setWsForm({ ...wsForm, modell: e.target.value })}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Online Kurs</option><option>Agency</option></select></div><div className="fg"><label className="fl">Status</label><select className="fsel" value={wsForm.status || 'Aktiv'} onChange={e => setWsForm({ ...wsForm, status: e.target.value })}><option>Aktiv</option><option>Pause</option><option>Offboarding</option></select></div></div>
                <div className="fr"><div className="fg"><label className="fl">Monatlicher Retainer (€)</label><input className="fi" type="number" value={wsForm.retainer || 0} onChange={e => setWsForm({ ...wsForm, retainer: e.target.value })} /></div><div className="fg"><label className="fl">Aktueller Monat</label><select className="fsel" value={wsForm.monat || 1} onChange={e => setWsForm({ ...wsForm, monat: parseInt(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={m}>Monat {m}</option>)}</select></div></div>
                <div className="fg"><label className="fl">Website / Link</label><input className="fi" value={wsForm.website || ''} onChange={e => setWsForm({ ...wsForm, website: e.target.value })} placeholder="https://..." /></div>
                <div style={{ marginTop: 4, paddingTop: 16, borderTop: '1px solid #f0f2f5' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>90-Tage Ziele</div>
                  {[['ziel_1', 'Ziel 1'], ['ziel_2', 'Ziel 2'], ['ziel_3', 'Ziel 3']].map(([k, l]) => (
                    <div key={k} className="fg"><label className="fl">{l}</label><input className="fi" value={wsForm[k] || ''} onChange={e => setWsForm({ ...wsForm, [k]: e.target.value })} placeholder="z.B. 10k Follower aufbauen..." /></div>
                  ))}
                </div>
                <div className="fg"><label className="fl">Groesstes Bottleneck</label><textarea className="fta" rows={2} value={wsForm.bottleneck || ''} onChange={e => setWsForm({ ...wsForm, bottleneck: e.target.value })} /></div>
                <button className="btn-p" onClick={saveWorkspace}>Workspace speichern</button>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="card">
              <div className="ch"><div className="ct">Team Mitglieder</div><button className="btn-p" style={{ fontSize: 12, height: 28 }}>+ Einladen</button></div>
              <div className="cb">
                {[{ name: 'Alex Heidrich', email: 'emco7h@gmail.com', role: 'Admin', you: true }].map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>AH</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name} {m.you && <span style={{ fontSize: 10.5, color: '#9ba1ab' }}>(du)</span>}</div><div style={{ fontSize: 12, color: '#9ba1ab' }}>{m.email}</div></div>
                    <span className="badge bb">{m.role}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: 14, background: '#f4f6f8', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Team Mitglied einladen</div>
                  <div style={{ fontSize: 12, color: '#5c6370', marginBottom: 10 }}>Closer, Chatsetter oder VA hinzufuegen. Sie erhalten Zugang zum System.</div>
                  <div className="fr" style={{ gap: 8 }}>
                    <input className="fi" placeholder="email@beispiel.de" />
                    <select className="fsel" style={{ maxWidth: 130 }}><option>Closer</option><option>Chatsetter</option><option>VA</option><option>Admin</option></select>
                    <button className="btn-p" style={{ whiteSpace: 'nowrap' }}>Einladen</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'clients' && (
            <div className="card">
              <div className="ch"><div className="ct">Client Portal Zugaenge</div></div>
              <div className="cb">
                <div style={{ padding: 14, background: '#e3f0ff', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1565c0' }}>
                  Wenn du einem Client Zugang gibst, kann er sich unter <strong>/portal</strong> einloggen und sein eigenes Dashboard (read-only) sehen. Er sieht nur seinen eigenen Workspace.
                </div>
                {workspaces.map(ws => (
                  <div key={ws.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{ws.name?.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 500 }}>{ws.name}</div><div style={{ fontSize: 12, color: '#9ba1ab' }}>{ws.nische}</div></div>
                    <button className="btn-s" style={{ fontSize: 12, height: 28 }}>Portal einrichten</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'integrationen' && (
            <div className="card">
              <div className="ch"><div className="ct">Integrationen</div></div>
              <div className="cb">
                {[
                  { name: 'Calendly', status: 'Verbunden', icon: '📅', info: 'emco7h · 5 Event Types aktiv' },
                  { name: 'Klaviyo', status: 'Verbunden', icon: '📧', info: 'Account ID: Y4pMFg · 3 Listen' },
                  { name: 'Make.com', status: 'Verbunden', icon: '⚡', info: '2 aktive Scenarios' },
                  { name: 'Supabase', status: 'Verbunden', icon: '🗄️', info: 'Datenbank aktiv' },
                  { name: 'Stripe', status: 'Nicht verbunden', icon: '💳', info: 'Zahlungen verarbeiten' },
                  { name: 'Google Analytics', status: 'Nicht verbunden', icon: '📊', info: 'Website Tracking' },
                ].map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{i.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 500 }}>{i.name}</div><div style={{ fontSize: 12, color: '#9ba1ab' }}>{i.info}</div></div>
                    <span className={`badge ${i.status === 'Verbunden' ? 'bg' : 'bgr'}`}>{i.status}</span>
                    <button className="btn-s" style={{ fontSize: 11.5, height: 28 }}>{i.status === 'Verbunden' ? 'Verwalten' : 'Verbinden'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'gefahrenzone' && (
            <div className="card">
              <div className="ch"><div className="ct" style={{ color: '#c0392b' }}>Gefahrenzone</div></div>
              <div className="cb">
                <div style={{ border: '1px solid #f5c6c0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Workspace loeschen</div>
                  <div style={{ fontSize: 12.5, color: '#5c6370', marginBottom: 12 }}>Loescht den Workspace "{current?.name}" und alle zugehoerigen Leads, Kontakte, KPIs und Daten unwiderruflich.</div>
                  <button onClick={() => { if (window.confirm(`Workspace "${current?.name}" wirklich loeschen?`)) deleteWorkspace(current?.id) }} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Workspace loeschen</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  return <WorkspaceProvider><div className="layout"><Sidebar/><div className="main">
    <div className="topbar"><div className="tb-l"><span className="tb-title">Einstellungen</span></div></div>
    <SettingsContent/>
  </div></div></WorkspaceProvider>
}
