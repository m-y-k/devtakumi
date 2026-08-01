import { useEffect, useState } from 'react'
import { getCoursesPublic, getCourseTree, getWeekAssessment, getAssessmentSubmissions, getAssessmentProjectSubmissions, gradeProjectSubmission, CourseTreeItem } from '../../api/client'

interface CourseSummary { id: string; title: string }
interface SubmissionItem { id: string; userId: string; questionId: string | null; verdict: string; score: number | null; submittedAt: string; code: string }
interface ProjectSubmissionItem { id: string; userId: string; repoUrl: string | null; fileUrl: string | null; score: number | null; feedback: string | null; submittedAt: string }

export default function AdminSubmissionsGrading() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [trees, setTrees] = useState<Record<string, CourseTreeItem>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedWeek, setSelectedWeek] = useState('')
  const [assessment, setAssessment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmissionItem[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmissionItem | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')

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
    ? trees[selectedCourse].months.flatMap(m => m.weeks.map(w => ({ ...w, monthNumber: m.monthNumber, courseId: selectedCourse })))
    : []

  useEffect(() => {
    if (!selectedWeek) { setAssessment(null); setSubmissions([]); setProjectSubmissions([]); return }
    getWeekAssessment(selectedWeek).then(async (a: any) => {
      setAssessment(a)
      if (a.type === 'CODE') {
        const subs = await getAssessmentSubmissions(a.id)
        setSubmissions(subs)
      } else {
        const subs = await getAssessmentProjectSubmissions(a.id)
        setProjectSubmissions(subs)
      }
    }).catch(() => { setAssessment(null); setSubmissions([]); setProjectSubmissions([]) })
  }, [selectedWeek])

  const handleGrade = async (id: string) => {
    const score = parseInt(gradeScore)
    if (isNaN(score)) { alert('Enter a valid score'); return }
    try {
      await gradeProjectSubmission(id, score, gradeFeedback)
      alert('Graded!')
      setSelectedSubmission(null)
      setGradeScore('')
      setGradeFeedback('')
      if (selectedWeek) {
        const a = await getWeekAssessment(selectedWeek)
        const subs = await getAssessmentProjectSubmissions(a.id)
        setProjectSubmissions(subs)
      }
    } catch { alert('Failed to grade') }
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
          <h1 className="text-2xl font-bold text-white">Submissions & Grading</h1>
          <p className="text-gray-500 text-sm mt-1">Review student coding submissions and grade projects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={e => { setSelectedCourse(e.target.value); setSelectedWeek('') }}
              className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-600/50 appearance-none cursor-pointer"
            >
              <option value="">-- Select --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Week</label>
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-600/50 appearance-none cursor-pointer"
            >
              <option value="">-- Select --</option>
              {weeks.map(w => <option key={w.id} value={w.id}>Month {w.monthNumber} · Week {w.weekNumber}: {w.title}</option>)}
            </select>
          </div>
        </div>

        {assessment && (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Currently Reviewing</p>
              <h2 className="text-base font-bold text-white mt-1">{assessment.title}</h2>
            </div>
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {assessment.type}
            </span>
          </div>
        )}

        {assessment?.type === 'CODE' && (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1e2433] bg-[#0c0f16] text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Verdict</th>
                    <th className="p-4 font-semibold">Score</th>
                    <th className="p-4 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2433]">
                  {submissions.map(s => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-400">{s.userId}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                          s.verdict === 'ACCEPTED' ? 'bg-green-500/15 text-green-400' :
                          s.verdict === 'WRONG_ANSWER' ? 'bg-red-500/15 text-red-400' :
                          'bg-gray-500/15 text-gray-400'
                        }`}>{s.verdict}</span>
                      </td>
                      <td className="p-4 font-semibold text-white">{s.score ?? '-'}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(s.submittedAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-gray-500 text-center text-sm">No submissions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {assessment?.type === 'PROJECT_SUBMISSION' && (
          <div className="space-y-4">
            {projectSubmissions.map(ps => (
              <div key={ps.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-2xl p-5 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-gray-500">Student: {ps.userId}</p>
                    {ps.repoUrl && (
                      <a
                        href={ps.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 font-medium break-all flex items-center gap-1"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {ps.repoUrl}
                      </a>
                    )}
                    {ps.fileUrl && <p className="text-xs text-gray-400 bg-[#0f1117] rounded-lg p-2.5 break-all font-mono">File: {ps.fileUrl}</p>}
                    <p className="text-xs text-gray-600">
                      Submitted: {new Date(ps.submittedAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {ps.score != null && (
                      <div className="mt-3 bg-purple-600/10 border border-purple-600/20 rounded-xl p-3 text-sm">
                        <span className="text-gray-400">Grade: </span>
                        <strong className="text-purple-300">{ps.score} / 100</strong>
                        {ps.feedback && <p className="text-gray-400 text-xs mt-1">Feedback: {ps.feedback}</p>}
                      </div>
                    )}
                  </div>
                  {ps.score == null && (
                    <button
                      onClick={() => { setSelectedSubmission(ps); setGradeScore(''); setGradeFeedback('') }}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      Grade Project
                    </button>
                  )}
                </div>

                {selectedSubmission?.id === ps.id && (
                  <div className="border-t border-[#1e2433] pt-4 mt-4 space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Score (out of 100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeScore}
                        onChange={e => setGradeScore(e.target.value)}
                        className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-600/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Feedback</label>
                      <textarea
                        value={gradeFeedback}
                        onChange={e => setGradeFeedback(e.target.value)}
                        rows={3}
                        placeholder="Write feedback for the student..."
                        className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-600/50 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleGrade(ps.id)}
                        className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Submit Grade
                      </button>
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 px-5 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {projectSubmissions.length === 0 && (
              <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm">No project submissions yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}