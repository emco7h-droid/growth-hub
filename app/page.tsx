'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SkeletonCard, SkeletonStats } from '@/components/Skeleton'

function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }
  return (
    <button onClick={logout} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#888' }}>
      Abmelden
    </button>
  )
}

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

function dateStr() {
  return new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function HomePage() {
  const [clients, setClients] = useState<any[]>([])
  const [stats, setStats] = useState({ mrr: 0, active: 0, tasks: 0 })
  const [openTasks, setOpenTasks] = useState<any[]>([])
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return }
      load()
    })
  }, [])

  async function load() {
    const { data: ws } = await supabase.from('workspaces').select('*').order('created_at', { ascending: false })
    const list = ws || []
    setClients(list)
    const mrr = list.reduce((s: number, c: any) => s + (Number(c.retainer) || 0), 0)
    const active = list.filter((c: any) => c.status === 'Aktiv' || !c.status).length
    const { data: taskData, count } = await supabase.from('tasks').select('*, workspaces(name, color)', { count: 'exact' }).neq('status', 'Erledigt').order('faellig', { ascending: true }).limit(5)
    const { data: leadData } = await supabase.from('leads').select('*, workspaces(name, color)').order('created_at', { ascending: false }).limit(6)
    setStats({ mrr, active, tasks: count || 0 })
    setOpenTasks(taskData || [])
    setRecentLeads(leadData || [])
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || (c.nische || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      {/* Topnav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eaeaea', height: 54, display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>GH</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>Growth Hub</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..." className="gh-input" style={{ width: 200, paddingLeft: 32 }} />
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <Link href="/client/new" className="btn-primary">+ Neuer Client</Link>
          <LogoutButton />
        </div>
      </div>

      <div style={{ padding: '32px 28px 48px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Greeting */}
        <div className="animate-card" style={{ marginBottom: 28, animationDelay: '0s' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: 4 }}>
            {greeting()}, Alex 👋
          </h1>
          <p style={{ fontSize: 13.5, color: '#999' }}>{dateStr()}</p>
        </div>

        {/* Stats */}
        <div className="animate-card stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32, animationDelay: '0.05s' }}>
          {loading ? <SkeletonStats /> : <>
            {[
              { label: 'Aktive Clients', value: stats.active, sub: `${clients.length} Gesamt`, icon: '◎', color: '#6366f1' },
              { label: 'Monatlicher MRR', value: `€${stats.mrr.toLocaleString('de')}`, sub: 'Gesamt Retainer', icon: '◈', color: '#22c55e' },
              { label: 'Offene Aufgaben', value: stats.tasks, sub: 'Zu erledigen', icon: '○', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={s.label} className="animate-card" style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', animationDelay: `${0.1 + i * 0.05}s` }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#bbb', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11.5, color: '#bbb', marginTop: 3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </>}
        </div>

        {/* Clients header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>Deine Clients</h2>
          <span style={{ fontSize: 12, color: '#bbb' }}>{filtered.length} {filtered.length === 1 ? 'Client' : 'Clients'}</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="client-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 && !search ? (
          <div className="animate-fade" style={{ textAlign: 'center', padding: 72, background: '#fff', borderRadius: 16, border: '1.5px dashed #e0e0e0' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>◈</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Noch keine Clients</div>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 22, maxWidth: 300, margin: '0 auto 22px' }}>Erstelle deinen ersten Client und starte die Zusammenarbeit.</p>
            <Link href="/client/new" className="btn-primary" style={{ display: 'inline-block' }}>Ersten Client anlegen</Link>
          </div>
        ) : (
          <div className="client-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map((c, i) => {
              const color = c.color || COLORS[i % COLORS.length]
              return (
                <Link key={c.id} href={`/client/${c.id}`}>
                  <div className="animate-card" style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.12s', animationDelay: `${i * 0.06}s` }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; el.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none' }}
                  >
                    <div style={{ height: 4, background: color }} />
                    <div style={{ padding: '16px 18px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                          {c.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                          <div style={{ fontSize: 11.5, color: '#bbb', marginTop: 1 }}>{c.nische || 'Keine Nische'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 99, background: (!c.status || c.status === 'Aktiv') ? '#22c55e' : '#f59e0b' }} />
                          <span style={{ fontSize: 10.5, color: '#bbb' }}>{c.status || 'Aktiv'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', borderTop: '1px solid #f5f5f5', paddingTop: 12 }}>
                        {[
                          { label: 'MRR', value: c.retainer ? `€${Number(c.retainer).toLocaleString('de')}` : '—' },
                          { label: 'Modell', value: c.modell || '—' },
                          { label: 'Start', value: c.start_date ? new Date(c.start_date).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }) : '—' },
                        ].map((s, si) => (
                          <div key={s.label} style={{ flex: 1, textAlign: si === 0 ? 'left' : si === 2 ? 'right' : 'center' }}>
                            <div style={{ fontSize: 10, color: '#ccc', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            <Link href="/client/new">
              <div className="animate-card" style={{ background: 'transparent', borderRadius: 14, border: '1.5px dashed #ddd', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 148, gap: 8, transition: 'all 0.15s', animationDelay: `${filtered.length * 0.06}s` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#999'; el.style.background = '#fff' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#ddd'; el.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 22, color: '#ccc' }}>+</span>
                <span style={{ fontSize: 12.5, color: '#bbb', fontWeight: 500 }}>Neuen Client hinzufügen</span>
              </div>
            </Link>
          </div>
        )}

        {/* Bottom section: Tasks + Recent Leads */}
        {!loading && (openTasks.length > 0 || recentLeads.length > 0) && (
          <div className="animate-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28, animationDelay: '0.3s' }}>
            {/* Open Tasks */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Offene Aufgaben</h3>
                <span style={{ fontSize: 11.5, color: '#bbb' }}>{stats.tasks} offen</span>
              </div>
              {openTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#ccc', fontSize: 13 }}>Keine offenen Aufgaben 🎉</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {openTasks.map((t: any) => {
                    const overdue = t.faellig && new Date(t.faellig) < new Date()
                    const color = t.workspaces?.color || '#6366f1'
                    const prioColor: any = { Hoch: '#ef4444', Mittel: '#f59e0b', Niedrig: '#22c55e' }
                    return (
                      <Link key={t.id} href={`/client/${t.workspace_id}/tasks`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: '#f9f9f9', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f9f9f9'}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: prioColor[t.prioritaet] || '#ddd', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titel}</div>
                          <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{t.workspaces?.name}</div>
                        </div>
                        {t.faellig && (
                          <span style={{ fontSize: 11, color: overdue ? '#ef4444' : '#bbb', fontWeight: overdue ? 600 : 400, flexShrink: 0 }}>
                            {new Date(t.faellig).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Leads */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Neueste Leads</h3>
                <span style={{ fontSize: 11.5, color: '#bbb' }}>Alle Clients</span>
              </div>
              {recentLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#ccc', fontSize: 13 }}>Noch keine Leads eingegangen</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentLeads.map((l: any) => {
                    const color = l.workspaces?.color || '#6366f1'
                    const statusBg: any = { Neu: '#f0f9ff', Gewonnen: '#f0fdf4', Verloren: '#fef2f2', 'In Bearbeitung': '#fefce8' }
                    const statusC: any = { Neu: '#0ea5e9', Gewonnen: '#16a34a', Verloren: '#dc2626', 'In Bearbeitung': '#ca8a04' }
                    return (
                      <Link key={l.id} href={`/client/${l.workspace_id}/leads`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: '#f9f9f9', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f9f9f9'}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 99, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
                          {l.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{l.workspaces?.name} · {l.quelle}</div>
                        </div>
                        <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, fontWeight: 600, background: statusBg[l.status] || '#f5f5f5', color: statusC[l.status] || '#888', flexShrink: 0 }}>{l.status}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
