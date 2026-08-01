import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../api/auth'
import { getMyEnrollments, getAnnouncements, getCoursesPublic, EnrollmentSummary, Announcement } from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyEnrollments(), getAnnouncements(), getCoursesPublic()])
      .then(([enr, ann, cs]) => {
        setEnrollments(enr)
        setAnnouncements(ann)
        setCourses(cs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId)
  const activeCourses = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading your dashboard...</div>
      </div>
    </div>
  )

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg-base)' }}>
      {/* Top header bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{greeting},</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 6 }}>
            {user?.name?.split(' ')[0]} 👋
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'var(--accent-soft)',
            border: '1px solid rgba(249,115,22,0.15)',
            color: 'var(--accent-text)',
            borderRadius: 99, fontSize: 12, fontWeight: 700,
            padding: '4px 12px', letterSpacing: '0.03em',
          }}>
            {user?.role === 'ADMIN' ? '⚡ Admin' : '🎓 Student'}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 28px 60px' }}>

        {/* ── Stats row ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            {
              label: 'Enrolled Courses',
              value: activeCourses.length,
              sub: activeCourses.length === 1 ? '1 active course' : `${activeCourses.length} active courses`,
              icon: '📚',
              color: '#f97316',
              bg: '#fff7f0',
            },
            {
              label: 'Completed',
              value: enrollments.filter(e => e.status === 'COMPLETED').length,
              sub: 'Courses finished',
              icon: '✅',
              color: '#16a34a',
              bg: '#f0fdf4',
            },
            {
              label: 'Announcements',
              value: announcements.length,
              sub: 'From your mentor',
              icon: '🔔',
              color: '#4f46e5',
              bg: '#eef2ff',
            },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 13,
                background: s.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginTop: 3 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── My Courses ───────────────────────────────────────── */}
        {activeCourses.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Courses</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeCourses.length} enrolled</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
              {activeCourses.map(enr => {
                const course = getCourse(enr.courseId)
                const isCompleted = enr.status === 'COMPLETED'
                const elapsedMonths = (Date.now() - new Date(enr.enrolledAt).getTime()) / (1000 * 60 * 60 * 24 * 30.43)
                const progressPercent = isCompleted
                  ? 100
                  : Math.min(100, Math.max(0, Math.round((elapsedMonths / (course?.durationMonths || 1)) * 100)))

                return (
                  <Link key={enr.id} to={`/courses/${enr.courseId}`} className="card-interactive" style={{ padding: '22px 24px' }}>
                    {/* Course header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: isCompleted ? '#f0fdf4' : '#fff7f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, flexShrink: 0,
                          }}>
                            {isCompleted ? '🎓' : '📖'}
                          </div>
                          <div>
                            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', lineHeight: 1.3 }}>
                              {course?.title || 'Course'}
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                              {course?.durationMonths} months
                              {course?.totalClasses ? ` · ${course.totalClasses} classes` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className={isCompleted ? 'pill-completed' : 'pill-active'} style={{ padding: '4px 12px', flexShrink: 0 }}>
                        {isCompleted ? '✓ Done' : 'Active'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 600, marginBottom: 7 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span style={{ color: isCompleted ? '#16a34a' : '#f97316' }}>{progressPercent}%</span>
                      </div>
                      <div className="progress-track" style={{ height: 7 }}>
                        <div
                          className={isCompleted ? 'progress-fill progress-fill-green' : 'progress-fill'}
                          style={{ height: 7, width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 500 }}>
                        Enrolled {new Date(enr.enrolledAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 13, color: '#f97316', fontWeight: 700 }}>
                        {isCompleted ? 'View course →' : 'Continue →'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────── */}
        {activeCourses.length === 0 && (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '56px 32px',
            textAlign: 'center',
            marginBottom: 32,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 64, height: 64,
              background: '#fff7f0',
              borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 28,
            }}>📚</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              No Active Courses Yet
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              You haven't been enrolled in any courses yet. Request enrollment to get started.
            </p>
            <a
              href="http://localhost:5173/enroll"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'inline-flex' }}
            >
              Request Enrollment →
            </a>
          </div>
        )}

        {/* ── Announcements ────────────────────────────────────── */}
        {announcements.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Announcements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.slice(0, 5).map(a => (
                <div key={a.id} style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: '#fff7f0', border: '1px solid rgba(249,115,22,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>📢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {a.title}
                        </h3>
                        <time style={{ fontSize: 11.5, color: 'var(--text-faint)', flexShrink: 0, fontWeight: 500 }}>
                          {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </time>
                      </div>
                      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{a.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
