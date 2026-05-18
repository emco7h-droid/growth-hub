'use client'
import Link from 'next/link'

type CheckItem = { label: string; done: boolean; href: string; desc: string }

export function OnboardingChecklist({ clientId, checks }: { clientId: string; checks: CheckItem[] }) {
  const done = checks.filter(c => c.done).length
  const pct = Math.round((done / checks.length) * 100)

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eaeaea', padding: '28px', maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🚀</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Workspace einrichten</h2>
        <p style={{ fontSize: 13, color: '#aaa' }}>Erledige diese Schritte um loszulegen</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#888' }}>{done} von {checks.length} erledigt</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: '#f0f0ee', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: pct === 100 ? '#22c55e' : '#6366f1', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {checks.map((c, i) => (
          <Link key={i} href={c.done ? '#' : c.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1px solid ${c.done ? '#d1fae5' : '#eaeaea'}`, background: c.done ? '#f0fdf4' : '#fff', transition: 'all 0.15s', cursor: c.done ? 'default' : 'pointer' }}
              onMouseEnter={e => { if (!c.done) (e.currentTarget as HTMLElement).style.background = '#f7f7f5' }}
              onMouseLeave={e => { if (!c.done) (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 99, background: c.done ? '#22c55e' : '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {c.done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>{i + 1}</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: c.done ? '#16a34a' : '#1a1a1a', textDecoration: c.done ? 'line-through' : 'none', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{c.desc}</div>
              </div>
              {!c.done && <div style={{ marginLeft: 'auto', fontSize: 14, color: '#ccc', alignSelf: 'center' }}>→</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
