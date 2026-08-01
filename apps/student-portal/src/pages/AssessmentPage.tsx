import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWeekAssessment, submitAssessmentAnswer, submitProjectAssessment, Assessment } from '../api/client'

export default function AssessmentPage() {
  const { weekId } = useParams<{ weekId: string }>()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [code, setCode] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [repoUrl, setRepoUrl] = useState('')
  const [submittingProject, setSubmittingProject] = useState(false)
  const [projectMessage, setProjectMessage] = useState('')
  const [projectStatus, setProjectStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!weekId) return
    getWeekAssessment(weekId).then(a => {
      setAssessment(a)
      const initCode: Record<string, string> = {}
      a.questions.forEach(q => { initCode[q.questionId] = '' })
      setCode(initCode)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [weekId])

  const handleSubmit = async (questionId: string) => {
    if (!assessment) return
    try {
      const res = await submitAssessmentAnswer(assessment.id, questionId, code[questionId])
      setResults(prev => ({ ...prev, [questionId]: res.verdict }))
    } catch {
      setResults(prev => ({ ...prev, [questionId]: 'ERROR' }))
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assessment || !repoUrl.trim()) return
    setSubmittingProject(true)
    setProjectMessage('')
    setProjectStatus('idle')
    try {
      await submitProjectAssessment(assessment.id, repoUrl.trim())
      setProjectStatus('success')
      setProjectMessage('Project repository submitted successfully!')
    } catch (err: any) {
      setProjectStatus('error')
      setProjectMessage(err.message || 'Failed to submit project repository. Please try again.')
    } finally {
      setSubmittingProject(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!assessment) return (
    <div className="text-center py-20 text-gray-500">No assessment for this week</div>
  )

  const now = new Date()
  const opensAt = new Date(assessment.opensAt)
  const closesAt = new Date(assessment.closesAt)

  if (now < opensAt) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Assessment Not Yet Open</h1>
        <p className="text-gray-500 text-sm">This assessment opens at {opensAt.toLocaleString('en-IN')}</p>
      </div>
    )
  }

  if (now > closesAt) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Assessment Closed</h1>
        <p className="text-gray-500 text-sm">This assessment closed at {closesAt.toLocaleString('en-IN')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-purple-400 text-sm mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">{assessment.title}</h1>
          <p className="text-gray-500 text-sm">
            {assessment.type === 'CODE' ? 'Coding assessment — submit Java solutions' : 'Project submission'}
          </p>
        </div>

        {assessment.type === 'CODE' && (
          <div className="space-y-6">
            {assessment.questions.map(q => (
              <div key={q.id} className="bg-[#151921] border border-[#1e2433] rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white text-sm">{q.title || 'Question'}</h3>
                  <span className="text-xs text-purple-400 bg-purple-600/10 px-2.5 py-0.5 rounded-lg font-mono">
                    {q.points} pts
                  </span>
                </div>
                <textarea
                  value={code[q.questionId] || ''}
                  onChange={e => setCode(prev => ({ ...prev, [q.questionId]: e.target.value }))}
                  placeholder="Write your Java code solution here..."
                  rows={10}
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-gray-200 rounded-xl p-4 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-purple-600/50 transition resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleSubmit(q.questionId)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-900/30"
                  >
                    Submit Code
                  </button>
                  {results[q.questionId] && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      results[q.questionId] === 'ACCEPTED' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {results[q.questionId] === 'ACCEPTED' ? '✓ ACCEPTED' : results[q.questionId]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {assessment.type === 'PROJECT_SUBMISSION' && (
          <form onSubmit={handleProjectSubmit} className="bg-[#151921] border border-[#1e2433] rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white mb-2">Project Repository Link</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Provide the link to your GitHub repository or hosted project URL. Make sure the repository is public or you have shared access.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub Repository URL *</label>
              <input
                required
                type="url"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/yourusername/yourproject"
                className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm placeholder-gray-700 focus:outline-none focus:border-purple-600/50 transition"
              />
            </div>

            {projectMessage && (
              <div className={`text-xs font-medium px-4 py-3 rounded-xl border ${
                projectStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {projectMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingProject}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-purple-900/30"
            >
              {submittingProject ? 'Submitting...' : 'Submit Project Repository'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
