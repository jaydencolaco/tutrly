// lib/types.ts

export type ClassStatus = "upcoming" | "completed" | "no-link"

export interface ClassSession {
  id: string
  date: string
  time: string
  status: ClassStatus
  meetingLink?: string
}

export interface Group {
  id: string
  name: string
  classes: ClassSession[]
}

export interface Teacher {
  id: string
  name: string
  phone: string
  subject?: string
}