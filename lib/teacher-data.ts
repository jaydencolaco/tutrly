// ─── Types ───────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string
  name: string
  phone: string
  password: string
  subject: string
}

export interface ClassSession {
  id: string
  date: string        // "2025-05-10"
  time: string        // "4:00 PM"
  status: 'upcoming' | 'completed'
  meetingLink?: string
}

export interface Group {
  id: string
  name: string
  subject: string
  studentsCount: number
  nextClass: string   // ISO date string
  classes: ClassSession[]
}

export interface TeacherWithGroups extends Teacher {
  groups: Group[]
}

// ─── Mock Teachers ────────────────────────────────────────────────────────────

export const MOCK_TEACHERS: TeacherWithGroups[] = [
  {
    id: 't1',
    name: 'Priya Sharma',
    phone: '9999999999',
    password: '1234',
    subject: 'Keyboard',
    groups: [
      {
        id: 'g1',
        name: 'Keyboard Batch A',
        subject: 'Keyboard',
        studentsCount: 12,
        nextClass: '2025-05-10T16:00:00',
        classes: [
          { id: 'c1', date: '2025-05-10', time: '4:00 PM', status: 'upcoming' },
          { id: 'c2', date: '2025-05-17', time: '4:00 PM', status: 'upcoming' },
          { id: 'c3', date: '2025-04-26', time: '4:00 PM', status: 'completed', meetingLink: 'https://meet.google.com/abc-defg-hij' },
          { id: 'c4', date: '2025-04-19', time: '4:00 PM', status: 'completed', meetingLink: 'https://meet.google.com/xyz-uvwx-yz1' },
        ],
      },
      {
        id: 'g2',
        name: 'Keyboard Batch B',
        subject: 'Keyboard',
        studentsCount: 8,
        nextClass: '2025-05-11T11:00:00',
        classes: [
          { id: 'c5', date: '2025-05-11', time: '11:00 AM', status: 'upcoming' },
          { id: 'c6', date: '2025-05-18', time: '11:00 AM', status: 'upcoming' },
          { id: 'c7', date: '2025-04-27', time: '11:00 AM', status: 'completed', meetingLink: 'https://meet.google.com/mno-pqrs-tuv' },
          { id: 'c8', date: '2025-04-20', time: '11:00 AM', status: 'completed' },
        ],
      },
    ],
  },
  {
    id: 't2',
    name: 'Arjun Mehta',
    phone: '8888888888',
    password: 'pass2',
    subject: 'Guitar',
    groups: [
      {
        id: 'g3',
        name: 'Guitar Beginners',
        subject: 'Guitar',
        studentsCount: 15,
        nextClass: '2025-05-12T17:30:00',
        classes: [
          { id: 'c9',  date: '2025-05-12', time: '5:30 PM', status: 'upcoming' },
          { id: 'c10', date: '2025-05-19', time: '5:30 PM', status: 'upcoming' },
          { id: 'c11', date: '2025-04-28', time: '5:30 PM', status: 'completed', meetingLink: 'https://meet.google.com/gui-tarrr-beg' },
          { id: 'c12', date: '2025-04-21', time: '5:30 PM', status: 'completed' },
        ],
      },
    ],
  },
]
