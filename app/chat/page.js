'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { WorkspaceProvider } from '@/context/WorkspaceContext'

const CHANNELS = [
  { id: 'allgemein', label: 'Allgemein', icon: '#' },
  { id: 'sales', label: 'Sales & Leads', icon: '#' },
  { id: 'clients', label: 'Clients', icon: '#' },
  { id: 'ideen', label: 'Ideen', icon: '💡' },
]

function ChatContent() {
  const [channel, setChannel] = useState('allgemein')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [name] = useState('Alex')
  const bottomRef = useRef(null)

  useEffect(() => { load() }, [channel])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const load = async () => {
    const { data } = await supabase.from('messages').select('*').eq('channel', channel).order('created_at').limit(50)
    setMessages(data || [])
  }

  const send = async () => {
    if (!input.trim()) return
    await supabase.from('messages').insert([{ sender_name: name, content: input.trim(), channel }])
    setInput('')
    load()
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
      {/* Channel sidebar */}
      <div style={{ width: 200, background: '#fff', borderRight: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px 8px', fontSize: 11, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.06em' }}>Channels</div>
        {CHANNELS.map(c => (
          <div key={c.id} onClick={() => setChannel(c.id)} className={`chat-channel${channel === c.id ? ' act' : ''}`}>
            <span style={{ marginRight: 6, fontSize: 13 }}>{c.icon}</span> {c.label}
          </div>
        ))}
        <div style={{ padding: '12px 14px 8px', fontSize: 11, fontWeight: 600, color: '#9ba1ab', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8 }}>Direktnachrichten</div>
        {['Alex H.'].map(u => (
          <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', fontSize: 13, color: '#5c6370', cursor: 'pointer' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a7c59' }} />
            {u}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e1e4e8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}># {CHANNELS.find(c => c.id === channel)?.label}</span>
          <span className="badge bgr" style={{ fontSize: 11 }}>{messages.length} Nachrichten</span>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ba1ab' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Noch keine Nachrichten</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Schreib die erste Nachricht in #{CHANNELS.find(c => c.id === channel)?.label}</div>
            </div>
          ) : messages.map((m, i) => {
            const isOwn = m.sender_name === name
            return (
              <div key={m.id} className={`chat-msg${isOwn ? ' own' : ''}`}>
                {!isOwn && <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6b4bc8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{m.sender_name?.slice(0, 2).toUpperCase()}</div>}
                <div>
                  {!isOwn && <div style={{ fontSize: 11, color: '#9ba1ab', marginBottom: 3 }}>{m.sender_name}</div>}
                  <div className={`chat-bubble ${isOwn ? 'own' : 'other'}`}>{m.content}</div>
                  <div style={{ fontSize: 10, color: '#c5ccd4', marginTop: 2, textAlign: isOwn ? 'right' : 'left' }}>{new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {isOwn && <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AH</div>}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-wrap">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} placeholder={`Nachricht in #${CHANNELS.find(c => c.id === channel)?.label}...`}
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
  return <WorkspaceProvider><div className="layout"><Sidebar/><div className="main">
    <div className="topbar"><div className="tb-l"><span className="tb-title">Team Chat</span><span className="badge bg" style={{fontSize:11}}>Live</span></div></div>
    <ChatContent/>
  </div></div></WorkspaceProvider>
}
