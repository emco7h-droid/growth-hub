'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '🎯' },
  { href: '/clients', label: 'Clients', icon: '👥' },
  { href: '/emails', label: 'Email Sequenz', icon: '📧' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-64 min-h-screen bg-brand-900 text-white flex flex-col">
      <div className="p-6 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-sm">G</div>
          <div>
            <div className="font-semibold text-sm">Growth Operator Hub</div>
            <div className="text-xs text-brand-100 opacity-60">Alex Heidrich</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-brand-500 text-white'
                : 'text-brand-100 opacity-70 hover:opacity-100 hover:bg-brand-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-700">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-100 opacity-70 hover:opacity-100 hover:bg-brand-700 transition-colors"
        >
          <span>🚪</span>
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  )
}
