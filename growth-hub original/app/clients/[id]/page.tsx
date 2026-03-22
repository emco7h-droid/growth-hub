'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useParams } from 'next/navigation'

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState<any>(null)
  const [kpis, setKpis] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('uebersicht')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({ woche: '', erledigt: '', nicht_funktioniert: '', plan_naechste_woche: '', zahlen_notizen: '' })

  useEffect(() => { loadData() }, [params.id])

  async function loadData() {
    const [{ data: clientData }, { data: kpiData }, { data: updateData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', params.id).single(),
      supabase.from('kpis').select('*').eq('client_id', params.id).order('monat', { ascending: false }),
      supabase.from('weekly_updates').select('*').eq('client_id', params.id).order('woche', { ascending: false }),
    ])
    setClient(clientData)
    setKpis(kpiData || [])
    setUpdates(updateData || [])
    setLoading(false)
  }

  async function saveUpdate() {
    await supabase.from('weekly_updates').insert({ ...updateForm, client_id: params.id })
    setShowUpdateModal(false)
    setUpdateForm({ woche: '', erledigt: '', nicht_funktioniert: '', plan_naechste_woche: '', zahlen_notizen: '' })
    loadData()
  }

  async function updateMonth(monat: number) {
    await supabase.from('clients').update({ aktueller_monat: monat }).eq('id', params.id)
    loadData()
  }

  if (loading) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8"><div className="text-gray-400">Laden...</div></main></div>
  if (!client) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8"><div>Client nicht gefunden.</div></main></div>

  const tabs = ['uebersicht', 'kpis', 'updates', 'portal']

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <div className="text-gray-500 text-sm">{client.email} · {client.nische}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={client.status === 'Aktiv' ? 'badge-green' : 'badge-gray'}>{client.status}</span>
            <span className="text-sm font-semibold text-gray-900">€{(client.retainer || 0).toLocaleString('de-DE')}/Mo</span>
          </div>
        </div>

        {/* Progress */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">90-Tage Fortschritt</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(m => (
                <button
                  key={m}
                  onClick={() => updateMonth(m)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${client.aktueller_monat === m ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-500'}`}
                >
                  Monat {m}
                </button>
              ))}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (client.aktueller_monat / 3) * 100)}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {[['uebersicht', 'Uebersicht'], ['kpis', 'KPIs'], ['updates', 'Updates'], ['portal', 'Client Portal']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === key ? 'border-brand-700 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Uebersicht Tab */}
        {activeTab === 'uebersicht' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Ziele</h3>
              <div className="space-y-2">
                {[client.ziel_1, client.ziel_2, client.ziel_3].filter(Boolean).map((z: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-gray-700">{z}</span>
                  </div>
                ))}
                {!client.ziel_1 && !client.ziel_2 && !client.ziel_3 && <div className="text-gray-400 text-sm">Noch keine Ziele definiert.</div>}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Bottleneck und Quick Win</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Groesster Bottleneck</div>
                  <div className="text-sm text-gray-700">{client.bottleneck || 'Noch nicht definiert'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Quick Win</div>
                  <div className="text-sm text-gray-700">{client.quick_win || 'Noch nicht definiert'}</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Client Details</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Coaching Modell', client.coaching_modell],
                  ['Start Datum', client.start_datum || '-'],
                  ['Retainer', `€${(client.retainer || 0).toLocaleString('de-DE')}/Monat`],
                  ['Email', client.email],
                  ['Telefon', client.phone || '-'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Notizen</h3>
              <div className="text-sm text-gray-700">{client.notizen || 'Keine Notizen vorhanden.'}</div>
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowUpdateModal(true)} className="btn-primary">+ Update hinzufuegen</button>
            </div>
            {updates.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">Noch keine Updates vorhanden.</div>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u.id} className="card">
                    <div className="font-medium text-gray-900 mb-3">Woche: {u.woche}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><div className="text-xs text-gray-500 uppercase mb-1">Diese Woche erledigt</div><div className="text-gray-700">{u.erledigt || '-'}</div></div>
                      <div><div className="text-xs text-gray-500 uppercase mb-1">Nicht funktioniert</div><div className="text-gray-700">{u.nicht_funktioniert || '-'}</div></div>
                      <div><div className="text-xs text-gray-500 uppercase mb-1">Plan naechste Woche</div><div className="text-gray-700">{u.plan_naechste_woche || '-'}</div></div>
                      <div><div className="text-xs text-gray-500 uppercase mb-1">Zahlen</div><div className="text-gray-700">{u.zahlen_notizen || '-'}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portal Tab */}
        {activeTab === 'portal' && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Client Portal Zugang</h3>
            <p className="text-sm text-gray-500 mb-4">Der Client kann sich mit seiner Email anmelden und seinen eigenen Bereich sehen.</p>
            <div className="bg-brand-50 rounded-lg p-4 text-sm">
              <div className="font-medium text-brand-700 mb-1">Portal Link</div>
              <div className="text-brand-500 font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/portal/{client.id}</div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Um dem Client Zugang zu geben: In Supabase Auth einen User mit seiner Email erstellen und dann in der Tabelle client_portal_users verknuepfen.</p>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4">Neues Update</h2>
              <div className="space-y-3">
                <div><label className="block text-xs text-gray-500 mb-1">Woche (Datum)</label><input className="input" type="date" value={updateForm.woche} onChange={e => setUpdateForm({...updateForm, woche: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Diese Woche erledigt</label><textarea className="input" rows={3} value={updateForm.erledigt} onChange={e => setUpdateForm({...updateForm, erledigt: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Was nicht funktioniert hat</label><textarea className="input" rows={2} value={updateForm.nicht_funktioniert} onChange={e => setUpdateForm({...updateForm, nicht_funktioniert: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Plan naechste Woche</label><textarea className="input" rows={2} value={updateForm.plan_naechste_woche} onChange={e => setUpdateForm({...updateForm, plan_naechste_woche: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Aktuelle Zahlen</label><textarea className="input" rows={2} value={updateForm.zahlen_notizen} onChange={e => setUpdateForm({...updateForm, zahlen_notizen: e.target.value})} /></div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => setShowUpdateModal(false)} className="btn-secondary">Abbrechen</button>
                <button onClick={saveUpdate} className="btn-primary">Speichern</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
