"use client"

import { ExternalLink, Clock, CalendarDays } from "lucide-react"
import type { ClassSession } from "@/lib/types" 
import MeetingLinkInput from "./MeetingLinkInput"

interface ClassCardProps {
  session: ClassSession
  onSaveLink: (classId: string, link: string) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function ClassCard({ session, onSaveLink }: ClassCardProps) {
  const isUpcoming = session.status === "upcoming"
  const isCompleted = session.status === "completed"
  const isNoLink = session.status === "no-link"

  const handleGenerateLink = () => {
    window.open("https://meet.google.com/new", "_blank")
  }

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all ${
        isUpcoming ? "border-purple-200" : "border-gray-100 opacity-80"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-900">
            <CalendarDays className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-sm">
              {formatDate(session.date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-purple-600">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-sm">{session.time}</span>
          </div>
        </div>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isUpcoming
              ? "bg-purple-100 text-purple-700"
              : isNoLink
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isUpcoming
            ? "Upcoming"
            : isNoLink
            ? "No Link"
            : "Completed"}
        </span>
      </div>

      {/* Show link for completed OR no-link once added */}
      {!isUpcoming && session.meetingLink && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-purple-500 hover:text-purple-700 transition-colors truncate"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          {session.meetingLink}
        </a>
      )}

      {/* Actions for upcoming OR no-link */}
      {(isUpcoming || isNoLink) && (
        <div className="space-y-3 pt-1 border-t border-purple-50">
          <button
            onClick={handleGenerateLink}
            className="flex items-center gap-2 w-full justify-center py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold rounded-xl border border-purple-200 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Generate Meeting Link
          </button>

          <MeetingLinkInput
            classId={session.id}
            existingLink={session.meetingLink}
            onSave={onSaveLink}
          />
        </div>
      )}
    </div>
  )
}