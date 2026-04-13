'use client'

import { useState, useEffect } from 'react'
import { Search, MoreVertical, User } from 'lucide-react'

interface Student {
  _id: string
  firstName: string
  lastName: string
  fatherName: string
  fatherMobile: string
  hobbies?: string[]
  gender?: string
  createdAt?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [filter, setFilter] = useState('Name')

  useEffect(() => {
    fetchStudents()
  }, [searchTerm, page])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        limit: '10',
      })

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (data.success) {
        setStudents(data.students)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative circles */}
      <div className="circle-1" style={{ top: '-200px', left: '-200px' }} />
      <div className="circle-2" style={{ bottom: '-100px', right: '-150px' }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 md:p-8 border-b border-purple-200/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-2">Student List</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          {/* Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-2">
              {['Name', 'Hobby'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    filter === filterOption
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:flex-none relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
                <input
                  type="text"
                  placeholder="Search by Name"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full md:w-96 pl-10 pr-4 py-2 rounded-lg border border-purple-200 bg-white text-purple-900 placeholder-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
                Filter
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-medium">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-purple-700 font-medium">No students found</p>
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student._id}
                  className="bg-white rounded-3xl shadow-md border border-purple-100 p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  {/* Number */}
                  <div className="text-xl font-bold text-purple-900 min-w-8">{index + 1}.</div>

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-bold text-purple-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{student.fatherMobile}</p>
                    </div>
                    <p className="text-sm text-gray-600">Father: {student.fatherName}</p>
                  </div>

                  {/* Hobbies */}
                  <div className="flex-1">
                    {student.hobbies && student.hobbies.length > 0 ? (
                      <div className="space-y-2">
                        {student.hobbies.slice(0, 1).map((hobby, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm text-center"
                          >
                            {hobby}
                          </div>
                        ))}
                        {student.hobbies.length > 1 && (
                          <div className="bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm text-center font-medium">
                            +{student.hobbies.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm text-center">
                        No hobbies
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm">
                    Active
                  </div>

                  {/* Menu */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      p === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
