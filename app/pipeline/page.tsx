'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lead, type PipelineStage, type AutomationRule } from '@/lib/supabase'
import { useWorkspace } from '@/components/Layout'

export default function PipelinePage() {
  const ws = useWorkspace()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [tab, setTab] = useState<'kanban' | 'stages' | 'automations'>('kanban')
  const [showStageModal, setShowStageModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
  const [stageForm, setStageForm] = useState({ name: '', farbe: '#6366f1', ist_gewonnen: false, ist_verloren: false })
  const [ruleForm, setRuleForm] = useState({ stage_id: '', trigger_event: 'stage_entered', action_type: 'start_email_sequence', action_config: '{}' })
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => { if (ws) load() }, [ws])

  async function load() {
    const [sr, lr, rr] = await Promise.all([
      supabase.from('pipeline_stages').select('*').eq('workspace_id', ws!.id).order('reihenfolge'),
      supabase.from('leads').select('*').eq('workspace_id', ws!.id),
      supabase.from('automation_rules').select('*').eq('workspace_id', ws!.id),
    ])
    setStages(sr.data || [])
    setLeads(lr.data || [])
    setRules(rr.data || [])
  }

  async function saveStage() {
    const payload = { ...stageForm, workspace_id: ws!.id, reihenfolge: editingStage ? editingStage.reihenfolge : stages.length }
    if (editingStage) {
      await supabase.from('pipeline_stages').update(payload).eq('id', editingStage.id)
    } else {
      await supabase.from('pipeline_stages').insert(payload)
    }
    setShowStageModal(false)
    load()
  }

  async function deleteStage(id: string) {
    if (!confirm('Stage löschen? Leads verlieren diese Stage.')) return
    await supabase.from('pipeline_stages').delete().eq('id', id)
    load()
  }

  async function saveRule() {
    let config: any = {}
    try { config = JSON.parse(ruleForm.action_config) } catch { config = {} }
    await supabase.from('automation_rules').insert({ ...ruleForm, workspace_id: ws!.id, action_config: config })
    setShowRuleModal(false)
    load()
  }

  async function deleteRule(id: string) {
    await supabase.from('automation_rules').delete().eq('id', id)
    load()
  }

  async function dropLead(leadId: string, stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    await supabase.from('leads').update({
      stage_id: stageId,
      status: stage?.ist_gewonnen ? 'Gewonnen' : stage?.ist_verloren ? 'Verloren' : 'In Bearbeitung',
      letzte_aktivitaet: new Date().toISOString(),
    }).eq('id', leadId)
    setDragging(null)
    load()
  }

  const ACTION_TYPES: Record<string, string> = {
    start_email_sequence: '7-Tage Email Sequenz starten',
    send_notification: 'Notification senden',
    create_task: 'Task erstellen',
    send_klaviyo_email: 'Klaviyo Email senden',
  }

  const TRIGGER_TYPES: Record<string, string> = {
    stage_entered: 'Lead betritt diese Stage',
    stage_left: 'Lead verlässt diese Stage',
  }

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Pipeline</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>{ws?.name} · {stages.length} Stages · {leads.length} Leads</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'stages' && <button onClick={() => { setEditingStage(null); setStageForm({ name: '', farbe: '#6366f1', ist_gewonnen: false, ist_verloren: false }); setShowStageModal(true) }} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Stage</button>}
          {tab === 'automations' && <button onClick={() => { setRuleForm({ stage_id: stages[0]?.id || '', trigger_event: 'stage_entered', action_type: 'start_email_sequence', action_config: '{}' }); setShowRuleModal(true) }} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Regel</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f5f5f5', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {(['kanban', 'stages', 'automations'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#111' : '#888',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
            {t === 'kanban' ? 'Kanban Board' : t === 'stages' ? 'Stages verwalten' : 'Automationen'}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {tab === 'kanban' && (
        <div>
          {stages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 6 }}>Noch keine Pipeline Stages</div>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Erstelle Stages die zu deinem Client passen.</div>
              <button onClick={() => setTab('stages')} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Stages erstellen →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
              {stages.map(stage => {
                const stageLeads = leads.filter(l => l.stage_id === stage.id)
                return (
                  <div
                    key={stage.id}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); if (dragging) dropLead(dragging, stage.id) }}
                    style={{
                      minWidth: 240, background: '#f9f9f9', borderRadius: 12,
                      border: `1px solid ${stage.farbe}20`,
                    }}
                  >
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `2px solid ${stage.farbe}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: stage.farbe }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{stage.name}</span>
                      <span style={{ fontSize: 10, color: '#aaa', marginLeft: 'auto' }}>{stageLeads.length}</span>
                    </div>
                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                      {stageLeads.map(lead => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => setDragging(lead.id)}
                          style={{
                            background: '#fff', borderRadius: 10, padding: '10px 12px',
                            border: '1px solid #f0f0f0', cursor: 'grab',
                            boxShadow: dragging === lead.id ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                          {lead.email && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{lead.email}</div>}
                          {lead.deal_wert ? <div style={{ fontSize: 11, color: stage.farbe, fontWeight: 600, marginTop: 4 }}>€{Number(lead.deal_wert).toLocaleString()}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {/* Leads ohne Stage */}
              <div style={{ minWidth: 240, background: '#f9f9f9', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                <div style={{ padding: '12px 14px', borderBottom: '2px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: '#ddd' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#999' }}>Ohne Stage</span>
                  <span style={{ fontSize: 10, color: '#aaa', marginLeft: 'auto' }}>{leads.filter(l => !l.stage_id).length}</span>
                </div>
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                  {leads.filter(l => !l.stage_id).map(lead => (
                    <div key={lead.id} draggable onDragStart={() => setDragging(lead.id)} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #f0f0f0', cursor: 'grab' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{lead.name}</div>
                      {lead.email && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{lead.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stages verwalten */}
      {tab === 'stages' && (
        <div style={{ maxWidth: 600 }}>
          {stages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 13, color: '#aaa' }}>Noch keine Stages. Klick "+ Stage" um loszulegen.</div>
            </div>
          ) : stages.map((stage, i) => (
            <div key={stage.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 99, background: stage.farbe, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{stage.name}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>
                  {stage.ist_gewonnen ? '🏆 Gewonnen Stage' : stage.ist_verloren ? '✗ Verloren Stage' : `Position ${i + 1}`}
                  {' · '}{rules.filter(r => r.stage_id === stage.id).length} Automationen
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditingStage(stage); setStageForm({ name: stage.name, farbe: stage.farbe, ist_gewonnen: stage.ist_gewonnen, ist_verloren: stage.ist_verloren }); setShowStageModal(true) }} style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Bearbeiten</button>
                <button onClick={() => deleteStage(stage.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>×</button>
              </div>
            </div>
          ))}
          <button onClick={() => { setEditingStage(null); setStageForm({ name: '', farbe: '#6366f1', ist_gewonnen: false, ist_verloren: false }); setShowStageModal(true) }} style={{ width: '100%', padding: '12px', border: '1px dashed #e5e5e5', borderRadius: 10, background: 'none', cursor: 'pointer', fontSize: 13, color: '#aaa', marginTop: 4 }}>
            + Stage hinzufügen
          </button>
        </div>
      )}

      {/* Automationen */}
      {tab === 'automations' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#92400e' }}>
            💡 Automationen laufen wenn ein Lead eine Stage betritt oder verlässt. Z.B. "Wenn Lead 'Kein Kauf' betritt → 7-Tage Sequenz starten"
          </div>
          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 13, color: '#aaa' }}>Noch keine Automatisierungsregeln. Klick "+ Regel" um loszulegen.</div>
            </div>
          ) : rules.map(rule => {
            const stage = stages.find(s => s.id === rule.stage_id)
            return (
              <div key={rule.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
                    <span style={{ color: stage?.farbe || '#aaa' }}>{stage?.name || 'Unbekannte Stage'}</span>
                    {' → '}{ACTION_TYPES[rule.action_type] || rule.action_type}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    Trigger: {TRIGGER_TYPES[rule.trigger_event] || rule.trigger_event}
                    {' · '}{rule.aktiv ? '✓ Aktiv' : '— Inaktiv'}
                  </div>
                </div>
                <button onClick={() => deleteRule(rule.id)} style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Stage Modal */}
      {showStageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 420, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editingStage ? 'Stage bearbeiten' : 'Neue Stage'}</h2>
              <button onClick={() => setShowStageModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Name *</label>
                <input value={stageForm.name} onChange={e => setStageForm(p => ({ ...p, name: e.target.value }))} placeholder="z.B. Erstkontakt, Qualifiziert, Angebot..." style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 8 }}>Farbe</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setStageForm(p => ({ ...p, farbe: c }))} style={{ width: 28, height: 28, borderRadius: 99, background: c, border: stageForm.farbe === c ? '3px solid #111' : '3px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={stageForm.ist_gewonnen} onChange={e => setStageForm(p => ({ ...p, ist_gewonnen: e.target.checked, ist_verloren: false }))} />
                  🏆 Gewonnen Stage
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={stageForm.ist_verloren} onChange={e => setStageForm(p => ({ ...p, ist_verloren: e.target.checked, ist_gewonnen: false }))} />
                  ✗ Verloren Stage
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowStageModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={saveStage} disabled={!stageForm.name} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: !stageForm.name ? 0.5 : 1 }}>Speichern</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 480, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Neue Automation</h2>
              <button onClick={() => setShowRuleModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Wenn Stage...</label>
                <select value={ruleForm.stage_id} onChange={e => setRuleForm(p => ({ ...p, stage_id: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Trigger</label>
                <select value={ruleForm.trigger_event} onChange={e => setRuleForm(p => ({ ...p, trigger_event: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {Object.entries(TRIGGER_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 4 }}>Dann...</label>
                <select value={ruleForm.action_type} onChange={e => setRuleForm(p => ({ ...p, action_type: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #f0f0f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                  {Object.entries(ACTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowRuleModal(false)} style={{ flex: 1, padding: '10px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button onClick={saveRule} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#111', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Erstellen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
