'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface ClientContextType {
  client: any
  leads: any[]
  stages: any[]
  tasks: any[]
  calendar: any[]
  goals: any[]
  emails: any[]
  loading: boolean
  refresh: (table?: string) => void
}

const ClientContext = createContext<ClientContextType>({
  client: null, leads: [], stages: [], tasks: [], calendar: [], goals: [], emails: [],
  loading: true, refresh: () => {},
})

export function useClientData() { return useContext(ClientContext) }

export function ClientProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const [client, setClient]     = useState<any>(null)
  const [leads, setLeads]       = useState<any[]>([])
  const [stages, setStages]     = useState<any[]>([])
  const [tasks, setTasks]       = useState<any[]>([])
  const [calendar, setCalendar] = useState<any[]>([])
  const [goals, setGoals]       = useState<any[]>([])
  const [emails, setEmails]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async (table?: string) => {
    if (!table) {
      // Initial full load — all in parallel
      const [ws, ld, st, tk, cal, gl, em] = await Promise.all([
        supabase.from('workspaces').select('*').eq('id', id).single(),
        supabase.from('leads').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
        supabase.from('pipeline_stages').select('*').eq('workspace_id', id).order('reihenfolge'),
        supabase.from('tasks').select('*').eq('workspace_id', id).order('faellig', { ascending: true }),
        supabase.from('content_calendar').select('*').eq('workspace_id', id).order('geplant_fuer', { ascending: true }),
        supabase.from('client_goals').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
        supabase.from('email_sequences').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
      ])
      setClient(ws.data)
      setLeads(ld.data || [])
      setStages(st.data || [])
      setTasks(tk.data || [])
      setCalendar(cal.data || [])
      setGoals(gl.data || [])
      setEmails(em.data || [])
      setLoading(false)
    } else {
      // Selective refresh after mutation
      if (table === 'leads')            supabase.from('leads').select('*').eq('workspace_id', id).order('created_at', { ascending: false }).then(r => setLeads(r.data || []))
      if (table === 'pipeline_stages')  supabase.from('pipeline_stages').select('*').eq('workspace_id', id).order('reihenfolge').then(r => setStages(r.data || []))
      if (table === 'tasks')            supabase.from('tasks').select('*').eq('workspace_id', id).order('faellig', { ascending: true }).then(r => setTasks(r.data || []))
      if (table === 'content_calendar') supabase.from('content_calendar').select('*').eq('workspace_id', id).order('geplant_fuer', { ascending: true }).then(r => setCalendar(r.data || []))
      if (table === 'client_goals')     supabase.from('client_goals').select('*').eq('workspace_id', id).order('created_at', { ascending: false }).then(r => setGoals(r.data || []))
      if (table === 'email_sequences')  supabase.from('email_sequences').select('*').eq('workspace_id', id).order('created_at', { ascending: false }).then(r => setEmails(r.data || []))
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return (
    <ClientContext.Provider value={{ client, leads, stages, tasks, calendar, goals, emails, loading, refresh: load }}>
      {children}
    </ClientContext.Provider>
  )
}
