import { useEffect, useState } from 'react'
import { getCoursesPublic, getCourseTree, createAssessment, updateAssessment, addAssessmentQuestion, createQuestion, CourseTreeItem } from '../../api/client'

interface CourseSummary { id: string; title: string }
interface AssessmentItem { id: string; weekId: string; title: string; type: string; opensAt: string; closesAt: string; durationMinutes: number | null }

export default function AdminAssessments() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [trees, setTrees] = useState<Record<string, CourseTreeItem>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [weekAssessments, setWeekAssessments] = useState<Record<string, AssessmentItem>>({})

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

  const weeks = selectedCourse && trees[selectedCourse]
    ? trees[selectedCourse].months.flatMap(m => m.weeks.map(w => ({ ...w, monthTitle: m.title, monthNumber: m.monthNumber, courseId: selectedCourse })))
    : []

  const handleCreateAssessment = async (weekId: string) => {
    const title = prompt('Assessment title:')
    if (!title) return
    const type = prompt('Type (CODE / PROJECT_SUBMISSION):', 'CODE') || 'CODE'
    try {
      const assessment = await createAssessment(weekId, {
        title, type,
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      setWeekAssessments(prev => ({ ...prev, [weekId]: assessment }))
    } catch { alert('Failed to create assessment') }
  }

  const handleEditAssessment = async (assessment: AssessmentItem) => {
    const title = prompt('Title:', assessment.title) || assessment.title
    const opensAt = prompt('Opens at (ISO):', assessment.opensAt) || assessment.opensAt
    const closesAt = prompt('Closes at (ISO):', assessment.closesAt) || assessment.closesAt
    const dur = prompt('Duration (minutes, optional):', String(assessment.durationMinutes || ''))
    try {
      const updated = await updateAssessment(assessment.id, {
        title, opensAt, closesAt,
        durationMinutes: dur ? parseInt(dur) : null,
      })
      setWeekAssessments(prev => ({ ...prev, [assessment.weekId]: updated }))
    } catch { alert('Failed to update') }
  }

  const handleAddQuestion = async (assessmentId: string) => {
    const qTitle = prompt('Question title:')
    if (!qTitle) return
    try {
      const q = await createQuestion('00000000-0000-0000-0000-000000000000', {
        title: qTitle,
        difficulty: 'EASY',
        statementMarkdown: '# Problem\n\nWrite your problem statement.',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', expected_output: '', hidden: false }],
        orderIndex: 1,
      })
      await addAssessmentQuestion(assessmentId, { questionId: q.id, points: 10, orderIndex: 1 })
      alert('Question added to assessment')
    } catch { alert('Failed to add question') }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Assessments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage weekly coding assessments and projects</p>
        </div>

        <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-5 mb-6 max-w-md">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-600/50 appearance-none cursor-pointer"
          >
            <option value="">-- Choose a course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {selectedCourse && (
          <div className="space-y-3">
            {weeks.map(w => (
              <div key={w.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-2xl p-5 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded">
                      Month {w.monthNumber}
                    </span>
                    <h3 className="font-semibold text-white text-sm mt-1.5">Week {w.weekNumber}: {w.title}</h3>
                    {weekAssessments[w.id] && (
                      <p className="text-[11px] text-gray-500 mt-1 font-mono">
                        Active: {new Date(weekAssessments[w.id].opensAt).toLocaleString()} → {new Date(weekAssessments[w.id].closesAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {!weekAssessments[w.id] ? (
                    <button
                      onClick={() => handleCreateAssessment(w.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      + Create Assessment
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center flex-shrink-0">
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg">
                        {weekAssessments[w.id].type}
                      </span>
                      <button
                        onClick={() => handleEditAssessment(weekAssessments[w.id])}
                        className="text-xs bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAddQuestion(weekAssessments[w.id].id)}
                        className="text-xs bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-400 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        + Add Question
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}