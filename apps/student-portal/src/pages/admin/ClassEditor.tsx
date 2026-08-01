import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getClass, getClassQuestions, updateClass, createQuestion, deleteQuestion, ClassDetail, QuestionSummary } from '../../api/client'

const difficultyConfig = {
  EASY:   { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
  MEDIUM: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500' },
  HARD:   { bg: 'bg-red-500/15',   text: 'text-red-400',   dot: 'bg-red-500'   },
}

export default function AdminClassEditor() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [cls, setCls]             = useState<ClassDetail | null>(null)
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [title, setTitle]         = useState('')
  const [day, setDay]             = useState('MON')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd]     = useState('')
  const [liveMeetingUrl, setLiveMeetingUrl] = useState('')
  const [notesMarkdown, setNotesMarkdown]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)
  const [saved, setSaved]         = useState(false)
  const [activeSection, setActiveSection] = useState<'details' | 'notes' | 'questions'>('details')
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQTitle, setNewQTitle] = useState('')
  const [newQDiff, setNewQDiff]   = useState<'EASY'|'MEDIUM'|'HARD'>('EASY')
  const [addingQ, setAddingQ]     = useState(false)

  const fetchData = () => {
    if (!classId) return
    setLoading(true)
    Promise.all([getClass(classId), getClassQuestions(classId)])
      .then(([c, q]) => {
        setCls(c)
        setQuestions(q)
        setTitle(c.title)
        setDay(c.day)
        setScheduledStart(c.scheduledStart ? new Date(c.scheduledStart).toISOString().slice(0, 16) : '')
        setScheduledEnd(c.scheduledEnd ? new Date(c.scheduledEnd).toISOString().slice(0, 16) : '')
        setLiveMeetingUrl(c.liveMeetingUrl || '')
        setNotesMarkdown(c.notesMarkdown || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [classId])

  const handleSave = async () => {
    if (!classId) return
    setSaving(true)
    try {
      await updateClass(classId, {
        title,
        day,
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduledEnd:   scheduledEnd   ? new Date(scheduledEnd).toISOString()   : null,
        liveMeetingUrl: liveMeetingUrl || null,
        notesMarkdown:  notesMarkdown  || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

  const handleAddQuestion = async () => {
    if (!classId || !newQTitle.trim()) return
    setAddingQ(true)
    try {
      await createQuestion(classId, {
        title:              newQTitle.trim(),
        difficulty:         newQDiff,
        statementMarkdown:  `# ${newQTitle.trim()}\n\nWrite the problem statement here.`,
        examples:           [{ input: '1', output: '1', explanation: 'Example explanation' }],
        testCases:          [{ input: '1', expected_output: '1', hidden: false }],
        orderIndex:         questions.length + 1,
      })
      setNewQTitle('')
      setNewQDiff('EASY')
      setShowAddQuestion(false)
      fetchData()
    } catch { /* silent */ }
    setAddingQ(false)
  }

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await deleteQuestion(qId)
      setQuestions(prev => prev.filter(q => q.id !== qId))
    } catch { /* silent */ }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!cls) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Class not found</p>
    </div>
  )

  const tabs = [
    { key: 'details',   label: 'Details',   icon: '📋' },
    { key: 'notes',     label: 'Notes',     icon: '📝' },
    { key: 'questions', label: `Questions (${questions.length})`, icon: '🧩' },
  ] as const

  return (
    <div className="h-[calc(100vh)] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/admin/courses')} className="text-gray-500 hover:text-purple-400 transition">Curriculum</button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400">Class #{cls.globalClassNumber}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Class</h1>
            <p className="text-gray-500 text-sm mt-1">#{cls.globalClassNumber} · {cls.day}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/classes/${classId}/recording`}
              className="flex items-center gap-1.5 bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Recording
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                saved
                  ? 'bg-green-600/20 border border-green-600/40 text-green-400'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30'
              }`}
            >
              {saving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
              ) : saved ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Saved!</>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 bg-[#151921] border border-[#1e2433] rounded-xl mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveSection(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === t.key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Details */}
        {activeSection === 'details' && (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Day</label>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition appearance-none"
                >
                  {['MON','TUE','WED','THU','FRI'].map(d => (
                    <option key={d} value={d}>{['Monday','Tuesday','Wednesday','Thursday','Friday'][['MON','TUE','WED','THU','FRI'].indexOf(d)]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Live Meeting URL</label>
                <input
                  type="url"
                  value={liveMeetingUrl}
                  onChange={e => setLiveMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600/50 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Scheduled Start</label>
                <input
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={e => setScheduledStart(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Scheduled End</label>
                <input
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={e => setScheduledEnd(e.target.value)}
                  className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600/50 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {activeSection === 'notes' && (
          <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes (Markdown)</label>
              <span className="text-[10px] text-gray-600 font-mono">{notesMarkdown.length} chars</span>
            </div>
            <textarea
              value={notesMarkdown}
              onChange={e => setNotesMarkdown(e.target.value)}
              rows={20}
              placeholder="# Class Notes&#10;&#10;Write Markdown here. Images, code blocks, and lists are all supported."
              className="w-full bg-[#0f1117] border border-[#2d3748] text-gray-200 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-purple-600/50 transition resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Questions */}
        {activeSection === 'questions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{questions.length} questions attached to this class</p>
              <button
                onClick={() => setShowAddQuestion(v => !v)}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            {showAddQuestion && (
              <div className="bg-[#151921] border border-purple-600/30 rounded-2xl p-5 mb-4 space-y-4">
                <h3 className="text-sm font-semibold text-white">New Question</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newQTitle}
                      onChange={e => setNewQTitle(e.target.value)}
                      placeholder="E.g. Two Sum"
                      className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-600/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                    <select
                      value={newQDiff}
                      onChange={e => setNewQDiff(e.target.value as any)}
                      className="w-full bg-[#0f1117] border border-[#2d3748] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none appearance-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddQuestion}
                    disabled={addingQ || !newQTitle.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    {addingQ ? 'Adding...' : 'Add Question'}
                  </button>
                  <button
                    onClick={() => setShowAddQuestion(false)}
                    className="bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-gray-300 px-5 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {questions.length === 0 ? (
              <div className="bg-[#151921] border border-[#1e2433] rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm">No questions yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const dc = difficultyConfig[q.difficulty] || difficultyConfig.EASY
                  return (
                    <div key={q.id} className="bg-[#151921] border border-[#1e2433] hover:border-purple-600/30 rounded-xl p-4 flex items-center gap-3 group transition">
                      <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200">{q.title}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${dc.bg} ${dc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`} />
                        {q.difficulty}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Delete question"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}