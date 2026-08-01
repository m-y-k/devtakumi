import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { getClass, getClassQuestions, getRecordingUrl, getCourseTree, ClassDetail, QuestionSummary, CourseTreeItem } from '../api/client'

type Tab = 'LECTURE' | 'QUESTIONS' | 'NOTES'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'LECTURE',   label: 'Lecture',   icon: '🎬' },
  { id: 'QUESTIONS', label: 'Questions', icon: '🧩' },
  { id: 'NOTES',     label: 'Notes',     icon: '📝' },
]

const diffBadge: Record<string, string> = {
  EASY:   'badge badge-easy',
  MEDIUM: 'badge badge-medium',
  HARD:   'badge badge-hard',
}

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [cls, setCls] = useState<ClassDetail | null>(null)
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('LECTURE')
  const [tree, setTree] = useState<CourseTreeItem | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    if (!classId) return
    setLoading(true)
    setRecordingUrl(null)
    setCls(null)
    setTree(null)
    Promise.all([getClass(classId), getClassQuestions(classId)])
      .then(([c, qs]) => {
        setCls(c)
        setQuestions(qs)
        if (c.hasRecording) getRecordingUrl(classId).then(setRecordingUrl).catch(() => {})
        if (c.courseId) {
          getCourseTree(c.courseId).then(t => {
            setTree(t)
            const monthWithClass = t.months.find(m =>
              m.weeks.some(w => w.classes.some(cl => cl.id === classId))
            )
            if (monthWithClass) setExpandedMonths(new Set([monthWithClass.monthNumber]))
          }).catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classId])

  const toggleMonth = (n: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n); else next.add(n)
      return next
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  )

  if (!cls) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Class not found</p>
    </div>
  )

  const solvedCount = questions.filter(q => q.solved).length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── Course tree sidebar ─────────────────────────────────── */}
      {tree && (
        <aside style={{
          width: 250,
          flexShrink: 0,
          background: '#fff',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Course header */}
          <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
            <button
              onClick={() => navigate(`/courses/${cls.courseId}`)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tree.title}
              </span>
            </button>
          </div>

          {/* Tree */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tree.months.map(m => (
              <div key={m.monthNumber}>
                <button
                  onClick={() => toggleMonth(m.monthNumber)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, fontSize: 9, fontWeight: 800, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: expandedMonths.has(m.monthNumber) ? '#fff7f0' : '#f1f5f9',
                      color: expandedMonths.has(m.monthNumber) ? '#f97316' : '#9ca3af',
                      border: `1px solid ${expandedMonths.has(m.monthNumber) ? 'rgba(249,115,22,0.25)' : '#e5e7eb'}`,
                    }}>
                      {m.monthNumber}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>Month {m.monthNumber}</span>
                  </div>
                  <svg style={{
                    width: 11, height: 11, color: '#9ca3af', flexShrink: 0,
                    transform: expandedMonths.has(m.monthNumber) ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s',
                  }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedMonths.has(m.monthNumber) && (
                  <div>
                    {m.weeks.map(w => (
                      <div key={w.weekNumber}>
                        <div style={{ padding: '4px 12px 3px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Week {w.weekNumber}
                          </span>
                        </div>
                        {w.classes.map(c => {
                          const isActive = c.id === classId
                          return (
                            <Link
                              key={c.id}
                              to={`/classes/${c.id}`}
                              className={`tree-class-link${isActive ? ' active' : ''}`}
                            >
                              <div className={`tree-class-num${isActive ? ' active' : ''}`}>
                                {c.globalClassNumber}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: 11.5,
                                  color: isActive ? '#f97316' : '#374151',
                                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  fontWeight: isActive ? 700 : 500,
                                }}>
                                  {c.title}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ── Left panel (class detail + tabs) ────────────────────── */}
      <div style={{
        width: 360,
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        overflow: 'hidden',
      }}>
        {/* Class header */}
        <div style={{ padding: '18px 20px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Class #{cls.globalClassNumber} · {cls.day}
            </div>
            {cls.isLive && (
              <div className="live-pulse" style={{ marginLeft: 'auto' }}>
                <span className="live-dot" />
                LIVE
              </div>
            )}
          </div>
          <h1 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
            {cls.title}
          </h1>
          {cls.scheduledStart && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', fontWeight: 500 }}>
              📅 {new Date(cls.scheduledStart).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          )}
          {!cls.scheduledStart && <div style={{ marginBottom: 14 }} />}

          {/* Tab bar */}
          <div className="tab-bar" style={{ padding: 0 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
                {t.id === 'QUESTIONS' && questions.length > 0 && (
                  <span style={{
                    marginLeft: 5, fontSize: 10,
                    background: activeTab === 'QUESTIONS' ? '#fff7f0' : '#f1f5f9',
                    color: activeTab === 'QUESTIONS' ? '#f97316' : '#9ca3af',
                    padding: '1px 6px', borderRadius: 99, fontWeight: 700,
                  }}>
                    {questions.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }} className="fade-up">

          {/* ── LECTURE TAB ──────────────────────────────────── */}
          {activeTab === 'LECTURE' && (
            <div>
              {cls.isLive && cls.liveMeetingUrl ? (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  borderRadius: 14, padding: '24px 20px', textAlign: 'center',
                }}>
                  <div className="live-pulse" style={{ display: 'inline-flex', marginBottom: 16 }}>
                    <span className="live-dot" />
                    Class is LIVE right now!
                  </div>
                  <p style={{ color: '#374151', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                    Join the live session before you miss anything
                  </p>
                  <a href={cls.liveMeetingUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: '#dc2626', color: '#fff',
                      padding: '10px 20px', borderRadius: 10, fontWeight: 700,
                      fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                    }}
                  >
                    🎥 Join Live Class →
                  </a>
                </div>
              ) : recordingUrl ? (
                <div>
                  <div className="video-player" style={{ marginBottom: 12 }}>
                    <video controls style={{ width: '100%', maxHeight: 200 }} src={recordingUrl} preload="metadata">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    🎬 Recorded lecture · Class #{cls.globalClassNumber}
                  </p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4 }}>
                    Use the full player on the right for a better viewing experience.
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{
                    width: 56, height: 56, background: '#f8fafc', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', border: '1px solid var(--border)', fontSize: 24,
                  }}>🎬</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>Recording not available yet</p>
                  {cls.scheduledStart && (
                    <p style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: 4 }}>
                      Scheduled: {new Date(cls.scheduledStart).toLocaleString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── QUESTIONS TAB ────────────────────────────────── */}
          {activeTab === 'QUESTIONS' && (
            <div>
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🧩</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>No questions yet</p>
                  <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>Questions will be added after class</p>
                </div>
              ) : (
                <div>
                  {/* Progress summary */}
                  <div style={{
                    background: solvedCount === questions.length ? '#f0fdf4' : '#fff7f0',
                    border: `1px solid ${solvedCount === questions.length ? '#86efac' : 'rgba(249,115,22,0.2)'}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>Questions solved</span>
                      <span style={{
                        fontSize: 12.5, fontWeight: 800,
                        color: solvedCount === questions.length ? '#16a34a' : '#f97316',
                      }}>
                        {solvedCount} / {questions.length}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: 6 }}>
                      <div
                        className={solvedCount === questions.length ? 'progress-fill progress-fill-green' : 'progress-fill'}
                        style={{ height: 6, width: `${questions.length ? (solvedCount / questions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Question list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {questions.map((q, idx) => (
                      <Link key={q.id} to={`/code/${q.id}`} className="question-item">
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', width: 18, flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        {q.solved ? (
                          <div className="solved-check">
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="unsolved-check" />
                        )}
                        <span style={{ flex: 1, fontSize: 13, color: '#374151', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {q.title}
                        </span>
                        <span className={diffBadge[q.difficulty] || 'badge'}>
                          {q.difficulty}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NOTES TAB ────────────────────────────────────── */}
          {activeTab === 'NOTES' && (
            <div>
              {cls.notesMarkdown ? (
                <article className="prose">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{cls.notesMarkdown}</ReactMarkdown>
                </article>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>Notes coming soon</p>
                  <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>Your mentor will upload notes after the session</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel — video / live ───────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        overflow: 'hidden',
      }}>
        {/* Topbar */}
        <div style={{
          padding: '0 24px',
          height: 64,
          borderBottom: '1px solid var(--border)',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>
              Class #{cls.globalClassNumber}
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {cls.title}
            </h2>
          </div>
          {cls.isLive && (
            <div className="live-pulse" style={{ marginLeft: 'auto' }}>
              <span className="live-dot" /> LIVE NOW
            </div>
          )}
          {cls.hasRecording && !cls.isLive && (
            <div style={{
              marginLeft: 'auto',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              color: '#2563eb', borderRadius: 99,
              fontSize: 11.5, fontWeight: 700,
              padding: '4px 10px', letterSpacing: '0.03em',
            }}>
              🎬 Recording Available
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {cls.isLive && cls.liveMeetingUrl ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32,
            }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: '#fef2f2', border: '2px solid #fca5a5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              }}>🔴</div>
              <div className="live-pulse">
                <span className="live-dot" />Class is live in progress
              </div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 22, margin: 0, textAlign: 'center' }}>
                Your class is currently live!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 340 }}>
                Join now before you miss anything. Your mentor is live and waiting.
              </p>
              <a href={cls.liveMeetingUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#dc2626', color: '#fff',
                padding: '14px 32px', borderRadius: 14, fontWeight: 800,
                fontSize: 16, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                transition: 'all 0.15s',
              }}>
                🎥 Join Live Class →
              </a>
            </div>
          ) : recordingUrl ? (
            <div style={{ padding: '24px 28px' }}>
              <div className="video-player" style={{ maxWidth: 960, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
                <video controls style={{ width: '100%', display: 'block' }} src={recordingUrl} preload="metadata">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div style={{
                maxWidth: 960, margin: '16px auto 0',
                padding: '16px 20px',
                background: '#fff', borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 4px' }}>{cls.title}</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                  Class #{cls.globalClassNumber} · {cls.day}
                  {cls.scheduledStart && ` · ${new Date(cls.scheduledStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32,
            }}>
              <div style={{
                width: 80, height: 80, background: '#f8fafc', borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)', fontSize: 36,
              }}>🎬</div>
              <h3 style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Recording Coming Soon
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 300 }}>
                The lecture recording will appear here once the live session ends.
              </p>
              {cls.scheduledStart && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fff7f0', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 10, padding: '10px 16px', marginTop: 8,
                  fontSize: 13, color: '#f97316', fontWeight: 600,
                }}>
                  📅 {new Date(cls.scheduledStart).toLocaleString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
