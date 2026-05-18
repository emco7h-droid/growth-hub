'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const SOURCES = ['Instagram','Calendly','OnePage.io','LinkedIn','Empfehlung','Ads','Sonstiges']

export function QuickAddLead() {
  const [open, setOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', quelle: 'Instagram', workspace_id: '' })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('workspaces').select('id, name, color, is_personal').order('created_at', { ascending: false }).then(({ data }) => {
      setWorkspaces(data || [])
      const personal = (data || []).find((w: any) => w.is_personal)
      if (personal) setForm(f => ({ ...f, workspace_id: personal.id }))
    })
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function save() {
    if (!form.name.trim() || !form.workspace_id) return
    setSaving(true)
    const { error } = await supabase.from('leads').insert({
      name: form.name.trim(),
      quelle: form.quelle,
      workspace_id: form.workspace_id,
      status: 'Neu',
      letzte_aktivitaet: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { toast.error('Fehler'); return }
    toast.success(`${form.name} hinzugefügt ✓`)
    setForm(f => ({ ...f, name: '' }))
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 14 }}>+</span> Quick Lead
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 44, width: 280, background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>Lead schnell eintragen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Name des Leads *"
              style={{ width: '100%', padding: '8px 11px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            <select value={form.workspace_id} onChange={e => setForm(f => ({ ...f, workspace_id: e.target.value }))}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              {workspaces.map((w: any) => (
                <option key={w.id} value={w.id}>{w.is_personal ? '⚡ Mein Workspace' : w.name}</option>
              ))}
            </select>
            <select value={form.quelle} onChange={e => setForm(f => ({ ...f, quelle: e.target.value }))}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid #eaeaea', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={save} disabled={!form.name.trim() || saving}
              style={{ width: '100%', padding: '9px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: form.name.trim() ? 1 : 0.4 }}>
              {saving ? 'Wird gespeichert...' : 'Lead hinzufügen ↵'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
