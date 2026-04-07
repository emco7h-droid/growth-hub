'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4']

export default function HomePage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.nische || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#111', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>GH</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Growth Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Client suchen..."
              style={{ padding: '7px 12px 7px 32px', border: '1px solid #ebebeb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f7f7f5', width: 220 }}
            />
            <svg style={{ position: 'absolute', left: 10, top: 9 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <Link href="/client/new" style={{ background: '#111', color: '#fff', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600 }}>
            + Neuer Client
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '36px 40px', maxWidth: 1200 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Deine Clients</h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>{clients.length} Clients insgesamt</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#bbb', fontSize: 14 }}>Laden...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>
              {search ? 'Kein Client gefunden' : 'Noch keine Clients'}
            </div>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>
              {search ? `Keine Ergebnisse für "${search}"` : 'Erstelle deinen ersten Client und fang an zu arbeiten.'}
            </p>
            {!search && (
              <Link href="/client/new" style={{ background: '#111', color: '#fff', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600 }}>
                Ersten Client anlegen
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((client, i) => {
              const color = client.color || COLORS[i % COLORS.length]
              return (
                <Link key={client.id} href={`/client/${client.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: 14, border: '1px solid #ebebeb',
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
                  >
                    {/* Color bar */}
                    <div style={{ height: 4, background: color }} />
                    <div style={{ padding: '20px 22px 22px' }}>
                      {/* Avatar + name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color }}>
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{client.name}</div>
                          <div style={{ fontSize: 11.5, color: '#aaa', marginTop: 1 }}>{client.nische || 'Keine Nische'}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 99, background: client.status === 'Aktiv' ? '#22c55e' : '#f59e0b' }} />
                          <span style={{ fontSize: 11, color: '#bbb' }}>{client.status || 'Aktiv'}</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #f5f5f5', paddingTop: 14 }}>
                        {[
                          { label: 'MRR', value: client.retainer ? `€${Number(client.retainer).toLocaleString()}` : '—' },
                          { label: 'Start', value: client.start_date ? new Date(client.start_date).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }) : '—' },
                          { label: 'Modell', value: client.modell || '—' },
                        ].map((stat, si) => (
                          <div key={stat.label} style={{ flex: 1, textAlign: si === 0 ? 'left' : si === 2 ? 'right' : 'center' }}>
                            <div style={{ fontSize: 11, color: '#ccc', marginBottom: 2 }}>{stat.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Add new client card */}
            <Link href="/client/new" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'transparent', borderRadius: 14,
                border: '1.5px dashed #ddd', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 160, gap: 10,
                transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#aaa'; (e.currentTarget as HTMLElement).style.background = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ fontSize: 24, color: '#ccc' }}>+</div>
                <span style={{ fontSize: 13, color: '#bbb', fontWeight: 500 }}>Neuen Client hinzufügen</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
