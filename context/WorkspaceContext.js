'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
const WS = createContext(null)
export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadWorkspaces() }, [])
  const loadWorkspaces = async () => {
    const { data } = await supabase.from('workspaces').select('*').order('created_at')
    const ws = data || []
    setWorkspaces(ws)
    const lastId = typeof window !== 'undefined' ? localStorage.getItem('gh_workspace') : null
    const found = ws.find(w => w.id === lastId)
    setCurrent(found || ws[0] || null)
    setLoading(false)
  }
  const switchWorkspace = (ws) => { setCurrent(ws); localStorage.setItem('gh_workspace', ws.id) }
  const addWorkspace = async (data) => {
    const { data: ws } = await supabase.from('workspaces').insert([data]).select().single()
    await loadWorkspaces(); if (ws) switchWorkspace(ws); return ws
  }
  const updateWorkspace = async (id, data) => { await supabase.from('workspaces').update(data).eq('id', id); await loadWorkspaces() }
  const deleteWorkspace = async (id) => { await supabase.from('workspaces').delete().eq('id', id); await loadWorkspaces() }
  return <WS.Provider value={{ workspaces, current, loading, switchWorkspace, addWorkspace, updateWorkspace, deleteWorkspace, reload: loadWorkspaces }}>{children}</WS.Provider>
}
export const useWorkspace = () => useContext(WS)
