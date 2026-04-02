'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const empty = { woche_nr: '', woche_start: '', was_lief_gut: '', was_lief_nicht: '', plan_naechste_woche: '', umsatz_woche: 0, neue_leads: 0, calls_gemacht: 0, sichtbar_fuer_client: true }

function ReportsContent() {
  const { current } = useWorkspace()
  const [reports, setReports] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) load() }, [current?.id])

  const load = async () => {
    const { data } = await supabase.from('weekly_reports').select('*').eq('workspace_id', current.id).order('woche_nr', { ascending: false })
    setReports(data || [])
  }

  const save = async () => {
    if (!form.woche_nr) return
    const payload = { ...form, workspace_id: current.id, umsatz_woche: parseFloat(form.umsatz_woche) || 0, neue_leads: parseInt(form.neue_leads) || 0, calls_gemacht: parseInt(form.calls_gemacht) || 0 }
    if (editing) await supabase.from('weekly_reports').update(payload).eq('id', editing)
    else await supabase.from('weekly_reports').insert([payload])
    setModal(false); setEditing(null); setForm(empty); load()
  }

  const del = async (id) => { if (!confirm('Loeschen?')) return; await supabase.from('weekly_reports').delete().eq('id', id); load() }
  const openEdit = (r) => { setEditing(r.id); setForm({ woche_nr: r.woche_nr, woche_start: r.woche_start || '', was_lief_gut: r.was_lief_gut || '', was_lief_nicht: r.was_lief_nicht || '', plan_naechste_woche: r.plan_naechste_woche || '', umsatz_woche: r.umsatz_woche || 0, neue_leads: r.neue_leads || 0, calls_gemacht: r.calls_gemacht || 0, sichtbar_fuer_client: r.sichtbar_fuer_client }); setModal(true) }

  const wsColor = current?.color || '#1565c0'
  const getCurrentWeek = () => { const d = new Date(); const onejan = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7) }

  if (!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      <div style={{ background: '#e3f0ff', border: '1px solid #c5d8fd', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1565c0', lineHeight: 1.6 }}>
        <strong>Wochen Reports fuer {current.name}</strong> — Fuell jeden Freitag kurz aus was lief. Wenn "Sichtbar fuer Client" aktiviert ist, sieht der Client es in seinem Portal.
      </div>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Noch kein Update</div>
          <div style={{ fontSize: 13, color: '#9ba1ab', marginBottom: 20 }}>Schreib deinen ersten Wochen-Report fuer {current.name}</div>
          <button className="btn-p" onClick={() => { setForm({ ...empty, woche_nr: getCurrentWeek() }); setModal(true) }} style={{ background: wsColor }}>+ Jetzt schreiben</button>
        </div>
      ) : reports.map((r) => (
        <div key={r.id} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${wsColor}` }}>
          <div className="ch">
            <div>
              <div className="ct">KW {r.woche_nr} {r.woche_start ? `· ${new Date(r.woche_start).toLocaleDateString('de-DE')}` : ''}</div>
              <div className="csub">{current.name}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {r.umsatz_woche > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#0a7c59' }}>€{r.umsatz_woche?.toLocaleString('de-DE')}</span>}
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: r.sichtbar_fuer_client ? '#e0f5ee' : '#f4f6f8', color: r.sichtbar_fuer_client ? '#0a7c59' : '#9ba1ab', fontWeight: 600 }}>{r.sichtbar_fuer_client ? '👁 Sichtbar' : 'Intern'}</span>
              <button className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 11 }} onClick={() => openEdit(r)}>Bearbeiten</button>
              <button className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 11 }} onClick={() => del(r.id)}>×</button>
            </div>
          </div>
          <div className="cb">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[['✅ Was lief gut', r.was_lief_gut, '#0a7c59'], ['⚠️ Was lief nicht', r.was_lief_nicht, '#c0392b'], ['→ Plan naechste Woche', r.plan_naechste_woche, '#1565c0']].map(([l, v, c]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c, marginBottom: 6 }}>{l}</div>
                  <div style={{ fontSize: 13, color: v ? '#1a1a2e' : '#c5ccd4', lineHeight: 1.5 }}>{v || 'Nicht eingetragen'}</div>
                </div>
              ))}
            </div>
            {(r.neue_leads > 0 || r.calls_gemacht > 0) && (
              <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f2f5' }}>
                {r.neue_leads > 0 && <span style={{ fontSize: 13, color: '#5c6370' }}>🎯 {r.neue_leads} neue Leads</span>}
                {r.calls_gemacht > 0 && <span style={{ fontSize: 13, color: '#5c6370' }}>📞 {r.calls_gemacht} Calls</span>}
              </div>
            )}
          </div>
        </div>
      ))}

      {modal && (
        <div className="mo" onClick={() => { setModal(false); setEditing(null); setForm(empty) }}>
          <div className="md" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="mh"><span className="mt">{editing ? 'Report bearbeiten' : 'Neuer Wochen Report'} — {current.name}</span><span className="mx" onClick={() => { setModal(false); setEditing(null); setForm(empty) }}>×</span></div>
            <div className="mb">
              <div className="fr">
                <div className="fg"><label className="fl">KW Nummer *</label><input className="fi" type="number" value={form.woche_nr} onChange={e => setForm({ ...form, woche_nr: e.target.value })} placeholder="z.B. 14" /></div>
                <div className="fg"><label className="fl">Woche Start</label><input className="fi" type="date" value={form.woche_start} onChange={e => setForm({ ...form, woche_start: e.target.value })} /></div>
              </div>
              <div className="fg"><label className="fl">✅ Was lief gut?</label><textarea className="fta" value={form.was_lief_gut} onChange={e => setForm({ ...form, was_lief_gut: e.target.value })} rows={2} placeholder="Erfolge, Wins, positive Entwicklungen..." /></div>
              <div className="fg"><label className="fl">⚠️ Was lief nicht?</label><textarea className="fta" value={form.was_lief_nicht} onChange={e => setForm({ ...form, was_lief_nicht: e.target.value })} rows={2} placeholder="Probleme, Herausforderungen, Verbesserungen..." /></div>
              <div className="fg"><label className="fl">→ Plan naechste Woche</label><textarea className="fta" value={form.plan_naechste_woche} onChange={e => setForm({ ...form, plan_naechste_woche: e.target.value })} rows={2} placeholder="Fokus, Actions, Ziele..." /></div>
              <div className="fr">
                <div className="fg"><label className="fl">Umsatz diese Woche (€)</label><input className="fi" type="number" value={form.umsatz_woche} onChange={e => setForm({ ...form, umsatz_woche: e.target.value })} /></div>
                <div className="fg"><label className="fl">Neue Leads</label><input className="fi" type="number" value={form.neue_leads} onChange={e => setForm({ ...form, neue_leads: e.target.value })} /></div>
                <div className="fg"><label className="fl">Calls gemacht</label><input className="fi" type="number" value={form.calls_gemacht} onChange={e => setForm({ ...form, calls_gemacht: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                <div onClick={() => setForm({ ...form, sichtbar_fuer_client: !form.sichtbar_fuer_client })} style={{ width: 36, height: 20, borderRadius: 10, background: form.sichtbar_fuer_client ? wsColor : '#e1e4e8', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: form.sichtbar_fuer_client ? 18 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
                <span style={{ fontSize: 13 }}>Im Client Portal sichtbar</span>
              </div>
            </div>
            <div className="mf"><button className="btn-s" onClick={() => { setModal(false); setEditing(null); setForm(empty) }}>Abbrechen</button><button className="btn-p" onClick={save} style={{ background: wsColor }}>Speichern</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Reports() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <ReportsTopbar />
          <ReportsContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function ReportsTopbar() {
  const { current } = useWorkspace()
  const [modal, setModal] = useState(false)
  const getCurrentWeek = () => { const d = new Date(); const onejan = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7) }
  return (
    <div className="topbar">
      <div className="tb-l"><span className="tb-title">Wochen Reports</span>{current && <span className="tb-ws-badge">{current.name}</span>}</div>
      <div className="tb-r">
        <a href="/portal" target="_blank" className="btn-s" style={{ fontSize: 12 }}>Client Portal →</a>
        <button className="btn-p" onClick={() => setModal(true)}>+ Report schreiben</button>
      </div>
    </div>
  )
}
