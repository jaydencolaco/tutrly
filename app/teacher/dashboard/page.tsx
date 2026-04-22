"use client"

import { useEffect, useState } from "react"
import { useTeacherAuth } from "@/lib/teacher-auth-context"
import { supabase } from "@/lib/supabase"
import GroupCard from "@/components/teacher/GroupCard"
import { Users, CalendarCheck, BookOpen } from "lucide-react"

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

    // 🔄 transform for UI
    const transformed = data.map((g: any) => {
      const classes = g.classes || []

      const upcomingClasses = classes.map((c: any) => {
        const meeting = c.meetings?.[0]
        return {
          id: c.id,
          status: meeting
            ? new Date(meeting.start_time) > new Date()
              ? "upcoming"
              : "completed"
            : "no-link",
        }
      })

      return {
        id: g.id,
        name: g.name,
        studentsCount: 0, // optional for now
        classes: upcomingClasses,
        nextClass: null,
      }
    })

    setGroups(transformed)
  }

  if (!teacher) return <p className="p-6">Loading...</p>

  // ✅ SAFE CALCULATIONS
  const totalStudents = groups.reduce(
    (s, g) => s + (g.studentsCount || 0),
    0
  )

  const totalClasses = groups.reduce(
    (s, g) => s + (g.classes?.length || 0),
    0
  )

  const upcomingClasses = groups.reduce(
    (s, g) =>
      s + (g.classes?.filter((c: any) => c.status === "upcoming").length || 0),
    0
  )

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-purple-900 text-balance">
          Welcome back, {teacher.name.split(" ")[0]}
        </h1>
        <p className="text-purple-600 mt-1">
          Here&apos;s an overview of your classes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900">
              {groups.length}
            </p>
            <p className="text-sm text-purple-500">Total Groups</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900">
              {totalStudents}
            </p>
            <p className="text-sm text-purple-500">Total Students</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900">
              {upcomingClasses}
            </p>
            <p className="text-sm text-purple-500">Upcoming Classes</p>
          </div>
        </div>
      </div>

      {/* Groups grid */}
      <div>
        <h2 className="text-xl font-bold text-purple-900 mb-4">
          My Groups
        </h2>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-purple-100 p-10 text-center">
            <p className="text-purple-400">No groups assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}