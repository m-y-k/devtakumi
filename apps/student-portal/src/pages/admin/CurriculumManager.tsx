import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoursesPublic, getCourseTree, createCourse, updateCourse, createMonth, updateMonth, createWeek, updateWeek, createClass, deleteClass, CourseTreeItem } from '../../api/client'

interface CourseSummary {
  id: string; slug: string; title: string; description: string; priceInr: number; durationMonths: number; orderIndex: number; prerequisiteCourseId: string | null
}

export default function AdminCurriculumManager() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [trees, setTrees] = useState<Record<string, CourseTreeItem>>({})
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchAll = () => {
    setLoading(true)
    getCoursesPublic().then(async (cs: CourseSummary[]) => {
      setCourses(cs)
      const treeMap: Record<string, CourseTreeItem> = {}
      await Promise.all(cs.map(c => getCourseTree(c.id).then(t => { treeMap[c.id] = t }).catch(() => {})))
      setTrees(treeMap)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreateCourse = async () => {
    const title = prompt('Course title:')
    if (!title) return
    const slug = prompt('Slug (e.g. new-course):')
    if (!slug) return
    const price = parseInt(prompt('Price (INR):') || '0')
    const months = parseInt(prompt('Duration (months):') || '1')
    await createCourse({ title, slug, description: '', priceInr: price, durationMonths: months, orderIndex: courses.length + 1 })
    fetchAll()
  }

  const handleEditCourse = async (c: CourseSummary) => {
    const title = prompt('Title:', c.title)
    if (!title) return
    const description = prompt('Description:', c.description || '')
    const price = parseInt(prompt('Price (INR):', String(c.priceInr)) || String(c.priceInr))
    await updateCourse(c.id, { title, description, priceInr: price })
    fetchAll()
  }

  const handleCreateMonth = async (courseId: string) => {
    const title = prompt('Month title:')
    if (!title) return
    const num = parseInt(prompt('Month number:') || '1')
    await createMonth(courseId, { title, monthNumber: num, courseId })
    fetchAll()
  }

  const handleEditMonth = async (monthId: string, currentTitle: string) => {
    const title = prompt('Month title:', currentTitle)
    if (!title) return
    await updateMonth(monthId, { title })
    fetchAll()
  }

  const handleCreateWeek = async (monthId: string) => {
    const title = prompt('Week title:')
    if (!title) return
    const num = parseInt(prompt('Week number:') || '1')
    await createWeek(monthId, { title, weekNumber: num, monthId })
    fetchAll()
  }

  const handleEditWeek = async (weekId: string, currentTitle: string) => {
    const title = prompt('Week title:', currentTitle)
    if (!title) return
    await updateWeek(weekId, { title })
    fetchAll()
  }

  const handleCreateClass = async (weekId: string) => {
    const title = prompt('Class title:')
    if (!title) return
    const gcn = parseInt(prompt('Global class number:') || '1')
    const day = prompt('Day (MON/TUE/WED/THU/FRI):', 'MON') || 'MON'
    const oi = parseInt(prompt('Order index:') || '1')
    await createClass(weekId, { title, globalClassNumber: gcn, day, orderIndex: oi, weekId })
    fetchAll()
  }

  const handleEditClass = async (classId: string) => {
    navigate(`/admin/classes/${classId}`)
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Delete this class?')) return
    await deleteClass(classId)
    fetchAll()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Curriculum Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Design courses, months, weeks, and classes</p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </button>
        </div>

        <div className="space-y-4">
          {courses.map(c => (
            <div key={c.id} className="bg-[#151921] border border-[#1e2433] rounded-2xl overflow-hidden hover:border-purple-600/20 transition-all">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition"
                onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}
              >
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹{c.priceInr} · {c.durationMonths} months · Index {c.orderIndex}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={e => { e.stopPropagation(); handleEditCourse(c) }}
                    className="text-xs bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 px-3 py-1.5 rounded-lg transition"
                  >
                    Edit Info
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ${expandedCourse === c.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedCourse === c.id && trees[c.id] && (
                <div className="border-t border-[#1e2433] p-5 space-y-4 bg-[#0c0f16]">
                  {trees[c.id].months.map(m => (
                    <div key={m.id} className="border-l border-purple-500/20 pl-4 py-1">
                      <div className="flex items-center justify-between py-2 group">
                        <button
                          onClick={() => setExpandedMonth(expandedMonth === m.id ? null : m.id)}
                          className="text-sm font-semibold text-gray-200 hover:text-white transition flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded bg-purple-600/10 text-purple-400 text-[10px] font-bold flex items-center justify-center">
                            M{m.monthNumber}
                          </span>
                          {m.title}
                        </button>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEditMonth(m.id, m.title)}
                            className="text-xs text-gray-500 hover:text-purple-400 transition"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => { setExpandedMonth(m.id); handleCreateWeek(m.id) }}
                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
                          >
                            + Week
                          </button>
                        </div>
                      </div>

                      {expandedMonth === m.id && m.weeks.map(w => (
                        <div key={w.id} className="ml-6 border-l border-purple-500/10 pl-4 py-1">
                          <div className="flex items-center justify-between py-1.5 group">
                            <button
                              onClick={() => setExpandedWeek(expandedWeek === w.id ? null : w.id)}
                              className="text-xs font-medium text-gray-400 hover:text-gray-200 transition"
                            >
                              Week {w.weekNumber}: {w.title}
                            </button>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditWeek(w.id, w.title)}
                                className="text-[10px] text-gray-500 hover:text-purple-400 transition"
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => handleCreateClass(w.id)}
                                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition"
                              >
                                + Class
                              </button>
                            </div>
                          </div>

                          {expandedWeek === w.id && (
                            <div className="mt-1 space-y-1">
                              {w.classes.map(cls => (
                                <div key={cls.id} className="ml-6 flex items-center justify-between py-1 px-3 bg-[#151921] hover:bg-[#1a1f2e] border border-[#1e2433] rounded-xl transition group/item">
                                  <span className="text-[11px] text-gray-400 flex items-center gap-2">
                                    <span className="font-mono text-purple-400 text-[10px] bg-purple-600/10 px-1.5 py-0.5 rounded">
                                      #{cls.globalClassNumber}
                                    </span>
                                    {cls.title}
                                    <span className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{cls.day}</span>
                                  </span>
                                  <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition">
                                    <button
                                      onClick={() => handleEditClass(cls.id)}
                                      className="text-[10px] text-purple-400 hover:text-purple-300 font-medium transition"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClass(cls.id)}
                                      className="text-[10px] text-red-400 hover:text-red-300 font-medium transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {w.classes.length === 0 && (
                                <p className="text-[10px] text-gray-600 italic ml-6 py-1">No classes in this week</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {expandedMonth === m.id && m.weeks.length === 0 && (
                        <p className="text-xs text-gray-600 italic ml-6 py-1">No weeks created yet</p>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => handleCreateMonth(c.id)}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition mt-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Month
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}