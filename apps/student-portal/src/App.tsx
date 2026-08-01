import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './api/auth'
import { useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CourseView from './pages/CourseView'
import ClassPage from './pages/ClassPage'
import CodeRunnerPage from './pages/CodeRunnerPage'
import AssessmentPage from './pages/AssessmentPage'
import Profile from './pages/Profile'
import AdminEnrollmentRequests from './pages/admin/EnrollmentRequests'
import AdminStudents from './pages/admin/Students'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminCurriculumManager from './pages/admin/CurriculumManager'
import AdminClassEditor from './pages/admin/ClassEditor'
import AdminRecordingUpload from './pages/admin/RecordingUpload'
import AdminAssessments from './pages/admin/Assessments'
import AdminSubmissionsGrading from './pages/admin/SubmissionsGrading'
import { getMyEnrollments } from './api/client'

// ─── Courses redirect — navigates to first active enrollment ──
function CoursesRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    getMyEnrollments().then(enrollments => {
      const active = enrollments.find(e => e.status === 'ACTIVE' || e.status === 'COMPLETED')
      if (active) {
        navigate(`/courses/${active.courseId}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }).catch(() => navigate('/dashboard', { replace: true }))
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  )
}

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="spinner" />
        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Loading...</div>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// ─── Icons ───────────────────────────────────────────────────
const IconHome = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconBook = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)
const IconUsers = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)
const IconUser = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconBell = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)
const IconClipboard = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const IconLogout = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
function SidebarItem({ to, icon, label, exact = false }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  return (
    <NavLink to={to} end={exact} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <aside className="sidebar flex flex-col" style={{ height: '100vh' }}>
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
        <div className="sidebar-logo-icon">
          <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>&gt;_</span>
        </div>
        <div className="sidebar-brand">
          dev<br /><span>takumi</span>
        </div>
      </div>

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
        {/* Student nav */}
        <div className="sidebar-section-label">Student</div>
        <SidebarItem to="/dashboard" icon={<IconHome />} label="Dashboard" exact />
        <SidebarItem to="/courses" icon={<IconBook />} label="My Courses" />

        {/* Admin nav */}
        {isAdmin && (
          <>
            <div className="nav-divider" style={{ margin: '12px 16px' }} />
            <div className="sidebar-section-label">Admin</div>
            <SidebarItem to="/admin/enrollment-requests" icon={<IconClipboard />} label="Enrollments" />
            <SidebarItem to="/admin/students" icon={<IconUsers />} label="Students" />
            <SidebarItem to="/admin/courses" icon={<IconBook />} label="Curriculum" />
            <SidebarItem to="/admin/announcements" icon={<IconBell />} label="Announcements" />
            <SidebarItem to="/admin/assessments" icon={<IconClipboard />} label="Assessments" />
          </>
        )}
      </div>

      {/* Bottom: Profile + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 0 12px' }}>
        {/* User info */}
        <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 10.5, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <SidebarItem to="/profile" icon={<IconUser />} label="Profile" />
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: 'calc(100% - 16px)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <IconLogout />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><Layout><CoursesRedirect /></Layout></ProtectedRoute>} />
      <Route path="/courses/:courseId" element={<ProtectedRoute><Layout><CourseView /></Layout></ProtectedRoute>} />
      <Route path="/classes/:classId" element={<ProtectedRoute><Layout><ClassPage /></Layout></ProtectedRoute>} />
      <Route path="/code/:questionId" element={<ProtectedRoute><Layout><CodeRunnerPage /></Layout></ProtectedRoute>} />
      <Route path="/courses/:courseId/weeks/:weekId/assessment" element={<ProtectedRoute><Layout><AssessmentPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/admin/enrollment-requests" element={<ProtectedRoute adminOnly><Layout><AdminEnrollmentRequests /></Layout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute adminOnly><Layout><AdminStudents /></Layout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><Layout><AdminAnnouncements /></Layout></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute adminOnly><Layout><AdminCurriculumManager /></Layout></ProtectedRoute>} />
      <Route path="/admin/classes/:classId" element={<ProtectedRoute adminOnly><Layout><AdminClassEditor /></Layout></ProtectedRoute>} />
      <Route path="/admin/classes/:classId/recording" element={<ProtectedRoute adminOnly><Layout><AdminRecordingUpload /></Layout></ProtectedRoute>} />
      <Route path="/admin/assessments" element={<ProtectedRoute adminOnly><Layout><AdminAssessments /></Layout></ProtectedRoute>} />
      <Route path="/admin/submissions" element={<ProtectedRoute adminOnly><Layout><AdminSubmissionsGrading /></Layout></ProtectedRoute>} />
    </Routes>
  )
}
