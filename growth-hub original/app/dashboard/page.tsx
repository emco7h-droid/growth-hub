'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

interface Stats {
  activeClients: number
  totalRevenue: number
  openLeads: number
  wonLeads: number
  totalLeads: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ activeClients: 0, totalRevenue: 0, openLeads: 0, wonLeads: 0, totalLeads: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [recentClients, setRecentClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [{ data: clients }, { data: leads }] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    const allLeads = await supabase.from('leads').select('id, status')
    const activeClients = clients?.filter(c => c.status === 'Aktiv') || []
    const totalRevenue = activeClients.reduce((sum, c) => sum + (c.retainer || 0), 0)
    const openLeads = allLeads.data?.filter(l => l.status === 'Ausstehend').length || 0
    const wonLeads = allLeads.data?.filter(l => l.status === 'Gewonnen').length || 0
    const totalLeads = allLeads.data?.length || 0

    setStats({ activeClients: activeClients.length, totalRevenue, openLeads, wonLeads, totalLeads })
    setRecentLeads(leads || [])
    setRecentClients(activeClients.slice(0, 5))
    setLoading(false)
  }

  const convRate = stats.totalLeads > 0 ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Aktiv': 'badge-green', 'Interessiert': 'badge-blue',
      'Gewonnen': 'badge-green', 'Ausstehend': 'badge-amber',
      'Verloren': 'badge-red', 'No Show': 'badge-gray', 'Pausiert': 'badge-gray'
    }
    return <span className={map[status] || 'badge-gray'}>{status}</span>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Willkommen zurueck. Hier ist dein Ueberblick.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Aktive Clients', value: stats.activeClients, sub: 'Laufende Zusammenarbeiten' },
            { label: 'Monatlicher Umsatz', value: `€${stats.totalRevenue.toLocaleString('de-DE')}`, sub: 'Recurring Revenue' },
            { label: 'Offene Leads', value: stats.openLeads, sub: 'Warten auf Entscheidung' },
            { label: 'Conversion Rate', value: `${convRate}%`, sub: 'Lead zu Client' },
          ].map((m) => (
            <div key={m.label} className="card">
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : m.value}</div>
              <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Neueste Leads</h2>
              <Link href="/leads" className="text-xs text-brand-500 hover:underline">Alle anzeigen</Link>
            </div>
            {loading ? (
              <div className="text-gray-400 text-sm">Laden...</div>
            ) : recentLeads.length === 0 ? (
              <div className="text-gray-400 text-sm">Noch keine Leads vorhanden.</div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.nische || 'Keine Nische'}</div>
                    </div>
                    {statusBadge(lead.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Clients */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Aktive Clients</h2>
              <Link href="/clients" className="text-xs text-brand-500 hover:underline">Alle anzeigen</Link>
            </div>
            {loading ? (
              <div className="text-gray-400 text-sm">Laden...</div>
            ) : recentClients.length === 0 ? (
              <div className="text-gray-400 text-sm">Noch keine aktiven Clients.</div>
            ) : (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-400">Monat {client.aktueller_monat}/3 · €{client.retainer}/Mo</div>
                    </div>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, (client.aktueller_monat / 3) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
