import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { getQuestion, getQuestionSubmissions, submitCodeRun, submitCode, QuestionDetail, Submission } from '../api/client'

const difficultyConfig = {
  EASY: { label: 'Easy', bg: 'bg-green-500/15', text: 'text-green-400' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  HARD: { label: 'Hard', bg: 'bg-red-500/15', text: 'text-red-400' },
}

type ProblemTab = 'Description' | 'Submissions'

export default function CodeRunnerPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [code, setCode] = useState('')
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ verdict: string; testCaseResults?: any[] } | null>(null)
  const [problemTab, setProblemTab] = useState<ProblemTab>('Description')

  useEffect(() => {
    if (!questionId) return
    getQuestion(questionId).then(q => {
      setQuestion(q)
      setCode(q.starterCodeJava || '// Write your Java solution here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}')
    }).catch(() => {})
    getQuestionSubmissions(questionId).then(setSubmissions).catch(() => {})
  }, [questionId])

  const handleRun = useCallback(async () => {
    if (!questionId || running) return
    setRunning(true)
    setOutput('')
    try {
      const res = await submitCodeRun(questionId, code, stdin)
      setOutput(res.stdout || res.stderr || res.compileOutput || 'No output')
    } catch (err: any) {
      setOutput(err.message || 'Error running code')
    } finally {
      setRunning(false)
    }
  }, [questionId, code, stdin, running])

  const handleSubmit = useCallback(async () => {
    if (!questionId || submitting) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await submitCode(questionId, code)
      setResult(res)
      getQuestionSubmissions(questionId).then(setSubmissions).catch(() => {})
    } catch (err: any) {
      setResult({ verdict: 'ERROR' })
    } finally {
      setSubmitting(false)
    }
  }, [questionId, code, submitting])

  if (!question) return (
    <div className="flex items-center justify-center h-full min-h-screen bg-[#0f1117]">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const diff = difficultyConfig[question.difficulty] || difficultyConfig.EASY

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Problem pane */}
      <div className="w-[420px] flex-shrink-0 border-r border-[#1e2433] flex flex-col">
        {/* Tabs */}
        <div className="flex items-center border-b border-[#1e2433] px-5 gap-4">
          {(['Description', 'Submissions'] as ProblemTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setProblemTab(tab)}
              className={`py-3.5 text-xs font-semibold border-b-2 transition ${
                problemTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto">
            <Link
              to={-1 as any}
              className="text-gray-600 hover:text-gray-400 transition"
              title="Back"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {problemTab === 'Description' && (
            <div>
              {/* Title & difficulty */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h1 className="text-base font-bold text-white leading-snug">{question.title}</h1>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0 ${diff.bg} ${diff.text}`}>
                  {question.difficulty}
                </span>
              </div>

              {/* Problem statement */}
              <div className="prose prose-sm max-w-none mb-6">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{question.statementMarkdown}</ReactMarkdown>
              </div>

              {/* Examples */}
              {question.examples && question.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Examples</h3>
                  <div className="space-y-3">
                    {question.examples.map((ex, i) => (
                      <div key={i} className="bg-[#151921] border border-[#1e2433] rounded-xl overflow-hidden">
                        <div className="px-3 py-1.5 bg-[#1a1f2e] border-b border-[#1e2433]">
                          <span className="text-[10px] text-gray-500 font-semibold">EXAMPLE {i + 1}</span>
                        </div>
                        <div className="p-3 space-y-2 text-xs">
                          <div>
                            <span className="text-gray-500 font-medium">Input:</span>
                            <code className="block mt-1 text-sky-400 font-mono bg-[#0f1117] rounded px-2 py-1">{ex.input}</code>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Output:</span>
                            <code className="block mt-1 text-green-400 font-mono bg-[#0f1117] rounded px-2 py-1">{ex.output}</code>
                          </div>
                          {ex.explanation && (
                            <p className="text-gray-500 italic">{ex.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {question.constraints && question.constraints.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Constraints</h3>
                  <ul className="space-y-1">
                    {question.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-gray-400 font-mono">
                        <span className="text-purple-400 mr-2">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {problemTab === 'Submissions' && (
            <div>
              <h2 className="text-sm font-semibold text-white mb-4">Your Submissions</h2>
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No submissions yet. Write your solution and hit Submit!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((s, i) => (
                    <div key={s.id} className="bg-[#151921] border border-[#1e2433] rounded-xl p-3 flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        s.verdict === 'ACCEPTED'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {s.verdict === 'ACCEPTED' ? '✓ Accepted' : s.verdict.replace('_', ' ')}
                      </span>
                      <span className="text-gray-600 text-xs ml-auto">
                        {new Date(s.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor + console pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2433] bg-[#0a0c13]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-amber-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="text-xs text-gray-600 font-mono ml-2">Main.java</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 bg-[#1a1f2e] hover:bg-[#2d3748] border border-[#2d3748] text-green-400 hover:text-green-300 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-40"
            >
              {running ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {running ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 shadow-sm shadow-purple-900/30"
            >
              {submitting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={val => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              fontFamily: 'JetBrains Mono, Menlo, monospace',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'gutter',
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>

        {/* Console / output panel */}
        <div className="border-t border-[#1e2433] bg-[#0a0c13]" style={{ minHeight: '140px', maxHeight: '220px' }}>
          {/* Custom input */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2433]">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">stdin</span>
            <input
              type="text"
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Custom input..."
              className="flex-1 bg-transparent text-gray-300 text-xs font-mono placeholder-gray-700 focus:outline-none"
            />
          </div>

          {/* Output */}
          <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '140px' }}>
            {output && (
              <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed">{output}</pre>
            )}
            {result && (
              <div>
                <div className={`flex items-center gap-2 mb-2 text-sm font-semibold ${
                  result.verdict === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.verdict === 'ACCEPTED' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      All test cases passed!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {result.verdict.replace(/_/g, ' ')}
                    </>
                  )}
                </div>
                {result.testCaseResults && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.testCaseResults.map((tc, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-semibold ${
                          tc.passed
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {tc.hidden ? '?' : `#${i + 1}`} {tc.passed ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!output && !result && (
              <p className="text-gray-700 text-xs font-mono">Run your code to see output here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
