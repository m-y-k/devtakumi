import { useEffect, useState } from 'react'
import { getAdminStudents, markCourseComplete, getCoursesPublic } from '../../api/client'
import { authFetch } from '../../api/auth'

interface Enrollment {
  id: string
  courseId: string
  status: string
  enrolledAt: string
  completedAt: string | null
}

interface StudentItem {
  id: string
  name: string
  email: string
  phone: string | null
  enrollments: Enrollment[]
}

const statusConfig = {
  ACTIVE:    { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  COMPLETED: { bg: 'bg-green-500/15',  text: 'text-green-400'  },
  LOCKED:    { bg: 'bg-gray-500/15',   text: 'text-gray-400'   },
}

export default function AdminStudents() {
  const [students, setStudents]   = useState<StudentItem[]>([])
  const [courses, setCourses]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [actionId, setActionId]   = useState<string | null>(null)
  const [grantStudentId, setGrantStudentId] = useState<string | null>(null)
  const [grantCourseId, setGrantCourseId]   = useState('')

  useEffect(() => {
    Promise.all([getAdminStudents(), getCoursesPublic()])
      .then(([s, c]) => { setStudents(s); setCourses(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleComplete = async (studentId: string, courseId: string) => {
    setActionId(`${studentId}-${courseId}`)
    try {
      await markCourseComplete(studentId, courseId)
      setStudents(prev => prev.map(s => {
        if (s.id !== studentId) return s
        return {
          ...s,
          enrollments: s.enrollments.map(e =>
            e.courseId === courseId ? { ...e, status: 'COMPLETED', completedAt: new Date().toISOString() } : e
          )
        }
      }))
    } catch { /* silent */ }
    setActionId(null)
  }

  const handleGrantEnrollment = async () => {
    if (!grantStudentId || !grantCourseId) return
    try {
      await authFetch(`/api/admin/students/${grantStudentId}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: grantCourseId }),
      })
      const updated = await getAdminStudents()
      setStudents(updated)
    } catch { /* silent */ }
    setGrantStudentId(null)
    setGrantCourseId('')
  }

  const getCourseTitle = (id: string) => courses.find(c => c.id === id)?.title || id

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-gray-500 text-sm mt-1">{students.length} total students</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#151921] border border-[#1e2433] text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600/50 transition"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-sm">{students.length === 0 ? 'No students yet.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <div key={s.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-2xl p-5 transition-all">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Student info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600/40 to-violet-700/40 rounded-xl flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-gray-500 text-sm">{s.email}</p>
                      {s.phone && <p className="text-gray-600 text-xs mt-0.5">{s.phone}</p>}
                    </div>
                  </div>

                  {/* Enrollments */}
                  <div className="flex-1">
                    {s.enrollments.length === 0 ? (
                      <p className="text-gray-600 text-xs italic">No enrollments</p>
                    ) : (
                      <div className="space-y-2">
                        {s.enrollments.map(e => {
                          const sc = statusConfig[e.status as keyof typeof statusConfig] || statusConfig.LOCKED
                          const busy = actionId === `${s.id}-${e.courseId}`
                          return (
                            <div key={e.id} className="flex items-center justify-between bg-[#0f1117] rounded-xl px-3 py-2.5 gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 truncate">{getCourseTitle(e.courseId)}</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">
                                  Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {e.completedAt && ` · Completed ${new Date(e.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                </p>
                              </div>
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${sc.bg} ${sc.text}`}>
                                {e.status}
                              </span>
                              {e.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleComplete(s.id, e.courseId)}
                                  disabled={busy}
                                  className="text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-400 px-3 py-1.5 rounded-lg flex-shrink-0 transition disabled:opacity-50"
                                >
                                  {busy ? '...' : 'Mark Complete'}
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Grant enrollment */}
                  <button
                    onClick={() => { setGrantStudentId(s.id); setGrantCourseId('') }}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 px-3 py-2 rounded-xl transition flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grant enrollment modal */}
      {grantStudentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Grant Enrollment</h3>
            <p className="text-gray-400 text-sm mb-4">
              Select a course to manually enroll <strong className="text-white">{students.find(s => s.id === grantStudentId)?.name}</strong>.
            </p>
            <select
              value={grantCourseId}
              onChange={e => setGrantCourseId(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-purple-600/50 appearance-none"
            >
              <option value="">-- Select course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleGrantEnrollment}
                disabled={!grantCourseId}
                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Grant Access
              </button>
              <button
                onClick={() => setGrantStudentId(null)}
                className="flex-1 bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
