'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const COLS = [
  { s: 'Neu', c: '#9ba1ab', bg: '#f4f6f8' },
  { s: 'In Kontakt', c: '#5b9cf6', bg: '#eff6ff' },
  { s: 'Qualifiziert', c: '#a78bfa', bg: '#f5f3ff' },
  { s: 'Call gebucht', c: '#1565c0', bg: '#eff6ff' },
  { s: 'Gewonnen', c: '#0a7c59', bg: '#f0fdf4' },
  { s: 'Verloren', c: '#c0392b', bg: '#fef2f2' },
]

function PipelineContent() {
  const { current } = useWorkspace()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('board') // 'board' or 'table'
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') }) }, [])
  useEffect(() => { if (current) load() }, [current?.id])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('leads').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false })
    setLeads(data || []); setLoading(false)
  }
  const move = async (id, status) => { await supabase.from('leads').update({ status }).eq('id', id); load() }

  const totalVal = leads.reduce((s, l) => s + (l.wert || 0), 0)

  if (!current) return <div className="page"><div className="empty">Workspace auswaehlen</div></div>

  return (
    <div className="page">
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 20 }}>
        {COLS.map(col => {
          const colLeads = leads.filter(l => l.status === col.s)
          const val = colLeads.reduce((s, l) => s + (l.wert || 0), 0)
          return (
            <div key={col.s} style={{ background: '#fff', border: `1px solid #e1e4e8`, borderTop: `3px solid ${col.c}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: col.c, marginBottom: 4 }}>{col.s}</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{colLeads.length}</div>
              {val > 0 && <div style={{ fontSize: 11, color: '#0a7c59', fontWeight: 600 }}>€{val.toLocaleString('de-DE')}</div>}
            </div>
          )
        })}
      </div>

      {/* Board view - 2x3 grid instead of horizontal scroll */}
      {view === 'board' && (
        loading ? <div style={{ textAlign: 'center', paddingTop: 60, color: '#9ba1ab' }}>Laden...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {COLS.map(col => {
              const colLeads = leads.filter(l => l.status === col.s)
              return (
                <div key={col.s} style={{ background: col.bg, borderRadius: 10, padding: 12, minHeight: 200 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('leadId'); if (id) move(id, col.s) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: col.c, textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.c, display: 'inline-block' }} />{col.s}
                    </span>
                    <span style={{ background: '#fff', color: col.c, fontSize: 10.5, padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>{colLeads.length}</span>
                  </div>
                  {colLeads.map(l => (
                    <div key={l.id} draggable onDragStart={e => e.dataTransfer.setData('leadId', l.id)}
                      style={{ background: '#fff', border: `1px solid ${col.c}20`, borderLeft: `3px solid ${col.c}`, borderRadius: 7, padding: '10px 12px', marginBottom: 8, cursor: 'grab', transition: 'all .15s' }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = `0 2px 8px ${col.c}25`}
                      onMouseOut={e => e.currentTarget.style.boxShadow = ''}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: col.c, border: `1px solid ${col.c}30`, flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
                      </div>
                      {l.nische && <div style={{ fontSize: 11, color: '#9ba1ab', marginBottom: 4 }}>{l.nische}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {l.wert > 0 ? <span style={{ fontSize: 12, fontWeight: 700, color: '#0a7c59' }}>€{l.wert.toLocaleString('de-DE')}</span> : <span />}
                        <select value={l.status} onChange={e => move(l.id, e.target.value)} onClick={e => e.stopPropagation()} style={{ fontSize: 10, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', color: col.c, fontWeight: 600, fontFamily: 'inherit' }}>
                          {COLS.map(c => <option key={c.s}>{c.s}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: '#c5ccd4', borderRadius: 6, border: `1px dashed ${col.c}30` }}>Leer — hierher ziehen</div>}
                </div>
              )
            })}
          </div>
        )
      )}

      {view === 'table' && (
        <div className="card">
          {leads.length === 0 ? <div className="empty"><p>Keine Leads. Fuege sie unter "Leads" hinzu.</p></div> : (
            <div className="tw"><table>
              <thead><tr><th>Name</th><th>Nische</th><th>Status</th><th>Wert</th><th>Quelle</th></tr></thead>
              <tbody>{leads.map(l => {
                const col = COLS.find(c => c.s === l.status)
                return (
                  <tr key={l.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: '50%', background: col?.bg || '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600, color: col?.c || '#5c6370', flexShrink: 0 }}>{l.name?.slice(0, 2).toUpperCase()}</div><span style={{ fontWeight: 500 }}>{l.name}</span></div></td>
                    <td style={{ fontSize: 12, color: '#5c6370' }}>{l.nische || '—'}</td>
                    <td>
                      <select value={l.status} onChange={e => move(l.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', color: col?.c, fontWeight: 500 }}>
                        {COLS.map(c => <option key={c.s}>{c.s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0a7c59' }}>{l.wert ? `€${l.wert.toLocaleString('de-DE')}` : '—'}</td>
                    <td><span className="tag-g" style={{ fontSize: 11 }}>{l.quelle || '—'}</span></td>
                  </tr>
                )
              })}</tbody>
            </table></div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Pipeline() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar />
        <div className="main">
          <PipelineTopbar />
          <PipelineContent />
        </div>
      </div>
    </WorkspaceProvider>
  )
}
function PipelineTopbar() {
  const { current } = useWorkspace()
  const [view, setView] = useState('board')
  return (
    <div className="topbar">
      <div className="tb-l"><span className="tb-title">Pipeline</span>{current && <span className="tb-ws-badge">{current.name}</span>}</div>
      <div className="tb-r">
        <div style={{ display: 'flex', background: '#f4f6f8', borderRadius: 7, padding: 2, gap: 1 }}>
          {[['board', 'Board'], ['table', 'Tabelle']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ height: 26, padding: '0 10px', border: 'none', borderRadius: 5, cursor: 'pointer', background: view === v ? '#fff' : 'transparent', fontSize: 12, boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.1)' : undefined, fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <a href="/leads" className="btn-p" style={{ textDecoration: 'none', fontSize: 13 }}>+ Lead hinzufuegen</a>
      </div>
    </div>
  )
}
