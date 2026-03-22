'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  nische: string
  call_datum: string
  status: string
  notizen: string
  source: string
}

const STATUS_OPTIONS = ['Ausstehend', 'Interessiert', 'Gewonnen', 'Verloren', 'No Show']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', nische: '', call_datum: '', status: 'Ausstehend', notizen: '' })

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function saveLead() {
    if (selectedLead) {
      await supabase.from('leads').update(form).eq('id', selectedLead.id)
    } else {
      await supabase.from('leads').insert(form)
    }
    setShowModal(false)
    setSelectedLead(null)
    setForm({ name: '', email: '', phone: '', nische: '', call_datum: '', status: 'Ausstehend', notizen: '' })
    loadLeads()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id)
    loadLeads()
  }

  async function deleteLead(id: string) {
    if (!confirm('Lead loeschen?')) return
    await supabase.from('leads').delete().eq('id', id)
    loadLeads()
  }

  function openEdit(lead: Lead) {
    setSelectedLead(lead)
    setForm({ name: lead.name, email: lead.email, phone: lead.phone || '', nische: lead.nische || '', call_datum: lead.call_datum || '', status: lead.status, notizen: lead.notizen || '' })
    setShowModal(true)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Gewonnen': 'badge-green', 'Ausstehend': 'badge-amber',
      'Interessiert': 'badge-blue', 'Verloren': 'badge-red', 'No Show': 'badge-gray'
    }
    return <span className={map[status] || 'badge-gray'}>{status}</span>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500 text-sm mt-1">Alle Discovery Call Anfragen</p>
          </div>
          <button onClick={() => { setSelectedLead(null); setForm({ name: '', email: '', phone: '', nische: '', call_datum: '', status: 'Ausstehend', notizen: '' }); setShowModal(true) }} className="btn-primary">
            + Lead hinzufuegen
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Nische', 'Call Datum', 'Quelle', 'Status', 'Aktionen'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Laden...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Noch keine Leads. Klick auf + Lead hinzufuegen.</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{lead.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{lead.nische || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{lead.call_datum || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{lead.source || 'Calendly'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(lead)} className="text-xs text-brand-500 hover:underline">Bearbeiten</button>
                      <button onClick={() => deleteLead(lead.id)} className="text-xs text-red-500 hover:underline">Loeschen</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4">{selectedLead ? 'Lead bearbeiten' : 'Neuer Lead'}</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email *</label>
                    <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Telefon</label>
                    <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nische</label>
                    <input className="input" value={form.nische} onChange={e => setForm({...form, nische: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Call Datum</label>
                    <input className="input" type="date" value={form.call_datum} onChange={e => setForm({...form, call_datum: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notizen</label>
                  <textarea className="input" rows={3} value={form.notizen} onChange={e => setForm({...form, notizen: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Abbrechen</button>
                <button onClick={saveLead} className="btn-primary">Speichern</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
