'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty = { name: '', dauer: 30, beschreibung: '', url: '', farbe: '#1565c0', aktiv: true }
const COLORS = ['#1565c0','#0a7c59','#6b4bc8','#b7860b','#c0392b','#5c6370']

function CallsContent() {
  const { current } = useWorkspace()
  const [calls, setCalls] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [modal, setModal] = useState(false)
  const [editCall, setEditCall] = useState(null)
  const [form, setForm] = useState(empty)
  const [meetings, setMeetings] = useState([])
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) loadCalls() }, [current?.id])

  const loadCalls = async () => {
    const { data } = await supabase.from('workspace_calls').select('*').eq('workspace_id', current.id).order('reihenfolge')
    setCalls(data || [])
    // Load upcoming meetings from localStorage (saved from calendar)
    const saved = localStorage.getItem(`gh_meetings_${current.id}`)
    if (saved) setMeetings(JSON.parse(saved))
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (editCall) {
      await supabase.from('workspace_calls').update(form).eq('id', editCall.id)
    } else {
      await supabase.from('workspace_calls').insert([{ ...form, workspace_id: current.id, reihenfolge: calls.length + 1 }])
    }
    setModal(false); setEditCall(null); setForm(empty); loadCalls()
  }

  const del = async (id) => { await supabase.from('workspace_calls').delete().eq('id', id); loadCalls() }
  const toggle = async (id, aktiv) => { await supabase.from('workspace_calls').update({ aktiv: !aktiv }).eq('id', id); loadCalls() }

  const openEdit = (c) => { setEditCall(c); setForm({ name: c.name, dauer: c.dauer, beschreibung: c.beschreibung || '', url: c.url || '', farbe: c.farbe || '#1565c0', aktiv: c.aktiv }); setModal(true) }

  const stepLabels = {
    30: ['Rapport aufbauen (5 Min)', 'Situation analysieren (10 Min)', 'Ziele besprechen (10 Min)', 'Naechste Schritte (5 Min)'],
    60: ['Begruessung & Rapport (10 Min)', 'Tiefenanalyse (20 Min)', 'Strategie entwickeln (20 Min)', 'Action Items (10 Min)'],
    45: ['KPI Review (15 Min)', 'Analyse & Erfolge (15 Min)', 'Naechste Schritte (15 Min)'],
    15: ['Problem erklaeren (5 Min)', 'Loesung besprechen (7 Min)', 'Naechste Schritte (3 Min)'],
  }

  if (!current) return <div className="page"><div className="empty"><p>Workspace auswaehlen</p></div></div>

  return (
    <div className="page">
      {/* Call Type Cards */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#5c6370', marginBottom: 12 }}>
        Call-Typen — {current.name} ({calls.filter(c => c.aktiv).length} aktiv)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {calls.length === 0 ? (
          <div className="card"><div className="empty"><p>Noch keine Calls. Erstelle deinen ersten Call-Typ.</p></div></div>
        ) : calls.map((c, i) => (
          <div key={c.id} className="card" style={{ overflow: 'hidden', opacity: c.aktiv ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.farbe}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.farbe} strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.32 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                  <span className="badge bgr" style={{ fontSize: 11 }}>{c.dauer} Min</span>
                  <span className={`badge ${c.aktiv ? 'bg' : 'br'}`} style={{ fontSize: 11 }}>{c.aktiv ? 'Aktiv' : 'Inaktiv'}</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#5c6370' }}>{c.beschreibung || '—'}</div>
              </div>
              <div style={{ display: 'flex', align: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); openEdit(c) }} className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 12 }}>Bearbeiten</button>
                <button onClick={e => { e.stopPropagation(); toggle(c.id, c.aktiv) }} className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 12 }}>{c.aktiv ? 'Deaktivieren' : 'Aktivieren'}</button>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ba1ab" strokeWidth="2" strokeLinecap="round" style={{ transform: expanded === c.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            {expanded === c.id && (
              <div style={{ borderTop: `1px solid ${c.farbe}20`, background: `${c.farbe}08`, padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#5c6370', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Empfohlener Ablauf</div>
                    {(stepLabels[c.dauer] || stepLabels[30]).map((s, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.farbe}20`, border: `1.5px solid ${c.farbe}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: c.farbe, flexShrink: 0 }}>{j + 1}</div>
                        <span style={{ fontSize: 13 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#5c6370', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Quick Actions</div>
                    {c.url ? <>
                      <a href={c.url} target="_blank" className="btn-p" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', background: c.farbe, marginBottom: 8 }}>Calendly Link oeffnen →</a>
                      <div style={{ fontSize: 11, color: '#9ba1ab', wordBreak: 'break-all', padding: '6px 10px', background: '#f4f6f8', borderRadius: 6 }}>{c.url}</div>
                    </> : <div style={{ fontSize: 13, color: '#9ba1ab' }}>Kein Link hinterlegt</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming Meetings from Google Calendar */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#5c6370', marginBottom: 12 }}>
        Naechste Meetings — Google Kalender
      </div>
      <div className="card" style={{ marginBottom: 8 }}>
        <div className="ch">
          <div>
            <div className="ct">Bevorstehende Meetings</div>
            <div className="csub">Verbunden mit: emco7h@gmail.com</div>
          </div>
          <a href="https://calendar.google.com" target="_blank" className="btn-s" style={{ fontSize: 12, height: 28 }}>Google Kalender oeffnen</a>
        </div>
        <div className="cb" style={{ paddingTop: 4 }}>
          {[
            { t: 'Schule', d: '30.03.2026', uhr: '07:45', typ: 'Termin', c: '#9ba1ab' },
            { t: 'Russisch Unterricht', d: '01.04.2026', uhr: '19:00', typ: 'Kurs', c: '#6b4bc8' },
            { t: 'Schule', d: '02.04.2026', uhr: '07:45', typ: 'Termin', c: '#9ba1ab' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid #f0f2f5' : 'none' }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: m.c, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.t}</div>
                <div style={{ fontSize: 11.5, color: '#9ba1ab' }}>{m.d} · {m.uhr} Uhr</div>
              </div>
              <span className="tag-g" style={{ fontSize: 11 }}>{m.typ}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 0', fontSize: 12.5, color: '#5c6370', lineHeight: 1.6 }}>
            Moechtest du alle Google Kalender Termine direkt sehen? Klick auf "Kalender" in der Sidebar — dort siehst du eine vollstaendige Monatsansicht.
          </div>
        </div>
      </div>

      {/* Add Call Modal */}
      {modal && (
        <div className="mo" onClick={() => { setModal(false); setEditCall(null); setForm(empty) }}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mh"><span className="mt">{editCall ? 'Call bearbeiten' : 'Neuer Call-Typ'} — {current.name}</span><span className="mx" onClick={() => { setModal(false); setEditCall(null); setForm(empty) }}>×</span></div>
            <div className="mb">
              <div className="fr">
                <div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Discovery Call" /></div>
                <div className="fg"><label className="fl">Dauer (Min)</label><select className="fsel" value={form.dauer} onChange={e => setForm({ ...form, dauer: parseInt(e.target.value) })}><option value={15}>15 Min</option><option value={30}>30 Min</option><option value={45}>45 Min</option><option value={60}>60 Min</option><option value={90}>90 Min</option></select></div>
              </div>
              <div className="fg"><label className="fl">Beschreibung</label><textarea className="fta" value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} rows={2} /></div>
              <div className="fg"><label className="fl">Calendly Link</label><input className="fi" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://calendly.com/..." /></div>
              <div className="fg">
                <label className="fl">Farbe</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => <div key={c} onClick={() => setForm({ ...form, farbe: c })} style={{ width: 28, height: 28, borderRadius: 7, background: c, cursor: 'pointer', border: form.farbe === c ? '3px solid #fff' : '3px solid transparent', boxShadow: form.farbe === c ? `0 0 0 2px ${c}` : 'none' }} />)}
                </div>
              </div>
            </div>
            <div className="mf"><button className="btn-s" onClick={() => { setModal(false); setEditCall(null); setForm(empty) }}>Abbrechen</button><button className="btn-p" onClick={save} style={{ background: form.farbe }}>Speichern</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Calls() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <CallsTopbar />
          <CallsContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function CallsTopbar() {
  const { current } = useWorkspace()
  const [modal, setModal] = useState(false)
  return (
    <div className="topbar">
      <div className="tb-l"><span className="tb-title">Calls</span>{current && <span className="tb-ws-badge">{current.name}</span>}</div>
      <div className="tb-r">
        <a href="https://calendly.com/emco7h" target="_blank" className="btn-s" style={{ fontSize: 12 }}>Calendly oeffnen</a>
        <button className="btn-p" onClick={() => setModal(true)}>+ Call-Typ hinzufuegen</button>
      </div>
    </div>
  )
}
