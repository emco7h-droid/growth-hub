'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  nische: string
  coaching_modell: string
  retainer: number
  start_datum: string
  aktueller_monat: number
  status: string
  ziel_1: string
  ziel_2: string
  ziel_3: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nische: '', coaching_modell: '1 zu 1 Coaching',
    retainer: '', start_datum: '', aktueller_monat: '1', status: 'Aktiv',
    ziel_1: '', ziel_2: '', ziel_3: '', bottleneck: '', quick_win: '', notizen: ''
  })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function saveClient() {
    await supabase.from('clients').insert({
      ...form,
      retainer: parseFloat(form.retainer) || 0,
      aktueller_monat: parseInt(form.aktueller_monat) || 1
    })
    setShowModal(false)
    setForm({ name: '', email: '', phone: '', nische: '', coaching_modell: '1 zu 1 Coaching', retainer: '', start_datum: '', aktueller_monat: '1', status: 'Aktiv', ziel_1: '', ziel_2: '', ziel_3: '', bottleneck: '', quick_win: '', notizen: '' })
    loadClients()
  }

  async function deleteClient(id: string) {
    if (!confirm('Client loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.')) return
    await supabase.from('clients').delete().eq('id', id)
    loadClients()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Alle aktiven Zusammenarbeiten</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Client hinzufuegen
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400">Laden...</div>
        ) : clients.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Noch keine Clients</h3>
            <p className="text-gray-500 text-sm mb-4">Fuege deinen ersten Client hinzu oder gewinne einen Lead.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">+ Client hinzufuegen</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/clients/${client.id}`} className="font-semibold text-gray-900 hover:text-brand-500">
                        {client.name}
                      </Link>
                      <div className="text-sm text-gray-500">{client.nische} · {client.coaching_modell}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">€{(client.retainer || 0).toLocaleString('de-DE')}/Mo</div>
                      <div className="text-xs text-gray-400">Monat {client.aktueller_monat}/3</div>
                    </div>
                    <span className={client.status === 'Aktiv' ? 'badge-green' : client.status === 'Pausiert' ? 'badge-amber' : 'badge-gray'}>
                      {client.status}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/clients/${client.id}`} className="btn-secondary text-xs py-1.5">Details</Link>
                      <button onClick={() => deleteClient(client.id)} className="text-xs text-red-500 hover:underline">Loeschen</button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Fortschritt</span>
                    <span>Monat {client.aktueller_monat} von 3</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (client.aktueller_monat / 3) * 100)}%` }} />
                  </div>
                </div>
                {(client.ziel_1 || client.ziel_2 || client.ziel_3) && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {[client.ziel_1, client.ziel_2, client.ziel_3].filter(Boolean).map((z, i) => (
                      <span key={i} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{z}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-4">
              <h2 className="text-lg font-semibold mb-4">Neuer Client</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-500 mb-1">Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-500 mb-1">Nische</label><input className="input" value={form.nische} onChange={e => setForm({...form, nische: e.target.value})} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Coaching Modell</label>
                    <select className="input" value={form.coaching_modell} onChange={e => setForm({...form, coaching_modell: e.target.value})}>
                      {['1 zu 1 Coaching', 'Group Coaching', 'Community', 'Online Kurs', 'Done For You'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs text-gray-500 mb-1">Retainer (€/Mo)</label><input className="input" type="number" value={form.retainer} onChange={e => setForm({...form, retainer: e.target.value})} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Startdatum</label><input className="input" type="date" value={form.start_datum} onChange={e => setForm({...form, start_datum: e.target.value})} /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Aktueller Monat</label>
                    <select className="input" value={form.aktueller_monat} onChange={e => setForm({...form, aktueller_monat: e.target.value})}>
                      <option value="1">Monat 1</option><option value="2">Monat 2</option><option value="3">Monat 3</option>
                    </select>
                  </div>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1">Ziel 1</label><input className="input" value={form.ziel_1} onChange={e => setForm({...form, ziel_1: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Ziel 2</label><input className="input" value={form.ziel_2} onChange={e => setForm({...form, ziel_2: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Ziel 3</label><input className="input" value={form.ziel_3} onChange={e => setForm({...form, ziel_3: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Groesster Bottleneck</label><input className="input" value={form.bottleneck} onChange={e => setForm({...form, bottleneck: e.target.value})} /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Quick Win (erste 2 Wochen)</label><input className="input" value={form.quick_win} onChange={e => setForm({...form, quick_win: e.target.value})} /></div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Abbrechen</button>
                <button onClick={saveClient} className="btn-primary">Speichern</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
