import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCourseTree, getMyEnrollments, getCoursesPublic, CourseTreeItem, EnrollmentSummary } from '../api/client'

export default function CourseView() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [tree, setTree] = useState<CourseTreeItem | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '')
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]))
  const [courseList, setCourseList] = useState<any[]>([])

  useEffect(() => {
    if (!courseId) return
    getCourseTree(courseId).then(t => {
      setTree(t)
      setExpandedMonths(new Set([t.months[0]?.monthNumber ?? 1]))
    }).catch(() => navigate('/dashboard'))
    getMyEnrollments().then(setEnrollments)
    getCoursesPublic().then(setCourseList).catch(() => {})
  }, [courseId])

  useEffect(() => { setSelectedCourseId(courseId || '') }, [courseId])

  const toggleMonth = (n: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n); else next.add(n)
      return next
    })
  }

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/courses/${e.target.value}`)
  }

  const enrolledEnrollments = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')

  if (!tree) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  const totalClasses = tree.months.reduce((sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.classes.length, 0), 0)
  const enrollment = enrollments.find(e => e.courseId === courseId)
  let progressPercent = 0
  if (enrollment?.status === 'COMPLETED') {
    progressPercent = 100
  } else if (totalClasses > 0) {
    const now = new Date()
    const done = tree.months.reduce((sum, m) =>
      sum + m.weeks.reduce((ws, w) =>
        ws + w.classes.filter(c => c.scheduledStart && new Date(c.scheduledStart) < now).length
      , 0)
    , 0)
    progressPercent = Math.min(100, Math.round((done / totalClasses) * 100))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Course sidebar ──────────────────────────────────────── */}
      <aside style={{
        width: 320,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Course dropdown */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            style={{
              width: '100%',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 500,
              padding: '9px 12px',
              borderRadius: 10,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none' as any,
              fontFamily: 'inherit',
            }}
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

        {/* Progress */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 7 }}>
            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>{progressPercent}%</span>
          </div>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ height: 4, width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Class tree */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}>
          {tree.months.map(m => (
            <div key={m.monthNumber}>
              <button
                onClick={() => toggleMonth(m.monthNumber)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                    background: expandedMonths.has(m.monthNumber) ? 'var(--accent-soft)' : 'var(--bg-overlay)',
                    color: expandedMonths.has(m.monthNumber) ? 'var(--accent-hover)' : 'var(--text-muted)',
                  }}>
                    {m.monthNumber}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Month {m.monthNumber}
                  </span>
                </div>
                <svg style={{
                  width: 13, height: 13, color: 'var(--text-faint)', flexShrink: 0,
                  transform: expandedMonths.has(m.monthNumber) ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedMonths.has(m.monthNumber) && (
                <div>
                  {m.weeks.map(w => (
                    <div key={w.weekNumber}>
                      <div style={{ padding: '5px 16px 4px', background: 'var(--bg-base)' }}>
                        <span className="section-label">W{w.weekNumber} · {w.title}</span>
                      </div>

                      {w.classes.map(c => (
                        <Link
                          key={c.id}
                          to={`/classes/${c.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 16px', textDecoration: 'none',
                            borderLeft: '2px solid transparent', transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderLeftColor = 'var(--accent)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, fontSize: 9, fontWeight: 700, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                          }}>
                            {c.globalClassNumber}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.title}
                            </p>
                            <p style={{ fontSize: 10, color: 'var(--text-faint)', margin: '2px 0 0' }}>
                              {c.day}{c.scheduledStart && ` · ${new Date(c.scheduledStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </p>
                          </div>
                        </Link>
                      ))}

                      <Link
                        to={`/courses/${courseId}/weeks/${w.id}/assessment`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          margin: '4px 12px 6px', padding: '7px 12px', borderRadius: 8,
                          background: 'var(--accent-soft)', border: '1px solid rgba(91,106,240,0.15)',
                          color: 'var(--accent-hover)', textDecoration: 'none',
                          fontSize: 11, fontWeight: 600, transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(91,106,240,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
                      >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* ── Main content ───────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 40px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 520 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Course Overview</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
            {tree.title}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 36px' }}>
            Select a class from the sidebar to view its lecture, questions, and notes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Classes', value: totalClasses, icon: '📅' },
              { label: 'Months', value: tree.months.length, icon: '🗓️' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '20px 22px',
              }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
