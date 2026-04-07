'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lead, type PipelineStage } from '@/lib/supabase'
import { useWorkspace } from '@/components/Layout'

export default function LeadsPage() {
  const ws = useWorkspace()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [form, setForm] = useState({ name: '', email: '', telefon: '', unternehmen: '', quelle: 'Organisch', stage_id: '', deal_wert: '', notizen: '', tags: '' })

  useEffect(() => { if (ws) load() }, [ws])

  async function load() {
    setLoading(true)
    const [lr, sr] = await Promise.all([
      supabase.from('leads').select('*').eq('workspace_id', ws!.id).order('created_at', { ascending: false }),
      supabase.from('pipeline_stages').select('*').eq('workspace_id', ws!.id).order('reihenfolge'),
    ])
    setLeads(lr.data || [])
    setStages(sr.data || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', email: '', telefon: '', unternehmen: '', quelle: 'Organisch', stage_id: stages[0]?.id || '', deal_wert: '', notizen: '', tags: '' })
    setShowModal(true)
  }

  function openEdit(lead: Lead) {
    setEditing(lead)
    setForm({ name: lead.name, email: lead.email || '', telefon: lead.telefon || '', unternehmen: lead.unternehmen || '', quelle: lead.quelle, stage_id: lead.stage_id || '', deal_wert: String(lead.deal_wert || ''), notizen: lead.notizen || '', tags: lead.tags || '' })
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, workspace_id: ws!.id, deal_wert: Number(form.deal_wert) || 0, stage_id: form.stage_id || null, letzte_aktivitaet: new Date().toISOString() }
    if (editing) {
      await supabase.from('leads').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('leads').insert({ ...payload, status: 'Neu' })
    }
    setShowModal(false)
    load()
  }

  async function deleteLead(id: string) {
    if (!confirm('Lead löschen?')) return
    await supabase.from('leads').delete().eq('id', id)
    load()
  }

  async function updateStage(leadId: string, stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    await supabase.from('leads').update({ stage_id: stageId, status: stage?.ist_gewonnen ? 'Gewonnen' : stage?.ist_verloren ? 'Verloren' : 'In Bearbeitung', letzte_aktivitaet: new Date().toISOString() }).eq('id', leadId)
    load()
  }

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Alle' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  const STATUSES = ['Alle', 'Neu', 'In Bearbeitung', 'Gewonnen', 'Verloren']
  const SOURCES = ['Organisch', 'Calendly', 'OnePage.io', 'Instagram', 'LinkedIn', 'Empfehlung', 'Ads', 'Sonstiges']

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Leads</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{leads.length} Leads in {ws?.name}</p>
        </div>
        <button onClick={openNew} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Neuer Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suchen..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
          <svg style={{ position: 'absolute', left: 10, top: 10 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: filterStatus === s ? '#111' : '#fff',
              color: filterStatus === s ? '#fff' : '#666',
              border: `1px solid ${filterStatus === s ? '#111' : '#f0f0f0'}` as any,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>○</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Keine Leads gefunden</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>Erstelle einen neuen Lead oder verbinde deinen Funnel.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                {['Name', 'Email', 'Quelle', 'Pipeline Stage', 'Deal Wert', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = stages.find(s => s.id === lead.stage_id)
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 99, background: `${ws?.color || '#6366f1'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ws?.color || '#6366f1' }}>
                          {lead.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                          {lead.unternehmen && <div style={{ fontSize: 11, color: '#aaa' }}>{lead.unternehmen}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{lead.email || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: '#f5f5f5', color: '#666', fontWeight: 500 }}>{lead.quelle}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {stages.length > 0 ? (
                        <select
                          value={lead.stage_id || ''}
                          onChange={e => updateStage(lead.id, e.target.value)}
                          style={{ border: 'none', background: 'none', fontSize: 12, cursor: 'pointer', color: stage?.farbe || '#aaa', fontWeight: 600, outline: 'none' }}
                        >
                          <option value="">Keine Stage</option>
                          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      ) : <span style={{ fontSize: 12, color: '#bbb' }}>Keine Pipeline</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#111', fontWeight: 600 }}>
                      {lead.deal_wert ? `€${Number(lead.deal_wert).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                        background: lead.status === 'Neu' ? '#f0f9ff' : lead.status === 'Gewonnen' ? '#f0fdf4' : lead.status === 'Verloren' ? '#fef2f2' : '#fef9f0',
                        color: lead.status === 'Neu' ? '#0ea5e9' : lead.status === 'Gewonnen' ? '#22c55e' : lead.status === 'Verloren' ? '#ef4444' : '#f59e0b',
                      }}>{lead.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(lead)} style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#666' }}>Bearbeiten</button>
                        <button onClick={() => deleteLead(lead.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 500, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Lead bearbeiten' : 'Neuer Lead'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Name *', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Telefon', key: 'telefon', type: 'text' },
                { label: 'Unternehmen', key: 'unternehmen', type: 'text' },
                { label: 'Deal Wert (€)', key: 'deal_wert', type: 'number' },
                { label: 'Tags', key: 'tags', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Quelle</label>
                <select value={form.quelle} onChange={e => setForm(prev => ({ ...prev, quelle: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {stages.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Pipeline Stage</label>
                  <select value={form.stage_id} onChange={e => setForm(prev => ({ ...prev, stage_id: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Keine Stage</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Notizen</label>
                <textarea value={form.notizen} onChange={e => setForm(prev => ({ ...prev, notizen: e.target.value }))} rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Abbrechen</button>
                <button onClick={save} disabled={!form.name} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: !form.name ? 0.5 : 1 }}>
                  {editing ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
