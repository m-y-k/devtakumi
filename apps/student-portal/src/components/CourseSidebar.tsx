import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCourseTree, getMyEnrollments, getCoursesPublic, CourseTreeItem, EnrollmentSummary } from '../api/client'

interface CourseSidebarProps {
  courseId: string
}

export default function CourseSidebar({ courseId }: CourseSidebarProps) {
  const navigate = useNavigate()
  const [tree, setTree] = useState<CourseTreeItem | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))
  const [courseList, setCourseList] = useState<any[]>([])

  useEffect(() => {
    if (!courseId) return
    getCourseTree(courseId).then(t => {
      setTree(t)
      setExpandedMonths(new Set([t.months[0]?.monthNumber ?? 1]))
    }).catch(() => {})
    
    getMyEnrollments().then(enr => {
      setEnrollments(enr)
    })
    getCoursesPublic().then(setCourseList).catch(() => {})
  }, [courseId])

  const toggleMonth = (n: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n); else next.add(n)
      return next
    })
  }

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    navigate(`/courses/${id}`)
  }

  if (!tree) {
    return (
      <aside className="w-[340px] flex-shrink-0 bg-[#0f1117] border-r border-[#1e2433] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </aside>
    )
  }

  const enrolledEnrollments = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')
  const totalClasses = tree.months.reduce((sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.classes.length, 0), 0)
  
  let progressPercent = 0
  const enrollment = enrollments.find(e => e.courseId === courseId)
  if (enrollment?.status === 'COMPLETED') {
    progressPercent = 100
  } else if (totalClasses > 0) {
    const now = new Date()
    const completedClassesCount = tree.months.reduce((sum, m) =>
      sum + m.weeks.reduce((ws, w) =>
        ws + w.classes.filter(c => c.scheduledStart && new Date(c.scheduledStart) < now).length
      , 0)
    , 0)
    progressPercent = Math.min(100, Math.round((completedClassesCount / totalClasses) * 100))
  }

  return (
    <aside className="w-[340px] flex-shrink-0 bg-[#0f1117] border-r border-[#1e2433] flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-[#1e2433]">
        <select
          value={courseId}
          onChange={handleCourseChange}
          className="w-full bg-[#1a1f2e] border border-[#2d3748] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent appearance-none cursor-pointer"
        >
          {enrolledEnrollments.map(enr => {
            const matchingCourse = courseList.find(c => c.id === enr.courseId)
            return (
              <option key={enr.courseId} value={enr.courseId}>
                {matchingCourse?.title || tree.title}
              </option>
            )
          })}
        </select>
      </div>

      <div className="px-4 py-3 border-b border-[#1e2433]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-purple-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#1a1f2e] rounded-full h-1.5">
          <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {tree.months.map(m => (
          <div key={m.monthNumber}>
            <button
              onClick={() => toggleMonth(m.monthNumber)}
              className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition group"
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 transition ${
                  expandedMonths.has(m.monthNumber) ? 'bg-purple-600/30 text-purple-400' : 'bg-[#1a1f2e] text-gray-500'
                }`}>
                  {m.monthNumber}
                </div>
                <span className="text-xs font-semibold text-gray-300 truncate leading-snug">
                  Month {m.monthNumber}
                </span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-gray-600 transition-transform flex-shrink-0 ${expandedMonths.has(m.monthNumber) ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedMonths.has(m.monthNumber) && (
              <div>
                {m.weeks.map(w => (
                  <div key={w.weekNumber}>
                    <div className="px-4 py-1.5 bg-[#0a0c13]">
                      <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
                        Week {w.weekNumber}: {w.title}
                      </p>
                    </div>

                    {w.classes.map(c => (
                      <Link
                        key={c.id}
                        to={`/classes/${c.id}`}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 border-l-2 border-transparent hover:border-purple-600/40 transition-all group"
                      >
                        <div className="w-5 h-5 rounded bg-[#1a1f2e] flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0 mt-0.5 group-hover:bg-purple-600/20 group-hover:text-purple-400 transition">
                          {c.globalClassNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 leading-snug truncate group-hover:text-white transition">
                            {c.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-600">{c.day}</span>
                            {c.scheduledStart && (
                              <span className="text-[10px] text-gray-600">
                                {new Date(c.scheduledStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}

                    <Link
                      to={`/courses/${courseId}/weeks/${w.id}/assessment`}
                      className="flex items-center gap-2 px-4 py-2 mx-4 mb-1 rounded-lg bg-purple-600/5 hover:bg-purple-600/15 border border-purple-600/20 text-purple-400 hover:text-purple-300 transition text-xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Weekly Assessment
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
