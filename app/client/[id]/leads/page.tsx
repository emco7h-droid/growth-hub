'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeadsPage({ params }: { params: { id: string } }) {
  const [leads, setLeads] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', telefon: '', unternehmen: '', quelle: 'OnePage.io', stage_id: '', deal_wert: '', notizen: '' })

  useEffect(() => { load() }, [params.id])

  async function load() {
    setLoading(true)
    const [lr, sr, cr] = await Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', params.id).order('created_at', { ascending: false }),
      supabase.from('pipeline_stages').select('*').eq('workspace_id', params.id).order('reihenfolge'),
      supabase.from('workspaces').select('*').eq('id', params.id).single(),
    ])
    setLeads(lr.data || [])
    setStages(sr.data || [])
    setClient(cr.data)
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', email: '', telefon: '', unternehmen: '', quelle: 'OnePage.io', stage_id: stages[0]?.id || '', deal_wert: '', notizen: '' })
    setShowModal(true)
  }

  function openEdit(lead: any) {
    setEditing(lead)
    setForm({ name: lead.name, email: lead.email || '', telefon: lead.telefon || '', unternehmen: lead.unternehmen || '', quelle: lead.quelle, stage_id: lead.stage_id || '', deal_wert: String(lead.deal_wert || ''), notizen: lead.notizen || '' })
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, workspace_id: params.id, deal_wert: Number(form.deal_wert) || 0, stage_id: form.stage_id || null, letzte_aktivitaet: new Date().toISOString() }
    if (editing) await supabase.from('leads').update(payload).eq('id', editing.id)
    else await supabase.from('leads').insert({ ...payload, status: 'Neu' })
    setShowModal(false)
    load()
  }

  async function deleteLead(id: string) {
    if (!confirm('Lead löschen?')) return
    await supabase.from('leads').delete().eq('id', id)
    load()
  }

  async function updateStage(leadId: string, stageId: string) {
    const stage = stages.find((s: any) => s.id === stageId)
    await supabase.from('leads').update({
      stage_id: stageId,
      status: stage?.ist_gewonnen ? 'Gewonnen' : stage?.ist_verloren ? 'Verloren' : 'In Bearbeitung',
      letzte_aktivitaet: new Date().toISOString(),
    }).eq('id', leadId)
    load()
  }

  const STATUSES = ['Alle', 'Neu', 'In Bearbeitung', 'Gewonnen', 'Verloren']
  const SOURCES = ['OnePage.io', 'Calendly', 'Instagram', 'LinkedIn', 'Website', 'Empfehlung', 'Ads', 'Sonstiges']
  const color = client?.color || '#6366f1'

  const filtered = leads.filter(l => {
    const ms = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus === 'Alle' || l.status === filterStatus
    return ms && mf
  })

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/leads?workspace_id=${params.id}`

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Leads</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{leads.length} Leads · kommen automatisch über OnePage.io / Calendly rein</p>
        </div>
        <button onClick={openNew} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Lead manuell
        </button>
      </div>

      {/* Webhook Info */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, color: '#0369a1', fontWeight: 500 }}>Webhook URL für OnePage.io / Make: </span>
          <code style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: 4 }}>{webhookUrl}</code>
        </div>
        <button onClick={() => navigator.clipboard.writeText(webhookUrl)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Kopieren</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." style={{ padding: '7px 12px 7px 30px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', width: 220 }} />
          <svg style={{ position: 'absolute', left: 9, top: 9 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: filterStatus === s ? '#111' : '#fff',
              color: filterStatus === s ? '#fff' : '#666',
              border: filterStatus === s ? '1px solid #111' : '1px solid #ebebeb',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#bbb' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>○</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Noch keine Leads</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Leads kommen automatisch wenn jemand deinen Funnel durchläuft.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ebebeb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                {['Name', 'Kontakt', 'Quelle', 'Stage', 'Deal Wert', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = stages.find((s: any) => s.id === lead.stage_id)
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 99, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                          {lead.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                          {lead.unternehmen && <div style={{ fontSize: 11, color: '#aaa' }}>{lead.unternehmen}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#777' }}>
                      <div>{lead.email || '—'}</div>
                      {lead.telefon && <div style={{ color: '#bbb' }}>{lead.telefon}</div>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: '#f5f5f5', color: '#777', fontWeight: 500 }}>{lead.quelle}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {stages.length > 0 ? (
                        <select value={lead.stage_id || ''} onChange={e => updateStage(lead.id, e.target.value)} style={{ border: 'none', background: 'none', fontSize: 12, cursor: 'pointer', color: stage?.farbe || '#bbb', fontWeight: 600, outline: 'none', padding: 0 }}>
                          <option value="">Keine</option>
                          {stages.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      ) : <span style={{ fontSize: 12, color: '#ccc' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#111' }}>
                      {lead.deal_wert ? `€${Number(lead.deal_wert).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                        background: lead.status === 'Neu' ? '#f0f9ff' : lead.status === 'Gewonnen' ? '#f0fdf4' : lead.status === 'Verloren' ? '#fef2f2' : '#fefce8',
                        color: lead.status === 'Neu' ? '#0ea5e9' : lead.status === 'Gewonnen' ? '#16a34a' : lead.status === 'Verloren' ? '#dc2626' : '#ca8a04',
                      }}>{lead.status}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(lead)} style={{ background: 'none', border: '1px solid #ebebeb', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#666' }}>Edit</button>
                        <button onClick={() => deleteLead(lead.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Lead bearbeiten' : 'Lead hinzufügen'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                { label: 'Name *', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Telefon', key: 'telefon', type: 'text' },
                { label: 'Unternehmen', key: 'unternehmen', type: 'text' },
                { label: 'Deal Wert (€)', key: 'deal_wert', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Quelle</label>
                <select value={form.quelle} onChange={e => setForm(p => ({ ...p, quelle: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {stages.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Pipeline Stage</label>
                  <select value={form.stage_id} onChange={e => setForm(p => ({ ...p, stage_id: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Keine Stage</option>
                    {stages.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Notizen</label>
                <textarea value={form.notizen} onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px', border: '1px solid #ebebeb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={save} disabled={!form.name} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: form.name ? 1 : 0.4 }}>
                  {editing ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
