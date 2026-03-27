'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const WsCtx = createContext(null)

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('workspaces').select('*').order('created_at', { ascending: true })
    const ws = data || []
    setWorkspaces(ws)
    // Restore last selected workspace from localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gh_workspace') : null
    if (saved && ws.find(w => w.id === saved)) {
      setCurrent(ws.find(w => w.id === saved))
    } else if (ws.length > 0) {
      setCurrent(ws[0])
    }
    setLoading(false)
  }

  const switchWorkspace = (ws) => {
    setCurrent(ws)
    if (typeof window !== 'undefined') localStorage.setItem('gh_workspace', ws.id)
  }

  const addWorkspace = async (data) => {
    const { data: newWs } = await supabase.from('workspaces').insert([data]).select().single()
    if (newWs) { await load(); switchWorkspace(newWs) }
    return newWs
  }

  return (
    <WsCtx.Provider value={{ workspaces, current, loading, switchWorkspace, addWorkspace, reload: load }}>
      {children}
    </WsCtx.Provider>
  )
}

export const useWorkspace = () => useContext(WsCtx)
