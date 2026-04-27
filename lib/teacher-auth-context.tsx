"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface Teacher {
  id: string
  name: string
  phone: string
}

interface AuthContextValue {
  teacher: Teacher | null
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = "tutrly_teacher_session"

export function TeacherAuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)

  // 🔄 Restore session
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return

    const fetchTeacher = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, phone")
        .eq("id", stored)
        .eq("role", "teacher")
        .single()

      if (!error && data) setTeacher(data)
    }

    fetchTeacher()
  }, [])

  // 🔐 LOGIN WITH PASSWORD CHECK
 const login = async (phone: string, password: string): Promise<boolean> => {
  console.log("LOGIN INPUT:", phone, password)

  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, password, role")
    .eq("phone", phone.trim())
    .eq("role", "teacher")
    .maybeSingle()

  console.log("DB USER:", data)

  if (error || !data) {
    console.error("No user found")
    return false
  }

  // 🔥 SAFE PASSWORD CHECK
  const dbPassword = (data.password || "").trim()
  const inputPassword = password.trim()

  console.log("COMPARE:", dbPassword, inputPassword)

  if (dbPassword !== inputPassword) {
    console.error("Password mismatch")
    return false
  }

  const teacherData = {
    id: data.id,
    name: data.name,
    phone: data.phone,
  }

  setTeacher(teacherData)
  localStorage.setItem(SESSION_KEY, data.id)

  console.log("LOGIN SUCCESS")

  return true
}

  // 🚪 LOGOUT
  const logout = () => {
    setTeacher(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ teacher, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useTeacherAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useTeacherAuth must be used inside TeacherAuthProvider")
  return ctx
}