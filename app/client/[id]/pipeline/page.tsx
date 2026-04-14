'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

export default function PipelinePage({ params }: { params: { id: string } }) {
  const [stages, setStages] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [client, setClient] = useState<any>(null)
  const [tab, setTab] = useState<'kanban' | 'stages'>('kanban')
  const [showModal, setShowModal] = useState(false)
  const [editingStage, setEditingStage] = useState<any>(null)
  const [stageForm, setStageForm] = useState({ name: '', farbe: '#6366f1', ist_gewonnen: false, ist_verloren: false })
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => { load() }, [params.id])

  async function load() {
    const [sr, lr, cr] = await Promise.all([
      supabase.from('pipeline_stages').select('*').eq('workspace_id', params.id).order('reihenfolge'),
      supabase.from('leads').select('*').eq('workspace_id', params.id),
      supabase.from('workspaces').select('*').eq('id', params.id).single(),
    ])
    setStages(sr.data || [])
    setLeads(lr.data || [])
    setClient(cr.data)
  }

  async function saveStage() {
    const payload = { ...stageForm, workspace_id: params.id, reihenfolge: editingStage ? editingStage.reihenfolge : stages.length }
    if (editingStage) await supabase.from('pipeline_stages').update(payload).eq('id', editingStage.id)
    else await supabase.from('pipeline_stages').insert(payload)
    setShowModal(false)
    load()
  }

  async function deleteStage(stageId: string) {
    if (!confirm('Stage löschen?')) return
    await supabase.from('pipeline_stages').delete().eq('id', stageId)
    load()
  }

  async function dropLead(leadId: string, stageId: string) {
    const stage = stages.find((s: any) => s.id === stageId)
    await supabase.from('leads').update({
      stage_id: stageId,
      status: stage?.ist_gewonnen ? 'Gewonnen' : stage?.ist_verloren ? 'Verloren' : 'In Bearbeitung',
    }).eq('id', leadId)
    setDragging(null)
    load()
  }

  const color = client?.color || '#6366f1'

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Pipeline</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{stages.length} Stages · {leads.length} Leads</p>
        </div>
        {tab === 'stages' && (
          <button onClick={() => { setEditingStage(null); setStageForm({ name: '', farbe: '#6366f1', ist_gewonnen: false, ist_verloren: false }); setShowModal(true) }} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Stage
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: '#f0f0f0', padding: 4, borderRadius: 9, width: 'fit-content' }}>
        {(['kanban', 'stages'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#111' : '#888', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
            {t === 'kanban' ? 'Kanban' : 'Stages verwalten'}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {tab === 'kanban' && (
        stages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #ebebeb' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Noch keine Pipeline Stages</div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Erstelle Stages passend zu diesem Client.</div>
            <button onClick={() => setTab('stages')} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Stages erstellen →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {stages.map((stage: any) => {
              const stageLeads = leads.filter((l: any) => l.stage_id === stage.id)
              return (
                <div key={stage.id} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragging) dropLead(dragging, stage.id) }} style={{ minWidth: 230, background: '#f9f9f9', borderRadius: 12, border: `1px solid ${stage.farbe}20` }}>
                  <div style={{ padding: '11px 14px', borderBottom: `2px solid ${stage.farbe}`, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 99, background: stage.farbe }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111', flex: 1 }}>{stage.name}</span>
                    <span style={{ fontSize: 10, color: '#bbb' }}>{stageLeads.length}</span>
                  </div>
                  <div style={{ padding: 8, minHeight: 100, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {stageLeads.map((lead: any) => (
                      <div key={lead.id} draggable onDragStart={() => setDragging(lead.id)} style={{ background: '#fff', borderRadius: 9, padding: '9px 11px', border: '1px solid #ebebeb', cursor: 'grab' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                        {lead.email && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{lead.email}</div>}
                        {lead.deal_wert ? <div style={{ fontSize: 11, color: stage.farbe, fontWeight: 600, marginTop: 3 }}>€{Number(lead.deal_wert).toLocaleString()}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragging) { supabase.from('leads').update({ stage_id: null, status: 'Neu' }).eq('id', dragging).then(() => { setDragging(null); load() }) } }} style={{ minWidth: 230, background: '#f9f9f9', borderRadius: 12, border: '1px solid #ebebeb' }}>
              <div style={{ padding: '11px 14px', borderBottom: '2px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: 99, background: '#ddd' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', flex: 1 }}>Ohne Stage</span>
                <span style={{ fontSize: 10, color: '#bbb' }}>{leads.filter((l: any) => !l.stage_id).length}</span>
              </div>
              <div style={{ padding: 8, minHeight: 100, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {leads.filter((l: any) => !l.stage_id).map((lead: any) => (
                  <div key={lead.id} draggable onDragStart={() => setDragging(lead.id)} style={{ background: '#fff', borderRadius: 9, padding: '9px 11px', border: '1px solid #ebebeb', cursor: 'grab' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                    {lead.email && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{lead.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Stages verwalten */}
      {tab === 'stages' && (
        <div style={{ maxWidth: 560 }}>
          {stages.map((stage: any, i: number) => (
            <div key={stage.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #ebebeb', padding: '13px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 9, height: 9, borderRadius: 99, background: stage.farbe, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{stage.name}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>{stage.ist_gewonnen ? '🏆 Gewonnen' : stage.ist_verloren ? '✗ Verloren' : `Position ${i + 1}`}</div>
              </div>
              <button onClick={() => { setEditingStage(stage); setStageForm({ name: stage.name, farbe: stage.farbe, ist_gewonnen: stage.ist_gewonnen, ist_verloren: stage.ist_verloren }); setShowModal(true) }} style={{ background: 'none', border: '1px solid #ebebeb', borderRadius: 6, padding: '4px 11px', fontSize: 11, cursor: 'pointer' }}>Bearbeiten</button>
              <button onClick={() => deleteStage(stage.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#ef4444' }}>×</button>
            </div>
          ))}
          <button onClick={() => { setEditingStage(null); setStageForm({ name: '', farbe: color, ist_gewonnen: false, ist_verloren: false }); setShowModal(true) }} style={{ width: '100%', padding: '11px', border: '1px dashed #ddd', borderRadius: 10, background: 'none', cursor: 'pointer', fontSize: 13, color: '#bbb', marginTop: 4 }}>
            + Stage hinzufügen
          </button>
        </div>
      )}

      {/* Stage Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 400, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editingStage ? 'Stage bearbeiten' : 'Neue Stage'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Name *</label>
                <input value={stageForm.name} onChange={e => setStageForm(p => ({ ...p, name: e.target.value }))} placeholder="z.B. Qualifiziert, Angebot, Gewonnen..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 8 }}>Farbe</label>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {COLORS.map(c => <button key={c} onClick={() => setStageForm(p => ({ ...p, farbe: c }))} style={{ width: 26, height: 26, borderRadius: 99, background: c, border: stageForm.farbe === c ? '3px solid #111' : '3px solid transparent', cursor: 'pointer' }} />)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={stageForm.ist_gewonnen} onChange={e => setStageForm(p => ({ ...p, ist_gewonnen: e.target.checked, ist_verloren: false }))} />
                  🏆 Gewonnen
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={stageForm.ist_verloren} onChange={e => setStageForm(p => ({ ...p, ist_verloren: e.target.checked, ist_gewonnen: false }))} />
                  ✗ Verloren
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '9px', border: '1px solid #ebebeb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={saveStage} disabled={!stageForm.name} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: stageForm.name ? 1 : 0.4 }}>Speichern</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
