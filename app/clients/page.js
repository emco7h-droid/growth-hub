'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty = { name: '', email: '', rolle: 'Closer', notizen: '' }
const ROLLEN = ['Closer', 'Setter', 'VA', 'Coach', 'Admin']

function TeamContent() {
  const [members, setMembers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [inviteStep, setInviteStep] = useState(false)
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: false })
    setMembers(data || [])
  }

  const invite = async () => {
    if (!form.email || !form.name) return
    // Add to team_members
    await supabase.from('team_members').insert([{ ...form }])
    // Send invite email via Supabase Auth
    await supabase.auth.admin?.inviteUserByEmail?.(form.email).catch(() => {})
    setModal(false); setForm(empty); setInviteStep(false); load()
  }

  const del = async (id) => { if (!confirm('Entfernen?')) return; await supabase.from('team_members').delete().eq('id', id); load() }
  const toggle = async (id, aktiv) => { await supabase.from('team_members').update({ aktiv: !aktiv }).eq('id', id); load() }

  const getRollenColor = (r) => ({ 'Closer': '#1565c0', 'Setter': '#6b4bc8', 'VA': '#0a7c59', 'Coach': '#b7860b', 'Admin': '#c0392b' })[r] || '#9ba1ab'

  return (
    <div className="page">
      <div style={{ background: '#e3f0ff', border: '1px solid #c5d8fd', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1565c0', lineHeight: 1.6 }}>
        <strong>Team Mitglieder</strong> — Closer und andere Mitglieder koennen sich einloggen und den Team Chat sowie ihre Aufgaben sehen. Sie haben keinen Zugriff auf Client-Daten anderer Clients.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {members.map(m => (
          <div key={m.id} className="card" style={{ opacity: m.aktiv ? 1 : 0.5 }}>
            <div className="cb">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${getRollenColor(m.rolle)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: getRollenColor(m.rolle) }}>
                  {m.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: `${getRollenColor(m.rolle)}20`, color: getRollenColor(m.rolle), fontWeight: 600 }}>{m.rolle}</span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: '#5c6370', marginBottom: 4 }}>{m.email}</div>
              {m.notizen && <div style={{ fontSize: 12, color: '#9ba1ab', marginBottom: 10 }}>{m.notizen}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggle(m.id, m.aktiv)} className="btn-s" style={{ flex: 1, justifyContent: 'center', height: 28, fontSize: 11 }}>{m.aktiv ? 'Deaktivieren' : 'Aktivieren'}</button>
                <button onClick={() => del(m.id)} className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 11 }}>×</button>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div onClick={() => setModal(true)} className="card" style={{ cursor: 'pointer', border: '2px dashed #e1e4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 150 }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#1565c0'; e.currentTarget.style.background = '#f0f7ff' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#e1e4e8'; e.currentTarget.style.background = '#fff' }}>
          <div style={{ textAlign: 'center', color: '#9ba1ab' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Mitglied einladen</div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="ch"><div className="ct">Client Portal Zugaenge</div></div>
        <div className="cb">
          <div style={{ fontSize: 13, color: '#5c6370', lineHeight: 1.7, marginBottom: 12 }}>
            Um einem Client Zugang zum Portal zu geben: Geh zu <strong>Workspaces → Workspace auswaehlen → Einstellungen → "Client Email"</strong> eintragen. Dann kannst du in Supabase unter Authentication → Invite User den Client einladen.
          </div>
          <a href="https://supabase.com/dashboard/project/pzrqyhqereieruwyekfr/auth/users" target="_blank" className="btn-s" style={{ textDecoration: 'none', fontSize: 12 }}>Supabase Users oeffnen →</a>
        </div>
      </div>

      {modal && (
        <div className="mo" onClick={() => { setModal(false); setForm(empty) }}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mh"><span className="mt">Team Mitglied einladen</span><span className="mx" onClick={() => { setModal(false); setForm(empty) }}>×</span></div>
            <div className="mb">
              <div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Max Mustermann" /></div>
              <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="max@beispiel.de" /></div>
              <div className="fg"><label className="fl">Rolle</label><select className="fsel" value={form.rolle} onChange={e => setForm({ ...form, rolle: e.target.value })}>{ROLLEN.map(r => <option key={r}>{r}</option>)}</select></div>
              <div className="fg"><label className="fl">Notizen</label><textarea className="fta" value={form.notizen} onChange={e => setForm({ ...form, notizen: e.target.value })} rows={2} /></div>
            </div>
            <div className="mf"><button className="btn-s" onClick={() => { setModal(false); setForm(empty) }}>Abbrechen</button><button className="btn-p" onClick={invite}>Hinzufuegen</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Clients() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">Team</span></div>
            <div className="tb-r"><button className="btn-p" onClick={() => {}}>+ Mitglied einladen</button></div>
          </div>
          <TeamContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
