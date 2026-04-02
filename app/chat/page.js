'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext'

const CHANNELS = [
  { id: 'allgemein', label: 'Allgemein', desc: 'Team Kanal', icon: '#' },
  { id: 'sales', label: 'Sales', desc: 'Leads & Deals', icon: '#' },
  { id: 'clients', label: 'Clients', desc: 'Client Updates', icon: '#' },
  { id: 'ideen', label: 'Ideen', desc: 'Brainstorming', icon: '💡' },
]

function ChatContent() {
  const { current, workspaces } = useWorkspace()
  const [channel, setChannel] = useState('allgemein')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [userName, setUserName] = useState('Alex')
  const [wsFilter, setWsFilter] = useState(null)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => { 
    supabase.auth.getSession().then(({ data: { session } }) => { if (!session) router.push('/login') })
  }, [])
  
  useEffect(() => { loadMessages() }, [channel, wsFilter])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Realtime subscription
  useEffect(() => {
    const sub = supabase.channel('chat_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadMessages())
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [channel])

  const loadMessages = async () => {
    let q = supabase.from('messages').select('*').eq('channel', channel).order('created_at').limit(100)
    if (wsFilter) q = q.eq('workspace_id', wsFilter)
    else q = q.is('workspace_id', null)
    const { data } = await q
    setMessages(data || [])
  }

  const send = async () => {
    if (!input.trim()) return
    await supabase.from('messages').insert([{
      sender_name: userName,
      content: input.trim(),
      channel,
      workspace_id: wsFilter || null,
      sender_role: 'admin'
    }])
    setInput('')
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const getInitials = (name) => name?.slice(0, 2).toUpperCase() || 'XX'
  const getColor = (name) => {
    const colors = ['#1565c0', '#0a7c59', '#6b4bc8', '#b7860b', '#c0392b']
    return colors[name?.charCodeAt(0) % colors.length] || '#1565c0'
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
      {/* Left sidebar */}
      <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Team channels */}
        <div style={{ padding: '12px 14px 6px', fontSize: 11, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.06em' }}>Team Channels</div>
        {CHANNELS.map(c => (
          <div key={c.id} onClick={() => { setChannel(c.id); setWsFilter(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', background: channel === c.id && !wsFilter ? '#e3f0ff' : 'transparent', color: channel === c.id && !wsFilter ? '#1565c0' : '#5c6370', fontSize: 13, fontWeight: channel === c.id && !wsFilter ? 500 : 400, borderRadius: 6, margin: '1px 8px', transition: 'all .12s' }}>
            <span style={{ fontSize: 14 }}>{c.icon}</span>
            <div>
              <div>{c.label}</div>
              <div style={{ fontSize: 10.5, color: '#c5ccd4' }}>{c.desc}</div>
            </div>
          </div>
        ))}

        {/* Client chats */}
        <div style={{ padding: '12px 14px 6px', fontSize: 11, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8, borderTop: '1px solid #f0f2f5' }}>Client Chats</div>
        {workspaces.filter(ws => ws.slug !== 'mein-workspace').map(ws => (
          <div key={ws.id} onClick={() => { setChannel('client'); setWsFilter(ws.id) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', background: wsFilter === ws.id ? '#e3f0ff' : 'transparent', color: wsFilter === ws.id ? '#1565c0' : '#5c6370', fontSize: 13, fontWeight: wsFilter === ws.id ? 500 : 400, borderRadius: 6, margin: '1px 8px', transition: 'all .12s' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: ws.color || '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {ws.name?.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
          </div>
        ))}
        {workspaces.filter(ws => ws.slug !== 'mein-workspace').length === 0 && (
          <div style={{ padding: '8px 14px', fontSize: 12, color: '#c5ccd4' }}>Noch keine Clients</div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e1e4e8', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {wsFilter ? `💬 ${workspaces.find(w => w.id === wsFilter)?.name}` : `# ${CHANNELS.find(c => c.id === channel)?.label || 'Chat'}`}
          </span>
          <span className="badge bgr" style={{ fontSize: 11 }}>{messages.length} Nachrichten</span>
          {wsFilter && <span className="badge bb" style={{ fontSize: 11 }}>Client Chat</span>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ba1ab' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Noch keine Nachrichten</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Schreib die erste Nachricht!</div>
            </div>
          ) : messages.map(m => {
            const isOwn = m.sender_name === userName
            return (
              <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: getColor(m.sender_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {getInitials(m.sender_name)}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  {!isOwn && <div style={{ fontSize: 11, color: '#9ba1ab', marginBottom: 3 }}>{m.sender_name}</div>}
                  <div style={{ padding: '10px 14px', borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isOwn ? '#1565c0' : '#f4f6f8', color: isOwn ? '#fff' : '#1a1a2e', fontSize: 13.5, lineHeight: 1.5 }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: 10, color: '#c5ccd4', marginTop: 2, textAlign: isOwn ? 'right' : 'left' }}>
                    {new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #e1e4e8', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
            placeholder={`Nachricht...`}
            style={{ flex: 1, height: 40, padding: '0 14px', border: '1px solid #e1e4e8', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={send} className="btn-p" style={{ height: 40, width: 40, padding: 0, justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  return (
    <WorkspaceProvider>
      <div className="layout"><Sidebar/>
        <div className="main">
          <div className="topbar">
            <div className="tb-l"><span className="tb-title">Team Chat</span><span className="badge bg" style={{fontSize:11}}>Live</span></div>
          </div>
          <ChatContent/>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
