'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Upload,
  LogOut,
  GraduationCap,
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth-context'

const NAV_ITEMS = [
  { href: '/teacher/dashboard',           label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/teacher/dashboard/groups',    label: 'My Groups',   icon: Users },
  { href: '/teacher/dashboard/upload',    label: 'Mass Upload', icon: Upload },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { teacher, logout } = useTeacherAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!teacher) router.replace('/teacher/login')
  }, [teacher, router])

  if (!teacher) return null

  const handleLogout = () => {
    logout()
    router.push('/teacher/login')
  }

  return (
    <div className="min-h-screen flex bg-[#f5e6ff]" style={{ background: 'linear-gradient(135deg, #f5e6ff 0%, #fce7f3 100%)' }}>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white/80 backdrop-blur-sm border-r border-purple-100 shadow-sm">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-purple-100">
          <span className="text-2xl font-bold italic text-purple-900 tracking-tight">TUTRLY</span>
          <p className="text-xs text-purple-500 mt-0.5">Teacher Portal</p>
        </div>

        {/* Teacher info */}
        <div className="px-6 py-4 border-b border-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 leading-tight">{teacher.name}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/teacher/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-purple-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold italic text-purple-900">TUTRLY</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 flex z-50">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/teacher/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all ${
                  active ? 'text-purple-700' : 'text-purple-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-purple-400'}`} />
                {label}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-red-400"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  )
}
