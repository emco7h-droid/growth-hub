export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', overflow: 'hidden', padding: '18px 20px 20px' }}>
      <div style={{ height: 4, background: '#f0f0ee', marginBottom: 18 }} />
      <div style={{ display: 'flex', gap: 11, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: '40%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 1, marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ flex: 1, height: 28 }} />
        <div className="skeleton" style={{ flex: 1, height: 28 }} />
        <div className="skeleton" style={{ flex: 1, height: 28 }} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 12 }}>
        {[140, 120, 80, 100, 80].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 11, width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '13px 16px', borderBottom: '1px solid #f9f9f9', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0 }} />
          <div className="skeleton" style={{ height: 13, width: 140 }} />
          <div className="skeleton" style={{ height: 13, width: 120 }} />
          <div className="skeleton" style={{ height: 13, width: 80 }} />
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eaeaea', padding: '20px 22px', display: 'flex', gap: 14 }}>
          <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 11, width: '70%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 24, width: '50%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
