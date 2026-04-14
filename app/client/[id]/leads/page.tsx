'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { SkeletonTable } from '@/components/Skeleton'
import { OnboardingChecklist } from '@/components/Onboarding'

const SOURCES = ['OnePage.io','Calendly','Instagram','LinkedIn','Website','Empfehlung','Ads','Typeform','Sonstiges']

export default function LeadsPage({ params }: { params: { id: string } }) {
  const [leads, setLeads] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Alle')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
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

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { ...form, workspace_id: params.id, deal_wert: Number(form.deal_wert) || 0, stage_id: form.stage_id || null, letzte_aktivitaet: new Date().toISOString() }
    const { error } = editing
      ? await supabase.from('leads').update(payload).eq('id', editing.id)
      : await supabase.from('leads').insert({ ...payload, status: 'Neu' })
    setSaving(false)
    if (error) { toast.error('Fehler beim Speichern'); return }
    toast.success(editing ? 'Lead aktualisiert' : 'Lead hinzugefügt ✓')
    setShowModal(false)
    load()
  }

  async function deleteLead(id: string) {
    if (!confirm('Lead löschen?')) return
    await supabase.from('leads').delete().eq('id', id)
    toast.success('Lead gelöscht')
    load()
  }

  async function updateStage(leadId: string, stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    await supabase.from('leads').update({ stage_id: stageId || null, status: stage?.ist_gewonnen ? 'Gewonnen' : stage?.ist_verloren ? 'Verloren' : 'In Bearbeitung', letzte_aktivitaet: new Date().toISOString() }).eq('id', leadId)
    load()
  }

  const STATUSES = ['Alle','Neu','In Bearbeitung','Gewonnen','Verloren']
  const color = client?.color || '#6366f1'
  const filtered = leads.filter(l => {
    const ms = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())
    const mf = filterStatus === 'Alle' || l.status === filterStatus
    return ms && mf
  })
  const allowManual = client?.allow_manual_leads !== false
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/leads?workspace_id=${params.id}` : `/api/leads?workspace_id=${params.id}`

  // Onboarding checklist
  const hasLeads = leads.length > 0
  const hasStages = stages.length > 0
  if (!loading && !hasLeads && !hasStages) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Leads</h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>Noch keine Daten für {client?.name}</p>
        </div>
        <OnboardingChecklist clientId={params.id} checks={[
          { label: 'Pipeline Stages erstellen', done: hasStages, href: `/client/${params.id}/pipeline`, desc: 'Definiere den Verkaufsprozess für diesen Client' },
          { label: 'Webhook in Make einrichten', done: false, href: `/client/${params.id}/settings`, desc: `URL: ${webhookUrl}` },
          { label: 'Ersten Lead hinzufügen', done: hasLeads, href: '#', desc: 'Manuell oder über den Webhook' },
          { label: 'Ziele definieren', done: false, href: `/client/${params.id}/goals`, desc: 'Setze messbare Projektziele' },
        ]} />
      </div>
    )
  }

  return (
    <div className="main-content" style={{ padding: '28px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', margin: 0 }}>Leads</h1>
          <p style={{ fontSize: 12.5, color: '#aaa', margin: '3px 0 0' }}>{leads.length} Leads — kommen automatisch über Webhook</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setForm({ name: '', email: '', telefon: '', unternehmen: '', quelle: 'OnePage.io', stage_id: '', deal_wert: '', notizen: '' }); setShowModal(true) }} style={{ display: allowManual ? 'inline-flex' : 'none', alignItems: 'center' }}>
          + Lead
        </button>
      </div>

      {/* Webhook banner */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '10px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <code style={{ fontSize: 11.5, color: '#0369a1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{webhookUrl}</code>
        <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Webhook URL kopiert ✓') }} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>Kopieren</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="gh-input" style={{ width: 200, paddingLeft: 30 }} />
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, background: filterStatus === s ? '#1a1a1a' : '#fff', color: filterStatus === s ? '#fff' : '#666', border: filterStatus === s ? '1px solid #1a1a1a' : '1px solid #eaeaea', transition: 'all 0.1s' }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonTable rows={5} /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 56, background: '#fff', borderRadius: 12, border: '1px solid #eaeaea' }}>
          <div style={{ fontSize: 13.5, color: '#aaa' }}>{search ? `Keine Ergebnisse für "${search}"` : 'Noch keine Leads'}</div>
        </div>
      ) : (
        <div className="animate-fade" style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                {['Name', 'Kontakt', 'Quelle', 'Stage', 'Wert', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = stages.find(s => s.id === lead.stage_id)
                const statusColors: any = { Neu: { bg: '#f0f9ff', c: '#0ea5e9' }, Gewonnen: { bg: '#f0fdf4', c: '#16a34a' }, Verloren: { bg: '#fef2f2', c: '#dc2626' }, 'In Bearbeitung': { bg: '#fefce8', c: '#ca8a04' } }
                const sc = statusColors[lead.status] || { bg: '#f5f5f5', c: '#888' }
                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 99, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                          {lead.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{lead.name}</div>
                          {lead.unternehmen && <div style={{ fontSize: 11, color: '#bbb' }}>{lead.unternehmen}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#777' }}>
                      <div>{lead.email || '—'}</div>
                      {lead.telefon && <div style={{ color: '#bbb' }}>{lead.telefon}</div>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#f5f5f5', color: '#777', fontWeight: 500 }}>{lead.quelle}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {stages.length > 0 ? (
                        <select value={lead.stage_id || ''} onChange={e => updateStage(lead.id, e.target.value)} style={{ border: 'none', background: 'none', fontSize: 12, cursor: 'pointer', color: stage?.farbe || '#bbb', fontWeight: 600, padding: 0, maxWidth: 130 }}>
                          <option value="">Keine Stage</option>
                          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      ) : <span style={{ fontSize: 12, color: '#ccc' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                      {lead.deal_wert ? `€${Number(lead.deal_wert).toLocaleString('de')}` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600, background: sc.bg, color: sc.c }}>{lead.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {allowManual && <button onClick={() => { setEditing(lead); setForm({ name: lead.name, email: lead.email || '', telefon: lead.telefon || '', unternehmen: lead.unternehmen || '', quelle: lead.quelle, stage_id: lead.stage_id || '', deal_wert: String(lead.deal_wert || ''), notizen: lead.notizen || '' }); setShowModal(true) }} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11.5 }}>Edit</button>}
                        {allowManual && <button onClick={() => deleteLead(lead.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: 11.5 }}>×</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Lead bearbeiten' : 'Neuer Lead'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#bbb', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Name *', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Telefon', key: 'telefon', type: 'text' },
                { label: 'Unternehmen', key: 'unternehmen', type: 'text' },
                { label: 'Deal Wert (€)', key: 'deal_wert', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="gh-input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Quelle</label>
                <select value={form.quelle} onChange={e => setForm(p => ({ ...p, quelle: e.target.value }))} className="gh-select">
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {stages.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Pipeline Stage</label>
                  <select value={form.stage_id} onChange={e => setForm(p => ({ ...p, stage_id: e.target.value }))} className="gh-select">
                    <option value="">Keine Stage</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Notizen</label>
                <textarea value={form.notizen} onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))} rows={3} className="gh-textarea" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Abbrechen</button>
                <button onClick={save} disabled={!form.name.trim() || saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving ? <span className="spinner" /> : editing ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
