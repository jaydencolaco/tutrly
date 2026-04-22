"use client"

import { useEffect, useState } from "react"
import { useTeacherAuth } from "@/lib/teacher-auth-context"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { teacher } = useTeacherAuth()
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    if (!teacher?.id) return

    fetchGroups(teacher.id)
  }, [teacher])

  const fetchGroups = async (teacherId: string) => {
    const { data, error } = await supabase
      .from("groups")
      .select(`
        id,
        name,
        classes (
          id,
          class_date,
          meetings (
            meeting_link,
            start_time
          )
        )
      `)
      .eq("teacher_id", teacherId)

    if (error) {
      console.error(error)
      return
    }

    setGroups(data)
  }

  if (!teacher) return <p className="p-6">Loading...</p>

  // 🔥 SAFE CALCULATIONS
  const totalGroups = groups.length

  const totalClasses = groups.reduce(
    (sum, g) => sum + (g.classes?.length || 0),
    0
  )

  const upcomingClasses = groups.reduce(
    (sum, g) =>
      sum +
      (g.classes?.filter((c: any) => {
        const meeting = c.meetings?.[0]
        return (
          meeting &&
          new Date(meeting.start_time) > new Date()
        )
      }).length || 0),
    0
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">
          Welcome, {teacher.name}
        </h1>
        <p className="text-purple-600 mt-1">
          Here's your teaching overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-sm text-gray-500">Groups</p>
          <p className="text-2xl font-bold">{totalGroups}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-2xl font-bold">{totalClasses}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold">{upcomingClasses}</p>
        </div>
      </div>
    </div>
  )
}