'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

const empty = {name:'',email:'',phone:'',instagram:'',nische:'',modell:'1 zu 1',retainer:0,startdatum:'',monat:1,naechster_call:'',status:'Aktiv',ziel_1:'',ziel_2:'',ziel_3:'',bottleneck:'',quick_win:'',notizen:'',website:'',zahlungsanbieter:''}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [sel, setSel] = useState(null)
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState(empty)
  const router = useRouter()

  useEffect(() => { supabase.auth.getSession().then(({ data: { session } }) => { if (!session) { router.push('/login'); return }; load() }) }, [])
  const load = async () => { const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false }); setClients(data || []); setLoading(false) }
  const save = async () => { if (!form.name.trim()) return; await supabase.from('clients').insert([{ ...form, retainer: parseFloat(form.retainer) || 0 }]); setModal(false); setForm(empty); load() }
  const del = async (id) => { if (!confirm('Client loeschen?')) return; await supabase.from('clients').delete().eq('id', id); setSel(null); load() }
  const upd = async (id, field, val) => { await supabase.from('clients').update({ [field]: val }).eq('id', id); load(); if (sel?.id === id) setSel({ ...sel, [field]: val }) }

  const active = clients.filter(c => c.status === 'Aktiv')
  const totalRev = active.reduce((s, c) => s + (c.retainer || 0), 0)

  const statusColor = { 'Aktiv': ['#e0f5ee', '#0a7c59'], 'Beendet': ['#f4f6f8', '#5c6370'], 'Pause': ['#fff8e1', '#b7860b'] }

  const Pill = ({ s }) => { const [bg, c] = statusColor[s] || ['#f4f6f8', '#9ba1ab']; return <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>{s}</span> }

  const InfoRow = ({ l, v, editable, field, type = 'text' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f0f2f5' }}>
      <span style={{ fontSize: 12.5, color: '#5c6370', flex: '0 0 140px' }}>{l}</span>
      {editable ? (
        <input defaultValue={v || ''} onBlur={e => upd(sel.id, field, e.target.value)} type={type}
          style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e', textAlign: 'right', background: 'transparent', flex: 1, fontFamily: 'inherit' }} placeholder="—" />
      ) : (
        <span style={{ fontSize: 13, fontWeight: 500, color: v ? '#1a1a2e' : '#c5ccd4' }}>{v || '—'}</span>
      )}
    </div>
  )

  const MilestoneRow = ({ monat, current }) => {
    const done = current >= monat
    const active = current === monat
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f2f5' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#0a7c59' : active ? '#1565c0' : '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : '#9ba1ab' }}>{monat}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: done ? '#0a7c59' : active ? '#1565c0' : '#5c6370', fontWeight: active ? 600 : 400 }}>
            Monat {monat} {active ? '← Aktuell' : done ? '✓ Abgeschlossen' : ''}
          </span>
        </div>
        <Pill s={done ? 'Aktiv' : active ? 'Aktiv' : 'Pause'} />
      </div>
    )
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="tb-l">
            <span className="tb-title">{sel ? sel.name : 'Clients'}</span>
            {sel && <button className="btn-s" style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={() => setSel(null)}>← Alle Clients</button>}
          </div>
          <div className="tb-r">
            {!sel && <button className="btn-p" onClick={() => setModal(true)}>+ Client hinzufuegen</button>}
            {sel && <button className="btn-s" style={{ fontSize: 12 }} onClick={() => del(sel.id)}>Client loeschen</button>}
          </div>
        </div>

        <div className="page">
          {!sel ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[['Aktive Clients', active.length, '#1565c0'], ['Monatl. Umsatz', `€${totalRev.toLocaleString('de-DE')}`, '#0a7c59'], ['Ø Retainer', active.length ? `€${Math.round(totalRev / active.length).toLocaleString('de-DE')}` : '—', '#6b4bc8']].map(([l, v, c]) => (
                  <div key={l} className="metric" style={{ padding: '16px 20px' }}>
                    <div className="m-lbl">{l}</div>
                    <div className="m-val" style={{ color: c, fontSize: 28 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                {loading ? <div className="empty"><p>Laden...</p></div> : clients.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 6 }}>Noch keine Clients</div>
                    <div style={{ fontSize: 13, color: '#9ba1ab', marginBottom: 20 }}>Fuege deinen ersten Client hinzu um loszulegen</div>
                    <button className="btn-p" onClick={() => setModal(true)}>+ Ersten Client hinzufuegen</button>
                  </div>
                ) : (
                  <div className="tw">
                    <table>
                      <thead><tr><th>Name</th><th>Nische</th><th>Modell</th><th>Retainer</th><th>Fortschritt</th><th>Naechster Call</th><th>Status</th></tr></thead>
                      <tbody>
                        {clients.map(c => (
                          <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setSel(c); setTab('info') }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: c.status === 'Aktiv' ? '#1565c0' : '#9ba1ab', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{c.name?.slice(0, 2).toUpperCase()}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                                  <div style={{ fontSize: 11, color: '#9ba1ab' }}>{c.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: 12.5, color: '#5c6370' }}>{c.nische || '—'}</td>
                            <td><span style={{ background: '#e3f0ff', color: '#1565c0', padding: '2px 8px', borderRadius: 20, fontSize: 11.5 }}>{c.modell}</span></td>
                            <td style={{ fontWeight: 700, color: '#0a7c59', fontSize: 15 }}>€{(c.retainer || 0).toLocaleString('de-DE')}</td>
                            <td style={{ minWidth: 130 }}>
                              <div style={{ fontSize: 11, color: '#9ba1ab', marginBottom: 4 }}>Monat {c.monat || 1} von 3</div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {[1, 2, 3].map(m => <div key={m} style={{ flex: 1, height: 5, borderRadius: 3, background: (c.monat || 1) >= m ? '#1565c0' : '#e1e4e8' }} />)}
                              </div>
                            </td>
                            <td style={{ fontSize: 12, color: c.naechster_call ? '#1565c0' : '#9ba1ab' }}>{c.naechster_call ? new Date(c.naechster_call).toLocaleDateString('de-DE') : '—'}</td>
                            <td><Pill s={c.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#fff', borderRadius: 8, padding: 4, border: '1px solid #e1e4e8', width: 'fit-content' }}>
                {[['info', 'Client Info'], ['ziele', 'Ziele & Plan'], ['kpis', 'Kennzahlen'], ['updates', 'Updates'], ['calls', 'Call Protokolle']].map(([t, l]) => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, background: tab === t ? '#1565c0' : 'transparent', color: tab === t ? '#fff' : '#5c6370', fontFamily: 'inherit', transition: 'all .12s' }}>{l}</button>
                ))}
              </div>

              {tab === 'info' && (
                <div className="g2">
                  <div>
                    <div className="card" style={{ marginBottom: 14 }}>
                      <div className="ch"><div className="ct">Client Info</div><Pill s={sel.status} /></div>
                      <div style={{ padding: '0 20px' }}>
                        <InfoRow l="Name" v={sel.name} editable field="name" />
                        <InfoRow l="Email" v={sel.email} editable field="email" />
                        <InfoRow l="Telefon" v={sel.phone} editable field="phone" />
                        <InfoRow l="Instagram / TikTok" v={sel.instagram} editable field="instagram" />
                        <InfoRow l="Nische" v={sel.nische} editable field="nische" />
                        <InfoRow l="Coaching Modell" v={sel.modell} />
                        <InfoRow l="Retainer / Monat" v={sel.retainer ? `€${sel.retainer.toLocaleString('de-DE')}` : '—'} />
                        <InfoRow l="Startdatum" v={sel.startdatum ? new Date(sel.startdatum).toLocaleDateString('de-DE') : '—'} />
                        <InfoRow l="Naechster Call" v={sel.naechster_call} editable field="naechster_call" type="date" />
                      </div>
                    </div>
                    <div className="card">
                      <div className="ch"><div className="ct">Zugaenge & Tools</div></div>
                      <div style={{ padding: '0 20px' }}>
                        <InfoRow l="Website" v={sel.website} editable field="website" />
                        <InfoRow l="Zahlungsanbieter" v={sel.zahlungsanbieter} editable field="zahlungsanbieter" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="card" style={{ marginBottom: 14 }}>
                      <div className="ch"><div className="ct">Fortschritt</div><span style={{ fontSize: 12, color: '#1565c0', fontWeight: 600 }}>Monat {sel.monat || 1} / 3</span></div>
                      <div style={{ padding: '0 18px' }}>
                        {[1, 2, 3].map(m => <MilestoneRow key={m} monat={m} current={sel.monat || 1} />)}
                      </div>
                      <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f2f5' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[1, 2, 3].map(m => <button key={m} onClick={() => upd(sel.id, 'monat', m)} style={{ flex: 1, height: 30, border: `1px solid ${(sel.monat || 1) === m ? '#1565c0' : '#e1e4e8'}`, borderRadius: 6, fontSize: 12, cursor: 'pointer', background: (sel.monat || 1) === m ? '#1565c0' : '#fff', color: (sel.monat || 1) === m ? '#fff' : '#5c6370', fontFamily: 'inherit' }}>Monat {m}</button>)}
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="ch"><div className="ct">Notizen</div></div>
                      <div style={{ padding: '12px 18px' }}>
                        <textarea defaultValue={sel.notizen || ''} onBlur={e => upd(sel.id, 'notizen', e.target.value)} rows={5} style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="Notizen zum Client..." />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'ziele' && (
                <div className="g2">
                  <div className="card">
                    <div className="ch"><div className="ct">90-Tage Ziele</div></div>
                    <div className="cb">
                      {[['ziel_1', 'Ziel 1'], ['ziel_2', 'Ziel 2'], ['ziel_3', 'Ziel 3']].map(([f, l], i) => (
                        <div key={f} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: sel[f] ? '#e3f0ff' : '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: sel[f] ? '#1565c0' : '#9ba1ab', flexShrink: 0, marginTop: 4 }}>{i + 1}</div>
                          <input defaultValue={sel[f] || ''} onBlur={e => upd(sel.id, f, e.target.value)} style={{ border: 'none', borderBottom: '1px solid #f0f2f5', outline: 'none', fontSize: 13.5, padding: '4px 0', flex: 1, fontFamily: 'inherit', background: 'transparent' }} placeholder={`${l} eintragen...`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="card" style={{ marginBottom: 14 }}>
                      <div className="ch"><div className="ct">Bottleneck & Quick Win</div></div>
                      <div className="cb">
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Groesster Bottleneck</div>
                          <textarea defaultValue={sel.bottleneck || ''} onBlur={e => upd(sel.id, 'bottleneck', e.target.value)} rows={3} style={{ width: '100%', border: '1px solid #f0f2f5', borderRadius: 6, outline: 'none', fontSize: 13, padding: '8px 10px', fontFamily: 'inherit', resize: 'none', background: '#fff7f7' }} placeholder="Was haelt den Client am meisten zurueck?" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#0a7c59', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Quick Win (erste 2 Wochen)</div>
                          <textarea defaultValue={sel.quick_win || ''} onBlur={e => upd(sel.id, 'quick_win', e.target.value)} rows={3} style={{ width: '100%', border: '1px solid #f0f2f5', borderRadius: 6, outline: 'none', fontSize: 13, padding: '8px 10px', fontFamily: 'inherit', resize: 'none', background: '#f7fff9' }} placeholder="Was kann in den ersten 2 Wochen verbessert werden?" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'kpis' && (
                <div className="card">
                  <div className="ch"><div className="ct">Kennzahlen Baseline</div><a href="/kpis" style={{ fontSize: 12.5, color: '#1565c0', fontWeight: 500 }}>Vollstaendiger KPI Tracker →</a></div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Kennzahl</th><th>Baseline (Start)</th><th>Aktuell</th><th>Ziel 90 Tage</th></tr></thead>
                      <tbody>
                        {[['Follower Instagram', '#'], ['Follower TikTok', '#'], ['Monatlicher Umsatz', '€'], ['Neue Kunden / Monat', '#'], ['Email Subscriber', '#'], ['Open Rate', '%'], ['Conversion Rate', '%'], ['Engagement Rate', '%']].map(([n]) => (
                          <tr key={n}><td style={{ fontWeight: 500, color: '#5c6370' }}>{n}</td><td><input style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', width: 80, background: 'transparent' }} placeholder="—" /></td><td><input style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', width: 80, background: 'transparent' }} placeholder="—" /></td><td><input style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', width: 80, background: 'transparent' }} placeholder="—" /></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'updates' && (
                <div className="card">
                  <div className="ch"><div className="ct">Woechentliche Updates</div></div>
                  <div className="cb">
                    {[1, 2, 3, 4].map(w => (
                      <div key={w} style={{ background: '#f4f6f8', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>Update Woche {w}</div>
                        {[['Diese Woche erledigt:', '#0a7c59'], ['Was nicht funktioniert hat:', '#c0392b'], ['Plan naechste Woche:', '#1565c0']].map(([l, c]) => (
                          <div key={l} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: c, marginBottom: 4 }}>{l}</div>
                            <textarea rows={2} style={{ width: '100%', border: '1px solid #e1e4e8', borderRadius: 6, outline: 'none', fontSize: 13, padding: '6px 10px', fontFamily: 'inherit', resize: 'none', background: '#fff' }} placeholder="Hier eintragen..." />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'calls' && (
                <div className="card">
                  <div className="ch"><div className="ct">Call Protokolle</div></div>
                  <div className="cb">
                    {[['Onboarding Call', '#0a7c59'], ['Strategy Call 1', '#1565c0'], ['Monthly Review 1', '#6b4bc8'], ['Strategy Call 2', '#1565c0']].map(([n, c]) => (
                      <div key={n} style={{ border: `1px solid ${c}20`, background: `${c}08`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: c }}>{n}</span>
                          <input type="date" style={{ border: 'none', outline: 'none', fontSize: 12, color: '#9ba1ab', background: 'transparent', fontFamily: 'inherit' }} />
                        </div>
                        {[['Wichtigste Erkenntnisse:', 3], ['Vereinbarte Aufgaben:', 2]].map(([l, r]) => (
                          <div key={l} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#5c6370', marginBottom: 4 }}>{l}</div>
                            <textarea rows={r} style={{ width: '100%', border: '1px solid #e1e4e8', borderRadius: 6, outline: 'none', fontSize: 13, padding: '6px 10px', fontFamily: 'inherit', resize: 'none', background: '#fff' }} placeholder="Hier eintragen..." />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <div className="mo" onClick={() => setModal(false)}>
          <div className="md" onClick={e => e.stopPropagation()}>
            <div className="mh"><span className="mt">Neuer Client</span><span className="mx" onClick={() => setModal(false)}>×</span></div>
            <div className="mb">
              <div className="fr"><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="fg"><label className="fl">Email</label><input className="fi" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div></div>
              <div className="fr"><div className="fg"><label className="fl">Telefon</label><input className="fi" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div><div className="fg"><label className="fl">Instagram / TikTok</label><input className="fi" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} /></div></div>
              <div className="fr"><div className="fg"><label className="fl">Nische</label><input className="fi" value={form.nische} onChange={e => setForm({ ...form, nische: e.target.value })} placeholder="Trading, Fitness, Coaching..." /></div><div className="fg"><label className="fl">Coaching Modell</label><select className="fsel" value={form.modell} onChange={e => setForm({ ...form, modell: e.target.value })}><option>1 zu 1</option><option>Group Coaching</option><option>Community</option><option>Kurs</option></select></div></div>
              <div className="fr"><div className="fg"><label className="fl">Retainer (€/Mo)</label><input className="fi" type="number" value={form.retainer} onChange={e => setForm({ ...form, retainer: e.target.value })} /></div><div className="fg"><label className="fl">Startdatum</label><input className="fi" type="date" value={form.startdatum} onChange={e => setForm({ ...form, startdatum: e.target.value })} /></div></div>
              <div className="fg"><label className="fl">Ziel 1 (90 Tage)</label><input className="fi" value={form.ziel_1} onChange={e => setForm({ ...form, ziel_1: e.target.value })} placeholder="Konkretes messbares Ziel..." /></div>
              <div className="fr"><div className="fg"><label className="fl">Ziel 2</label><input className="fi" value={form.ziel_2} onChange={e => setForm({ ...form, ziel_2: e.target.value })} /></div><div className="fg"><label className="fl">Ziel 3</label><input className="fi" value={form.ziel_3} onChange={e => setForm({ ...form, ziel_3: e.target.value })} /></div></div>
              <div className="fr"><div className="fg"><label className="fl">Bottleneck</label><input className="fi" value={form.bottleneck} onChange={e => setForm({ ...form, bottleneck: e.target.value })} /></div><div className="fg"><label className="fl">Quick Win</label><input className="fi" value={form.quick_win} onChange={e => setForm({ ...form, quick_win: e.target.value })} /></div></div>
            </div>
            <div className="mf"><button className="btn-s" onClick={() => { setModal(false); setForm(empty) }}>Abbrechen</button><button className="btn-p" onClick={save}>Client speichern</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
