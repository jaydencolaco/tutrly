"use client"

import Link from "next/link"
import { Users, Calendar, ArrowRight } from "lucide-react"

interface GroupCardProps {
  group: {
    id: string
    name: string
    subject?: string
    studentsCount?: number
    nextClass: string | null
    classes: any[]
  }
}

function formatNextClass(dateStr: string | null) {
  if (!dateStr) return "No upcoming class"

  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function GroupCard({ group }: GroupCardProps) {
  const upcoming =
    group.classes?.filter((c: any) => c.status === "upcoming").length || 0

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-purple-900 text-lg leading-tight">
            {group.name}
          </h3>
          <p className="text-sm text-purple-500 mt-0.5">
            {group.subject || "Class Group"}
          </p>
        </div>

        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
          {upcoming} upcoming
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Users className="w-4 h-4 text-purple-400" />
          <span>
            <strong className="text-purple-900">
              {group.studentsCount || 0}
            </strong>{" "}
            students
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>{formatNextClass(group.nextClass)}</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/teacher/dashboard/groups/${group.id}`}
        className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
      >
        View Group
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}