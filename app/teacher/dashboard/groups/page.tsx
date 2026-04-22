"use client"

import { useEffect, useState } from "react"
import { useTeacherAuth } from "@/lib/teacher-auth-context"
import { supabase } from "@/lib/supabase"
import GroupCard from "@/components/teacher/GroupCard"

export default function GroupsPage() {
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

    // 🔄 transform for GroupCard
    const transformed = data.map((g: any) => {
      const classes = g.classes || []

      const upcomingMeeting = classes
        .flatMap((c: any) => c.meetings || [])
        .sort(
          (a: any, b: any) =>
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime()
        )[0]

      return {
        id: g.id,
        name: g.name,
        nextClass: upcomingMeeting
          ? new Date(upcomingMeeting.start_time).toISOString()
          : null,
        classes: classes.map((c: any) => {
          const meeting = c.meetings?.[0]
          return {
            id: c.id,
            status: meeting
              ? new Date(meeting.start_time) > new Date()
                ? "upcoming"
                : "completed"
              : "no-link",
          }
        }),
        studentsCount: 0, // optional for now
      }
    })

    setGroups(transformed)
  }

  if (!teacher) return <p className="p-6">Loading...</p>

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">My Groups</h1>
        <p className="text-purple-600 mt-1">
          {groups.length} group{groups.length !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

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
  )
}