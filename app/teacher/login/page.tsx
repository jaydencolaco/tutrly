'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth-context'

export default function TeacherLoginPage() {
  const { login } = useTeacherAuth()
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    // Small artificial delay for UX
    await new Promise((r) => setTimeout(r, 400))
    const success = login(phone.trim(), password)
    setLoading(false)

    if (!success) {
      setError('Invalid credentials. Please try again.')
      return
    }

    router.push('/teacher/dashboard')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background circles */}
      <div className="circle-1" style={{ top: '-200px', left: '-200px' }} />
      <div className="circle-2" style={{ bottom: '-100px', right: '-150px' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-4xl font-bold italic text-purple-900 tracking-tight">TUTRLY</span>
          <p className="text-purple-600 mt-2 font-medium">Teacher Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-900">Sign in</h1>
                <p className="text-sm text-purple-500">Access your teacher dashboard</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-purple-900" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                inputMode="numeric"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-purple-900" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-purple-400">
              No account? Contact your administrator to get access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
