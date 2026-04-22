'use client'

import { useState } from 'react'
import { Link2, Send, Check } from 'lucide-react'

interface MeetingLinkInputProps {
  classId: string
  existingLink?: string
  onSave: (classId: string, link: string) => void
}

export default function MeetingLinkInput({ classId, existingLink, onSave }: MeetingLinkInputProps) {
  const [link, setLink] = useState(existingLink ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!link.trim()) return
    onSave(classId, link.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
        <input
          type="url"
          placeholder="Paste meeting link here..."
          value={link}
          onChange={(e) => { setLink(e.target.value); setSaved(false) }}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-purple-200 bg-purple-50/50 text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={!link.trim()}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
      >
        {saved ? (
          <><Check className="w-4 h-4" /> Saved</>
        ) : (
          <><Send className="w-4 h-4" /> Send</>
        )}
      </button>
    </div>
  )
}
